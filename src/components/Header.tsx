import React, { ReactNode } from 'react';
import './Header.css';

interface HeaderProps {
  children: ReactNode;
  isLightTheme?: boolean;
  hasEndedEvents?: boolean;
  areEndedEventsShown?: boolean;
  onToggleEndedEvents?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  children,
  isLightTheme = false,
  hasEndedEvents = false,
  areEndedEventsShown = false,
  onToggleEndedEvents
}) => {
  return (
    <div className={`header-block ${hasEndedEvents ? 'header-block--has-ended-toggle' : ''} ${isLightTheme ? 'header-block--light' : 'header-block--dark'}`}>
      <div className={`header ${isLightTheme ? 'header--light' : 'header--dark'}`}>
        {children}
      </div>
      {hasEndedEvents && onToggleEndedEvents && (
        <button
          type="button"
          className="header__ended-toggle"
          onClick={onToggleEndedEvents}
          aria-pressed={areEndedEventsShown}
        >
          {areEndedEventsShown ? 'Скрыть завершённые' : 'Показать завершённые'}
        </button>
      )}
    </div>
  );
};

export default React.memo(Header);
