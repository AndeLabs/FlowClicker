import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "../../../lib/cn";
import { ParticleEffect } from "../../../types/game";

interface ClickButtonProps {
  onClick: () => void;
  disabled?: boolean;
  tokensPerClick: number;
  isProcessing?: boolean;
}

interface FloatingNumber {
  id: string;
  value: number;
  x: number;
  y: number;
}

export function ClickButton({
  onClick,
  disabled = false,
  tokensPerClick,
  isProcessing = false,
}: ClickButtonProps) {
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [ripples, setRipples] = useState<{ id: string; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isProcessing) return;

      // Get click position relative to button
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create floating number
      const numberId = `num-${Date.now()}`;
      setFloatingNumbers((prev) => [
        ...prev,
        { id: numberId, value: tokensPerClick, x, y },
      ]);

      // Create ripple effect
      const rippleId = `ripple-${Date.now()}`;
      setRipples((prev) => [...prev, { id: rippleId, x, y }]);

      // Remove after animation
      setTimeout(() => {
        setFloatingNumbers((prev) => prev.filter((n) => n.id !== numberId));
      }, 1000);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 600);

      // Trigger actual click
      onClick();
    },
    [disabled, isProcessing, onClick, tokensPerClick]
  );

  return (
    <div className="relative flex items-center justify-center">
      {/* Main Click Button */}
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={cn(
          "click-button relative h-64 w-64 rounded-full",
          "bg-gradient-to-br from-primary via-purple-600 to-secondary",
          "shadow-2xl transition-all duration-200",
          "flex items-center justify-center",
          "border-4 border-white/20",
          !disabled && !isProcessing && "hover:scale-105 glow-intense",
          disabled && "opacity-50 cursor-not-allowed",
          isProcessing && "animate-pulse"
        )}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent animate-pulse" />

        {/* Icon */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div
            animate={{
              rotate: isProcessing ? 360 : 0,
              scale: isProcessing ? [1, 1.2, 1] : 1,
            }}
            transition={{
              rotate: { duration: 1, repeat: isProcessing ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.5, repeat: isProcessing ? Infinity : 0 },
            }}
          >
            <Zap className="h-24 w-24 text-white drop-shadow-2xl" fill="currentColor" />
          </motion.div>

          <div className="text-center">
            <p className="text-2xl font-bold text-white drop-shadow-lg">
              CLICK!
            </p>
            <p className="text-sm text-white/80">
              +{tokensPerClick.toFixed(4)} FLOW
            </p>
          </div>
        </div>

        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full border-2 border-white"
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 200, height: 200, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </motion.button>

      {/* Floating numbers */}
      <AnimatePresence>
        {floatingNumbers.map((num) => (
          <motion.div
            key={num.id}
            className="floating-number absolute pointer-events-none text-3xl font-bold text-success drop-shadow-lg"
            style={{
              left: num.x,
              top: num.y,
            }}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -100, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            +{num.value.toFixed(4)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Particle ring (optional decoration) */}
      {!disabled && (
        <div className="absolute inset-0 -z-10">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-3 w-3 rounded-full bg-primary/30"
              style={{
                left: "50%",
                top: "50%",
                transformOrigin: "0 0",
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: {
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.1,
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
