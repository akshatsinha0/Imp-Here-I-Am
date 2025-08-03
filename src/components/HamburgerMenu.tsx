import React from 'react';

interface HamburgerMenuProps {
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isActive, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`hamburger-menu ${isActive ? 'active' : ''} ${className} p-2 rounded-lg hover:bg-white/10 transition-colors`}
      aria-label={isActive ? 'Close menu' : 'Open menu'}
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
};

export default HamburgerMenu;