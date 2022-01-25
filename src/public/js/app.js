const socket = io();
// socketIO를 설치하면, io라는 fn를 볼 수 있음
// => 자동적으로 backend socket.io와 연결해주는 fn

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;
// 처음에 room 숨김
let roomName;

function showRoom() {
   welcome.hidden = true;
   room.hidden = false;
   const h3 = room.querySelector("h3");
   h3.innerText = `Room: ${roomName}`;
}

function handleRoomSubmit(event) {
   event.preventDefault();
   const input = form.querySelector("input");

   socket.emit("enter_room", input.value, showRoom);
   // 1) 특정 event를 emit할 수 있음.
   // 2) webSocket => obj를 str으로(only text) 변환시킨 후 전송했어야하지만 socket.io는 어떤 것이든 가능.
   //    전송할 수 있는 payload의 argument 갯수는 매우 많음.
   // 3) 서버에서 호출하는 fn(callback fn을 보낼 수 있음)
   //    마지막 argumnet는 꼭 fn.

   roomName = input.value;

   input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
