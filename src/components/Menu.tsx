import React, { useLayoutEffect, useRef, useState } from 'react';
import './Menu.css';
import DonationButtons from './DonationButtons';
import EventLogo from './EventLogo';

interface MenuProps {
  isLightTheme?: boolean;
  onToggleTheme?: () => void;
  useLocalTime?: boolean;
  onToggleTime?: (useLocal: boolean) => void;
  viewMode?: 'all' | 'byDay';
  onToggleViewMode?: (mode: 'all' | 'byDay') => void;
  sessionScrollMode?: 'all' | 'future';
  onToggleSessionScrollMode?: (mode: 'all' | 'future') => void;
  onHeightChange?: (height: number) => void;
  onOpenFilter?: () => void;
  activeFilters?: Array<{
    key: string;
    label: string;
    type: 'series' | 'days' | 'tracks' | 'commentators';
    value: string;
  }>;
  onRemoveActiveFilter?: (type: 'series' | 'days' | 'tracks' | 'commentators', value: string) => void;
}

const Menu: React.FC<MenuProps> = ({
  isLightTheme = false,
  onToggleTheme,
  useLocalTime = false,
  onToggleTime,
  viewMode = 'all',
  onToggleViewMode,
  sessionScrollMode = 'all',
  onToggleSessionScrollMode,
  onHeightChange,
  onOpenFilter,
  activeFilters = [],
  onRemoveActiveFilter
}) => {
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const iconColor = isLightTheme ? '#000000' : '#FFD600'; // черная в светлой теме, желтая в темной
  // Фильтр: в светлой теме иконка жёлтая на чёрном фоне; в тёмной теме иконка чёрная на жёлтом фоне
  const filterIconColor = isLightTheme ? '#FFD600' : '#000000';
  const filterButtonClass = isLightTheme ? 'filter-button filter-button--light' : 'filter-button filter-button--dark';
  const menuRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!onHeightChange) return;
    const el = menuRef.current;
    if (!el) return;
    const update = () => onHeightChange(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange]);

  return (
    <div ref={menuRef} className={`menu ${isLightTheme ? 'menu--light' : 'menu--dark'}`}>
      <DonationButtons />
      {activeFilters.length > 0 && (
        <div className="active-filters active-filters--mobile" aria-label="Выбранные фильтры">
          {activeFilters.map(filter => (
            <button
              key={filter.key}
              type="button"
              className="active-filters__item"
              onClick={() => onRemoveActiveFilter?.(filter.type, filter.value)}
              title={`Убрать фильтр: ${filter.label}`}
            >
              <span>{filter.label}</span>
              <span className="active-filters__remove" aria-hidden="true">✕</span>
            </button>
          ))}
        </div>
      )}
      <div className="menu-center">
        <div className="menu-center__row menu-center__row--primary">
          {onToggleTime && (
            <div className="time-toggle-container">
              <div className="time-toggle menu-toggle--vertical">
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
                  Ваш пояс
                </button>
              </div>
            </div>
          )}
          {onToggleViewMode && (
            <div className="view-toggle-container">
              <div className="view-toggle menu-toggle--vertical">
                <button
                  onClick={() => onToggleViewMode && onToggleViewMode('all')}
                  className={`time-toggle-option ${viewMode === 'all' ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                >
                  Все дни
                </button>
                <button
                  onClick={() => onToggleViewMode && onToggleViewMode('byDay')}
                  className={`time-toggle-option ${viewMode === 'byDay' ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                >
                  По дням
                </button>
              </div>
            </div>
          )}
          {onToggleSessionScrollMode && (
            <div className="session-scroll-toggle">
              <div className="session-scroll-toggle__controls menu-toggle--vertical">
                <button
                  onClick={() => onToggleSessionScrollMode('all')}
                  className={`time-toggle-option session-scroll-toggle__option--all ${sessionScrollMode === 'all' ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                >
                  Все сессии
                </button>
                <button
                  onClick={() => onToggleSessionScrollMode('future')}
                  className={`time-toggle-option ${sessionScrollMode === 'future' ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                >
                  Будущие
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="menu-center__row menu-center__row--secondary">
          <div className="quick-actions">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="menu-button quick-actions__button"
              >
                {isLightTheme ? (
                  <svg
                    width="28"
                    height="28"
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
                  <svg
                    width="28"
                    height="28"
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
            <button className={`${filterButtonClass} quick-actions__button`} aria-label="Фильтр" onClick={onOpenFilter}>
              <svg
                width="26"
                height="26"
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
        {activeFilters.length > 0 && (
          <div className="active-filters active-filters--desktop" aria-label="Выбранные фильтры">
            {activeFilters.map(filter => (
              <button
                key={filter.key}
                type="button"
                className="active-filters__item"
                onClick={() => onRemoveActiveFilter?.(filter.type, filter.value)}
                title={`Убрать фильтр: ${filter.label}`}
              >
                <span>{filter.label}</span>
                <span className="active-filters__remove" aria-hidden="true">✕</span>
              </button>
            ))}
          </div>
        )}
        <EventLogo isLightTheme={isLightTheme} />
      </div>
      <div className="mobile-settings">
        {isMobileSettingsOpen && (
          <button
            type="button"
            className="mobile-settings__backdrop"
            aria-label="Закрыть настройки"
            onClick={() => setIsMobileSettingsOpen(false)}
          />
        )}
        <div className={`mobile-settings__sheet ${isMobileSettingsOpen ? 'mobile-settings__sheet--open' : ''}`}>
          <div className="mobile-settings__header">
            <span>Настройки расписания</span>
            <button
              type="button"
              className="mobile-settings__close"
              aria-label="Закрыть настройки"
              onClick={() => setIsMobileSettingsOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="mobile-settings__controls">
            {onToggleTime && (
              <div className="time-toggle-container">
                <div className="time-toggle menu-toggle--vertical">
                  <button
                    onClick={() => onToggleTime(false)}
                    className={`time-toggle-option ${!useLocalTime ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                  >
                    МСК
                  </button>
                  <button
                    onClick={() => onToggleTime(true)}
                    className={`time-toggle-option ${useLocalTime ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                  >
                    Ваш пояс
                  </button>
                </div>
              </div>
            )}
            {onToggleViewMode && (
              <div className="view-toggle-container">
                <div className="view-toggle menu-toggle--vertical">
                  <button
                    onClick={() => onToggleViewMode('all')}
                    className={`time-toggle-option ${viewMode === 'all' ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                  >
                    Все дни
                  </button>
                  <button
                    onClick={() => onToggleViewMode('byDay')}
                    className={`time-toggle-option ${viewMode === 'byDay' ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                  >
                    По дням
                  </button>
                </div>
              </div>
            )}
            {onToggleSessionScrollMode && (
              <div className="session-scroll-toggle">
                <div className="session-scroll-toggle__controls menu-toggle--vertical">
                  <button
                    onClick={() => onToggleSessionScrollMode('all')}
                    className={`time-toggle-option session-scroll-toggle__option--all ${sessionScrollMode === 'all' ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                  >
                    Все сессии
                  </button>
                  <button
                    onClick={() => onToggleSessionScrollMode('future')}
                    className={`time-toggle-option ${sessionScrollMode === 'future' ? 'time-toggle-option--active' : ''} ${isLightTheme ? 'time-toggle-option--light' : 'time-toggle-option--dark'}`}
                  >
                    Будущие
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="mobile-settings__actions">
            <div className="quick-actions">
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="menu-button quick-actions__button"
                  type="button"
                >
                  {isLightTheme ? (
                    <svg
                      width="28"
                      height="28"
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
                    <svg
                      width="28"
                      height="28"
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
              <button
                className={`${filterButtonClass} quick-actions__button`}
                aria-label="Фильтр"
                onClick={() => {
                  onOpenFilter?.();
                  setIsMobileSettingsOpen(false);
                }}
                type="button"
              >
                <svg
                  width="26"
                  height="26"
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
        </div>
        <button
          type="button"
          className={`mobile-settings__trigger ${isLightTheme ? 'mobile-settings__trigger--light' : 'mobile-settings__trigger--dark'}`}
          onClick={() => setIsMobileSettingsOpen(true)}
        >
          Настройки
        </button>
      </div>
    </div>
  );
};

export default Menu;

