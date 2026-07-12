import { writeFileSync, readFileSync } from 'fs';

const retries = [
  { id: 'r1d3', url: 'https://foodish-api.com/images/biryani/biryani40.jpg' },
  { id: 'r1d8', url: 'https://foodish-api.com/images/biryani/biryani41.jpg' },
  { id: 'r1d9', url: 'https://foodish-api.com/images/biryani/biryani42.jpg' },
  { id: 'r1d10', url: 'https://foodish-api.com/images/butter-chicken/butter-chicken10.jpg' },
  { id: 'r1d11', url: 'https://foodish-api.com/images/butter-chicken/butter-chicken11.jpg' },
  { id: 'r1d14', url: 'https://foodish-api.com/images/rice/rice10.jpg' },
  { id: 'r3d8', url: 'https://foodish-api.com/images/dosa/dosa20.jpg' },
  { id: 'r5d8', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop&q=80' },
  { id: 'r5d10', url: 'https://foodish-api.com/images/butter-chicken/butter-chicken12.jpg' },
  { id: 'r5d11', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=600&fit=crop&q=80' },
  { id: 'r10d4', url: 'https://foodish-api.com/images/dessert/dessert30.jpg' },
];

let catalog = readFileSync('src/data/catalog.js', 'utf8');

for (const r of retries) {
  const dest = `public/food/${r.id}-v4.jpg`;
  const res = await fetch(r.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) {
    console.log('fail', r.id, res.status);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  const rel = `/food/${r.id}-v4.jpg`;
  catalog = catalog.replace(
    new RegExp(`(id:\\s*'${r.id}'[\\s\\S]*?image:\\s*')[^']+(')`),
    `$1${rel}$2`,
  );
  console.log('ok', r.id, buf.length);
}

writeFileSync('src/data/catalog.js', catalog);
console.log('done');
