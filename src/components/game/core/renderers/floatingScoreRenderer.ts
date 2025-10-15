export type FloatingScore = {
  x: number;
  y: number;
  score: number;
  life: number;
  ttl: number;
  crit?: boolean;
};

const items: FloatingScore[] = [];

const FONT_PER_SIZE = 0.42;
const RISE_PER_SIZE = 0.54;
const LW_PER_SIZE = 0.09;
const BLUR_PER_SIZE = 0.18;
const CRIT_FONT_SCALE = 1.2;
const TTL_NORMAL = 800;
const TTL_CRIT = 1000;

export function addFloatingScore(
  x: number,
  y: number,
  score: number,
  crit = false
) {
  items.push({
    x,
    y,
    score,
    life: 0,
    ttl: crit ? TTL_CRIT : TTL_NORMAL,
    crit,
  });
}

export function clearFloatingScores() {
  items.length = 0;
}

export function updateFloatingScores(dtMs: number) {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.life += dtMs;
    if (it.life >= it.ttl) items.splice(i, 1);
  }
}

export function drawFloatingScores(
  ctx: CanvasRenderingContext2D,
  targetSize: number
) {
  for (const it of items) {
    const t = Math.min(1, it.life / it.ttl);
    const eased = 1 - Math.pow(1 - t, 3);
    const alpha = Math.max(0, Math.min(1, 1 - eased));
    const scale = 1 + 0.3 * (1 - eased);

    // 타겟 사이즈 비율로 계산
    const fontPx = targetSize * FONT_PER_SIZE * (it.crit ? CRIT_FONT_SCALE : 1);
    const rise = targetSize * RISE_PER_SIZE;
    const lw = Math.max(1, targetSize * LW_PER_SIZE);
    const blur = targetSize * BLUR_PER_SIZE;

    ctx.save();
    ctx.translate(it.x, it.y - t * rise);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    ctx.font = `${fontPx}px Pretendard, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = `rgba(0,0,0,${0.4 * alpha})`;
    ctx.shadowBlur = blur;
    ctx.lineWidth = lw;
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeText(formatScore(it.score), 0, 0);

    ctx.fillStyle = pickFillColor(it.score, !!it.crit);
    ctx.fillText(formatScore(it.score), 0, 0);

    ctx.restore();
  }
}

function pickFillColor(score: number, crit: boolean): string {
  if (score < 0) return '#ffb3b3'; // 패널티: 옅은 레드
  if (crit) return '#ffec99'; // 크리티컬: 옅은 옐로
  if (score === 0) return '#d9d9d9'; // 0점: 그레이
  return '#e6f2ff'; // 기본: 옅은 블루
}

function formatScore(score: number) {
  // +3, -1, 0 등 출력 일관화
  return `${score > 0 ? '+' : ''}${score}`;
}
