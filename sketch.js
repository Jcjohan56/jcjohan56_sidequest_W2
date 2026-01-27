// Emotion: Frustration
// Mischief: push boxes, steal coins

let blob;
let platforms = [];
let boxes = [];
let coins = [];
let stolen = 0;
let shake = 0;

function setup() {
  createCanvas(640, 360);

  blob = {
    x: 80,
    y: 200,
    r: 22,
    vx: 0,
    vy: 0,
    onGround: false
  };

  const floorY = height - 30;

  // Platforms (annoying steps + low ceiling)
  platforms = [
    { x: 0, y: floorY, w: width, h: height - floorY }, // floor
    { x: 110, y: floorY - 55, w: 90, h: 12 },
    { x: 240, y: floorY - 90, w: 90, h: 12 },
    { x: 370, y: floorY - 120, w: 110, h: 12 },
    { x: 180, y: floorY - 140, w: 130, h: 10 }, // low ceiling bonk
  ];

  boxes = [
    makeBox(140, floorY - 55 - 18, 18),
    makeBox(270, floorY - 90 - 18, 18),
    makeBox(410, floorY - 120 - 18, 18),
  ];

  // Coins for stealing
  coins = [
    makeCoin(160, floorY - 90, 7),
    makeCoin(300, floorY - 140, 7),
    makeCoin(520, floorY - 60, 7),
  ];
}

function draw() {
  background(238);

  // shake
  push();
  translate(random(-shake, shake), random(-shake, shake));
  shake *= 0.85;

  // platforms
  fill(190);
  for (const p of platforms) rect(p.x, p.y, p.w, p.h);

  // boxes
  updateBoxes();
  drawBoxes();

  // coins
  drawCoins();

  // blob physics
  handleInput();
  blob.vy += 0.9; // heavy gravity

  // move X then collide
  blob.x += blob.vx;
  collideX();

  // move Y then collide
  blob.y += blob.vy;
  blob.onGround = false;
  collideY();

    blob.vx *= blob.onGround ? 0.78 : 0.93;

  // blob draw (change colour when going faster)
  const speed = constrain(abs(blob.vx) + abs(blob.vy) * 0.15, 0, 8);
  fill(255, 140 - speed * 10, 140 - speed * 10);
  circle(blob.x, blob.y, blob.r * 2);

  pop();

  fill(40);
  text(`Stolen: ${stolen}`, 12, 20);
  text(`Mischief: shove boxes, touch coins`, 12, 40);
}

function handleInput() {
  let move = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;

  blob.vx += move * 0.8;
  blob.vx = constrain(blob.vx, -5.2, 5.2);

  // snappy accel
  blob.vx += move * 0.8;

  // hard stop 
  blob.vx *= blob.onGround ? 0.78 : 0.93;

  blob.vx = constrain(blob.vx, -5.2, 5.2);
}

function keyPressed() {
  // jump
  if ((key === " " || keyCode === UP_ARROW || keyCode === 87) && blob.onGround) {
    blob.vy = -10.2;
    blob.onGround = false;
  }
}

// ----- collisions ------

function collideX() {
  for (const p of platforms) {
    if (circleRect(blob.x, blob.y, blob.r, p.x, p.y, p.w, p.h)) {
      // knockback
      blob.x -= blob.vx;
      blob.vx *= -0.4;
      shake = max(shake, 5);
    }
  }
}

function collideY() {
  for (const p of platforms) {
    if (circleRect(blob.x, blob.y, blob.r, p.x, p.y, p.w, p.h)) {
      // if falling, land
      if (blob.vy > 0) {
        blob.y = p.y - blob.r;
        blob.vy = 0;
        blob.onGround = true;
      } else {
        //bonk
        blob.y -= blob.vy;
        blob.vy = 1.5;
        shake = max(shake, 6);
      }
    }
  }
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const testX = constrain(cx, rx, rx + rw);
  const testY = constrain(cy, ry, ry + rh);
  const dx = cx - testX;
  const dy = cy - testY;
  return dx * dx + dy * dy <= cr * cr;
}

// ----- Mischief -----

function makeBox(x, y, s) {
  return { x, y, s, vx: 0, vy: 0 };
}

function updateBoxes() {
  for (const b of boxes) {
    // shove if blob touches
    if (dist(blob.x, blob.y, b.x + b.s / 2, b.y + b.s / 2) < blob.r + b.s * 0.6) {
      b.vx += (blob.vx * 0.6) + (blob.x < b.x ? 0.6 : -0.6);
      shake = max(shake, 3);
    }

    // gravity
    b.vy += 0.8;
    b.x += b.vx;
    b.y += b.vy;

    // friction
    b.vx *= 0.9;

    // collide with platforms
    for (const p of platforms) {
      if (rectRect(b.x, b.y, b.s, b.s, p.x, p.y, p.w, p.h)) {
        // only handle landing simply
        b.y = p.y - b.s;
        b.vy = 0;
      }
    }
  }
}

function drawBoxes() {
  fill(120);
  for (const b of boxes) rect(b.x, b.y, b.s, b.s, 3);
}

function makeCoin(x, y, r) {
  return { x, y, r, taken: false };
}

function drawCoins() {
  for (const c of coins) {
    if (c.taken) continue;

    // steal if touch
    if (dist(blob.x, blob.y, c.x, c.y) < blob.r + c.r) {
      c.taken = true;
      stolen += 1;
      shake = max(shake, 4);
      continue;
    }

    fill(245, 200, 60);
    circle(c.x, c.y, c.r * 2);
  }
}

function rectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}
