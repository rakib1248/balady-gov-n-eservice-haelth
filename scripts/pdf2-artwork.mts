import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { PNG } from "pngjs";

// Extract a reusable template, permanently excluding all sample personal data.
// Run only when the supplied reference changes; Poppler is a development dependency.
const directory = await mkdtemp("/tmp/hotel-pdf2-artwork-");
try {
  execFileSync("pdftoppm", ["-r", "300", "-png", "-singlefile", "desing-reference/pdf2.pdf", `${directory}/reference`]);
  const source = PNG.sync.read(await readFile(`${directory}/reference.png`));
  assert.equal(source.width, 1011);
  assert.equal(source.height, 638);
  const template = new PNG({ width: source.width, height: source.height });
  source.data.copy(template.data);
  const clear = (left: number, top: number, width: number, height: number, color: number[]) => {
    for (let y = top; y < top + height; y++) for (let x = left; x < left + width; x++) {
      template.data.set([...color, 255], (y * template.width + x) * 4);
    }
  };
  clear(21, 135, 203, 203, [240, 244, 244]); // Portrait, inside the original frame.
  clear(21, 360, 203, 203, [240, 244, 244]); // Sample QR, inside the original frame.
  for (const top of [285, 399, 520]) for (const left of [251, 638]) clear(left, top, 354, 44, [255, 255, 255]);
  // Replace the sample name with a clean portion of the same background row.
  for (let y = 184; y < 220; y++) for (let x = 745; x < 990; x++) {
    const from = (y * source.width + x - 450) * 4;
    template.data.set(source.data.subarray(from, from + 4), (y * template.width + x) * 4);
  }
  await writeFile("public/certificate/pdf2-front.png", PNG.sync.write(template));
} finally {
  await rm(directory, { recursive: true, force: true });
}
