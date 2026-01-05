import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface CrosshairProps {
  isGaming?: boolean;
}

export const Crosshair = ({ isGaming = false }: CrosshairProps) => {
  const [isFiring, setIsFiring] = useState(false);

  useEffect(() => {
    const handleMouseDown = () => {
      if (!isGaming) return;
      setIsFiring(true);
      setTimeout(() => setIsFiring(false), 50);
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [isGaming]);

  const springTransition = {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  };

  const activeLineStyle =
    'stroke-blue-600 stroke-[2] stroke-linecap-round drop-shadow-[0_0_2px_rgba(0,0,255,0.8)]';
  const idleLineStyle =
    'stroke-white stroke-[2] stroke-linecap-round drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]';
  const currentLineStyle = isGaming ? activeLineStyle : idleLineStyle;

  const activeCircleStyle =
    'fill-blue-600 drop-shadow-[0_0_2px_rgba(0,0,255,0.8)]';
  const idleCircleStyle = 'fill-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]';
  const currentCircleStyle = isGaming ? activeCircleStyle : idleCircleStyle;

  const canvasSize = 48;
  const center = canvasSize / 2;

  const gap = 5;
  const length = 5;
  const recoilDistance = 12;

  return (
    <div
      className={twMerge(
        'z-5 pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none',
        !isGaming && 'mix-blend-difference'
      )}
    >
      <svg
        width={canvasSize}
        height={canvasSize}
        viewBox={`0 0 ${canvasSize} ${canvasSize}`}
        fill="none"
      >
        <motion.line
          x1={center}
          y1={center - gap}
          x2={center}
          y2={center - gap - length}
          className={currentLineStyle}
          animate={{ translateY: isFiring ? -recoilDistance : 0 }}
          transition={springTransition}
        />

        <motion.line
          x1={center}
          y1={center + gap}
          x2={center}
          y2={center + gap + length}
          className={currentLineStyle}
          animate={{ translateY: isFiring ? recoilDistance : 0 }}
          transition={springTransition}
        />

        <motion.line
          x1={center - gap}
          y1={center}
          x2={center - gap - length}
          y2={center}
          className={currentLineStyle}
          animate={{ translateX: isFiring ? -recoilDistance : 0 }}
          transition={springTransition}
        />

        <motion.line
          x1={center + gap}
          y1={center}
          x2={center + gap + length}
          y2={center}
          className={currentLineStyle}
          animate={{ translateX: isFiring ? recoilDistance : 0 }}
          transition={springTransition}
        />

        <circle
          cx={center}
          cy={center}
          r="1.5"
          className={currentCircleStyle}
        />
      </svg>
    </div>
  );
};
