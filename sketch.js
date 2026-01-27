// Emotion: Frustration
// Mischief: push boxes, steal coins

let blob;
let platforms = [];
let boxes = [];
let coins = [];
let stolen = 0;
let shake = 0;

const W = 640;
const H = 360;

const GRAVITY = 0.9;
const MOVE_ACCEL = 0.8;
const MAX_RUN = 5.2;
const JUMP_V = -10.2;

const FRICTION_GROUND = 0.78;
const FRICTION_AIR = 0.93;

function setup() {
  createCanvas(W, H);

  const floorY = height - 30;

  blob = {
    x: 80,
    y: floorY - 22,
    r: 22,
    vx: 0,
    vy: 0,
    onGround: false,
    spawnX: 80,
    spawnY: floorY - 22
  };

  platforms = [
    { x: 0, y: floorY, w: width, h: height - floorY },
    { x: 110, y: floorY - 55, w: 90, h: 12 },
    { x: 240, y: floorY - 90, w: 90, h: 12 },
    { x: 370, y: floorY - 120, w: 110, h: 12 },
    { x: 180, y: floorY - 140, w: 130, h: 10 }
  ];

  boxes = [
    makeBox(140, floorY - 55 - 18, 18),
    makeBox(270, floorY - 90 - 18, 18),
    makeBox(410, floorY - 120 - 18, 18)
  ];

  coins = [
    makeCoin(160, floorY - 90, 7),
    makeCoin(300, floorY - 140, 7),
    makeCoin(520, floorY - 60, 7)
  ];
}

function draw() {
  if (!isFinite(blob.x) || !isFinite(blob.y) || !isFinite(blob.vx) || !isFinite(blob.vy)) {
    respawnBlob();
  }

  background(238);

  shake = isFinite(shake) ? shake : 0;
  push();
  translate(random(-shake, shake), random(-shake, shake));
  shake *= 0.85;

  drawPlatforms();

  updateBoxes();
  drawBoxes();

  updateCoinsAndDraw();

  updateBlob();
  drawBlob();

  pop();

  fill(40);
  text(`Stolen: ${stolen}`, 12, 20);
  text(`A D or arrows, space or W or up`, 12, 40);
}

function updateBlob() {
  handleInput();

  blob.vy += GRAVITY;

  // X move + collide
  blob.x += blob.vx;
  collideX();

  // Y move + collide
  blob.y += blob.vy;
  blob.onGround = false;
  collideY();

  // friction after collisions decide grounded state
  blob.vx *= blob.onGround ? FRICTION_GROUND : FRICTION_AIR;

  // clamp velocity
  blob.vx = constrain(blob.vx, -MAX_RUN, MAX_RUN);

  // keep within horizontal bounds so it can't leave the sim
  const pad = blob.r;
  blob.x = constrain(blob.x, pad, width - pad);

  // if it falls far below, respawn
  if (blob.y > height + 200) respawnBlob();
}

function handleInput() {
  let move = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;

  blob.vx += move * MOVE_ACCEL;
}

function keyPressed() {
  if ((key === " " || keyCode === UP_ARROW || keyCode === 87) && blob.onGround) {
    blob.vy = JUMP_V;
    blob.onGround = false;
  }
}

function drawPlatforms() {
  fill(190);
  for (const p of platforms) rect(p.x, p.y, p.w, p.h);
}

function drawBlob() {
  const speed = constrain(abs(blob.vx) + abs(blob.vy) * 0.15, 0, 8);
  fill(255, 140 - speed * 10, 140 - speed * 10);
  circle(blob.x, blob.y, blob.r * 2);
}

function collideX() {
  for (const p of platforms) {
 
    if (blob.y <= p.y || blob.y >= p.y + p.h) continue;

    if (circleRect(blob.x, blob.y, blob.r, p.x, p.y, p.w, p.h)) {
      blob.x -= blob.vx;
      blob.vx *= -0.4;
      shake = max(shake, 5);
    }
  }
}

function collideY() {
  for (const p of platforms) {
    if (!circleRect(blob.x, blob.y, blob.r, p.x, p.y, p.w, p.h)) continue;

    if (blob.vy > 0) {
      blob.y = p.y - blob.r;
      blob.vy = 0;
      blob.onGround = true;
    } else {
      // cleaner bonk resolution
      blob.y = p.y + p.h + blob.r;
      blob.vy = 1.5;
      shake = max(shake, 6);
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

function respawnBlob() {
  blob.x = blob.spawnX;
  blob.y = blob.spawnY;
  blob.vx = 0;
  blob.vy = 0;
  blob.onGround = false;
  shake = 0;
}

// Mischief

function makeBox(x, y, s) {
  return { x, y, s, vx: 0, vy: 0 };
}

function updateBoxes() {
  for (const b of boxes) {
    if (dist(blob.x, blob.y, b.x + b.s / 2, b.y + b.s / 2) < blob.r + b.s * 0.6) {
      b.vx += (blob.vx * 0.6) + (blob.x < b.x ? 0.6 : -0.6);
      shake = max(shake, 3);
    }

    b.vy += 0.8;
    b.x += b.vx;
    b.y += b.vy;

    b.vx *= 0.9;

    for (const p of platforms) {
      if (rectRect(b.x, b.y, b.s, b.s, p.x, p.y, p.w, p.h)) {
        b.y = p.y - b.s;
        b.vy = 0;
      }
    }

    if (b.y > height + 200) {
      b.y = height - 60;
      b.vy = 0;
      b.vx *= 0.2;
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

function updateCoinsAndDraw() {
  for (const c of coins) {
    if (c.taken) continue;
    if (dist(blob.x, blob.y, c.x, c.y) < blob.r + c.r) {
      c.taken = true;
      stolen += 1;
      shake = max(shake, 4);
    }
  }

  for (const c of coins) {
    if (c.taken) continue;
    fill(245, 200, 60);
    circle(c.x, c.y, c.r * 2);
  }
}

function rectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}
