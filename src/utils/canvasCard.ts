import { Badge, UserProfile } from '../types';

export interface CardRenderOptions {
  theme: 'emerald' | 'midnight' | 'solar';
  badge?: Badge | null;
  user: UserProfile;
  customQuote?: string;
  format: 'landscape' | 'square';
}

export async function generateSocialCardBlob(
  canvas: HTMLCanvasElement,
  options: CardRenderOptions
): Promise<string> {
  const isSquare = options.format === 'square';
  const width = isSquare ? 1080 : 1200;
  const height = isSquare ? 1080 : 630;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain canvas 2D context');

  // Background Theme
  if (options.theme === 'emerald') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#062016');
    grad.addColorStop(0.5, '#0b3425');
    grad.addColorStop(1, '#051912');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative ambient circles
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.2, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.85, 340, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (options.theme === 'midnight') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.07)';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.3, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // Solar earth
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.5, '#292524');
    grad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = 'rgba(234, 179, 8, 0.06)';
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.25, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Border frame hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // Corner accents
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 4;
  const cSize = 28;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(32, 32 + cSize);
  ctx.lineTo(32, 32);
  ctx.lineTo(32 + cSize, 32);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 32 - cSize, 32);
  ctx.lineTo(width - 32, 32);
  ctx.lineTo(width - 32, 32 + cSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(32, height - 32 - cSize);
  ctx.lineTo(32, height - 32);
  ctx.lineTo(32 + cSize, height - 32);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 32 - cSize, height - 32);
  ctx.lineTo(width - 32, height - 32);
  ctx.lineTo(width - 32, height - 32 - cSize);
  ctx.stroke();

  // Header: App Logo & Brand
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 32px Outfit, sans-serif';
  ctx.fillText('ECOPULSE', 72, 90);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '500 18px Plus Jakarta Sans, sans-serif';
  ctx.fillText('HABIT VERIFICATION CERTIFICATE', 250, 88);

  // User Identity Lockup
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`${options.user.avatar} ${options.user.name}`, 72, 145);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 17px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`@${options.user.username} · Level ${options.user.level} · ${options.user.region}`, 72, 175);

  // Main Showcase Box
  const boxTop = 210;
  const boxHeight = isSquare ? 500 : 250;
  const boxWidth = width - 144;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fillRect(72, boxTop, boxWidth, boxHeight);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(72, boxTop, boxWidth, boxHeight);

  // If badge is present
  if (options.badge) {
    const badge = options.badge;
    // Badge medal circle
    const medalX = 170;
    const medalY = boxTop + (isSquare ? 160 : 125);
    const medalR = isSquare ? 80 : 65;

    // Glowing rim
    ctx.save();
    const glow = ctx.createRadialGradient(medalX, medalY, 10, medalX, medalY, medalR + 20);
    glow.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(medalX, medalY, medalR + 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(medalX, medalY, medalR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner icon symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = isSquare ? '48px Outfit' : '40px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', medalX, medalY);
    ctx.restore();

    // Badge Title & Description
    const textLeft = isSquare ? 72 + 30 : 280;
    const textY = isSquare ? boxTop + 290 : boxTop + 70;

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '600 15px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${badge.rarity.toUpperCase()} BADGE UNLOCKED`, textLeft, textY);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillText(badge.name, textLeft, textY + 45);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 20px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`"${badge.title}"`, textLeft, textY + 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 17px Plus Jakarta Sans, sans-serif';
    wrapText(ctx, badge.description, textLeft, textY + 115, isSquare ? boxWidth - 60 : boxWidth - 240, 24);
  } else {
    // General impact showcase
    ctx.fillStyle = '#6ee7b7';
    ctx.font = '600 15px JetBrains Mono, monospace';
    ctx.fillText('EARTH IMPACT MILESTONE', 110, boxTop + 55);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px Outfit, sans-serif';
    ctx.fillText(`${options.user.totalCo2Kg.toFixed(1)} kg CO₂ Emissions Prevented`, 110, boxTop + 105);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 18px Plus Jakarta Sans, sans-serif';
    ctx.fillText(
      `${options.user.streak}-Day Sustainable Streak · ${options.user.totalWaterL}L Water Saved · Level ${options.user.level}`,
      110,
      boxTop + 145
    );
  }

  // Quote or User Reflection
  const quoteText = options.customQuote || '“What you do makes a difference, and you have to decide what kind of difference you want to make.” — Dr. Jane Goodall';
  const quoteY = isSquare ? height - 200 : height - 120;

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'italic 18px Plus Jakarta Sans, serif';
  ctx.textAlign = 'left';
  wrapText(ctx, quoteText, 72, quoteY, width - 144, 26);

  // Footer metadata
  ctx.fillStyle = '#64748b';
  ctx.font = '500 15px JetBrains Mono, monospace';
  ctx.fillText(`ecopulse.app/p/${options.user.username} · #EcoPulse #SustainableHabits`, 72, height - 55);

  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'right';
  ctx.fillText('VERIFIED CLIMATE IMPACT', width - 72, height - 55);

  return canvas.toDataURL('image/png');
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

export function buildShareUrls(params: {
  text: string;
  url?: string;
  hashtags?: string[];
}) {
  const appUrl = params.url || (typeof window !== 'undefined' ? window.location.href : 'https://ecopulse.app');
  const hashtags = (params.hashtags || ['EcoPulse', 'Sustainability', 'GreenHabits']).join(',');
  const encodedText = encodeURIComponent(params.text);
  const encodedUrl = encodeURIComponent(appUrl);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${hashtags}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    threads: `https://threads.net/intent/post?text=${encodedText}%20${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}
