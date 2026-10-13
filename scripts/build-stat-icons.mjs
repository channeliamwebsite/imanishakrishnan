// Builds the web-ready statistics icons from the source artworks in public/images/stati.
//
//   node scripts/build-stat-icons.mjs
//
// The sources are 1–1.5k px RGB PNGs on white with wide margins and ~6px strokes. Scaled by the
// browser to the ~44px icon slot, those strokes fall under half a pixel and break up. For each
// source this script: crops a square around the drawing, turns the white background transparent,
// thickens the strokes so they render ~1.4px at the icon size (matching the previous line icons),
// downsamples with Lanczos to 3× the largest display size, and fills the lines with the site
// burgundy. The source files are left untouched.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SRC_DIR = "public/images/stati";
const OUT_DIR = `${SRC_DIR}/web`;
const SIZE = 132; // 3× the 44px desktop slot (size-11)
const BURGUNDY = { r: 0x4a, g: 0x11, b: 0x19 }; // --burgundy in app/globals.css
const STROKE_AT_SLOT = 1.4 / 44; // target stroke width as a fraction of the icon side
const SOURCE_STROKE = 6; // measured stroke width of the source artworks, px

const ICONS = ["years_in_media", "bus", "channeliam", "awards"];

mkdirSync(OUT_DIR, { recursive: true });

for (const name of ICONS) {
  const src = sharp(`${SRC_DIR}/${name}.png`);
  const { width, height } = await src.metadata();

  // Line coverage: 0 on the white background, 255 on the strokes.
  const ink = await sharp(`${SRC_DIR}/${name}.png`).greyscale().negate().raw().toBuffer();

  // Bounding box of the drawing.
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (ink[y * width + x] > 40) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }

  // Square around its centre, with a little margin for the thickened strokes.
  const side = Math.round(Math.max(x1 - x0, y1 - y0) * 1.08);
  const left = Math.round((x0 + x1) / 2 - side / 2);
  const top = Math.round((y0 + y1) / 2 - side / 2);
  const target = STROKE_AT_SLOT * side;
  const radius = Math.max(0, Math.round((target - SOURCE_STROKE) / 2));

  // Crop (padding with background where the square runs past the canvas), normalise the line
  // coverage to 0–255 and drop the faint noise in the off-white background.
  let peak = 0;
  for (const v of ink) if (v > peak) peak = v;
  const crop = new Uint8Array(side * side);
  for (let y = 0; y < side; y++)
    for (let x = 0; x < side; x++) {
      const sx = left + x, sy = top + y;
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      const v = ((ink[sy * width + sx] - 12) / (peak - 12)) * 255;
      crop[y * side + x] = Math.max(0, Math.min(255, v));
    }

  // Thicken: max over a round brush keeps the drawing's rounded corners and line ends.
  const offsets = [];
  for (let dy = -radius; dy <= radius; dy++)
    for (let dx = -radius; dx <= radius; dx++) if (dx * dx + dy * dy <= radius * radius) offsets.push([dx, dy]);
  const thick = new Uint8Array(side * side);
  for (let y = 0; y < side; y++)
    for (let x = 0; x < side; x++) {
      let m = 0;
      for (const [dx, dy] of offsets) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= side || yy >= side) continue;
        const v = crop[yy * side + xx];
        if (v > m && (m = v) === 255) break;
      }
      thick[y * side + x] = m;
    }

  const alpha = await sharp(thick, { raw: { width: side, height: side, channels: 1 } })
    .resize(SIZE, SIZE, { kernel: "lanczos3" })
    .extractChannel(0) // raw single-channel input comes back as sRGB
    .raw()
    .toBuffer();

  await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: BURGUNDY } })
    .joinChannel(alpha, { raw: { width: SIZE, height: SIZE, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT_DIR}/${name}.png`);

  console.log(`${name}: crop ${side}px @ (${left}, ${top}), dilate ${radius}px → ${OUT_DIR}/${name}.png`);
}
