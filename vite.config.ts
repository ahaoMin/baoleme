import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

const MEME_DIRS = ['猫meme'];
const MIME: Record<string, string> = {
  '.gif': 'image/gif',
  '.mp3': 'audio/mpeg',
};

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const from = path.join(src, entry);
    const to = path.join(dest, entry);
    if (fs.statSync(from).isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function memeAssetsPlugin(): Plugin {
  return {
    name: 'meme-assets',
    configureServer(server) {
      for (const dir of MEME_DIRS) {
        const abs = path.resolve(dir);
        if (!fs.existsSync(abs)) continue;
        const prefix = `/${dir}`;
        server.middlewares.use((req, res, next) => {
          const raw = req.url?.split('?')[0] || '';
          let decoded = '';
          try {
            decoded = decodeURIComponent(raw);
          } catch {
            return next();
          }
          if (!decoded.startsWith(prefix)) return next();
          const rel = decoded.slice(1).split('/').join(path.sep);
          const filePath = path.resolve(rel);
          if (!filePath.startsWith(abs) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
            return next();
          }
          const ext = path.extname(filePath).toLowerCase();
          res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
          fs.createReadStream(filePath).pipe(res);
        });
      }
    },
    closeBundle() {
      const out = path.resolve('dist');
      for (const dir of MEME_DIRS) {
        const src = path.resolve(dir);
        if (!fs.existsSync(src)) continue;
        copyDir(src, path.join(out, dir));
      }
    },
  };
}

export default defineConfig({
  plugins: [vue(), memeAssetsPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
