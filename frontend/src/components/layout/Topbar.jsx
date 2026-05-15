import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { IconSun, IconMoon, IconMenu } from '../icons/SvgIcons';

export default function Topbar({ title, onMenuToggle }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button className="btn btn-ghost btn-icon" onClick={onMenuToggle} style={{ display: 'none' }} id="menu-toggle"><IconMenu /></button>
        <h2 className="topbar-title">{title}</h2>
      </div>
      <div className="topbar-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" id="theme-toggle">
          {theme === 'dark' ? <IconSun style={{ width: 18, height: 18 }} /> : <IconMoon style={{ width: 18, height: 18 }} />}
        </button>
      </div>
    </header>
  );
}
