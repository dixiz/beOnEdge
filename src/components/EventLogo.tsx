import React, { useEffect, useMemo, useState } from 'react';
import './EventLogo.css';

// Положите файл сюда: schedule/src/assets/indy500.png
import indy500Logo from '../assets/indy500.png';

type EventLogoProps = {
  alt?: string;
  isLightTheme?: boolean;
};

const EventLogo: React.FC<EventLogoProps> = ({ alt = 'Indy 500', isLightTheme = false }) => {
  const HIDE_AFTER = useMemo(() => new Date(2026, 4, 25, 0, 0, 0, 0), []);
  const [isVisible, setIsVisible] = useState(() => new Date().getTime() < HIDE_AFTER.getTime());

  useEffect(() => {
    if (!isVisible) return;
    const now = new Date();
    const msUntilHide = HIDE_AFTER.getTime() - now.getTime();
    if (msUntilHide <= 0) {
      setIsVisible(false);
      return;
    }
    const t = window.setTimeout(() => setIsVisible(false), msUntilHide);
    return () => window.clearTimeout(t);
  }, [HIDE_AFTER, isVisible]);

  const messages = useMemo(
    () => [
      { line1: '24 мая', line2: '19:45' },
      { line1: 'Фрэнк Бакулов', line2: 'Стив' }
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const SWITCH_EVERY_MS = 5000;
    const FADE_MS = 650;
    const fadeStart = window.setTimeout(() => setIsFading(true), SWITCH_EVERY_MS - FADE_MS);
    const switchTimer = window.setTimeout(() => {
      setIndex(prev => (prev + 1) % messages.length);
      setIsFading(false);
    }, SWITCH_EVERY_MS);

    return () => {
      window.clearTimeout(fadeStart);
      window.clearTimeout(switchTimer);
    };
  }, [index, messages.length]);

  if (!isVisible) return null;

  return (
    <div className={`event-logo ${isLightTheme ? 'event-logo--light' : 'event-logo--dark'}`} aria-hidden="true">
      <div className="event-logo__media">
        <img className="event-logo__img" src={indy500Logo} alt={alt} />
      </div>
      <div className={`event-logo__text ${isFading ? 'event-logo__text--fade' : ''}`}>
        <div className="event-logo__line1">{messages[index].line1}</div>
        <div className="event-logo__line2">{messages[index].line2}</div>
      </div>
    </div>
  );
};

export default React.memo(EventLogo);

