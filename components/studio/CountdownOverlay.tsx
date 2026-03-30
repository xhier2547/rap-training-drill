"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '@/lib/store/useStudioStore';

export default function CountdownOverlay() {
  const countdown = useStudioStore(s => s.countdown);

  return (
    <AnimatePresence>
      {countdown !== null && countdown > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0, rotate: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <span className="text-[180px] font-display font-black text-white leading-none drop-shadow-[0_0_30px_rgba(0,255,133,0.5)]">
              {countdown}
            </span>
            <span className="text-xl font-mono font-bold text-dojo-neon tracking-[0.3em] uppercase mt-4">
              Get Ready
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
