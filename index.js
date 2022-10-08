const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");


app.use(cors());

const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

server.listen(process.env.PORT || 8000, () => {
  console.log("SERVER IS RUNNING");
});

let rooms = {};
let socketToRoom = {};
let socketToName = {};

io.on("connection", (socket) => {
  console.log(`User Connected ${socket.id}`);
  socket.on("createRoom", (data) => {
    rooms[data.roomId] = { player1: socket.id };
    socketToRoom[socket.id] = data.roomId;
    socketToName[socket.id] = data.name;
    socket.join(data.roomId);
    console.log(`Room Created by ${data.name} with id ${data.roomId}`);
    console.log(socket.id);
  });
  socket.on("joinRoom", (data) => {
    //TODO check if room exists and if it is full
    
    rooms[data.roomId] = { ...rooms[data.roomId], player2: socket.id, fen: startFen };
    socketToRoom[socket.id] = data.roomId;
    socketToName[socket.id] = data.name;
    socket.join(data.roomId);
    console.log(`User Joined ${data.name} with id ${data.roomId}`);
    console.log(socketToName[rooms[data.roomId].player1]);
    io.to(rooms[data.roomId].player1).emit("startGame", {
      play: true,
      fen: startFen,
      orientation: "white",
      opponentName: socketToName[rooms[data.roomId].player2],
      // opponentName: "Nicolae Guta",
      userName: socketToName[rooms[data.roomId].player1],
    });
    io.to(rooms[data.roomId].player2).emit("startGame", {
      play: true,
      fen: startFen,
      orientation: "black",
      opponentName: socketToName[rooms[data.roomId].player1],
      userName: socketToName[rooms[data.roomId].player2],
      // userName: "Nicolae Guta",
    });
  });
  socket.on("newMove", (data) => {
    roomId = socketToRoom[socket.id];
    rooms[roomId] = { ...rooms[roomId], fen: data.fen };
    io.to(roomId).emit("newMove", { fen: data.fen });
  });
  socket.on("gameOver", (data) => {
    roomId = socketToRoom[socket.id];
    io.to(roomId).emit("gameOver", { message: "game over!" });
  })
});
