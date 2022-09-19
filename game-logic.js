/**
 * Here is where we should register event listeners and emitters.
 */

var io;
var gameSocket;
// gamesInSession stores an array of all active socket connections
var gamesInSession = [];

const initializeGame = (sio, socket) => {
  io = sio;
  gameSocket = socket;

  gamesInSession.push(gameSocket);

  gameSocket.on("disconnect", onDisconnect);

  gameSocket.on("new move", newMove);

  gameSocket.on("createNewGame", createNewGame);

  gameSocket.on("playerJoinGame", playerJoinsGame);

  gameSocket.on("request username", requestUserName);

  gameSocket.on("recieved userName", recievedUserName);
  
};

function playerJoinsGame(idData) {
  var sock = this;

  var room = io.sockets.adapter.rooms[idData.gameId];
  if (room === undefined) {
    this.emit("status", "This game session does not exist.");
    return;
  }
  if (room.length < 2) {
    idData.mySocketId = sock.id;

    sock.join(idData.gameId);

    console.log(room.length);

    if (room.length === 2) {
      io.sockets.in(idData.gameId).emit("start game", idData.userName);
    }

    io.sockets.in(idData.gameId).emit("playerJoinedRoom", idData);
  } else {
    this.emit("status", "There are already 2 people playing in this room.");
  }
}

function createNewGame(userName, gameId) {
  console.log("created a room");
  this.emit("createNewGame", { userName: userName, gameId: gameId, mySocketId: this.id });

  this.join(gameId);
}

function newMove(move) {
  const gameId = move.gameId;

  io.to(gameId).emit("opponent move", move);
}

function onDisconnect() {
  var i = gamesInSession.indexOf(gameSocket);
  gamesInSession.splice(i, 1);
}

function requestUserName(gameId) {
  io.to(gameId).emit("give userName", this.id);
}

function recievedUserName(data) {
  data.socketId = this.id;
  io.to(data.gameId).emit("get Opponent UserName", data);
}

exports.initializeGame = initializeGame;
