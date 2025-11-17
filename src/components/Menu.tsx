import React from 'react';
import './Menu.css';

interface MenuProps {
  isLightTheme?: boolean;
  onToggleTheme?: () => void;
  useLocalTime?: boolean;
  onToggleTime?: () => void;
  currentTimeZone?: string;
}

const Menu: React.FC<MenuProps> = ({ isLightTheme = false, onToggleTheme, useLocalTime = false, onToggleTime, currentTimeZone = 'GMT+3' }) => {
  const iconColor = isLightTheme ? '#000000' : '#FFD600'; // черная в светлой теме, желтая в темной

  return (
    <div className={`menu ${isLightTheme ? 'menu--light' : 'menu--dark'}`}>
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className="menu-button"
        >
          {isLightTheme ? (
            // Луна (когда фон желтый)
            <svg
              width="58"
              height="58"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill={iconColor}
              />
            </svg>
          ) : (
            // Солнце (когда фон черный)
            <svg
              width="58"
              height="58"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="5" fill={iconColor} />
              <path
                d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93"
                stroke={iconColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}
      {onToggleTime && (
        <div className="time-zone-container">
          <button
            onClick={onToggleTime}
            className="menu-button"
            title={useLocalTime ? 'Показать время GMT+3' : 'Показать локальное время'}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2" fill="none" />
              <path
                d="M12 6V12L16 14"
                stroke={iconColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {useLocalTime && (
                <circle cx="12" cy="12" r="2" fill={iconColor} />
              )}
            </svg>
          </button>
          <span className={`time-zone-text ${isLightTheme ? 'time-zone-text--light' : 'time-zone-text--dark'}`}>
            {currentTimeZone}
          </span>
        </div>
      )}
    </div>
  );
};

export default Menu;

