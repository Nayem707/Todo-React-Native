const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SIZE = 1024;
const ACCENT = [14, 165, 233, 255];
const WHITE = [255, 255, 255, 255];
const TRANSPARENT = [0, 0, 0, 0];

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filePath, getPixel) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
  for (let y = 0; y < SIZE; y += 1) {
    const row = y * (SIZE * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < SIZE; x += 1) {
      const pixel = getPixel(x, y);
      const offset = row + 1 + x * 4;
      raw[offset] = pixel[0];
      raw[offset + 1] = pixel[1];
      raw[offset + 2] = pixel[2];
      raw[offset + 3] = pixel[3];
    }
  }

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, png);
}

function inCircle(x, y, cx, cy, radius) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function inRoundedRect(x, y, left, top, right, bottom, radius) {
  if (x < left || x > right || y < top || y > bottom) {
    return false;
  }

  const innerLeft = left + radius;
  const innerRight = right - radius;
  const innerTop = top + radius;
  const innerBottom = bottom - radius;

  if (x >= innerLeft && x <= innerRight) {
    return true;
  }

  if (y >= innerTop && y <= innerBottom) {
    return true;
  }

  return (
    inCircle(x, y, innerLeft, innerTop, radius) ||
    inCircle(x, y, innerRight, innerTop, radius) ||
    inCircle(x, y, innerLeft, innerBottom, radius) ||
    inCircle(x, y, innerRight, innerBottom, radius)
  );
}

function inTriangle(x, y, ax, ay, bx, by, cx, cy) {
  const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  const s = ((ax - cx) * (y - cy) - (ay - cy) * (x - cx)) / area;
  const t = ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) / area;
  const u = 1 - s - t;
  return s >= 0 && t >= 0 && u >= 0;
}

function inChatBubble(x, y, scale = 1, originX = 512, originY = 512) {
  const s = (value) => originX + (value - 512) * scale;
  const t = (value) => originY + (value - 512) * scale;
  const r = (value) => value * scale;

  return (
    inRoundedRect(x, y, s(250), t(270), s(774), t(690), r(90)) ||
    inTriangle(x, y, s(310), t(650), s(250), t(790), s(430), t(690))
  );
}

const root = path.join(__dirname, "..");

writePng(path.join(root, "assets", "icon.png"), (x, y) =>
  inChatBubble(x, y) ? WHITE : ACCENT,
);

writePng(path.join(root, "assets", "adaptive-icon.png"), (x, y) =>
  inChatBubble(x, y, 0.72) ? WHITE : TRANSPARENT,
);
