import * as THREE from 'three';
import { PlanetStyle } from '../types/game';
import { PLANET_STYLES } from '../utils/helpers';

/**
 * 将十六进制颜色转换为 RGBA 字符串
 */
function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(255, 255, 255, ${alpha})`;
}

/**
 * 根据星球风格生成星球表面纹理
 *
 * @param style 星球视觉风格配置
 * @returns 生成的 Canvas 纹理
 */
export function createPlanetTexture(style: PlanetStyle = PLANET_STYLES.earth): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 根据风格生成渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, style.baseColor);
  gradient.addColorStop(0.3, style.primaryColor);
  gradient.addColorStop(0.5, style.vibrantColor);
  gradient.addColorStop(0.7, style.secondaryColor);
  gradient.addColorStop(1, style.tertiaryColor);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 根据风格添加色斑
  const blobColors = [
    hexToRgba(style.primaryColor, 0.3),
    hexToRgba(style.secondaryColor, 0.3),
    hexToRgba(style.tertiaryColor, 0.25),
    hexToRgba(style.vibrantColor, 0.2),
  ];

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 30 + Math.random() * 80;
    const color = blobColors[Math.floor(Math.random() * blobColors.length)];

    const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    blobGradient.addColorStop(0, color);
    blobGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = blobGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 添加细节纹理
  const detailColor = hexToRgba(style.primaryColor, 0.4);
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 2 + Math.random() * 8;
    const shade = 0.7 + Math.random() * 0.3;

    // 使用主色调并调整明暗
    const baseRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(style.primaryColor);
    if (baseRgb) {
      const r = Math.floor(parseInt(baseRgb[1], 16) * shade);
      const g = Math.floor(parseInt(baseRgb[2], 16) * shade);
      const b = Math.floor(parseInt(baseRgb[3], 16) * shade);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
    } else {
      ctx.fillStyle = detailColor;
    }

    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 生成云层纹理
 *
 * @param cloudColor 云层颜色（十六进制）
 * @returns 生成的 Canvas 纹理
 */
export function createCloudTexture(cloudColor: string = '#ffffff'): THREE.CanvasTexture {
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
    gradient.addColorStop(0, hexToRgba(cloudColor, 0.6));
    gradient.addColorStop(0.5, hexToRgba(cloudColor, 0.3));
    gradient.addColorStop(1, hexToRgba(cloudColor, 0));

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
