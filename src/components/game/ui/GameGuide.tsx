import { motion } from 'framer-motion';

import { slideLeft } from '@/utils/motion';

const styles = {
  listItem:
    'text-[8px] leading-tight md:text-[9px] md:leading-snug lg:text-[10px] lg:leading-normal xl:text-xs xl:leading-relaxed',
  highlight: 'text-[#00ff00] font-bold',
} as const;

const GameGuide = () => {
  return (
    <motion.div
      variants={slideLeft}
      initial="hidden"
      animate="show"
      exit="exit"
      className={`absolute left-4 top-4 max-w-[240px] space-y-2 rounded-lg bg-black bg-opacity-60 p-2 text-white backdrop-blur-sm md:left-4 md:top-4 md:max-w-[280px] md:p-2.5 lg:left-8 lg:top-8 lg:max-w-[320px] lg:p-3 xl:left-10 xl:top-10 xl:max-w-[360px] xl:p-3.5`}
    >
      <h2 className="text-[11px] font-bold text-[#00ff00] md:text-xs lg:text-sm xl:text-base">
        Game Guide
      </h2>
      <ul className="list-inside list-disc space-y-1 text-xs md:space-y-1 lg:space-y-2 xl:space-y-2">
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
          타겟이 <span className={styles.highlight}>10개</span> 이상인 상태가{' '}
          <span className={styles.highlight}>3초</span>간 지속될 경우 게임이
          종료됩니다.
        </li>
        <li className={styles.listItem}>
          <span className={styles.highlight}>ESC</span> 또는{' '}
          <span className={styles.highlight}>~</span>키를 눌러 게임을 즉시
          종료할 수 있습니다.
        </li>
        <li className={styles.listItem}>
          <span className={styles.highlight}>F5</span>를 눌러 화면 모드를 다시
          선택할 수 있습니다.
        </li>
      </ul>
    </motion.div>
  );
};

export default GameGuide;
