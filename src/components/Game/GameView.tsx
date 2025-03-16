import React, { useRef, useEffect, useState } from 'react';

interface Rotation {
  x: number;
  y: number;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface ExtendedDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

export default function GameView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState<Rotation>({ x: 0, y: 0 });

  // 전체화면 토글 함수
  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      const fsElem: FullscreenElement = elem;
      if (fsElem.requestFullscreen) {
        fsElem.requestFullscreen();
      } else if (fsElem.webkitRequestFullscreen) {
        fsElem.webkitRequestFullscreen();
      } else if (fsElem.msRequestFullscreen) {
        fsElem.msRequestFullscreen();
      }
    } else {
      const doc = document as ExtendedDocument;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  // 게임 창 클릭 시 포인터락 요청
  const requestPointerLock = () => {
    containerRef.current?.requestPointerLock();
  };

  // 전체화면 상태 변화 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 마우스 이동 이벤트로 rotation 업데이트 (pointer lock 상태일 때)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === containerRef.current) {
        setRotation((prev) => ({
          x: prev.x + e.movementX,
          y: prev.y + e.movementY,
        }));
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* 게임 창 */}
      <div
        ref={containerRef}
        onClick={requestPointerLock}
        className="relative h-full w-full cursor-none"
        style={{
          backgroundImage: "url('/grid.jpg')",
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: `${-rotation.x}px ${-rotation.y}px`,
        }}
      >
        {/* 중앙 크로스헤어 */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform select-none text-2xl text-red-500">
          +
        </div>
      </div>
      {/* 전체화면 토글 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        className="absolute right-4 top-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        {isFullscreen ? '창 모드로 전환' : '전체화면 모드'}
      </button>
    </div>
  );
}
