import fs from "fs";
import path from "path";
import sharp from "sharp";

const [svgPath, outDir] = process.argv.slice(2);

if (!svgPath || !outDir) {
  console.error("Usage: node generate-png-icons.mjs <svg-path> <output-dir>");
  process.exit(1);
}

const svg = fs.readFileSync(svgPath);

await sharp(svg).resize(180, 180).png().toFile(path.join(outDir, "apple-icon.png"));
await sharp(svg).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));

console.log(`Generated PNG icons in ${outDir}`);
