/**
 * Floating score renderer state.
 * - 타겟 컨테이너 좌표계(x, y) 기준으로 점수 텍스트를 떠오르게 렌더링한다.
 * - 크기/상승량/두께/블러는 `targetSize`(타겟 컨테이너 기준) 비율로 스케일링한다.
 * - 내부 상태(`items`)는 모듈 단위로 유지되며, `clear/update`로 생명주기를 관리한다.
 */

export type FloatingScore = {
  x: number;
  y: number;
  score: number;
  life: number;
  ttl: number;
  crit?: boolean;
};

const items: FloatingScore[] = [];

// 타겟 컨테이너 기준 스케일 계수(타겟 크기에 비례)
const FONT_PER_SIZE = 0.42;
const RISE_PER_SIZE = 0.54;
const LW_PER_SIZE = 0.09;
const BLUR_PER_SIZE = 0.18;
const CRIT_FONT_SCALE = 1.2;
const TTL_NORMAL = 800;
const TTL_CRIT = 1000;

/**
 * 떠오르는 점수 항목을 추가한다.
 * @param x 타겟 컨테이너 좌표계 X
 * @param y 타겟 컨테이너 좌표계 Y
 * @param score 표시할 점수(0 포함)
 * @param crit 크리티컬 여부(표기/TTL에 영향)
 */
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

/** 내부 상태를 초기화한다(씬 전환/재시작 시 사용). */
export function clearFloatingScores() {
  items.length = 0;
}

/**
 * 항목의 생존 시간을 업데이트하고, TTL이 지난 항목을 제거한다.
 * @param dtMs 프레임 간 경과 시간(ms)
 */
export function updateFloatingScores(dtMs: number) {
  // splice 제거가 있으므로 역순 순회로 인덱스 안정성 보장
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.life += dtMs;
    if (it.life >= it.ttl) items.splice(i, 1);
  }
}

/**
 * 모든 항목을 렌더링한다.
 * @param ctx 캔버스 컨텍스트
 * @param targetSize 타겟 컨테이너 기준 크기(스케일 기준)
 */
export function drawFloatingScores(
  ctx: CanvasRenderingContext2D,
  targetSize: number
) {
  for (const it of items) {
    const t = Math.min(1, it.life / it.ttl);
    const eased = 1 - Math.pow(1 - t, 3);
    const alpha = Math.max(0, Math.min(1, 1 - eased));
    const scale = 1 + 0.3 * (1 - eased);

    // targetSize 비율 스케일링 전제(해상도/DPR과 무관하게 "타겟 크기" 기준)
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
  if (crit) return '#ffec99';
  if (score === 0) return '#d9d9d9';
  return '#e6f2ff';
}

function formatScore(score: number): string {
  return `${score > 0 ? '+' : ''}${score}`;
}
