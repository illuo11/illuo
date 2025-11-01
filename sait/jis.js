// Загрузка пользователей
async function loadUsers() {
  const res = await fetch("/api/users");
  const users = await res.json();
  const container = document.getElementById("users-list");
  container.innerHTML = "";
  users.forEach((u) => {
    const div = document.createElement("div");
    div.className = "user-card";
    div.innerHTML = `<img src='${
      u.avatar_url || "/default-avatar.png"
    }'><strong>${u.nickname}</strong>`;
    container.appendChild(div);
  });
}

loadUsers();

// Чат через Socket.IO
const socket = io({ auth: { token: localStorage.getItem("jwt") } });
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

socket.on("chat:new", (msg) => {
  const div = document.createElement("div");
  div.className = "message";
  div.textContent = `${msg.nickname}: ${msg.text}`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

sendBtn.addEventListener("click", () => {
  const text = inputEl.value;
  if (text) socket.emit("chat:send", { text });
  inputEl.value = "";
});
express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const authRouter = require("./auth");
const usersRouter = require("./users");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New socket connected");
  socket.on("chat:send", (data) => {
    io.emit("chat:new", { nickname: socket.user.nickname, text: data.text });
  });
});

server.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
// Регистрация и логин, возвращаем JWT
// GET /api/users возвращает только id, nickname, avatar_url, role
