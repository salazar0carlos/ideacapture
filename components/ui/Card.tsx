"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface CardProps {
  hover?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, children, onClick }, ref) => {
    const MotionDiv = motion.div;

    return (
      <MotionDiv
        ref={ref}
        className={cn(
          "glass rounded-2xl p-6 transition-all duration-300",
          hover && "hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
      >
        {children}
      </MotionDiv>
    );
  }
);

Card.displayName = "Card";

export { Card };
