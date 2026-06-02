'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label="Mavzuni o'zgartirish"
      title="Mavzuni o'zgartirish"
    >
      {theme === 'light' ? (
        <Moon size={20} className="theme-icon moon-icon animate-pop-in" />
      ) : (
        <Sun size={20} className="theme-icon sun-icon animate-pop-in" />
      )}

      <style jsx global>{`
        .theme-toggle-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px;
          border-radius: 50%;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--card-shadow);
        }

        .theme-toggle-btn:hover {
          background: var(--bg-primary);
          border-color: var(--border-color-focus);
          transform: rotate(15deg) scale(1.08);
          box-shadow: var(--card-shadow-hover);
        }

        .theme-toggle-btn:active {
          transform: scale(0.95);
        }

        .theme-icon {
          transition: transform 0.3s ease;
        }

        @keyframes popIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-pop-in {
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </button>
  );
}
