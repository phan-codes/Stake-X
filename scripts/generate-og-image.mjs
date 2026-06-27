/**
 * Generates og-image.png for Prime XBL
 * Run: node scripts/generate-og-image.mjs
 * Requires: npm install canvas
 */
import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SIZE = 1200;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// ── Background ──────────────────────────────────────────────────────────────
const bg = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE * 0.85);
bg.addColorStop(0, '#1a1200');
bg.addColorStop(0.45, '#0f0c00');
bg.addColorStop(1, '#050400');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, SIZE, SIZE);

// Warm amber glow bottom-left
const glow1 = ctx.createRadialGradient(0, SIZE, 0, 0, SIZE, SIZE * 0.7);
glow1.addColorStop(0, 'rgba(180, 100, 0, 0.35)');
glow1.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = glow1;
ctx.fillRect(0, 0, SIZE, SIZE);

// Subtle top-right glow
const glow2 = ctx.createRadialGradient(SIZE, 0, 0, SIZE, 0, SIZE * 0.6);
glow2.addColorStop(0, 'rgba(200, 130, 0, 0.18)');
glow2.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = glow2;
ctx.fillRect(0, 0, SIZE, SIZE);

// ── Helper: draw a wireframe diamond/cube shape ──────────────────────────────
function drawDiamond(cx, cy, r, alpha = 0.25) {
  ctx.save();
  ctx.strokeStyle = `rgba(212, 160, 30, ${alpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.7, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.7, cy);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHex(cx, cy, r, alpha = 0.2) {
  ctx.save();
  ctx.strokeStyle = `rgba(212, 160, 30, ${alpha})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawCube(cx, cy, s, alpha = 0.25) {
  // A simple 2-D wireframe cube icon
  ctx.save();
  ctx.strokeStyle = `rgba(212, 160, 30, ${alpha})`;
  ctx.lineWidth = 1.4;
  const h = s * 0.55, w = s * 0.7;
  // top face
  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  ctx.lineTo(cx + w / 2, cy - h * 0.45);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx - w / 2, cy - h * 0.45);
  ctx.closePath();
  ctx.stroke();
  // left face
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h * 0.45);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx, cy + h * 0.55);
  ctx.lineTo(cx - w / 2, cy + h * 0.1);
  ctx.closePath();
  ctx.stroke();
  // right face
  ctx.beginPath();
  ctx.moveTo(cx + w / 2, cy - h * 0.45);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx, cy + h * 0.55);
  ctx.lineTo(cx + w / 2, cy + h * 0.1);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// ── Geometric decorations ────────────────────────────────────────────────────
// Large central diamond border
drawDiamond(SIZE / 2, SIZE / 2, 390, 0.22);
drawDiamond(SIZE / 2, SIZE / 2, 360, 0.12);

// Corner cubes
drawCube(SIZE * 0.14, SIZE * 0.14, 54, 0.4);
drawCube(SIZE * 0.86, SIZE * 0.14, 54, 0.4);
drawCube(SIZE * 0.14, SIZE * 0.86, 54, 0.35);
drawCube(SIZE * 0.86, SIZE * 0.86, 54, 0.35);

// Mid-edge cubes
drawCube(SIZE / 2, SIZE * 0.08, 36, 0.3);
drawCube(SIZE / 2, SIZE * 0.92, 28, 0.25);
drawCube(SIZE * 0.08, SIZE / 2, 28, 0.2);
drawCube(SIZE * 0.92, SIZE / 2, 28, 0.2);

// Scattered hexagons
drawHex(SIZE * 0.78, SIZE * 0.22, 38, 0.3);
drawHex(SIZE * 0.22, SIZE * 0.78, 28, 0.25);

// Connecting lines (top-center cube → right-corner cube)
ctx.save();
ctx.strokeStyle = 'rgba(212, 160, 30, 0.18)';
ctx.lineWidth = 1;
ctx.setLineDash([4, 6]);
// top-left to top-mid
ctx.beginPath(); ctx.moveTo(SIZE * 0.14, SIZE * 0.14); ctx.lineTo(SIZE / 2, SIZE * 0.08); ctx.stroke();
// top-mid to top-right
ctx.beginPath(); ctx.moveTo(SIZE / 2, SIZE * 0.08); ctx.lineTo(SIZE * 0.86, SIZE * 0.14); ctx.stroke();
// bottom
ctx.beginPath(); ctx.moveTo(SIZE * 0.14, SIZE * 0.86); ctx.lineTo(SIZE / 2, SIZE * 0.92); ctx.stroke();
ctx.beginPath(); ctx.moveTo(SIZE / 2, SIZE * 0.92); ctx.lineTo(SIZE * 0.86, SIZE * 0.86); ctx.stroke();
// sides
ctx.beginPath(); ctx.moveTo(SIZE * 0.14, SIZE * 0.14); ctx.lineTo(SIZE * 0.08, SIZE / 2); ctx.stroke();
ctx.beginPath(); ctx.moveTo(SIZE * 0.08, SIZE / 2); ctx.lineTo(SIZE * 0.14, SIZE * 0.86); ctx.stroke();
ctx.beginPath(); ctx.moveTo(SIZE * 0.86, SIZE * 0.14); ctx.lineTo(SIZE * 0.92, SIZE / 2); ctx.stroke();
ctx.beginPath(); ctx.moveTo(SIZE * 0.92, SIZE / 2); ctx.lineTo(SIZE * 0.86, SIZE * 0.86); ctx.stroke();
ctx.restore();

// ── Border ───────────────────────────────────────────────────────────────────
const borderInset = 18;
ctx.save();
ctx.strokeStyle = 'rgba(212, 160, 30, 0.35)';
ctx.lineWidth = 1.5;
ctx.strokeRect(borderInset, borderInset, SIZE - borderInset * 2, SIZE - borderInset * 2);
ctx.restore();

// ── Text ─────────────────────────────────────────────────────────────────────
// "Prime XBL" — large bold
ctx.save();
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Subtle text glow
ctx.shadowColor = 'rgba(245, 166, 35, 0.6)';
ctx.shadowBlur = 28;

ctx.font = 'bold 148px Arial, sans-serif';
ctx.fillStyle = '#F5A623';
ctx.fillText('Prime XBL', SIZE / 2, SIZE * 0.43);

// Reset shadow for subtitle
ctx.shadowBlur = 14;
ctx.shadowColor = 'rgba(245, 166, 35, 0.4)';

// "Digital Finance Cloud Solution" — two lines
ctx.font = '500 62px Arial, sans-serif';
ctx.fillStyle = '#E8982A';
ctx.fillText('Digital Finance', SIZE / 2, SIZE * 0.595);
ctx.fillText('Cloud Solution', SIZE / 2, SIZE * 0.685);

ctx.restore();

// ── Save ─────────────────────────────────────────────────────────────────────
const outPath = join(__dirname, '../public/og-image.png');
const buffer = canvas.toBuffer('image/png');
writeFileSync(outPath, buffer);
console.log(`✅  og-image.png saved to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
