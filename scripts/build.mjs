import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import pngjs from 'pngjs';

const { PNG } = pngjs;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checking = process.argv.includes('--check');

const brand = 'gonghunt';
const yellow = '#FFD43B';
const ink = '#17171A';
const paper = '#FFFFFF';
const paints = {
  color: { fill: yellow, under: ink },
  black: { fill: ink },
  white: { fill: paper },
  yellow: { fill: yellow },
  currentcolor: { fill: 'currentColor' },
};
const variants = {
  badge: ['color', 'black', 'white'],
  mark: ['black', 'yellow', 'white'],
};
const logoSizes = [16, 32, 48, 64, 128, 256, 512, 1024];
const generatedDirs = ['logos', 'web', 'social', 'docs'];
const pixelTolerance = 8;

async function loadArt(name) {
  const text = await readFile(join(root, 'src', `${name}.svg`), 'utf8');
  const viewBox = text.match(/viewBox="([^"]+)"/)?.[1];
  const d = text.match(/\sd="([^"]+)"/)?.[1];
  if (!viewBox || !d) {
    throw new Error(`src/${name}.svg에는 viewBox와 path 하나가 있어야 해요.`);
  }
  const [minX, minY, width, height] = viewBox.trim().split(/\s+/).map(Number);
  if (width !== height) {
    throw new Error(`src/${name}.svg의 viewBox는 정사각형이어야 해요(지금 ${width}×${height}).`);
  }
  return { name, viewBox, d, minX, minY, width, height };
}

function artBody(art, paint) {
  const path = `<path fill="${paint.fill}" d="${art.d}"/>`;
  if (!paint.under) {
    return path;
  }
  const radius = art.width / 2 - art.width / 512;
  return `<circle cx="${art.minX + art.width / 2}" cy="${art.minY + art.height / 2}" r="${radius}" fill="${paint.under}"/>${path}`;
}

function logoSvg(art, paint) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${art.viewBox}" width="${art.width}" height="${art.height}">${artBody(art, paint)}</svg>\n`;
}

function placed(art, { x, y, height, paint }) {
  const scale = height / art.height;
  return `<g transform="translate(${x} ${y}) scale(${scale}) translate(${-art.minX} ${-art.minY})">${artBody(art, paint)}</g>`;
}

function framedSvg(art, { size, ratio, paint, background }) {
  const height = (size * ratio * art.height) / Math.max(art.width, art.height);
  const width = (height * art.width) / art.height;
  const back = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';
  const logo = placed(art, { x: (size - width) / 2, y: (size - height) / 2, height, paint });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${back}${logo}</svg>`;
}

function png(svg, mode, value) {
  return Buffer.from(new Resvg(svg, { fitTo: { mode, value } }).render().asPng());
}

function icoFile(images) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([head, ...entries, ...images.map((image) => image.data)]);
}

function icoImages(buffer) {
  const count = buffer.readUInt16LE(4);
  return Array.from({ length: count }, (_, index) => {
    const at = 6 + 16 * index;
    const length = buffer.readUInt32LE(at + 8);
    const offset = buffer.readUInt32LE(at + 12);
    return buffer.subarray(offset, offset + length);
  });
}

const mist = '#F5F5F5';
const line = '#E5E5E5';
const muted = '#4F5256';
const night = '#141517';
const guide = '#6B4EFF';
const guideSoft = '#EBE8FF';
const warn = '#E5484D';
const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

function previewSvg(badge, mark) {
  const panel = (x, background, markPaint) =>
    `<rect x="${x}" width="600" height="400" fill="${background}"/>` +
    placed(badge, { x: x + 60, y: 80, height: 240, paint: paints.color }) +
    placed(mark, { x: x + 300, y: 80, height: 240, paint: markPaint });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">${panel(0, mist, paints.black)}${panel(600, ink, paints.yellow)}</svg>\n`;
}

function clearSpaceSvg(badge) {
  const size = 480;
  const diameter = 240;
  const space = diameter / 4;
  const start = (size - diameter) / 2 - space;
  const box = diameter + space * 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" fill="${paper}"/>` +
    `<rect x="${start}" y="${start}" width="${box}" height="${box}" fill="${guideSoft}"/>` +
    `<rect x="${start}" y="${start}" width="${box}" height="${box}" fill="none" stroke="${guide}" stroke-width="2" stroke-dasharray="8 6"/>` +
    `<rect x="${start}" y="${size / 2 - 1}" width="${space}" height="2" fill="${guide}"/>` +
    placed(badge, { x: (size - diameter) / 2, y: (size - diameter) / 2, height: diameter, paint: paints.color }) +
    `</svg>\n`
  );
}

