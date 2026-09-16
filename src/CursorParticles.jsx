import { useEffect, useRef } from 'react';

// 品牌色块（与 ColorBlocks 一致）
const COLORS = ['#dda164', '#4c514d', '#778d72', '#c98d90', '#669083', '#5e7fa3'];

/**
 * 半透明圆形光标与品牌色尾随粒子。
 * - 鼠标移动时沿途生成小方块，带轻微惯性与下坠，约 1s 渐缩渐隐
 * - 原生箭头替换为轻盈的半透明圆形光标
 * - 触屏设备与 prefers-reduced-motion 下自动禁用
 */
export default function CursorParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    document.documentElement.classList.add('custom-cursor-active');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const MAX = 200;
    let px = null;
    let py = null;
    let pointerVisible = false;

    const spawn = (x, y, dx, dy) => {
      particles.push({
        x,
        y,
        vx: dx * 0.06 + (Math.random() - 0.5) * 1.2,
        vy: dy * 0.06 + (Math.random() - 0.5) * 1.2 - 0.25,
        size: 4 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.18,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0,
        ttl: 60 + Math.random() * 50,
      });
      if (particles.length > MAX) particles.splice(0, particles.length - MAX);
    };

    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (px !== null) {
        const dx = x - px;
        const dy = y - py;
        const dist = Math.hypot(dx, dy);
        const steps = Math.min(Math.floor(dist / 6), 5);
        for (let i = 0; i < steps; i++) {
          const t = (i + 1) / steps;
          spawn(px + dx * t, py + dy * t, dx, dy);
        }
      }
      px = x;
      py = y;
      pointerVisible = true;
    };
    const hidePointer = e => {
      if (!e.relatedTarget) pointerVisible = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', hidePointer, { passive: true });

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      // While the flipbook is turning, skip the particle simulation entirely so the
      // 3D transform keeps the compositor to itself (keeps the turn smooth).
      if (document.documentElement.classList.contains('is-page-turning')) {
        particles.length = 0;
      } else {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life += 1;
          if (p.life >= p.ttl) {
            particles.splice(i, 1);
            continue;
          }
          p.vy += 0.03;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          const k = 1 - p.life / p.ttl;
          const ease = k * k;
          ctx.save();
          ctx.globalAlpha = ease * 0.9;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          const s = p.size * (0.4 + 0.6 * ease);
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.restore();
        }
      }

      if (pointerVisible && px !== null && py !== null) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(169, 112, 118, 0.24)';
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(80, 61, 66, 0.42)';
        ctx.stroke();
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', hidePointer);
      window.removeEventListener('resize', resize);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}
