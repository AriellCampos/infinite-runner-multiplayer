const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Serve arquivos estáticos da pasta 'public'

// Armazena os jogadores
let players = {};

// Quando um cliente se conecta
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Adiciona um novo jogador com uma cor aleatória
  players[socket.id] = {
    x: 50, // Posição inicial do jogador
    y: 145, // Posição Y inicial do jogador
    gameOver: false, // Inicialmente, o jogador não está "morto"
    color: 'blue', // Armazena a cor
  };

  // Envia a lista atualizada de jogadores para todos os clientes
  io.emit("updatePlayers", players);

  // Quando um jogador atualiza sua posição
  socket.on("updatePlayer", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].isJumping = data.isJumping;

      // Atualiza o estado de gameOver
      players[socket.id].gameOver = data.gameOver;
      // Atualiza o estado de cor
      players[socket.id].color = data.color;
    }

    // Atualiza a lista de jogadores
    io.emit("updatePlayers", players);
  });

  // Quando um jogador se desconecta
  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
    delete players[socket.id]; // Remove o jogador desconectado
    io.emit("updatePlayers", players); // Atualiza a lista de jogadores
  });
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log('Server is running on http://localhost:${PORT}');
});