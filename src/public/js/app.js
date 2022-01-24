/**
 * frontend에서 backend에 연결 요청
 * WebSocket() syntax =>
 *    var aWebSocket = new WebSocket(url [, protocols]);
 *
 * Backend로 JSON obj를 그대로 보내면 안됨. => string으로 변환시켜서 보내야함.
 * => Backend 서버가 JS 서버가 아닐 수도 있기 때문. ex) Java, Go... etc
 *    Backend에 있는 모든 서버는 object에서 변환받은 string을 가지고 뭘 할지 정함.
 *    => WebSocket이 브라우저에 있는 API이므로,
 *       백엔드에서는 다양한 프로그래밍 언어를 사용할 수 있기 때문에 이 API는 어떠한 판단도 하면 안됨.
 *       그러므로 string을 보내면 Backend가 Backend의 방법대로 처리함.
 */

const socket = new WebSocket(`ws://${window.location.host}`);
// window.location.host: 현재 위치
// socket: 서버로의 연결

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nickname");

function makeMessage(type, payload) {
   const msg = { type, payload };
   return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
   console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
   const li = document.createElement("li");
   li.innerText = message.data;
   messageList.append(li);
});

socket.addEventListener("close", () => {
   console.log("Disconnected from Server ❌");
});

function handleSubmit(e) {
   e.preventDefault();
   const input = messageForm.querySelector("input");
   socket.send(makeMessage("new_message", input.value));
   input.value = "";
}

function handleNickSubmit(e) {
   e.preventDefault();
   const input = nickForm.querySelector("input");
   socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
