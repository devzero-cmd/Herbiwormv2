class Food {
	constructor(ctx, x, y) {
		this.ctx = ctx;
		this.pos = new Point(x, y);
		this.size = 40;

		// Veggie image paths
		this.imagePaths = [
			"assets/veggies/broccoli.png",
			"assets/veggies/apple.png",
			"assets/veggies/onion.png",
			"assets/veggies/eggplant.png",
			"assets/veggies/carrot.png"
		];

		// Random image
		const randomPath = this.imagePaths[Math.floor(Math.random() * this.imagePaths.length)];
		this.image = new Image();
		this.image.src = randomPath;
	}

	draw(player) {
		// Defensive: if player or velocity is undefined, skip
		if (!player || !player.velocity) return;

		// Move food relative to player
		this.pos.x -= player.velocity.x;
		this.pos.y -= player.velocity.y;

		if (this.image && this.image.complete) {
			// Draw image
			this.ctx.drawImage(
				this.image,
				this.pos.x - this.size / 2,
				this.pos.y - this.size / 2,
				this.size,
				this.size
			);
		} else {
			// Placeholder while image loads
			this.ctx.fillStyle = "gray";
			this.ctx.beginPath();
			this.ctx.arc(this.pos.x, this.pos.y, this.size / 2, 0, 2 * Math.PI);
			this.ctx.fill();
		}
	}

	die() {
		this.state = 1;
		const index = game.foods.indexOf(this);
		if (index !== -1) {
			game.foods.splice(index, 1);
		}
	}
}
