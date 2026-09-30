#!/usr/bin/env node
/**
 * Builds the Thundra International brand assets from vector geometry.
 *
 * The logo is reproduced programmatically, so it can be re-generated without
 * any source artwork: an oblique monogram "T" with a gold lightning bolt
 * knocked through it, over the THUNDRA wordmark and tagline.
 *
 * Requirements: ImageMagick 6+ on PATH (`convert`).
 *
 * Usage:  node scripts/build-brand-assets.mjs
 *
 * Outputs (the "-light" variants carry an ink wordmark for light backgrounds)
 *   public/brand/logo.png                 stacked lockup, transparent
 *   public/brand/logo-dark.png            stacked lockup on an ink plate
 *   public/brand/logo-mark.png            monogram only, transparent
 *   public/brand/logo-mark-light.png      monogram only, ink "T"
 *   public/brand/logo-horizontal.png      mark + wordmark, transparent
 *   public/brand/logo-horizontal-light.png mark + wordmark, ink "T"
 *   app/icon.png                          favicon, 512x512
 *   app/apple-icon.png                    Apple touch icon, 180x180
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BUILD = path.join(ROOT, ".brand-build");
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

/* ------------------------------------------------------------------ palette */
const INK = "#14141C";
const PLATE = "#0A0A10";
const GOLD_HI = "#FFF3B4";
const GOLD_LO = "#C87F00";
const GOLD = "#E8A319";

/* ------------------------------------------------------------ imagemagick io */
const f = (n) => path.join(BUILD, `${n}.png`);

function im(args) {
  execFileSync("convert", args, { stdio: ["ignore", "pipe", "pipe"] });
  return args[args.length - 1];
}

function sizeOf(file) {
  const out = execFileSync("identify", ["-format", "%w %h", `${file}[0]`], {
    encoding: "utf8",
  });
  const [w, h] = out.trim().split(/\s+/).map(Number);
  return { w, h };
}

function measure(label, file) {
  const { w, h } = sizeOf(file);
  console.log(`  ${label.padEnd(34)} ${w}x${h}`);
}

/* ------------------------------------------------------------------ geometry */

const UNITS = 1000; // design space for the monogram
const SHEAR = 0.2; // shared slant, keeps mark + wordmark in the same italic
const SHEAR_DEG = (Math.atan(SHEAR) * 180) / Math.PI;

const CROSSBAR = [
  [170, 232],
  [830, 232],
  [830, 386],
  [170, 386],
];
const STEM = [
  [408, 386],
  [648, 386],
  [648, 848],
  [408, 936],
];
// Lightning bolt: narrow enough that the "T" still reads at favicon size.
const BOLT = [
  [606, 30],
  [326, 556],
  [494, 538],
  [386, 984],
  [726, 404],
  [506, 444],
];
const GAP = 20; // how far the bolt is inset into the "T" (design units)

const slant = ([x, y]) => [x + SHEAR * (UNITS - y), y];

function polygon(pts, multiplier) {
  return pts
    .map((p) => {
      const [x, y] = slant(p);
      return `${(x * multiplier).toFixed(1)},${(y * multiplier).toFixed(1)}`;
    })
    .join(" ");
}

/** Monogram (white or ink "T" with the gold bolt through it), trimmed. */
function buildMonogram(px, tee) {
  const S = 4; // supersample, then downsample for clean edges
  const canvas = UNITS * S;
  const teeColor = tee === "ink" ? INK : "#FFFFFF";
  const stem = f(`tee-${tee}`);
  const bolt = f("bolt");
  const gap = f("gap");

  im([
    "-size", `${canvas}x${canvas}`, "xc:none",
    "-fill", teeColor, "-stroke", "none",
    "-draw", `polygon ${polygon(CROSSBAR, S)}`,
    "-draw", `polygon ${polygon(STEM, S)}`,
    `png32:${stem}`,
  ]);

  im([
    "-size", `${canvas}x${canvas}`, "xc:none",
    "-fill", "#FFFFFF", "-stroke", "none",
    "-draw", `polygon ${polygon(BOLT, S)}`,
    `png32:${bolt}`,
  ]);

  im([
    "-size", `${canvas}x${canvas}`, "xc:none",
    "-fill", "none", "-stroke", "#FFFFFF", "-strokewidth", String(GAP * S),
    "-draw", `polygon ${polygon(BOLT, S)}`,
    `png32:${gap}`,
  ]);

  // knock the bolt (plus its inset) out of the "T"
  im([stem, gap, "-compose", "DstOut", "-composite", `png32:${f(`tee-${tee}-cut`)}`]);

  // gold gradient, clipped to the bolt
  im([
    "-size", `${canvas}x${canvas}`, `gradient:${GOLD_HI}-${GOLD_LO}`,
    "-gamma", "1.6", `png32:${f("gradient")}`,
  ]);
  im([
    f("gradient"), bolt, "-alpha", "off", "-compose", "CopyOpacity",
    "-composite", "-strip", `png32:${f("bolt-gold")}`,
  ]);

  const out = f(`mono-${tee}`);
  im([
    f(`tee-${tee}-cut`), f("bolt-gold"), "-compose", "over", "-composite",
    "-resize", `${px}x${px}`, "-trim", "+repage", "-strip", `png32:${out}`,
  ]);
  return out;
}

