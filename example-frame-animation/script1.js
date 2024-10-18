const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const spriteCount = 6; // Número de sprites
const sprites = [];
const spriteWidth = 100; // Largura do sprite
const spriteHeight = 100; // Altura do sprite
let currentFrame = 0;
let lastFrameTime = 0;
const frameDuration = 100; // Duração em milissegundos de cada frame

// Carregar as imagens dos sprites
function loadSprites() {
    for (let i = 1; i <= spriteCount; i++) {
        const img = new Image();
        img.src = `imagens/frame-${i}.png`;
        sprites.push(img);
    }
}

// Renderizar o sprite atual no canvas
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    ctx.drawImage(sprites[currentFrame], (canvas.width - spriteWidth) / 2, (canvas.height - spriteHeight) / 2);
}


// Atualizar o frame atual baseado no tempo
function update(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const elapsed = timestamp - lastFrameTime;

    if (elapsed >= frameDuration) {
        currentFrame = (currentFrame + 1) % spriteCount; // Ciclar pelos sprites
        lastFrameTime = timestamp;
    }

    render();
    requestAnimationFrame(update);
}

// Iniciar a animação após o carregamento das sprites
function startAnimation() {
    if (sprites.length === spriteCount && sprites.every(img => img.complete)) {
        requestAnimationFrame(update);
    } else {
        setTimeout(startAnimation, 100); // Tentar novamente após 100ms
    }
}
// Carregar sprites e iniciar a animação
loadSprites();
startAnimation();