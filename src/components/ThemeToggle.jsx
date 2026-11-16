import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            p-2 rounded-lg transition-all duration-200 hover:scale-105
            ${theme === value 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
          title={`Switch to ${label} theme`}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
};

export const CompactThemeToggle = ({ className = '' }) => {
  const { toggleTheme, theme, effectiveTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
      default:
        return Monitor;
    }
  };

  const Icon = getIcon();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200 hover:scale-105
        bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 
        hover:bg-gray-200 dark:hover:bg-gray-600
        ${className}
      `}
      title={`Current: ${theme} theme (Click to cycle)`}
      aria-label={`Toggle theme (currently ${theme})`}
    >
      <Icon size={18} />
    </button>
  );
};

export default ThemeToggle;