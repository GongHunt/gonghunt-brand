import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import pngjs from 'pngjs';

const { PNG } = pngjs;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checking = process.argv.includes('--check');

const brand = 'gonghunt';
const ink = '#17171A';
const paper = '#FFFFFF';
const colors = { black: ink, white: paper };
const logoSizes = [16, 32, 48, 64, 128, 256, 512, 1024];
const generatedDirs = ['logos', 'web', 'social', 'docs'];
const pixelTolerance = 8;

async function loadArt(name) {
  const text = await readFile(join(root, 'src', `${name}.svg`), 'utf8');
  const viewBox = text.match(/viewBox="([^"]+)"/)?.[1];
  const d = text.match(/\sd="([^"]+)"/)?.[1];
  if (!viewBox || !d) {
    throw new Error(`src/${name}.svg에는 viewBox와 path 하나가 있어야 합니다.`);
  }
  const [minX, minY, width, height] = viewBox.trim().split(/\s+/).map(Number);
  if (width !== height) {
    throw new Error(`src/${name}.svg의 viewBox는 정사각형이어야 합니다. 지금은 ${width}×${height}입니다.`);
  }
  return { name, viewBox, d, minX, minY, width, height };
}

function logoSvg(art, fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${art.viewBox}" width="${art.width}" height="${art.height}"><path fill="${fill}" d="${art.d}"/></svg>\n`;
}

function placed(art, { x, y, height, fill }) {
  const scale = height / art.height;
  return `<path transform="translate(${x} ${y}) scale(${scale}) translate(${-art.minX} ${-art.minY})" fill="${fill}" d="${art.d}"/>`;
}

function framedSvg(art, { size, ratio, fill, background }) {
  const height = (size * ratio * art.height) / Math.max(art.width, art.height);
  const width = (height * art.width) / art.height;
  const back = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';
  const logo = placed(art, { x: (size - width) / 2, y: (size - height) / 2, height, fill });
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

function previewSvg(badge, mark) {
  const panel = (x, background, fill) =>
    `<rect x="${x}" width="600" height="400" fill="${background}"/>` +
    placed(badge, { x: x + 60, y: 80, height: 240, fill }) +
    placed(mark, { x: x + 300, y: 80, height: 240, fill });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">${panel(0, '#F4F4F1', ink)}${panel(600, ink, paper)}</svg>\n`;
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
    `<rect x="${start}" y="${start}" width="${box}" height="${box}" fill="#FDE7D3"/>` +
    `<rect x="${start}" y="${start}" width="${box}" height="${box}" fill="none" stroke="#E8590C" stroke-width="2" stroke-dasharray="8 6"/>` +
    `<rect x="${start}" y="${size / 2 - 1}" width="${space}" height="2" fill="#E8590C"/>` +
    placed(badge, { x: (size - diameter) / 2, y: (size - diameter) / 2, height: diameter, fill: ink }) +
    `</svg>\n`
  );
}

const mist = '#F4F4F1';
const line = '#E2E2DD';
const muted = '#6B6B70';
const warn = '#E5484D';
const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

function sheet(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="16" fill="${mist}"/>${body}</svg>\n`;
}

function centered(art, { cx, cy, height, fill }) {
  const width = (height * art.width) / art.height;
  return placed(art, { x: cx - width / 2, y: cy - height / 2, height, fill });
}

function label(x, y, text) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${mono}" font-size="15" fill="${muted}">${text}</text>`;
}

function cardSvg(art, color) {
  const background = color === 'white' ? `<rect width="480" height="300" rx="16" fill="${ink}"/>` : '';
  return sheet(480, 300, background + centered(art, { cx: 240, cy: 150, height: 200, fill: colors[color] }));
}

function sizesSvg(badge) {
  const steps = [128, 64, 48, 32, 24, 16];
  const gap = 44;
  const baseline = 168;
  let x = 48;
  let body = '';
  for (const step of steps) {
    body += placed(badge, { x, y: baseline - step, height: step, fill: ink });
    body += label(x + step / 2, baseline + 40, step);
    x += step + gap;
  }
  return sheet(x + 4, 240, body);
}

function webIconsSvg(badge) {
  const appIcon =
    `<rect x="60" y="40" width="160" height="160" rx="36" fill="${paper}" stroke="${line}" stroke-width="2"/>` +
    centered(badge, { cx: 140, cy: 120, height: 131, fill: ink });
  const roundIcon =
    `<circle cx="360" cy="120" r="80" fill="${paper}" stroke="${line}" stroke-width="2"/>` +
    centered(badge, { cx: 360, cy: 120, height: 128, fill: ink });
  const tab =
    `<rect x="480" y="92" width="220" height="56" rx="12" fill="${paper}" stroke="${line}" stroke-width="2"/>` +
    centered(badge, { cx: 508, cy: 120, height: 16, fill: ink }) +
    `<rect x="530" y="114" width="96" height="12" rx="6" fill="${line}"/>` +
    `<rect x="672" y="113" width="14" height="14" rx="7" fill="${line}"/>`;
  return sheet(760, 240, appIcon + roundIcon + tab);
}

