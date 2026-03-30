"use client";

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlangTooltipProps {
  children: ReactNode;
  meaning?: string;
  context?: string;
  pronunciation?: string;
}

export default function SlangTooltip({ children, meaning, context, pronunciation }: SlangTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  // If no meaning provided, just render children without tooltip logic
  if (!meaning) return <>{children}</>;

  return (
    <div 
      className="relative inline-block cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[280px] bg-[#11141D] border border-dojo-alert text-dojo-text text-sm rounded-xl p-4 shadow-[0_4px_20px_rgba(255,61,90,0.2)] z-50 pointer-events-none text-left"
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#11141D] border-b border-r border-dojo-alert rotate-45" />
            
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-dojo-alert/20 text-dojo-alert text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-dojo-alert/30">
                  UK Slang
                </span>
                {pronunciation && (
                  <span className="text-dojo-text/50 font-mono text-xs"> /{pronunciation}/</span>
                )}
              </div>
              <p className="font-bold text-white text-base">{meaning}</p>
              {context && (
                <p className="text-xs text-dojo-text/70 mt-1 leading-relaxed">
                  {context}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
