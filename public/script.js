const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Definindo uma variavél de cor para o personagem 
//(Caso utilize frames pngs seja o frame não é necessário)
const colorPersonagem = getRandomColor();

// Função para gerar uma cor aleatória
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

// Definindo as dimensões do canvas
canvas.width = 600;
canvas.height = 200;

// Diferentes frames do personagem "palito" correndo
const frames = [
  [
    // Frame 1 (parado)
    [0, 0, 1, 1, 0, 0], // Cabeça
    [0, 1, 1, 1, 1, 0], // Braços
    [1, 0, 1, 1, 0, 1], // Braços
    [0, 0, 1, 1, 0, 0], // Corpo
    [0, 0, 0, 1, 0, 0], // Pernas (paradas)
  ],
  [
    // Frame 2 (perna direita para frente, esquerda parada)
    [0, 0, 1, 1, 0, 0], // Cabeça
    [0, 1, 1, 1, 1, 0], // Braços
    [0, 1, 1, 1, 1, 0], // Braços
    [0, 0, 1, 1, 0, 0], // Corpo
    [0, 0, 1, 0, 1, 0], // Pernas (movendo)
  ],
];

// Configurando o tamanho de cada pixel do personagem
const pixelSize = 10;
const characterX = 50; // Posição X do personagem
const groundLevel = canvas.height - 55; // Posição Y do personagem no chão
let characterY = groundLevel; // Posição Y do personagem no chão

// variaveis animação
let currentFrame = 0; // Controla qual frame está sendo exibido
let frameCount = 0; // Contador para controlar a velocidade da animação

// variaveis de background
let backgroundImage = new Image();
backgroundImage.src = "/imagens/bg.jpg";

// Posição inicial do obstáculo
let obstacleX = canvas.width - 10;
const groundY = canvas.height - 5; // Y do chão

let gameOver = false; // Controla o estado do jogo (se houve colisão)

// variavéis de pulo
let isJumping = false; // Indica se o personagem está no meio de um pulo.
let jumpSpeed = 0; // Controla a velocidade vertical do personagem enquanto pula.
const jumpHeight = -9; // A altura máxima que o personagem vai atingir no pulo
const gravity = 0.9; // Gravidade para trazer o personagem de volta ao chão

//Multiplayer
let players = {}; // Armazena os jogadores
let socket = io(); // Conecta ao servidor

socket.on("updatePlayers", (updatedPlayers) => {
  players = updatedPlayers;
});

// A função para desenhar os jogadores
function drawPlayers() {
  for (let id in players) {
    const player = players[id];
    
    // Apenas desenha se o jogador não está "morto"
    if (!player.gameOver) {
      drawCharacter(frames[currentFrame], player.x, player.y, player.color);
    }
  }
}

// Função para desenhar o personagem no canvas
function drawCharacter(frame, x, y, color) {
  for (let yOffset = 0; yOffset < frame.length; yOffset++) {
    for (let xOffset = 0; xOffset < frame[yOffset].length; xOffset++) {
      if (frame[yOffset][xOffset] === 1) {
        ctx.fillStyle = color; // Usa a cor passada como argumento
        ctx.fillRect(
          x + xOffset * pixelSize,
          y + yOffset * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }
}

// Atualiza a posição do jogador e envia para o servidor
function updatePlayer() {
  socket.emit("updatePlayer", {
    x: characterX,
    y: characterY,
    isJumping,
    gameOver: gameOver,
    color: colorPersonagem,
  }); // Envia a cor do jogador
}

// Desenhar o chão (uma linha na parte inferior)
function drawGround() {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "black";
  ctx.stroke();
}

// Função para desenhar o background
function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Atualizar o frame do personagem para criar a animação
function updateFrame() {
  frameCount++;
  if (frameCount % 10 === 0) {
    // Mudar de frame a cada 10 ciclos
    currentFrame = (currentFrame + 1) % frames.length;
  }
}

// Atualizar a posição do obstáculo
function updateObstacle() {
  obstacleX -= 5; // Velocidade do obstáculo (5 pixels por frame)
  if (obstacleX < 0) {
    // Quando o obstáculo sai pela esquerda, reposiciona à direita
    obstacleX = canvas.width;
  }
}

// Função que inicia o pulo apenas se o personagem não estiver no meio de outro pulo.
function jump() {
  if (!isJumping) {
    isJumping = true;
    jumpSpeed = jumpHeight;
  }
}

// Função que atualiza a posição Y do personagem, aplicando a gravidade e garantindo que ele retorne ao chão corretamente.
function updateJump() {
  if (isJumping) {
    characterY += jumpSpeed; // Atualiza a posição vertical com a velocidade do pulo
    jumpSpeed += gravity; // Aplica a gravidade

    // Verifica se o personagem voltou ao solo
    if (characterY >= groundLevel) {
      characterY = groundLevel;
      isJumping = false;
      jumpSpeed = 0;
    }
  }
}

// Desenhar o obstáculo
function drawObstacle() {
  ctx.fillStyle = "red";
  ctx.fillRect(obstacleX, groundY - 10, pixelSize, pixelSize);
}

// Função para detectar colisão entre o personagem e o obstáculo (pixel a pixel)
function detectCollision() {
  for (let y = 0; y < frames[currentFrame].length; y++) {
    for (let x = 0; x < frames[currentFrame][y].length; x++) {
      if (frames[currentFrame][y][x] === 1) {
        // Coordenadas do pixel do personagem
        const pixelX = characterX + x * pixelSize;
        const pixelY = characterY + y * pixelSize;

        // Verificar se qualquer pixel do personagem coincide com o obstáculo
        if (
          pixelX < obstacleX + pixelSize &&
          pixelX + pixelSize > obstacleX &&
          pixelY < groundY &&
          pixelY + pixelSize > groundY - 10
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Adicionar evento de teclado para detectar o pulo
// Adicionar evento de teclado para detectar o pulo
document.addEventListener("keydown", function (event) {
  if (event.code === "Space" && !gameOver) {
    jump(); // Inicia o pulo ao pressionar espaço
  }
});

// Desenhando o jogo
function drawGame() {
  if (gameOver) {
    // Exibir "Game Over" se o personagem colidir com o obstáculo
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2);
    return;
  }

  // Limpar o canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar o background
  drawBackground();

  // Desenhar o chão
  drawGround();

  // Desenhe todos os jogadores
  drawPlayers(); 

  // Atualiza a posição do jogador no servidor
  updatePlayer(); 

  // // Desenhar o obstáculo
  drawObstacle();

  // // Atualizar a posição do obstáculo
  updateObstacle();

  // Atualizar o frame
  updateFrame();

  // Atualizar a física do pulo
  updateJump();

  if (detectCollision()) {
    gameOver = true;
    updatePlayer(); // Envia o estado de gameOver ao servidor
  }
  // Repetir a animação
  requestAnimationFrame(drawGame);
}

// Iniciar o jogo
drawGame();
