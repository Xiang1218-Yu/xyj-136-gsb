import * as THREE from 'three';
import { PlanetThemeType } from '../types/game';

/**
 * 创建森林主题星球纹理
 * 绿色为主色调，包含森林、陆地和水域的随机分布
 */
export function createPlanetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a472a');
  gradient.addColorStop(0.3, '#2d5a27');
  gradient.addColorStop(0.5, '#3d6b35');
  gradient.addColorStop(0.7, '#8b7355');
  gradient.addColorStop(1, '#5d4e37');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 30 + Math.random() * 80;
    const colors = [
      'rgba(34, 139, 34, 0.3)',
      'rgba(85, 107, 47, 0.3)',
      'rgba(139, 115, 85, 0.3)',
      'rgba(70, 130, 180, 0.2)',
    ];
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
    ctx.fillStyle = `rgba(${Math.floor(60 * shade)}, ${Math.floor(100 * shade)}, ${Math.floor(50 * shade)}, 0.4)`;
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
 * 创建沙漠主题星球纹理
 * 金黄色为主色调，模拟沙丘和荒漠地貌
 */
function createDesertPlanetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#c2956a');
  gradient.addColorStop(0.3, '#d4a574');
  gradient.addColorStop(0.5, '#e6c88a');
  gradient.addColorStop(0.7, '#d4a574');
  gradient.addColorStop(1, '#b8860b');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 40 + Math.random() * 100;
    const colors = [
      'rgba(210, 180, 140, 0.4)',
      'rgba(244, 164, 96, 0.3)',
      'rgba(218, 165, 32, 0.3)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    blobGradient.addColorStop(0, color);
    blobGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = blobGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 300; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 1 + Math.random() * 3;
    ctx.fillStyle = `rgba(139, 90, 43, ${0.1 + Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 创建冰雪主题星球纹理
 * 蓝白色为主色调，模拟冰川和雪地地貌
 */
function createIcePlanetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#e0f0ff');
  gradient.addColorStop(0.3, '#c0e0f8');
  gradient.addColorStop(0.5, '#a0d0f0');
  gradient.addColorStop(0.7, '#b8e0f5');
  gradient.addColorStop(1, '#90c0e8');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 30 + Math.random() * 70;
    const colors = [
      'rgba(255, 255, 255, 0.5)',
      'rgba(200, 230, 255, 0.4)',
      'rgba(180, 220, 255, 0.3)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    blobGradient.addColorStop(0, color);
    blobGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = blobGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 150; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = 5 + Math.random() * 20;
    const angle = Math.random() * Math.PI;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 创建熔岩主题星球纹理
 * 红橙色为主色调，模拟火山和岩浆地貌
 */
function createLavaPlanetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#4a1000');
  gradient.addColorStop(0.3, '#6b1a00');
  gradient.addColorStop(0.5, '#8b2500');
  gradient.addColorStop(0.7, '#a52a00');
  gradient.addColorStop(1, '#5c1500');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 20 + Math.random() * 60;
    const colors = [
      'rgba(255, 69, 0, 0.5)',
      'rgba(255, 140, 0, 0.4)',
      'rgba(255, 0, 0, 0.3)',
      'rgba(255, 215, 0, 0.3)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    blobGradient.addColorStop(0, color);
    blobGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = blobGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 80; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = 10 + Math.random() * 40;
    const angle = Math.random() * Math.PI;
    ctx.strokeStyle = `rgba(255, 100, 0, ${0.3 + Math.random() * 0.4})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 创建海洋主题星球纹理
 * 蓝色为主色调，模拟海洋和岛屿地貌
 */
function createOceanPlanetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#004080');
  gradient.addColorStop(0.3, '#1e60a0');
  gradient.addColorStop(0.5, '#2e80c0');
  gradient.addColorStop(0.7, '#1e90ff');
  gradient.addColorStop(1, '#005090');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 30 + Math.random() * 80;
    const colors = [
      'rgba(100, 149, 237, 0.4)',
      'rgba(70, 130, 180, 0.3)',
      'rgba(135, 206, 235, 0.3)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    blobGradient.addColorStop(0, color);
    blobGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = blobGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 15 + Math.random() * 35;
    const islandGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    islandGradient.addColorStop(0, 'rgba(85, 107, 47, 0.6)');
    islandGradient.addColorStop(0.6, 'rgba(139, 115, 85, 0.4)');
    islandGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = islandGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const planetTextureCache: Partial<Record<PlanetThemeType, THREE.CanvasTexture>> = {};

/**
 * 根据主题类型创建星球纹理的统一入口
 * 内部使用缓存机制，避免重复生成相同主题的纹理
 */
export function createThemedPlanetTexture(theme: PlanetThemeType): THREE.CanvasTexture {
  if (planetTextureCache[theme]) {
    return planetTextureCache[theme]!;
  }

  let texture: THREE.CanvasTexture;
  switch (theme) {
    case 'desert':
      texture = createDesertPlanetTexture();
      break;
    case 'ice':
      texture = createIcePlanetTexture();
      break;
    case 'lava':
      texture = createLavaPlanetTexture();
      break;
    case 'ocean':
      texture = createOceanPlanetTexture();
      break;
    case 'forest':
    default:
      texture = createPlanetTexture();
      break;
  }

  planetTextureCache[theme] = texture;
  return texture;
}

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
