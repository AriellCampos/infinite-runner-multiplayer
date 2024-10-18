const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const spriteCount = 6; //numero de sprites
const sprites = [];
const spriteWidth = 100; // largura do sprite
const spriteHeight = 100; //altura do sprite
let currentFrame = 0;
let lastFrameTime = 0;
const frameDuration = 100; //Duração em milissegundos de cada frame

//carregar as imagens dos sprites
function loadSprites() {
  for (let i = 1; i <= spriteCount; i++) {
    const img = new Image();
    img.src = `imagens/Frame-${i}.png`;
    sprites.push(img);
  }
}

//renderizar o sprite atual no canvas
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // limpa o canvas
  ctx.drawnImage(
    sprites[currentFrame],
    (canvas.width - spriteWidth) / 2(canvas.height - spriteHeight) / 2
  );
}

function update(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const elapsed = timestamp - lastFrameTime;

  if (elapsed >= frameDuration) {
    currentFrame = (currentFrame + 1) % spriteCount; // ciclar sprites
    lastFrameTime = timestamp;
  }
  render();
  requestAnimationFrame(update);
}
//iniciar a animação após o carregamento dos sprites

function startAnimation() {
  if (sprites.length === spriteCount && sprites.every((img) => img.complete)) {
    requestAnimationFrame(update);
  } else {
    setTimeout(startAnimation, 100); // tentar novamente após 100ms
  }
}

//carregar sprites
loadSprites();
startAnimation();
