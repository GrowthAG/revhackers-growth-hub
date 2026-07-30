export const fadeInSlideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export const progressWidthAnimation = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 4, ease: "easeInOut" }
};
