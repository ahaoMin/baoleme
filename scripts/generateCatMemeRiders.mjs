import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const memeDirs = ['猫meme'];
const outFile = path.join(root, 'src/data/catMemeRiders.ts');

function walkGifs(dir, riders) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const abs = path.join(dir, entry);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      walkGifs(abs, riders);
      continue;
    }
    if (!entry.toLowerCase().endsWith('.gif')) continue;

    const rel = path.relative(root, abs).replace(/\\/g, '/');
    const name = path.basename(entry, path.extname(entry));
    const mp3Abs = path.join(path.dirname(abs), `${name}.mp3`);
    riders.push({
      name,
      gif: `/${rel}`,
      audio: fs.existsSync(mp3Abs) ? `/${path.relative(root, mp3Abs).replace(/\\/g, '/')}` : null,
    });
  }
}

const riders = [];
for (const dir of memeDirs) {
  walkGifs(path.join(root, dir), riders);
}

riders.sort((a, b) => a.gif.localeCompare(b.gif, 'zh-CN'));

const body = `// 猫meme骑手清单（自动生成，运行 node scripts/generateCatMemeRiders.mjs）
export interface CatMemeRider {
  name: string;
  gif: string;
  audio: string | null;
}

export const CAT_MEME_RIDERS: CatMemeRider[] = ${JSON.stringify(riders, null, 2)};
`;

fs.writeFileSync(outFile, body, 'utf8');
console.log(`Generated ${riders.length} cat meme riders -> ${path.relative(root, outFile)}`);
console.log(`With audio: ${riders.filter((r) => r.audio).length}`);
