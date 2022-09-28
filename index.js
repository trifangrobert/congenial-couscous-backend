const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

server.listen(process.env.PORT || 8000, () => {
  console.log("SERVER IS RUNNING");
});

let rooms = {};

io.on("connection", (socket) => {
  console.log(`User Connected ${socket.id}`)
  // socket.on("joinRoom", (data) => {
  //   socket.join(data);
  // })
  socket.on("createRoom", (data) => {
    
    rooms[data.roomId] = {player1: socket.id};
    socket.join(data.roomId);
    console.log(`Room Created by ${data.name} with id ${data.roomId}`);
    console.log(socket.id);
  })
  socket.on("joinRoom", (data) => {
    rooms[data.roomId] = {...rooms[data.roomId], player2: socket.id};
    socket.join(data.roomId);
    console.log(`User Joined ${data.name} with id ${data.roomId}`);
    // console.log(io.sockets.adapter.rooms.get(data.roomId));
    console.log(rooms[data.roomId]);
    console.log(socket.id);
    // io.to(data.roomId).emit("startGame", data);
    io.sockets.sockets.get(rooms[data.roomId].player1).emit("startGame", {play: true, orientation: "white"});
    io.sockets.sockets.get(rooms[data.roomId].player2).emit("startGame", {play: true, orientation: "black"});
  })
});

