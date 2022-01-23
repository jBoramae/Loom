import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

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

// const PORT = 4000;
// const handleListening = () =>
//    console.log(`✅ Server listening on port http://localhost:${PORT}/ 🚀`);
// app.listen(PORT, handleListening);

const handleListening = () => console.log(`Listening on http://localhost:4000`);
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
// 같은 서버에서 http와 websocket 모두 작동시키는 방법(같은 PORT)

server.listen(4000, handleListening);

/**
 * express: http server
 * ws: webSocket server
 */

/**
 * WebSocket: http같은 프로토콜의 한 종류
 * WebSocket을 사용하려 하고 + 서버가 지원하면 wss하면 됨.
 *    (ex) wss://localhost:4000/, wss: Secure Web Socket
 *    (ex2) ss://localhost:4000/, ws: Web Socket
 *
 * client가 sever로 request => server는 accept/deny함.
 * accept한 경우 연결 성립 => 양방향성 통신 가능해짐.
 */