function sheet(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="16" fill="${mist}"/>${body}</svg>\n`;
}

function centered(art, { cx, cy, height, paint }) {
  const width = (height * art.width) / art.height;
  return placed(art, { x: cx - width / 2, y: cy - height / 2, height, paint });
}

function label(x, y, text) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${mono}" font-size="15" fill="${muted}">${text}</text>`;
}

function cardSvg(art, variant) {
  const onDark = variant === 'white' || variant === 'yellow';
  const background = onDark ? `<rect width="480" height="300" rx="16" fill="${ink}"/>` : '';
  return sheet(480, 300, background + centered(art, { cx: 240, cy: 150, height: 200, paint: paints[variant] }));
}

function sizesSvg(badge) {
  const steps = [128, 64, 48, 32, 24, 16];
  const gap = 44;
  const baseline = 168;
  let x = 48;
  let body = '';
  for (const step of steps) {
    body += placed(badge, { x, y: baseline - step, height: step, paint: paints.color });
    body += label(x + step / 2, baseline + 40, step);
    x += step + gap;
  }
  return sheet(x + 4, 240, body);
}

function webIconsSvg(badge) {
  const appIcon =
    `<rect x="60" y="40" width="160" height="160" rx="36" fill="${ink}"/>` +
    centered(badge, { cx: 140, cy: 120, height: 131, paint: paints.color });
  const roundIcon =
    `<circle cx="360" cy="120" r="80" fill="${ink}"/>` +
    centered(badge, { cx: 360, cy: 120, height: 128, paint: paints.color });
  const tab =
    `<rect x="480" y="92" width="220" height="56" rx="12" fill="${paper}" stroke="${line}" stroke-width="2"/>` +
    centered(badge, { cx: 508, cy: 120, height: 16, paint: paints.color }) +
    `<rect x="530" y="114" width="96" height="12" rx="6" fill="${line}"/>` +
    `<rect x="672" y="113" width="14" height="14" rx="7" fill="${line}"/>`;
  return sheet(760, 240, appIcon + roundIcon + tab);
}

function socialSvg(badge) {
  const avatar = (cx) =>
    `<circle cx="${cx}" cy="140" r="100" fill="${ink}"/>` + centered(badge, { cx, cy: 140, height: 144, paint: paints.color });
  return sheet(520, 280, avatar(140) + `<rect x="270" y="20" width="230" height="240" rx="12" fill="${night}"/>` + avatar(385));
}

function colorsSvg() {
  const swatch = (x, fill, stroke) =>
    `<rect x="${x}" y="40" width="200" height="120" rx="12" fill="${fill}"${stroke ? ` stroke="${line}" stroke-width="2"` : ''}/>` +
    label(x + 100, 192, fill);
  return sheet(760, 220, swatch(40, yellow, false) + swatch(280, ink, false) + swatch(520, paper, true));
}

function dontsSvg(badge) {
  const cross = (x) =>
    `<circle cx="${x + 174}" cy="26" r="15" fill="${warn}"/>` +
    `<path d="M${x + 168} 20l12 12M${x + 180} 20l-12 12" stroke="${paper}" stroke-width="3" stroke-linecap="round"/>`;
  const panel = (index, inner, background = paper) => {
    const x = 20 + index * 220;
    return `<rect x="${x}" y="20" width="200" height="200" rx="12" fill="${background}"/>` + inner(x + 100, 120) + cross(x);
  };
  const around = (cx, cy, transform, paint) =>
    `<g transform="translate(${cx} ${cy}) ${transform} translate(${-cx} ${-cy})">${centered(badge, { cx, cy, height: 120, paint })}</g>`;
  return sheet(
    1120,
    240,
    panel(0, (cx, cy) => around(cx, cy, 'scale(1.35 0.8)', paints.color)) +
      panel(1, (cx, cy) => around(cx, cy, 'rotate(25)', paints.color)) +
      panel(2, (cx, cy) => around(cx, cy, '', { fill: '#3B82F6' })) +
      panel(3, (cx, cy) => around(cx, cy, '', { fill: ink, under: yellow })) +
      panel(4, (cx, cy) => around(cx, cy, '', paints.black), '#2B2B30'),
  );
}

