class Game {
  constructor(ctxSnake, ctxFood, ctxHex) {
    this.ctxSnake = ctxSnake;
    this.ctxFood = ctxFood;
    this.ctxHex = ctxHex;

    // Set screen size to window size (fullscreen)
    this.SCREEN_SIZE = new Point(window.innerWidth, window.innerHeight);

    // Make world size bigger than screen size for scrolling, etc.
    this.WORLD_SIZE = new Point(window.innerWidth * 5, window.innerHeight * 5);

    // Center the world position based on screen size
    this.world = new Point(-this.SCREEN_SIZE.x / 2, -this.SCREEN_SIZE.y / 2);

    this.snakes = [];
    this.foods = [];
    this.bricks = [];
    this.state = "playing";
  }
	init() {
  this.snakes = [];    // Clear old snakes
  this.foods = [];     // Clear old food
  this.bricks = [];    // Clear bricks if needed

  this.world = new Point(-1200, -600); // Reset world position

  this.snakes[0] = new Snake(this.ctxSnake, "YOU", 0);
  for (var i = 0; i < 10; i++) this.addSnake(ut.randomName(), 100);
  this.generateFoods(1000);

  this.state = "playing"; // Reset game state here
}

	draw() {
		this.drawWorld(); // Always draw background

		if (!this.snakes[0]) return;

		// Check player state
		if (this.snakes[0].state === 0) {
			this.snakes[0].move();
			this.state = "playing";
		} else {
			this.state = "dead";
		}

		// Move other snakes
		for (let i = 1; i < this.snakes.length; i++) {
			if (this.snakes[i].state === 0) {
				this.snakes[i].move(this.snakes[0]);
			}
		}

		// Draw food
		for (let i = 0; i < this.foods.length; i++) {
			this.foods[i].draw(this.snakes[0]);
		}

		// Always draw default leaderboard and map
		this.drawScore();
		this.drawMap();

		// Show centered leaderboard if dead
		if (this.state === "dead") {
			this.drawLeaderboard();
		}
	}

    drawHexBackground() {
	const hexSize = 30;
	const hexWidth = hexSize * Math.sqrt(3);
	const hexHeight = hexSize * 1.5;

	// Create RGB hue rotation
	let hue = (performance.now() / 50) % 360;
	let color = `hsl(${hue}, 100%, 50%)`;

	for (let x = -hexWidth; x < this.WORLD_SIZE.x + hexWidth; x += hexWidth * 0.75) {
		for (let y = -hexHeight; y < this.WORLD_SIZE.y + hexHeight; y += hexHeight) {
			let offsetX = (Math.floor(y / hexHeight) % 2 === 0) ? 0 : hexWidth / 2;
			let hex = new Hexagon(
				this.ctxHex,
				this.world.x + x + offsetX,
				this.world.y + y
			);
			hex.fillStyle = color;
			hex.strokeStyle = "rgba(255,255,255,0.1)";
			hex.draw();
		}
	}
}


	drawWorld() {
		this.ctxHex.fillStyle = "white";
		this.ctxHex.fillRect(this.world.x - 2, this.world.y - 2, this.WORLD_SIZE.x + 4, this.WORLD_SIZE.y + 4);

		this.ctxHex.fillStyle = "#17202A";
		this.ctxHex.fillRect(this.world.x, this.world.y, this.WORLD_SIZE.x, this.WORLD_SIZE.y);

		if (this.state === "playing") {
			this.world.x -= this.snakes[0].velocity.x;
			this.world.y -= this.snakes[0].velocity.y;
		}
	}

	drawScore() {
		let start = new Point(20, 20);
		for (let i = 0; i < this.snakes.length; i++) {
			this.ctxSnake.fillStyle = this.snakes[i].mainColor;
			this.ctxSnake.font = "bold 10px Arial";
			this.ctxSnake.fillText(`${this.snakes[i].name}:${this.snakes[i].score}`, start.x - 5, start.y + i * 15);
		}
	}

	drawMap() {
		this.ctxSnake.globalAlpha = 0.5;

		let mapSize = new Point(150, 75); // ✅ made it bigger
		let start = new Point(20, this.SCREEN_SIZE.y - mapSize.y - 10);
		this.ctxSnake.fillStyle = "white";
		this.ctxSnake.fillRect(start.x, start.y, mapSize.x, mapSize.y);
		this.ctxSnake.globalAlpha = 1;

		// draw players
		for (let i = 0; i < this.snakes.length; i++) {
			let playerInMap = new Point(
				(start.x + (mapSize.x / this.WORLD_SIZE.x) * this.snakes[i].pos.x),
				(start.y + (mapSize.y / this.WORLD_SIZE.y) * this.snakes[i].pos.y)
			);

			this.ctxSnake.fillStyle = this.snakes[i].mainColor;
			this.ctxSnake.beginPath();
			this.ctxSnake.arc(playerInMap.x, playerInMap.y, 2, 0, 2 * Math.PI);
			this.ctxSnake.fill();
		}
	}

	drawLeaderboard() {
    let sortedSnakes = [...this.snakes].sort((a, b) => b.score - a.score);

    const boxWidth = 500;
    const boxHeight = 240;
    const boxX = (this.SCREEN_SIZE.x - boxWidth) / 2;  // center X
    const boxY = (this.SCREEN_SIZE.y - boxHeight) / 2; // center Y

    // Background rectangle (semi-transparent)
    this.ctxSnake.fillStyle = "rgba(0, 0, 0, 0.26)";
    this.ctxSnake.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Title text
    this.ctxSnake.fillStyle = "white";
    this.ctxSnake.font = "bold 24px Arial";
    this.ctxSnake.fillText("Game Over - Leaderboard", boxX + 80, boxY + 30);

    // Scores list
    this.ctxSnake.font = "16px Arial";
    for (let i = 0; i < Math.min(sortedSnakes.length, 10); i++) {
        let s = sortedSnakes[i];
        this.ctxSnake.fillStyle = s.mainColor;
        this.ctxSnake.fillText(`${i + 1}. ${s.name}: ${s.score}`, boxX + 120, boxY + 60 + i * 20);
    }
}

	addSnake(name, id) {
		this.snakes.push(new SnakeAi(this.ctxSnake, name, id));
	}

	generateFoods(n) {
		for (let i = 0; i < n; i++) {
			this.foods.push(
				new Food(this.ctxFood,
					ut.random(-1200 + 50, 2800 - 50),
					ut.random(-600 + 50, 1400 - 50))
			);
		}
	}
}

// After you create your game instance somewhere else in your code:

var game = new Game(ctxSnake, ctxFood, ctxHex);

// ...your existing start and update functions...

canvas.addEventListener("click", () => {
  if (game.state === "dead") {
    game.init();
  }
});