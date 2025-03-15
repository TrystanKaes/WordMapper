export class Bubble {
  // Declare class properties
  targetRadius;
  baseRadius;
  radius;
  growthSpeed;
  x;
  y;
  speedX;
  speedY;
  opacity;
  r;
  g;
  b;
  text;
  count;
  canvas;
  ctx;
  isPopping;
  popProgress;
  popSpeed;
  maxSpeed;
  speedLimitEnabled;

  constructor(word, count, canvas, ctx, popCallback, speedLimitEnabled = true) {
    // Base size on word frequency (count)
    const sizeMultiplier = 17;
    this.targetRadius = count * sizeMultiplier;
    this.baseRadius = this.targetRadius;
    this.radius = this.targetRadius;
    this.growthSpeed = 0.1; // Speed of size change animation

    const minHeight = canvas.height / 3;
    const maxHeight = canvas.height - this.radius;
    this.y = Math.random() * (maxHeight - minHeight) + minHeight;
    this.x = this.radius; // Just enough space from left edge

    // Initial velocity aimed upward and to the right
    const maxSpeed = 3; // Maximum allowed speed
    const speed = Math.min(2, maxSpeed); // Initial speed capped at maxSpeed
    // Random angle up
    const angle = -(Math.random() * (Math.PI / 3 - Math.PI / 6) + Math.PI / 6);
    this.speedX = Math.cos(angle) * speed;
    this.speedY = Math.sin(angle) * speed;
    this.maxSpeed = maxSpeed; // Store maxSpeed as instance property
    this.speedLimitEnabled = speedLimitEnabled;

    this.opacity = Math.random() * 0.5 + 0.3;

    this.r = Math.floor(Math.random() * 256);
    this.g = Math.floor(Math.random() * 256);
    this.b = Math.floor(Math.random() * 256);

    this.text = word;
    this.count = count;
    this.canvas = canvas;
    this.ctx = ctx;
    this.isPopping = false;
    this.popProgress = 0;
    this.popSpeed = 0.1;

    // Add click handler
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check if click is within bubble
      const dx = clickX - this.x;
      const dy = clickY - this.y;
      if (Math.sqrt(dx * dx + dy * dy) <= this.radius) {
        this.isPopping = true;
        if (popCallback) {
          popCallback(this);
        }
      }
    });
  }

  draw() {
    if (this.isPopping) {
      // Draw popping animation
      this.ctx.beginPath();
      this.ctx.arc(
        this.x,
        this.y,
        this.radius * (1 + this.popProgress),
        0,
        Math.PI * 2
      );
      this.ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${
        this.opacity * (1 - this.popProgress)
      })`;
      this.ctx.fill();
      return;
    }

    // Draw bubble
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
    this.ctx.fill();

    // Draw shine
    this.ctx.beginPath();
    this.ctx.arc(
      this.x - this.radius / 3,
      this.y - this.radius / 3,
      this.radius / 4,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = `rgba(${this.r + 40}, ${this.g + 40}, ${
      this.b + 40
    }, ${this.opacity + 0.2})`;
    this.ctx.fill();

    // Draw text with lighter version of bubble color
    this.ctx.fillStyle = `rgba(${Math.min(255, this.r + 100)},
                                ${Math.min(255, this.g + 100)},
                                ${Math.min(255, this.b + 100)},
                                ${Math.min(1, this.opacity + 0.4)})`;
    this.ctx.font = `${this.radius / 3}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(this.text, this.x, this.y);
  }

  update(bubbles) {
    if (this.isPopping) {
      this.popProgress += this.popSpeed;
      if (this.popProgress >= 1) {
        // Remove this bubble from the bubbles array
        const index = bubbles.indexOf(this);
        if (index > -1) {
          bubbles.splice(index, 1);
          Bubble.adjustBubbleSizes(bubbles, this.canvas, true);
        }
      }
      return;
    }

    // Only animate towards target size if it changed due to word frequency
    if (Math.abs(this.radius - this.targetRadius) > 0.1) {
      const diff = this.targetRadius - this.radius;
      this.radius += diff * this.growthSpeed;
      this.baseRadius = this.radius;
    }

    // Move bubble
    this.x += this.speedX;
    this.y += this.speedY;

    // Limit velocity after any changes (like collisions)
    if (this.speedLimitEnabled) {
      const currentSpeed = Math.sqrt(
        this.speedX * this.speedX + this.speedY * this.speedY
      );
      if (currentSpeed > this.maxSpeed) {
        const scale = this.maxSpeed / currentSpeed;
        this.speedX *= scale;
        this.speedY *= scale;
      }
    }

    // Bounce off walls - ensure bubble stays completely within canvas
    if (this.x + this.radius > this.canvas.width) {
      this.x = this.canvas.width - this.radius;
      this.speedX = -this.speedX;
    } else if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.speedX = -this.speedX;
    }

    if (this.y + this.radius > this.canvas.height) {
      this.y = this.canvas.height - this.radius;
      this.speedY = -this.speedY;
    } else if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.speedY = -this.speedY;
    }

    // Check collision with other bubbles
    bubbles.forEach((otherBubble) => {
      if (otherBubble === this) return;

      const dx = otherBubble.x - this.x;
      const dy = otherBubble.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.radius + otherBubble.radius) {
        // Collision detected - calculate new velocities
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate velocities
        const vx1 = this.speedX * cos + this.speedY * sin;
        const vy1 = this.speedY * cos - this.speedX * sin;
        const vx2 = otherBubble.speedX * cos + otherBubble.speedY * sin;
        const vy2 = otherBubble.speedY * cos - otherBubble.speedX * sin;

        // Calculate mass based on radius (area of the bubble)
        const m1 = this.radius * this.radius;
        const m2 = otherBubble.radius * otherBubble.radius;
        const totalMass = m1 + m2;

        // Calculate new velocities using conservation of momentum
        const newVx1 = (vx1 * (m1 - m2) + 2 * m2 * vx2) / totalMass;
        const newVx2 = (vx2 * (m2 - m1) + 2 * m1 * vx1) / totalMass;

        // Update velocities
        this.speedX = newVx1 * cos - vy1 * sin;
        this.speedY = vy1 * cos + newVx1 * sin;
        otherBubble.speedX = newVx2 * cos - vy2 * sin;
        otherBubble.speedY = vy2 * cos + newVx2 * sin;

        // Move bubbles apart to prevent sticking
        const overlap = (this.radius + otherBubble.radius - distance) / 2;
        this.x -= overlap * cos;
        this.y -= overlap * sin;
        otherBubble.x += overlap * cos;
        otherBubble.y += overlap * sin;
      }
    });
  }

  static adjustBubbleSizes(bubbles, canvas, animate = false) {
    // Calculate total area of all bubbles
    const totalBubbleArea = bubbles.reduce((sum, bubble) => {
      return sum + Math.PI * bubble.targetRadius * bubble.targetRadius;
    }, 0);

    // Calculate canvas area (we'll use 60% as maximum coverage)
    const maxAllowedArea = canvas.width * canvas.height * 0.8;

    // If total bubble area exceeds allowed area, scale all bubbles down
    if (totalBubbleArea > maxAllowedArea) {
      const scaleFactor = Math.sqrt(maxAllowedArea / totalBubbleArea);
      bubbles.forEach((bubble) => {
        bubble.targetRadius *= scaleFactor;
        if (!animate) {
          bubble.radius = bubble.targetRadius;
        }

        bubble.baseRadius = bubble.targetRadius;
      });
    }
  }
}