function socialSvg(badge) {
  const avatar = (cx, background, fill, stroke) =>
    `<circle cx="${cx}" cy="140" r="100" fill="${background}"${stroke ? ` stroke="${line}" stroke-width="2"` : ''}/>` +
    centered(badge, { cx, cy: 140, height: 144, fill });
  return sheet(520, 280, avatar(140, paper, ink, true) + avatar(380, ink, paper, false));
}

function colorsSvg() {
  const swatch = (x, fill, text, stroke) =>
    `<rect x="${x}" y="40" width="200" height="120" rx="12" fill="${fill}"${stroke ? ` stroke="${line}" stroke-width="2"` : ''}/>` +
    label(x + 100, 192, text);
  return sheet(520, 220, swatch(40, ink, ink, false) + swatch(280, paper, paper, true));
}

function dontsSvg(badge) {
  const cross = (x) =>
    `<circle cx="${x + 174}" cy="26" r="15" fill="${warn}"/>` +
    `<path d="M${x + 168} 20l12 12M${x + 180} 20l-12 12" stroke="${paper}" stroke-width="3" stroke-linecap="round"/>`;
  const panel = (index, inner, background) => {
    const x = 20 + index * 220;
    const back = background ? `<rect x="${x}" y="20" width="200" height="200" rx="12" fill="${background}"/>` : `<rect x="${x}" y="20" width="200" height="200" rx="12" fill="${paper}"/>`;
    return back + inner(x + 100, 120) + cross(x);
  };
  const around = (cx, cy, transform, fill) =>
    `<g transform="translate(${cx} ${cy}) ${transform} translate(${-cx} ${-cy})">${centered(badge, { cx, cy, height: 120, fill })}</g>`;
  return sheet(
    900,
    240,
    panel(0, (cx, cy) => around(cx, cy, 'scale(1.35 0.8)', ink)) +
      panel(1, (cx, cy) => around(cx, cy, 'rotate(25)', ink)) +
      panel(2, (cx, cy) => around(cx, cy, '', '#3B82F6')) +
      panel(3, (cx, cy) => around(cx, cy, '', ink), '#2B2B30'),
  );
}

function webManifest() {
  const icons = [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ];
  const manifest = { name: '공모전헌터', short_name: '공모전헌터', icons, theme_color: ink, background_color: paper };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

async function outputs() {
  const badge = await loadArt('badge');
  const mark = await loadArt('mark');
  const files = new Map();

  for (const art of [badge, mark]) {
    for (const [color, fill] of Object.entries(colors)) {
      const base = `logos/${art.name}/${color}/${brand}-${art.name}-${color}`;
      const svg = logoSvg(art, fill);
      files.set(`${base}.svg`, svg);
      for (const size of logoSizes) {
        files.set(`${base}-${size}.png`, png(svg, 'width', size));
      }
    }
    files.set(`logos/${art.name}/currentcolor/${brand}-${art.name}-currentcolor.svg`, logoSvg(art, 'currentColor'));
  }

  const badgeInk = logoSvg(badge, ink);
  const themed = `<style>path{fill:${ink}}@media (prefers-color-scheme:dark){path{fill:${paper}}}</style>`;
  files.set('web/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${badge.viewBox}">${themed}<path d="${badge.d}"/></svg>\n`);
  files.set('web/favicon.ico', icoFile([16, 32, 48].map((size) => ({ size, data: png(badgeInk, 'width', size) }))));
  files.set('web/apple-touch-icon.png', png(framedSvg(badge, { size: 512, ratio: 0.82, fill: ink, background: paper }), 'width', 180));
  files.set('web/icon-192.png', png(badgeInk, 'width', 192));
  files.set('web/icon-512.png', png(badgeInk, 'width', 512));
  files.set('web/icon-maskable-512.png', png(framedSvg(badge, { size: 512, ratio: 0.8, fill: ink, background: paper }), 'width', 512));
  files.set('web/site.webmanifest', webManifest());

  files.set(`social/${brand}-avatar-light.png`, png(framedSvg(badge, { size: 1024, ratio: 0.72, fill: ink, background: paper }), 'width', 1024));
  files.set(`social/${brand}-avatar-dark.png`, png(framedSvg(badge, { size: 1024, ratio: 0.72, fill: paper, background: ink }), 'width', 1024));

  files.set('docs/preview.svg', previewSvg(badge, mark));
  files.set('docs/clear-space.svg', clearSpaceSvg(badge));
  for (const art of [badge, mark]) {
    for (const color of Object.keys(colors)) {
      files.set(`docs/cards/${art.name}-${color}.svg`, cardSvg(art, color));
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
    console.error('\nsrc/의 원본과 만든 파일이 맞지 않습니다. npm run build로 다시 만들어 함께 커밋해 주세요.');
    process.exit(1);
  }
  console.log(`파일 ${files.size}개가 src/의 원본과 맞습니다.`);
}

async function build(files) {
  await Promise.all(generatedDirs.map((dir) => rm(join(root, dir), { recursive: true, force: true })));
  for (const [path, content] of files) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  console.log(`파일 ${files.size}개를 만들었습니다.`);
}

const files = await outputs();
await (checking ? check(files) : build(files));
