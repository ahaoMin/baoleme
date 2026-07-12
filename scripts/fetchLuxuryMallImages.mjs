/**
 * 下载高奢包 / 化妆品商品图到 public/mall
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'mall');
mkdirSync(outDir, { recursive: true });

function u(id) {
  return `https://images.unsplash.com/${id}?w=600&h=600&fit=crop&q=80`;
}

const BAGS = [
  'photo-1584917865442-de89df76afd3',
  'photo-1566150905458-1bf1fc113f0d',
  'photo-1590874103328-a9486073a9c6',
  'photo-1548036328-c025895036b7',
  'photo-1591561954557-26941169b49e',
  'photo-1594633312681-825c1e5f4c1a',
  'photo-1553062407-98eeb64c6a62',
  'photo-1598532163257-ae3c6b2524b6',
  'photo-1594223274512-ad4803739b7c',
  'photo-1611011811380-c1c5a5b0b2c2',
  'photo-1605733513597-a8f8341084e6',
  'photo-1612902456551-333ac5afa26e',
];

const MAKEUP = [
  'photo-1586495777744-4413f21062fa',
  'photo-1522335789203-aabd1fc54bc9',
  'photo-1596462502278-27bfdc403348',
  'photo-1512496015851-a90fb38ba796',
  'photo-1487412947147-5cebf100ffc2',
  'photo-1631214524020-7e18db9a8cdf',
  'photo-1571781926291-c477ebfd024b',
  'photo-1596755389378-c31d21fd1273',
];

const SKIN = [
  'photo-1556228578-0d85b1a4d571',
  'photo-1611930022073-b7a4ba5fcccd',
  'photo-1570194065650-d99fb26b1181',
  'photo-1608248543803-ba4f8c70ae0b',
  'photo-1620916567454-8b5f2e0c4e1a',
];

const PERFUME = [
  'photo-1541643600914-78b084683601',
  'photo-1592945403244-b3fbafd7f539',
  'photo-1598440947619-2c35fc9aa908',
];

// 更稳妥的替补池（确认过能下）
const SAFE_BAGS = [
  'photo-1584917865442-de89df76afd3',
  'photo-1566150905458-1bf1fc113f0d',
  'photo-1590874103328-a9486073a9c6',
  'photo-1548036328-c025895036b7',
  'photo-1591561954557-26941169b49e',
  'photo-1594633312681-825c1e5f4c1a',
  'photo-1553062407-98eeb64c6a62',
  'photo-1598532163257-ae3c6b2524b6',
  'photo-1594223274512-ad4803739b7c',
];

const SAFE_MAKEUP = [
  'photo-1586495777744-4413f21062fa',
  'photo-1522335789203-aabd1fc54bc9',
  'photo-1596462502278-27bfdc403348',
  'photo-1512496015851-a90fb38ba796',
  'photo-1487412947147-5cebf100ffc2',
  'photo-1631214524020-7e18db9a8cdf',
  'photo-1571781926291-c477ebfd024b',
  'photo-1596755389378-c31d21fd1273',
];

const SAFE_SKIN = [
  'photo-1556228578-0d85b1a4d571',
  'photo-1611930022073-b7a4ba5fcccd',
  'photo-1570194065650-d99fb26b1181',
  'photo-1608248543803-ba4f8c70ae0b',
];

const SAFE_PERFUME = [
  'photo-1541643600914-78b084683601',
  'photo-1592945403244-b3fbafd7f539',
  'photo-1598440947619-2c35fc9aa908',
];

const FILES = [
  // beauty lipstick / makeup
  ['m2d7-chanel-lip.jpg', 'makeup'],
  ['m2d8-dior-lip.jpg', 'makeup'],
  ['m2d9-ysl-lip.jpg', 'makeup'],
  ['m2d10-mac-lip.jpg', 'makeup'],
  ['m2d11-armani-lip.jpg', 'makeup'],
  ['m2d12-tf-lip.jpg', 'makeup'],
  ['m2d13-nars-blush.jpg', 'makeup'],
  ['m2d14-givenchy-lip.jpg', 'makeup'],
  ['m2d15-ct-gloss.jpg', 'makeup'],
  // beauty skincare / perfume
  ['m2d16-el-serum.jpg', 'skin'],
  ['m2d17-lancome.jpg', 'skin'],
  ['m2d18-skii.jpg', 'skin'],
  ['m2d19-lamer.jpg', 'skin'],
  ['m2d20-shiseido.jpg', 'skin'],
  ['m2d21-clinique.jpg', 'skin'],
  ['m2d22-jomalone.jpg', 'perfume'],
  ['m2d23-no5.jpg', 'perfume'],
  ['m2d24-benefit.jpg', 'makeup'],
  // bags
  ['m4d6-lv-tote.jpg', 'bag'],
  ['m4d7-chanel-flap.jpg', 'bag'],
  ['m4d8-hermes-birkin.jpg', 'bag'],
  ['m4d9-gucci-saddle.jpg', 'bag'],
  ['m4d10-prada-nylon.jpg', 'bag'],
  ['m4d11-dior-lady.jpg', 'bag'],
  ['m4d12-bottega.jpg', 'bag'],
  ['m4d13-celine.jpg', 'bag'],
  ['m4d14-ysl-envelope.jpg', 'bag'],
  ['m4d15-fendi.jpg', 'bag'],
  ['m4d16-burberry.jpg', 'bag'],
  ['m4d17-loewe.jpg', 'bag'],
  // luxury store
  ['m7d1-lv-neverfull.jpg', 'bag'],
  ['m7d2-chanel-cf.jpg', 'bag'],
  ['m7d3-hermes-garden.jpg', 'bag'],
  ['m7d4-gucci-dionysus.jpg', 'bag'],
  ['m7d5-prada-galleria.jpg', 'bag'],
  ['m7d6-dior-book.jpg', 'bag'],
  ['m7d7-dior-fdt.jpg', 'makeup'],
  ['m7d8-chanel-oil.jpg', 'skin'],
  ['m7d9-ysl-cushion.jpg', 'makeup'],
  ['m7d10-lamer-toner.jpg', 'skin'],
  ['m7d11-lancome-cream.jpg', 'skin'],
  ['m7d12-tf-oud.jpg', 'perfume'],
];

const POOLS = {
  bag: SAFE_BAGS,
  makeup: SAFE_MAKEUP,
  skin: SAFE_SKIN,
  perfume: SAFE_PERFUME,
};

const counters = { bag: 0, makeup: 0, skin: 0, perfume: 0 };

async function fetchOne(file, kind) {
  const dest = join(outDir, file);
  if (existsSync(dest)) {
    console.log('skip', file);
    return true;
  }
  const pool = POOLS[kind];
  const start = counters[kind]++;
  for (let i = 0; i < pool.length; i++) {
    const id = pool[(start + i) % pool.length];
    try {
      const res = await fetch(u(id), { redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2000) throw new Error(`too small ${buf.length}`);
      writeFileSync(dest, buf);
      console.log('ok', file, id, buf.length);
      return true;
    } catch (e) {
      console.warn('retry', file, id, e.message);
    }
  }
  return false;
}

let fail = 0;
for (const [file, kind] of FILES) {
  const ok = await fetchOne(file, kind);
  if (!ok) fail++;
}
console.log(fail ? `done with ${fail} failures` : 'all done');
process.exit(fail ? 1 : 0);
