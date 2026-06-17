import * as THREE from 'three';
import { PlanetStyle } from '../types/game';

function createNoiseBlobs(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[], count: number) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 30 + Math.random() * 80;
    const color = colors[Math.floor(Math.random() * colors.length)];

    const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    blobGradient.addColorStop(0, color);
    blobGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = blobGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createTextureDetails(ctx: CanvasRenderingContext2D, width: number, height: number, baseShade: [number, number, number], count: number) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 8;
    const shade = 0.7 + Math.random() * 0.3;
    ctx.fillStyle = `rgba(${Math.floor(baseShade[0] * shade)}, ${Math.floor(baseShade[1] * shade)}, ${Math.floor(baseShade[2] * shade)}, 0.4)`;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function createPlanetTexture(style: PlanetStyle = 'verdant'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  let gradientStops: [number, string][] = [];
  let blobColors: string[] = [];
  let detailShade: [number, number, number] = [60, 100, 50];
  let detailCount = 200;

  switch (style) {
    case 'verdant':
      gradientStops = [
        [0, '#1a472a'],
        [0.3, '#2d5a27'],
        [0.5, '#3d6b35'],
        [0.7, '#8b7355'],
        [1, '#5d4e37'],
      ];
      blobColors = [
        'rgba(34, 139, 34, 0.3)',
        'rgba(85, 107, 47, 0.3)',
        'rgba(139, 115, 85, 0.3)',
        'rgba(70, 130, 180, 0.2)',
      ];
      detailShade = [60, 100, 50];
      break;

    case 'desert':
      gradientStops = [
        [0, '#c2956e'],
        [0.3, '#d4a574'],
        [0.5, '#e6b88a'],
        [0.7, '#c2956e'],
        [1, '#8b6914'],
      ];
      blobColors = [
        'rgba(210, 180, 140, 0.4)',
        'rgba(244, 164, 96, 0.3)',
        'rgba(210, 105, 30, 0.3)',
        'rgba(222, 184, 135, 0.3)',
      ];
      detailShade = [200, 150, 100];
      break;

    case 'ocean':
      gradientStops = [
        [0, '#0a3d62'],
        [0.3, '#1e5f8a'],
        [0.5, '#2e86ab'],
        [0.7, '#1e5f8a'],
        [1, '#0a3d62'],
      ];
      blobColors = [
        'rgba(30, 144, 255, 0.3)',
        'rgba(0, 191, 255, 0.25)',
        'rgba(70, 130, 180, 0.3)',
        'rgba(100, 149, 237, 0.25)',
      ];
      detailShade = [40, 100, 150];
      break;

    case 'volcanic':
      gradientStops = [
        [0, '#2a1010'],
        [0.3, '#4a2020'],
        [0.5, '#5c2a2a'],
        [0.7, '#3d1a1a'],
        [1, '#1a0808'],
      ];
      blobColors = [
        'rgba(255, 69, 0, 0.35)',
        'rgba(255, 140, 0, 0.25)',
        'rgba(178, 34, 34, 0.35)',
        'rgba(139, 0, 0, 0.3)',
      ];
      detailShade = [100, 40, 30];
      break;

    case 'ice':
      gradientStops = [
        [0, '#a8d4e6'],
        [0.3, '#c5e1ed'],
        [0.5, '#d9eef5'],
        [0.7, '#b8d9e8'],
        [1, '#90c2d9'],
      ];
      blobColors = [
        'rgba(255, 255, 255, 0.4)',
        'rgba(200, 230, 255, 0.35)',
        'rgba(173, 216, 230, 0.3)',
        'rgba(224, 255, 255, 0.35)',
      ];
      detailShade = [180, 220, 240];
      break;

    case 'crystal':
      gradientStops = [
        [0, '#4b0082'],
        [0.3, '#6a5acd'],
        [0.5, '#9370db'],
        [0.7, '#7b68ee'],
        [1, '#483d8b'],
      ];
      blobColors = [
        'rgba(138, 43, 226, 0.35)',
        'rgba(186, 85, 211, 0.3)',
        'rgba(147, 112, 219, 0.35)',
        'rgba(218, 112, 214, 0.25)',
      ];
      detailShade = [100, 80, 180];
      break;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradientStops.forEach(([pos, color]) => gradient.addColorStop(pos, color));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  createNoiseBlobs(ctx, canvas.width, canvas.height, blobColors, 50);
  createTextureDetails(ctx, canvas.width, canvas.height, detailShade, detailCount);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createCloudTexture(style: PlanetStyle = 'verdant'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let cloudColor = 'rgba(255, 255, 255, 0.6)';
  let cloudColorMid = 'rgba(255, 255, 255, 0.3)';

  switch (style) {
    case 'desert':
      cloudColor = 'rgba(255, 240, 224, 0.5)';
      cloudColorMid = 'rgba(255, 220, 180, 0.25)';
      break;
    case 'volcanic':
      cloudColor = 'rgba(85, 51, 51, 0.7)';
      cloudColorMid = 'rgba(60, 30, 30, 0.35)';
      break;
    case 'ice':
      cloudColor = 'rgba(240, 248, 255, 0.65)';
      cloudColorMid = 'rgba(200, 230, 255, 0.3)';
      break;
    case 'crystal':
      cloudColor = 'rgba(230, 230, 250, 0.6)';
      cloudColorMid = 'rgba(221, 160, 221, 0.3)';
      break;
    case 'ocean':
      cloudColor = 'rgba(224, 240, 255, 0.6)';
      cloudColorMid = 'rgba(180, 220, 255, 0.3)';
      break;
  }

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 20 + Math.random() * 60;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, cloudColor);
    gradient.addColorStop(0.5, cloudColorMid);
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
