import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 本地 dev 保持根路径；生产构建使用 /pfo-dream/（GitHub Pages 子路径）
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/pfo-dream/' : '/',
}));
