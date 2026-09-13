import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 本地开发使用根路径；生产构建使用相对路径，兼容 Cloudflare Pages 与 GitHub Pages。
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? './' : '/',
}));
