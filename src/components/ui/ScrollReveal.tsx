import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?: number;
  /** Legacy alias for distance when direction is up/down */
  y?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  amount?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  y,
  distance = 24,
  direction = "up",
  className,
  amount = 0.15,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount, margin: "-8% 0px" } as never);
  const reduce = useReducedMotion();

  const d = y ?? distance;
  const offset =
    direction === "up"
      ? { y: d, x: 0 }
      : direction === "down"
        ? { y: -d, x: 0 }
        : direction === "left"
          ? { x: d, y: 0 }
          : { x: -d, y: 0 };

  const hidden = reduce ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset };
  const visible = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={inView ? visible : hidden}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
