import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
/**
 * __dirname : 현재 실행중인 폴더 경로
 * __filename : 현재 실행중인 파일 경로
 */

app.use("/public", express.static(__dirname + "/public"));
/**
 * static file(정적 파일): 직접 값에 변화를 주지않는 이상 변하지 않는 파일.
 * (ex) image, css, js ...
 *
 * express 변수에는 static 이라는 메서드가 포함되어 있음 => 이 메서드를 미들웨어로서 로드함.
 * static의 인자로 전달되는 public: 디렉토리명
 * express.static 메서드는 node 프로세스가 실행되는 디렉토리에 상대적임(상대경로)
 * public 디렉터리 하의 데이터 => 웹브라우저의 요청에 따라 서비스 제공
 * 이런 방법은 public에 저장된 파일만을 제공하므로 보안적 이점이 있음.
 *    (ex) localhost:4000/src/public/js/app.js 접근 시,
 *       __dirname/public/js/app.js에 존재하는 지 검색.
 *
 *    (cf) app.use("/public", express.static("/public"));
 *    => 가상 경로를 지정한 경우, 사용자가 public 디렉토리의 파일에 접근하려면 다음처럼 접근해야함.
 *       => http://localhost:4000/public/js/app.js
 *
 *    (cf2) app.use("/public", express.static(__dirname + "/public"));
 *    => 절대 경로를 지정한 경우
 *       => http://localhost:4000(/현재 실행중인 폴더경로)/public/js/app.js
 */

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));
// catch-all url: app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
   cors: {
      origin: ["https://admin.socket.io"],
      credential: true,
   },
});

instrument(wsServer, {
   auth: false,
});

// const wsServer = SocketIO(httpServer);
// const wss = new WebSocket({ server });

function publicRooms() {
   /* object: 키가 있는 컬렉션 저장
      array: 순서가 있는 컬렉션 저장
      Map? => 키가 있는 데이터를 저장하며, 키에 다양한 자료형을 저장할 수 있음(객체도 가능).
         new Map() - 맵 생성.
         map.set(key, value) - key를 이용해 value를 저장.
         map.get(key) - key에 해당하는 값을 반환.
      Set? => 중복을 허용하지 않는 값을 모아둔 특별한 컬렉션. 
    */

   const { sids } = wsServer.sockets.adapter;
   const { rooms } = wsServer.sockets.adapter;
   // const {sockets: {adapter: {sids, rooms}}} = wsServer;

   const publicRooms = [];
   rooms.forEach((_, key) => {
      if (sids.get(key) === undefined) {
         publicRooms.push(key);
         // rooms의 각 키마다 sids에도 key가 있는지 검사 => 없는 경우 publicRoom, 그러므로 publicRoom array에 저장. / 존재하는 경우 private Room.
      }
   });

   return publicRooms;
}

function countRoom(roomName) {
   return wsServer.sockets.adapter.rooms.get(roomName)?.size;
   // get(roomName)에 성공하면 .size를 반환?
}

const PORT = 4000;
const handleListening = () =>
   console.log(`Listening on http://localhost:${PORT}`);
httpServer.listen(PORT, handleListening);
// 같은 서버에서 http와 websocket 모두 작동시키는 방법(같은 PORT)

wsServer.on("connection", (socket) => {
   // console.log(wsServer.sockets.adapter);
   socket["nickname"] = "Anonymous";
   wsServer.sockets.emit("room_change", publicRooms());

   socket.onAny((event) => {
      console.log(`Socket Event: ${event}`);
   });

   socket.on("enter_room", (roomName, nickname, done) => {
      socket["nickname"] = nickname;
      socket.join(roomName);
      done();
      socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // 메시지를 하나의 소켓에만 전송
      wsServer.sockets.emit("room_change", publicRooms()); // 메시지를 모든 소켓에 전송
   });

   socket.on("disconnecting", () => {
      // client가 disconnect 하려고함(아직 disconnected X)
      socket.rooms.forEach(
         (room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
         // 각 arg에 대해서 bye 이벤트를 emit?
      );
   });

   socket.on("disconnect", () => {
      wsServer.sockets.emit("room_change", publicRooms());
   });

   socket.on("new_message", (msg, roomName, done) => {
      socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
      done();
   });

   socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

/* 
const wss = new WebSocketServer({ server });
const sockets = [];
wss.on("connection", (socket) => {
   // console.log(socket);
   // socket: 연결된 브라우저

   sockets.push(socket);
   socket["nickname"] = "Anonymous";

   console.log("Connected to Browser ✅");
   socket.on("close", onSocketClose);

   socket.on("message", (msg) => {
      const message = JSON.parse(msg);

      switch (message.type) {
         case "new_message":
            sockets.forEach((aSocket) =>
               aSocket.send(
                  `${socket.nickname}: ${message.payload.toString("utf8")}`
               )
            );
         case "nickname":
            socket["nickname"] = message.payload;
      }
   });
}); */

/**
 * wss.on("connection", callBack fn)
 *    => .on 메서드: backend에 연결된 사람의 정보를 제공(socket)
 *    => connection이 이루어지면 callback fn으로 socket을 받음 => socket이란, 연결된 client
 */

/**
 * WebSocket: http같은 프로토콜의 한 종류
 * WebSocket을 사용하려 하고 + 서버가 지원하면 wss하면 됨.
 *    (ex) wss://localhost:4000/, wss: Web Socket Secure
 *    (ex2) ss://localhost:4000/, ws: Web Socket
 *
 * client가 sever로 request => server는 accept/deny함.
 * accept한 경우 연결 성립 => 양방향성 통신 가능해짐.
 *
 * express: http server
 * ws: webSocket server
 *
 * 이전에는 브라우저가 주는 WebSocket API를 사용,
 * 하지만 브라우저가 주는 webSocket은 socketIO와 호환 X
 * => 브라우저에도 SocketIO를 import 해줘야함.
 *
 * Adapter: MongoDB를 사용해 서버간의 통신을 해줌.
 *    => 하나의 서버에 여러개의 브라우저의 커넥션이 생김.
 *       => 다른 서버의 경우 통신이 불가능한 것을 해결.
 */
