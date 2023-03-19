const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const { sin, cos } = Math;
let connectColor = "#009975"
let pointColor = "#d9d872"
let width;
let height;
let points;
let i = 0;
const range = x => Array(x).fill(0).map((_, index) => index)
const rad = (deg)=>deg / 180 * Math.PI
const beestSettings = function() {
  this.legsPerSide = 3;
  this.speed = 2;
  this.doubleSide = true;
};

const beest = new beestSettings();
var gui = new dat.GUI();
gui.add(
  beest,
  "legsPerSide",
  range(10).map(i => i + 1)
);
gui.add(beest, "speed", -10, 10);
gui.add(beest, "doubleSide");

const init = () => {
  const { innerWidth, innerHeight } = window;
  width = innerWidth;
  height = innerHeight;
  canvas.width = width;
  canvas.height = height;
  ctx.translate(width / 2, height / 2);
};

window.addEventListener("resize", init);
init();

const circle = ({ p, r = 2, c = "#000", fill = true }) => {
  const { x, y } = p;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  if (fill) {
    ctx.fillStyle = c;
    ctx.fill();
  } else {
    ctx.strokeStyle = c;
    ctx.stroke();
  }
};
const connect = (p0, p1) => {
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.strokeStyle = connectColor;
  ctx.stroke();
};
const drawPoints = () => {
  points.forEach(p => {
    circle({ p, r: 1.2, c: pointColor });
  });
};
const storePoint = p => {
  points.push(p);
};


// Finds intersection between two circles
// From : https://stackoverflow.com/questions/12219802/a-javascript-function-that-returns-the-x-y-points-of-intersection-between-two-ci

const intersection = (x0, y0, r0, x1, y1, r1) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Math.hypot(dx, dy);
  const a = (r0 * r0 - r1 * r1 + d * d) / (2.0 * d);
  const x2 = x0 + (dx * a) / d;
  const y2 = y0 + (dy * a) / d;
  const h = Math.sqrt(r0 * r0 - a * a);
  const rx = -dy * (h / d);
  const ry = dx * (h / d);
  const xi = x2 + rx;
  const xi_prime = x2 - rx;
  const yi = y2 + ry;
  const yi_prime = y2 - ry;
  const pArr = [
    { x: xi, y: yi },
    { x: xi_prime, y: yi_prime }
  ];
  pArr.sort((a, b) => a.x - b.x);
  const [l, r] = pArr;
  pArr.sort((a, b) => a.y - b.y);
  const [t, b] = pArr;
  return { l, r, t, b };
};

const findPoint = (p0, p1, r0, r1, d) => {
  const newPoint = intersection(p0.x, p0.y, r0, p1.x, p1.y, r1)[d];
  storePoint(newPoint);
  connect(p0, newPoint);
  connect(p1, newPoint);
  return newPoint;
};
const genPoint = (x, y) => {
  const point = { x, y };
  storePoint(point);
  return point;
};


// Modified version of Matlab code from https://community.wolfram.com/groups/-/m/t/863933
const updatePoints = (side, phase) => {
  const scaleMultiplier = Math.min(width, height) / 200;
  ctx.save();
  points = [];
  ctx.scale(side * scaleMultiplier, scaleMultiplier);
  const theta = rad(side * i) + phase;
  const p0 = genPoint(0, 0);
  const p1 = genPoint(-38, 7.8);
  const p2 = genPoint(15 * cos(theta), 15 * sin(theta));
  const p3 = findPoint(p1, p2, 41.5, 50, "t");
  const p4 = findPoint(p1, p2, 39.3, 61.9, "b");
  const p5 = findPoint(p1, p3, 40.1, 55.8, "l");
  const p6 = findPoint(p4, p5, 36.7, 39.4, "l");
  const p7 = findPoint(p4, p6, 49, 65.7, "b");
  connect(p0, p2);
  if (!phase) {
    connect(p0, p1);
  }
  drawPoints();
  ctx.restore();
};

const update = () => {
  ctx.clearRect(-width / 2, -height / 2, width, height);
  i += beest.speed;
  const legsPerSide = parseInt(beest.legsPerSide);
  const sideArray = [1];
  if (beest.doubleSide) {
    sideArray.push(-1);
  }
  sideArray.forEach(side => {
    range(legsPerSide).forEach(leg => {
      updatePoints(side, 2 * (Math.PI / legsPerSide) * leg);
    });
  });

  requestAnimationFrame(update);
};
update();