/* ------------------------------------------------------------------ wordmark */

const CAP_RATIO = 0.72; // DejaVu Sans Bold cap height / point size

/**
 * Renders a word in the display face, in the shared italic, trimmed.
 * `capHeight` is the finished height of the capital letters in pixels.
 */
function buildText(text, capHeight, { kerning = 0, fill = "#FFFFFF", slantText = true, stretch = 1 } = {}) {
  const pointsize = Math.round(capHeight / CAP_RATIO);
  const w = Math.round(pointsize * (text.length + 4));
  const h = Math.round(pointsize * 3);
  const baseline = Math.round(pointsize * 2);
  const raw = f(`text-${text.replace(/\W+/g, "_")}`);

  im([
    "-size", `${w}x${h}`, "xc:none",
    "-font", FONT, "-pointsize", String(pointsize),
    "-kerning", String(kerning), "-fill", fill,
    "-annotate", `+${Math.round(pointsize * 0.6)}+${baseline}`, text,
    `png32:${raw}`,
  ]);

  let file = raw;
  if (slantText) {
    const sheared = f(`text-shear-${text.replace(/\W+/g, "_")}`);
    // positive x-shear leans the top edge to the right, matching the monogram
    im([
      raw, "-background", "none", "-shear", `${SHEAR_DEG.toFixed(2)}x0`,
      "-gravity", "northwest", "-extent", `${w * 3}x${h * 3}`,
      `png32:${sheared}`,
    ]);
    file = sheared;
  }

  const out = f(`text-final-${text.replace(/\W+/g, "_")}`);
  const args = [file, "-trim", "+repage"];
  if (stretch !== 1) {
    // stretch after trimming, so the percentage applies to the ink box only
    args.push("-resize", `${(stretch * 100).toFixed(1)}%x100%!`);
  }
  im([...args, "-strip", `png32:${out}`]);
  return out;
}

/* ------------------------------------------------------------------- helpers */

function plate(w, h, color) {
  const out = f(`plate-${w}x${h}-${color.replace("#", "")}`);
  im(["-size", `${w}x${h}`, `xc:${color}`, `png32:${out}`]);
  return out;
}

/** Square plate with rounded corners (or a full square when radius is 0). */
function mask(w, h, radius, color) {
  const out = f(`mask-${w}x${h}-${radius}`);
  if (radius <= 0) return plate(w, h, color);
  im([
    "-size", `${w}x${h}`, "xc:none",
    "-fill", color, "-stroke", "none",
    "-draw", `roundrectangle 0,0 ${w - 1},${h - 1} ${radius},${radius}`,
    `png32:${out}`,
  ]);
  return out;
}

/** Composites overlapping layers at explicit positions. */
function paste(base, layers, out) {
  const args = [base];
  for (const { file, x, y } of layers) {
    args.push(file, "-geometry", `+${Math.round(x)}+${Math.round(y)}`,
      "-compose", "over", "-composite");
  }
  im([...args, "-strip", `png32:${out}`]);
  return out;
}

function centered(total, item) {
  return Math.round((total - item) / 2);
}

/* ---------------------------------------------------------------------- main */

