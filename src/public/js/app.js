const socket = io();
// socketIO를 설치하면, io라는 fn를 볼 수 있음
// => 자동적으로 backend socket.io와 연결해주는 fn

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");

let roomName;

room.hidden = true;
// 처음에 room 숨김

function addMessage(message) {
   const ul = room.querySelector("ul"),
      li = document.createElement("li");

   li.innerText = message;
   ul.appendChild(li);
}

function handleMessageSubmit(event) {
   event.preventDefault();
   const input = room.querySelector("#msg input");
   const { value } = input;

   socket.emit("new_message", input.value, roomName, () => {
      addMessage(`You: ${value}`);
   });

   input.value = "";
}

function handleNicknameSubmit(event) {
   event.preventDefault();
   const input = document.querySelector("#name input");
   const { value } = input;

   socket.emit("nickname", input.value);
}

function showRoom() {
   welcome.hidden = true;
   room.hidden = false;
   const h3 = room.querySelector("h3");
   h3.innerText = `Room: ${roomName}`;
   const msgForm = room.querySelector("#msg");
   const nameForm = document.querySelector("#name");
   nameForm.addEventListener("submit", handleNicknameSubmit);
   msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
   event.preventDefault();
   const nickNameInput = welcome.querySelector("#name");
   const roomNameInput = welcome.querySelector("#roomName");
   socket.emit(
      "enter_room",
      roomNameInput.value,
      nickNameInput.value,
      showRoom
   );
   // 1) 특정 event를 emit할 수 있음.
   // 2) webSocket => obj를 str으로(only text) 변환시킨 후 전송했어야하지만 socket.io는 어떤 것이든 가능.
   //    전송할 수 있는 payload의 argument 갯수는 매우 많음.
   // 3) 서버에서 호출하는 fn(callback fn을 보낼 수 있음)
   //    마지막 argumnet는 꼭 fn.
   const configuedNameInput = room.querySelector("#name input");
   configuedNameInput.value = nickNameInput.value;
   roomName = roomNameInput.value;
   roomNameInput.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
   addMessage(`${user} joined!`);
});

socket.on("bye", (user) => {
   addMessage(`${user} Left!`);
});

socket.on("new_message", addMessage);
