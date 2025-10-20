export const D = {
  base: 0.8,
  out: 0.5,
};

export const E = {
  in: [0.19, 1, 0.22, 1] as const,
  out: [0.4, 0, 0.5, 1] as const,
};

export const slideUp = {
  hidden: { opacity: 0, y: '120vh' },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: D.base, ease: E.in },
  },
  exit: {
    opacity: 0,
    y: '120vh',
    transition: { duration: D.out, ease: E.out },
  },
};

export const slideLeft = {
  hidden: { opacity: 0, x: '-20vw' },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: D.base, ease: E.in },
  },
  exit: {
    opacity: 0,
    x: '-20vw',
    transition: { duration: D.out, ease: E.out },
  },
};

export const slideRight = {
  hidden: { opacity: 0, x: '20vw' },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: D.base, ease: E.in },
  },
  exit: {
    opacity: 0,
    x: '20vw',
    transition: { duration: D.out, ease: E.out },
  },
};
