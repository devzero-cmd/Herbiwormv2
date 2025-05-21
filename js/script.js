var canvas = document.getElementById("canvasSnake");
var ctxSnake = canvas.getContext("2d");
var ctxFood = document.getElementById("canvasFood").getContext("2d");
var ctxHex = document.getElementById("canvasHex").getContext("2d");
var ut = new Util();
var mouseDown = false,
    cursor = new Point(0, 0);
var game = new Game(ctxSnake, ctxFood, ctxHex);

const restartBtn = document.getElementById("restartBtn");  // declare early

// Resize all canvases to fill the window (fullscreen)
function resizeCanvases() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w;
  canvas.height = h;

  document.getElementById("canvasFood").width = w;
  document.getElementById("canvasFood").height = h;

  document.getElementById("canvasHex").width = w;
  document.getElementById("canvasHex").height = h;
}

// Resize on load
resizeCanvases();

// Resize on window resize
window.addEventListener('resize', () => {
  resizeCanvases();
  // Also update game sizes if you want:
  game.updateSizes && game.updateSizes(); // if you implement updateSizes in Game class
});

canvas.onmousemove = function (e) {
  if (mouseDown) {
    cursor = ut.getMousePos(canvas, e);
    var ang = ut.getAngle(game.snakes[0].arr[0], cursor);
    game.snakes[0].changeAngle(ang);
  }
};

canvas.onmousedown = function (e) {
  mouseDown = true;
};

canvas.onmouseup = function (e) {
  mouseDown = false;
};

function start() {
  game.init();
  update();
}

var previousDelta = 0,
  fpsLimit = 20;

function update(currentDelta) {
  requestAnimationFrame(update);

  var delta = currentDelta - previousDelta;
  if (fpsLimit && delta < 1000 / fpsLimit) return;
  previousDelta = currentDelta;

  // Clear all canvases
  ctxFood.clearRect(0, 0, canvas.width, canvas.height);
  ctxSnake.clearRect(0, 0, canvas.width, canvas.height);
  ctxHex.clearRect(0, 0, canvas.width, canvas.height);

  // Draw game
  game.draw();

  // Show or hide restart button based on game state
  if (game.state === "dead") {
    restartBtn.style.display = "block";
  } else {
    restartBtn.style.display = "none";
  }
}

restartBtn.addEventListener("click", () => {
  game.init();
  restartBtn.style.display = "none"; // hide after restart
});

start();

// Joystick setup
const joystickContainer = document.getElementById('joystick-container');
const joystickThumb = document.getElementById('joystick-thumb');

let joystickActive = false;
let startX, startY;

joystickContainer.style.position = 'fixed';
joystickContainer.style.left = '20px';
joystickContainer.style.bottom = '20px';
joystickContainer.style.width = '120px';
joystickContainer.style.height = '120px';
joystickContainer.style.borderRadius = '50%';
joystickContainer.style.background = 'rgba(255,255,255,0.1)';
joystickContainer.style.touchAction = 'none';  // prevent default scrolling

joystickThumb.style.position = 'absolute';
joystickThumb.style.left = '50%';
joystickThumb.style.top = '50%';
joystickThumb.style.width = '40px';
joystickThumb.style.height = '40px';
joystickThumb.style.background = 'rgba(0, 255, 255, 0.7)';
joystickThumb.style.borderRadius = '50%';
joystickThumb.style.transform = 'translate(-50%, -50%)';

joystickContainer.addEventListener('touchstart', (e) => {
  e.preventDefault();
  joystickActive = true;
  const touch = e.targetTouches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  joystickThumb.style.left = startX + 'px';
  joystickThumb.style.top = startY + 'px';
});

joystickContainer.addEventListener('touchmove', (e) => {
  if (!joystickActive) return;
  e.preventDefault();

  const touch = e.targetTouches[0];
  let dx = touch.clientX - startX;
  let dy = touch.clientY - startY;

  // Limit joystick thumb movement radius to 40px
  const maxDist = 40;
  const dist = Math.min(Math.sqrt(dx*dx + dy*dy), maxDist);
  const angle = Math.atan2(dy, dx);

  dx = dist * Math.cos(angle);
  dy = dist * Math.sin(angle);

  joystickThumb.style.left = startX + dx + 'px';
  joystickThumb.style.top = startY + dy + 'px';

  // Normalize to -1..1
  const normX = dx / maxDist;
  const normY = dy / maxDist;

  if (game && game.snakes && game.snakes[0]) {
    // Update snake velocity or direction based on joystick input
    game.snakes[0].velocity.x = normX * game.snakes[0].speed;
    game.snakes[0].velocity.y = normY * game.snakes[0].speed;
  }
});

joystickContainer.addEventListener('touchend', (e) => {
  e.preventDefault();
  joystickActive = false;
  // Reset thumb position
  joystickThumb.style.left = '50%';
  joystickThumb.style.top = '50%';

  if (game && game.snakes && game.snakes[0]) {
    // Stop movement when joystick released
    game.snakes[0].velocity.x = 0;
    game.snakes[0].velocity.y = 0;
  }
});

// Show joystick only on mobile devices (touch support)
function isMobile() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

if (isMobile()) {
  joystickContainer.style.display = 'block';  // show joystick on mobile
} else {
  joystickContainer.style.display = 'none';   // hide on desktop
}

