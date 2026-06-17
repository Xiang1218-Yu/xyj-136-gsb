import * as THREE from 'three';
import { PlanetStyleId, PlanetStyleConfig } from '../types/game';
import { PLANET_STYLE_CONFIGS } from './helpers';

/* 根据星球风格配置生成程序化星球表面纹理 */
export function createPlanetTexture(styleId: PlanetStyleId = 'terra'): THREE.CanvasTexture {
  const style: PlanetStyleConfig = PLANET_STYLE_CONFIGS[styleId];
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  style.surfaceGradient.forEach((color, i) => {
    gradient.addColorStop(i / (style.surfaceGradient.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 30 + Math.random() * 80;
    const colors = style.surfaceBlobColors;
    const color = colors[Math.floor(Math.random() * colors.length)];

    const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    blobGradient.addColorStop(0, color);
    blobGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = blobGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 2 + Math.random() * 8;
    const shade = 0.7 + Math.random() * 0.3;

    const baseR = parseInt(style.surfaceGradient[0].slice(1, 3), 16);
    const baseG = parseInt(style.surfaceGradient[0].slice(3, 5), 16);
    const baseB = parseInt(style.surfaceGradient[0].slice(5, 7), 16);

    ctx.fillStyle = `rgba(${Math.floor(baseR * shade)}, ${Math.floor(baseG * shade)}, ${Math.floor(baseB * shade)}, 0.4)`;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* 生成云层纹理（所有星球通用） */
export function createCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 20 + Math.random() * 60;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* 生成城市窗户纹理 */
export function createWindowTexture(litRatio: number = 0.6): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 4;
  const rows = 8;
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  const padding = 3;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + padding;
      const y = r * cellH + padding;
      const w = cellW - padding * 2;
      const h = cellH - padding * 2;

      if (Math.random() < litRatio) {
        const colors = ['#ffd700', '#ffed4a', '#87ceeb', '#ffa500', '#e0ffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const intensity = 0.7 + Math.random() * 0.3;
        ctx.fillStyle = color;
        ctx.globalAlpha = intensity;
      } else {
        ctx.fillStyle = '#0a0a15';
        ctx.globalAlpha = 1;
      }
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* 生成冰面纹理 */
export function createIceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(200, 230, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.85)');
  gradient.addColorStop(1, 'rgba(180, 220, 255, 0.9)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = 10 + Math.random() * 40;
    const angle = Math.random() * Math.PI;
    const alpha = 0.1 + Math.random() * 0.3;

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 2 + Math.random() * 8;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/* 生成草地纹理 */
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  gradient.addColorStop(0, '#4caf50');
  gradient.addColorStop(0.7, '#388e3c');
  gradient.addColorStop(1, '#2e7d32');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 300; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const height = 3 + Math.random() * 8;
    const shades = ['#66bb6a', '#4caf50', '#388e3c', '#2e7d32', '#81c784'];
    ctx.strokeStyle = shades[Math.floor(Math.random() * shades.length)];
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 3, y - height / 2, x + (Math.random() - 0.5) * 2, y - height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/* 生成树皮纹理 */
export function createBarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#4e342e');
  gradient.addColorStop(0.5, '#5d4037');
  gradient.addColorStop(1, '#4e342e');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height;
    const length = 20 + Math.random() * 100;
    ctx.strokeStyle = `rgba(${60 + Math.random() * 30}, ${40 + Math.random() * 20}, ${30 + Math.random() * 15}, 0.6)`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, startY);
    for (let j = 0; j < 5; j++) {
      const py = startY + (length * j) / 5;
      const px = x + (Math.random() - 0.5) * 5;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
