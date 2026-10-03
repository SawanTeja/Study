import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ variant = 'segmented', className = '' }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'compact') {
    const isDark = resolvedTheme === 'dark';
    return (
      <button
        type="button"
        className={`theme-toggle-compact-btn ${className}`}
        onClick={toggleTheme}
        title={`Currently in ${resolvedTheme} mode. Click to switch to ${isDark ? 'light' : 'dark'} mode.`}
        aria-label={`Toggle theme: currently ${resolvedTheme}`}
      >
        <span className="theme-toggle-icon-wrap">
          {isDark ? (
            <Moon size={18} className="theme-toggle-icon moon-icon" />
          ) : (
            <Sun size={18} className="theme-toggle-icon sun-icon" />
          )}
        </span>
      </button>
    );
  }

  // Segmented Pill Variant (Light | Dark | System)
  return (
    <div className={`theme-toggle-segmented ${className}`} role="group" aria-label="Theme selector">
      <button
        type="button"
        className={`theme-option-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        title="Light theme"
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
      >
        <Sun size={15} />
        <span className="theme-label">Light</span>
      </button>

      <button
        type="button"
        className={`theme-option-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark theme"
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
      >
        <Moon size={15} />
        <span className="theme-label">Dark</span>
      </button>

      <button
        type="button"
        className={`theme-option-btn ${theme === 'system' ? 'active' : ''}`}
        onClick={() => setTheme('system')}
        title={`System preference (${resolvedTheme})`}
        aria-label="System preference"
        aria-pressed={theme === 'system'}
      >
        <Laptop size={15} />
        <span className="theme-label">Auto</span>
      </button>
    </div>
  );
}
