"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThreeDObjectProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  enabled?: boolean;
}

export function ThreeDObject({ children, className, onClick, enabled = true }: ThreeDObjectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !enabled) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d",
        rotateX: enabled ? rotateX : 0,
        rotateY: enabled ? rotateY : 0,
      }}
      className={cn("relative transition-all duration-200 ease-out", className)}
    >
      <div style={{ transform: "translateZ(20px)" }} className="absolute inset-0 z-10">
        {children}
      </div>

      {/* Holographic Glare */}
      {enabled && (
        <motion.div
          style={{
            background: `linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.4) 45%, rgba(255, 255, 255, 0.0) 50%, transparent 100%)`,
            left: glareX,
            top: glareY,
            zIndex: 50,
            transform: "scale(2)",
          }}
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
        />
      )}
    </motion.div>
  );
}