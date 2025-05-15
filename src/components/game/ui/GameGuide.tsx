import { PanelOverlay } from '@/components/common/PanelOverlay';

interface GameGuideProps {
  animate?: boolean;
}

const styles = {
  listItem:
    'text-[8px] leading-tight md:text-[9px] md:leading-snug lg:text-[10px] lg:leading-normal xl:text-xs xl:leading-relaxed',
  highlight: 'text-orange-400 font-bold',
} as const;

const GameGuide = ({ animate = true }: GameGuideProps) => {
  return (
    <div
      className={`absolute left-4 top-4 max-w-[240px] space-y-2 rounded-lg bg-black bg-opacity-50 p-2 text-white backdrop-blur-sm transition-opacity duration-1000 md:left-4 md:top-4 md:max-w-[280px] md:p-2.5 lg:left-8 lg:top-8 lg:max-w-[320px] lg:p-3 xl:left-10 xl:top-10 xl:max-w-[360px] xl:p-3.5 ${animate ? 'opacity-100' : 'opacity-0'}`}
    >
      <h2 className="text-[11px] font-bold md:text-xs lg:text-sm xl:text-base">
        Game Guide
      </h2>
      <ul className="list-inside list-disc space-y-1 text-xs md:space-y-1 lg:space-y-2 xl:space-y-2">
        <li className={styles.listItem}>
          <span className={styles.highlight}>점점 빠르게</span> 생성되는 타겟을
          사격하여 점수를 획득하세요
        </li>
        <li className={styles.listItem}>
          타겟 중앙부터 <span className={styles.highlight}>3점</span>,{' '}
          <span className={styles.highlight}>2점</span>,{' '}
          <span className={styles.highlight}>1점</span>의 점수를 얻습니다
        </li>
        <li className={styles.listItem}>
          게임 시작 후 <span className={styles.highlight}>[</span> 와{' '}
          <span className={styles.highlight}>]</span> 키로 마우스 민감도를
          조절할 수 있습니다
        </li>
        <li className={styles.listItem}>
          화면에 <span className={styles.highlight}>10개</span>의 타겟이
          남아있는 시점에 게임이 종료됩니다
        </li>
        <li className={styles.listItem}>
          <span className={styles.highlight}>ESC 키</span>를 눌러 게임을 즉시
          종료할 수 있습니다.
        </li>
      </ul>
    </div>
  );
};

export default GameGuide;
