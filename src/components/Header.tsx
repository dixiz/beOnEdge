import React, { ReactNode } from 'react';
import './Header.css';

interface HeaderProps {
  children: ReactNode;
  isLightTheme?: boolean;
  hasEndedEvents?: boolean;
  hasCancelledEvents?: boolean;
  areEndedEventsShown?: boolean;
  onToggleEndedEvents?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  children,
  isLightTheme = false,
  hasEndedEvents = false,
  hasCancelledEvents = false,
  areEndedEventsShown = false,
  onToggleEndedEvents
}) => {
  return (
    <div className={`header-block ${hasEndedEvents || hasCancelledEvents ? 'header-block--has-ended-toggle' : ''} ${isLightTheme ? 'header-block--light' : 'header-block--dark'}`}>
      <div className={`header ${isLightTheme ? 'header--light' : 'header--dark'}`}>
        {children}
      </div>
      {(hasEndedEvents || hasCancelledEvents) && onToggleEndedEvents && (
        <button
          type="button"
          className="header__ended-toggle"
          onClick={onToggleEndedEvents}
          aria-pressed={areEndedEventsShown}
        >
          {areEndedEventsShown ? 'Скрыть' : 'Показать'}{' '}
          {hasEndedEvents && hasCancelledEvents
            ? 'завершённые и отменённые'
            : hasCancelledEvents
              ? 'отменённые'
              : 'завершённые'}
        </button>
      )}
    </div>
  );
};

export default React.memo(Header);
