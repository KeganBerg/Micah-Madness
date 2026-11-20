// "Share my win": draws a picture card of the result and hands it to the phone's share sheet.

export interface ShareCard {
  title: string; // e.g. "Level 12 cleared"
  subtitle: string; // e.g. the area name
  stars: number; // 0-3
  lines: [string, string][]; // label, value rows
  micah: string; // image URL of Micah in her outfit
}

const SITE = 'micahmadness.netlify.app';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}

export async function drawCard(card: ShareCard): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  try {
    await document.fonts?.ready;
  } catch {
    /* fonts are a nice-to-have */
  }
  const display = "'Lilita One', 'Arial Rounded MT Bold', sans-serif";
  const body = "'Nunito', 'Helvetica Neue', Arial, sans-serif";

  ctx.fillStyle = '#173a52';
  ctx.fillRect(0, 0, W, H);
  // Confetti
  const colors = ['#e8352f', '#ffd23f', '#5fc7f0', '#7ed36f', '#ff9cc8'];
  for (let i = 0; i < 70; i++) {
    ctx.save();
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.75;
    ctx.translate((i * 397) % W, (i * 211) % 560);
    ctx.rotate(i);
    ctx.fillRect(-9, -4, 18, 8);
    ctx.restore();
  }
  // Big lobster-red circle with Micah
  ctx.fillStyle = '#e8352f';
  ctx.beginPath();
  ctx.arc(W / 2, 400, 250, 0, Math.PI * 2);
  ctx.fill();
  const img = await loadImage(card.micah);
  if (img) ctx.drawImage(img, W / 2 - 230, 160, 460, 460);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#9fc4dc';
  ctx.font = `800 40px ${body}`;
  ctx.fillText(card.subtitle.toUpperCase(), W / 2, 740);
  ctx.fillStyle = '#ffffff';
  ctx.font = `92px ${display}`;
  ctx.fillText(card.title, W / 2, 840);

  for (let i = 0; i < 3; i++) {
    starPath(ctx, W / 2 + (i - 1) * 130, 940, 52);
    ctx.fillStyle = i < card.stars ? '#ffd23f' : '#2b5674';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = i < card.stars ? '#b58a00' : '#204560';
    ctx.stroke();
  }

  ctx.font = `800 44px ${body}`;
  card.lines.slice(0, 3).forEach(([k, v], i) => {
    const y = 1065 + i * 62;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9fc4dc';
    ctx.fillText(k, 180, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(v, W - 180, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8352f';
  ctx.font = `64px ${display}`;
  ctx.fillText('Micah Madness', W / 2, 1275);
  ctx.fillStyle = '#9fc4dc';
  ctx.font = `700 32px ${body}`;
  ctx.fillText(SITE, W / 2, 1318);

  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}

/** Opens the share sheet with the card, or downloads it. Returns what happened, for a toast. */
export async function shareCard(card: ShareCard): Promise<'shared' | 'saved' | 'cancelled' | 'failed'> {
  const blob = await drawCard(card);
  if (!blob) return 'failed';
  const file = new File([blob], 'micah-madness.png', { type: 'image/png' });
  const text = `${card.title} in Micah Madness! Play at https://${SITE}`;
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return 'shared';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'cancelled';
  }
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'micah-madness.png';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return 'saved';
  } catch {
    return 'failed';
  }
}
