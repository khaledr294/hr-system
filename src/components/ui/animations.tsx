'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

// Fade In Animation
export function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.5,
  ...props 
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide In from Bottom
export function SlideInBottom({ 
  children, 
  delay = 0,
  ...props 
}: { 
  children: ReactNode; 
  delay?: number;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide In from Right (للقوائم العربية)
export function SlideInRight({ 
  children, 
  delay = 0,
  ...props 
}: { 
  children: ReactNode; 
  delay?: number;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale In Animation
export function ScaleIn({ 
  children, 
  delay = 0,
  ...props 
}: { 
  children: ReactNode; 
  delay?: number;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger Children Animation
export function StaggerContainer({ 
  children,
  staggerDelay = 0.1,
  ...props 
}: { 
  children: ReactNode;
  staggerDelay?: number;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ 
  children,
  ...props 
}: { 
  children: ReactNode;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Bounce Animation
export function BounceIn({ 
  children,
  delay = 0,
  ...props 
}: { 
  children: ReactNode;
  delay?: number;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Hover Scale Effect
export function HoverScale({ 
  children,
  scale = 1.05,
  ...props 
}: { 
  children: ReactNode;
  scale?: number;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Page Transition
export function PageTransition({ 
  children,
  ...props 
}: { 
  children: ReactNode;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Rotate Animation
export function Rotate({ 
  children,
  ...props 
}: { 
  children: ReactNode;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Pulse Animation
export function Pulse({ 
  children,
  ...props 
}: { 
  children: ReactNode;
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
