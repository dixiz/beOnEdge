import React, { ReactNode } from 'react';
import './Header.css';

interface HeaderProps {
  children: ReactNode;
  isLightTheme?: boolean;
}

const Header: React.FC<HeaderProps> = ({ children, isLightTheme = false }) => {
  return (
    <div className={`header ${isLightTheme ? 'header--light' : 'header--dark'}`}>
      {children}
    </div>
  );
};

export default React.memo(Header);