function webManifest() {
  const icons = [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ];
  const manifest = { name: '공모전헌터', short_name: '공모전헌터', icons, theme_color: ink, background_color: ink };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

async function outputs() {
  const badge = await loadArt('badge');
  const mark = await loadArt('mark');
  const files = new Map();

  for (const art of [badge, mark]) {
    for (const variant of variants[art.name]) {
      const base = `logos/${art.name}/${variant}/${brand}-${art.name}-${variant}`;
      const svg = logoSvg(art, paints[variant]);
      files.set(`${base}.svg`, svg);
      for (const size of logoSizes) {
        files.set(`${base}-${size}.png`, png(svg, 'width', size));
      }
    }
    files.set(`logos/${art.name}/currentcolor/${brand}-${art.name}-currentcolor.svg`, logoSvg(art, paints.currentcolor));
  }

  const badgeColor = logoSvg(badge, paints.color);
  files.set('web/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${badge.viewBox}">${artBody(badge, paints.color)}</svg>\n`);
  files.set('web/favicon.ico', icoFile([16, 32, 48].map((size) => ({ size, data: png(badgeColor, 'width', size) }))));
  files.set('web/apple-touch-icon.png', png(framedSvg(badge, { size: 512, ratio: 0.82, paint: paints.color, background: ink }), 'width', 180));
  files.set('web/icon-192.png', png(badgeColor, 'width', 192));
  files.set('web/icon-512.png', png(badgeColor, 'width', 512));
  files.set('web/icon-maskable-512.png', png(framedSvg(badge, { size: 512, ratio: 0.8, paint: paints.color, background: ink }), 'width', 512));
  files.set('web/site.webmanifest', webManifest());

  files.set(`social/${brand}-avatar.png`, png(framedSvg(badge, { size: 1024, ratio: 0.72, paint: paints.color, background: ink }), 'width', 1024));

  files.set('docs/preview.svg', previewSvg(badge, mark));
  files.set('docs/clear-space.svg', clearSpaceSvg(badge));
  for (const art of [badge, mark]) {
    for (const variant of variants[art.name]) {
      files.set(`docs/cards/${art.name}-${variant}.svg`, cardSvg(art, variant));
    }
  }
  files.set('docs/sizes.svg', sizesSvg(badge));
  files.set('docs/web-icons.svg', webIconsSvg(badge));
  files.set('docs/social.svg', socialSvg(badge));
  files.set('docs/colors.svg', colorsSvg());
  files.set('docs/donts.svg', dontsSvg(badge));
  return files;
}

async function listFiles(dir) {
  let entries;
  try {
    entries = await readdir(join(root, dir), { withFileTypes: true });
  } catch {
    return [];
  }
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? listFiles(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`])),
  );
  return nested.flat().filter((path) => !path.endsWith('.DS_Store'));
}

function samePng(a, b) {
  const left = PNG.sync.read(a);
  const right = PNG.sync.read(b);
  if (left.width !== right.width || left.height !== right.height) {
    return false;
  }
  return left.data.every((value, index) => Math.abs(value - right.data[index]) <= pixelTolerance);
}

function sameFile(path, expected, actual) {
  if (typeof expected === 'string') {
    return expected === actual.toString('utf8');
  }
  if (path.endsWith('.png')) {
    return samePng(expected, actual);
  }
  if (path.endsWith('.ico')) {
    const left = icoImages(expected);
    const right = icoImages(actual);
    return left.length === right.length && left.every((image, index) => samePng(image, right[index]));
  }
  return expected.equals(actual);
}

async function check(files) {
  const present = (await Promise.all(generatedDirs.map((dir) => listFiles(dir)))).flat();
  const problems = present.filter((path) => !files.has(path)).map((path) => `남는 파일: ${path}`);
  for (const [path, expected] of files) {
    let actual;
    try {
      actual = await readFile(join(root, path));
    } catch {
      problems.push(`빠진 파일: ${path}`);
      continue;
    }
    if (!sameFile(path, expected, actual)) {
      problems.push(`원본과 다른 파일: ${path}`);
    }
  }
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    console.error('\nsrc/의 원본과 만든 파일이 맞지 않아요. npm run build로 다시 만들어 함께 커밋해 주세요.');
    process.exit(1);
  }
  console.log(`파일 ${files.size}개가 src/의 원본과 맞아요.`);
}

async function build(files) {
  await Promise.all(generatedDirs.map((dir) => rm(join(root, dir), { recursive: true, force: true })));
  for (const [path, content] of files) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  console.log(`파일 ${files.size}개를 만들었어요.`);
}

const files = await outputs();
await (checking ? check(files) : build(files));