function main() {
  if (existsSync(BUILD)) rmSync(BUILD, { recursive: true, force: true });
  mkdirSync(BUILD, { recursive: true });
  mkdirSync(path.join(ROOT, "public/brand"), { recursive: true });

  const WORD = "THUNDRA";
  const TAGLINE = "HOUSEHOLD INSECTICIDE SOLUTIONS";

  const MARK = 880;
  const CAP = 200;
  const TAG_CAP = 40;
  const PAD = 56;
  const GAP_MARK_WORD = 40;
  const GAP_WORD_TAG = 64;
  const RULE_W = 130;
  const RULE_H = 5;
  const RULE_GAP = 30;

  console.log("building Thundra brand assets…");

  const markWhite = buildMonogram(MARK, "white");
  const markInk = buildMonogram(MARK, "ink");
  const word = buildText(WORD, CAP, {
    kerning: Math.round(CAP * 0.035),
    fill: "#FFFFFF",
    stretch: 1.04,
  });
  const tag = buildText(TAGLINE, TAG_CAP, {
    kerning: Math.round(TAG_CAP * 0.5),
    fill: "#FFFFFF",
    slantText: false,
    stretch: 1.02,
  });

  const mz = sizeOf(markWhite);
  const wz = sizeOf(word);
  const tz = sizeOf(tag);

  /* ---- full lockup ---- */
  const tagRowW = RULE_W * 2 + RULE_GAP * 2 + tz.w;
  const tagRowH = Math.max(RULE_H, tz.h);
  const tagRow = paste(plate(tagRowW, tagRowH, "none"), [
    { file: plate(RULE_W, RULE_H, GOLD), x: 0, y: centered(tagRowH, RULE_H) },
    { file: tag, x: RULE_W + RULE_GAP, y: centered(tagRowH, tz.h) },
    { file: plate(RULE_W, RULE_H, GOLD), x: tagRowW - RULE_W, y: centered(tagRowH, RULE_H) },
  ], f("tag-row"));

  const W = Math.max(mz.w, wz.w, tagRowW) + PAD * 2;
  const H = PAD + mz.h + GAP_MARK_WORD + wz.h + GAP_WORD_TAG + tagRowH + PAD;
  const layers = [
    { file: markWhite, x: centered(W, mz.w), y: PAD },
    { file: word, x: centered(W, wz.w), y: PAD + mz.h + GAP_MARK_WORD },
    { file: tagRow, x: centered(W, tagRowW), y: PAD + mz.h + GAP_MARK_WORD + wz.h + GAP_WORD_TAG },
  ];

  const logo = path.join(ROOT, "public/brand/logo.png");
  paste(mask(W, H, 0, "none"), layers, logo);

  const logoDark = path.join(ROOT, "public/brand/logo-dark.png");
  paste(plate(W, H, PLATE), layers, logoDark);

  /* ---- monogram only ---- */
  const markDark = path.join(ROOT, "public/brand/logo-mark.png");
  paste(plate(mz.w, mz.h, "none"), [{ file: markWhite, x: 0, y: 0 }], markDark);

  const markLight = path.join(ROOT, "public/brand/logo-mark-light.png");
  paste(plate(mz.w, mz.h, "none"), [{ file: markInk, x: 0, y: 0 }], markLight);

  /* ---- horizontal lockup: monogram beside the wordmark ---- */
  const H_WORD_CAP = 200;
  const H_MARK = 300;
  const H_GAP = 74;
  const hMarkWhite = buildMonogram(H_MARK, "white");
  const hMarkInk = buildMonogram(H_MARK, "ink");
  const hWordWhite = buildText(WORD, H_WORD_CAP, {
    kerning: Math.round(H_WORD_CAP * 0.035), fill: "#FFFFFF", stretch: 1.04,
  });
  const hWordInk = buildText(WORD, H_WORD_CAP, {
    kerning: Math.round(H_WORD_CAP * 0.035), fill: INK, stretch: 1.04,
  });
  const hw = sizeOf(hWordWhite);

  for (const [name, markFile, wordFile] of [
    ["logo-horizontal.png", hMarkWhite, hWordWhite],
    ["logo-horizontal-light.png", hMarkInk, hWordInk],
  ]) {
    const hm = sizeOf(markFile);
    const width = hm.w + H_GAP + hw.w;
    const height = Math.max(hm.h, hw.h);
    paste(plate(width, height, "none"), [
      { file: markFile, x: 0, y: centered(height, hm.h) },
      { file: wordFile, x: hm.w + H_GAP, y: centered(height, hw.h) },
    ], path.join(ROOT, "public/brand", name));
  }

  /* ---- app icons ---- */
  for (const { file, px, radius, inset } of [
    { file: "app/icon.png", px: 512, radius: 112, inset: 0.56 },
    { file: "app/apple-icon.png", px: 180, radius: 0, inset: 0.62 },
  ]) {
    const inner = buildMonogram(Math.round(px * inset), "white");
    const iz = sizeOf(inner);
    paste(
      mask(px, px, radius, PLATE),
      [{ file: inner, x: centered(px, iz.w), y: centered(px, iz.h) }],
      path.join(ROOT, file),
    );
  }

  console.log("wrote:");
  measure("public/brand/logo.png", logo);
  measure("public/brand/logo-dark.png", logoDark);
  measure("public/brand/logo-mark.png", markDark);
  measure("public/brand/logo-mark-light.png", markLight);
  measure("public/brand/logo-horizontal.png", path.join(ROOT, "public/brand/logo-horizontal.png"));
  measure("public/brand/logo-horizontal-light.png", path.join(ROOT, "public/brand/logo-horizontal-light.png"));
  measure("app/icon.png", path.join(ROOT, "app/icon.png"));
  measure("app/apple-icon.png", path.join(ROOT, "app/apple-icon.png"));

  // leave no scratch files behind
  rmSync(BUILD, { recursive: true, force: true });
}

main();
