import React from 'react';
import './Menu.css';
import DonationButtons from './DonationButtons';

interface MenuProps {
  isLightTheme?: boolean;
  onToggleTheme?: () => void;
  useLocalTime?: boolean;
  onToggleTime?: (useLocal: boolean) => void;
  onOpenFilter?: () => void;
}

const Menu: React.FC<MenuProps> = ({ isLightTheme = false, onToggleTheme, useLocalTime = false, onToggleTime, onOpenFilter }) => {
  const iconColor = isLightTheme ? '#000000' : '#FFD600'; // черная в светлой теме, желтая в темной
  // Фильтр: в светлой теме иконка жёлтая на чёрном фоне; в тёмной теме иконка чёрная на жёлтом фоне
  const filterIconColor = isLightTheme ? '#FFD600' : '#000000';
  const filterButtonClass = isLightTheme ? 'filter-button filter-button--light' : 'filter-button filter-button--dark';

  return (
    <div className={`menu ${isLightTheme ? 'menu--light' : 'menu--dark'}`}>
      <DonationButtons />
      <div className="menu-center">
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
        <div className="time-toggle-container">
          <div className="time-toggle">
            <button
              onClick={() => onToggleTime && onToggleTime(false)}
              className={`time-toggle-option ${!useLocalTime ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
            >
              МСК
            </button>
            <button
              onClick={() => onToggleTime && onToggleTime(true)}
              className={`time-toggle-option ${useLocalTime ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
            >
              Ваш часовой пояс
            </button>
          </div>
        </div>
      )}
        <button className={filterButtonClass} aria-label="Фильтр" onClick={onOpenFilter}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter-icon"
          >
            <path
              d="M4 5H20L14 12V18L10 19V12L4 5Z"
              stroke={filterIconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Menu;

