const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create PNG from raw RGBA buffer
function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk (with filter byte 0 at start of each scanline)
  const scanlineLength = width * 4 + 1;
  const rawIdat = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    rawIdat[y * scanlineLength] = 0; // filter type None
    rgbaBuffer.copy(
      rawIdat,
      y * scanlineLength + 1,
      y * width * 4,
      (y + 1) * width * 4
    );
  }

  const compressed = zlib.deflateSync(rawIdat);
  const idat = makeChunk('IDAT', compressed);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, len + 8));
  chunk.writeUInt32BE(crc, len + 8);
  return chunk;
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Draw TaskFlow icon (indigo rounded shield with checkmark)
function generateTaskFlowIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Squircle/rounded rect distance
      const dx = Math.abs(x - center);
      const dy = Math.abs(y - center);
      const roundness = size * 0.22;
      const insideX = dx <= radius - roundness;
      const insideY = dy <= radius - roundness;
      const cornerDist = Math.sqrt(
        Math.pow(dx - (radius - roundness), 2) +
        Math.pow(dy - (radius - roundness), 2)
      );

      const isInside = insideX || insideY || cornerDist <= roundness;

      if (!isInside) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Smooth anti-aliased edge
      let alpha = 255;
      if (!insideX && !insideY) {
        const edge = roundness - cornerDist;
        if (edge < 1) alpha = Math.max(0, Math.min(255, Math.floor(edge * 255)));
      }

      // Gradient from Indigo 600 (#4f46e5) to Violet 600 (#7c3aed)
      const gradRatio = (x + y) / (size * 2);
      const r = Math.floor(79 + (124 - 79) * gradRatio);
      const g = Math.floor(70 + (58 - 70) * gradRatio);
      const b = Math.floor(229 + (237 - 229) * gradRatio);

      // Checkmark check
      // Normalized coordinates: center is (0,0), scale -1 to 1
      const nx = (x - center) / (size * 0.5);
      const ny = (y - center) / (size * 0.5);

      // Checkmark segments:
      // Line 1: from (-0.45, 0.05) to (-0.1, 0.4)
      // Line 2: from (-0.1, 0.4) to (0.45, -0.3)
      const distToSeg1 = distToSegment(nx, ny, -0.4, 0.02, -0.08, 0.35);
      const distToSeg2 = distToSegment(nx, ny, -0.08, 0.35, 0.42, -0.3);
      const minDist = Math.min(distToSeg1, distToSeg2);
      const checkThickness = 0.09;

      if (minDist <= checkThickness) {
        // White checkmark
        buf[idx] = 255;
        buf[idx + 1] = 255;
        buf[idx + 2] = 255;
        buf[idx + 3] = alpha;
      } else if (minDist <= checkThickness + 0.02) {
        // Antialiased checkmark edge
        const t = (minDist - checkThickness) / 0.02;
        buf[idx] = Math.floor(255 * (1 - t) + r * t);
        buf[idx + 1] = Math.floor(255 * (1 - t) + g * t);
        buf[idx + 2] = Math.floor(255 * (1 - t) + b * t);
        buf[idx + 3] = alpha;
      } else {
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = alpha;
      }
    }
  }

  return createPng(size, size, buf);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of sizes) {
  const png = generateTaskFlowIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), png);
  console.log(`Generated icon-${size}x${size}.png`);
}

// Also write apple-touch-icon.png and favicon
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generateTaskFlowIcon(180));
console.log('All icons generated successfully!');
