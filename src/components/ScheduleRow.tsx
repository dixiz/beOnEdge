import React, { useMemo } from 'react';
import './ScheduleRow.css';
import ScheduleIcons from './ScheduleIcons';
import Commentator from './Commentator';
import Optionally from './Optionally';
import { normalizeTime } from '../utils/timeUtils';
import { generateGoogleCalendarUrl, downloadICalendarFile } from '../utils/calendarUtils';

interface ScheduleRowProps {
  date: string;
  time: string;
  championship: string;
  stage: string;
  place: string;
  session: string;
  isLightTheme?: boolean;
  showPC?: boolean;
  showTG?: boolean;
  showBCU?: boolean;
  commentator1?: string;
  commentator2?: string;
  optionally?: string;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  date,
  time,
  championship,
  stage,
  place,
  session,
  isLightTheme = false,
  showPC = false,
  showTG = false,
  showBCU = false,
  commentator1,
  commentator2,
  optionally,
}) => {
  const commentators = useMemo(() => {
    return [commentator1, commentator2].filter(Boolean) as string[];
  }, [commentator1, commentator2]);
  
  // Нормализуем время к формату ЧЧ:ММ
  const normalizedTime = useMemo(() => normalizeTime(time), [time]);
  
  // Форматируем чемпионат
  const formatChampionship = useMemo(() => {
    const champ = championship?.trim() || '';
    return champ.endsWith('.') ? champ : champ + '.';
  }, [championship]);

  // Форматируем этап
  const formatStage = useMemo(() => {
    const stageText = stage?.trim() || '';
    return stageText.endsWith('.') ? stageText.slice(0, -1) : stageText;
  }, [stage]);
  
  // Обработчик добавления в Google Calendar
  const handleAddToGoogleCalendar = () => {
    const calendarUrl = generateGoogleCalendarUrl({
      date,
      time,
      championship,
      stage,
      place,
      session,
      day: '', // не используется для календаря
      Commentator1: commentator1,
      Commentator2: commentator2,
      Optionally: optionally
    });
    window.open(calendarUrl, '_blank');
  };

  // Обработчик добавления в Яндекс Календарь
  const handleAddToYandexCalendar = () => {
    downloadICalendarFile({
      date,
      time,
      championship,
      stage,
      place,
      session,
      day: '', // не используется для календаря
      Commentator1: commentator1,
      Commentator2: commentator2,
      Optionally: optionally
    });
  };
  
  return (
    <div className="schedule-row-wrapper">
      <div className="time-container">
        <div className="time">{normalizedTime}</div>
        <ScheduleIcons showPC={showPC} showTG={showTG} showBCU={showBCU} />
      </div>
      <div className={`content-container ${isLightTheme ? 'schedule-row--light' : 'schedule-row--dark'}`}>
        <div className="content-header">
          <div className="content-text">
            <div className="championship">
              {formatChampionship}
            </div>
            <div className="stage">
              {formatStage}
            </div>
            <div className="place-session">
              {place}. {session}
            </div>
          </div>
          <div className="calendar-buttons">
            <button 
              onClick={handleAddToGoogleCalendar}
              className={`calendar-button calendar-button--google ${isLightTheme ? 'calendar-button--light' : 'calendar-button--dark'}`}
              title="Добавить в Google Calendar"
              aria-label="Добавить в Google Calendar"
            >
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="calendar-icon"
              >
                <rect 
                  x="3" 
                  y="5" 
                  width="18" 
                  height="16" 
                  rx="2" 
                  className="calendar-icon-outline"
                  strokeWidth="2"
                />
                <line 
                  x1="3" 
                  y1="8" 
                  x2="21" 
                  y2="8" 
                  className="calendar-icon-outline"
                  strokeWidth="2"
                />
                <rect 
                  x="6" 
                  y="2" 
                  width="2" 
                  height="6" 
                  rx="1" 
                  className="calendar-icon-accent"
                />
                <rect 
                  x="16" 
                  y="2" 
                  width="2" 
                  height="6" 
                  rx="1" 
                  className="calendar-icon-accent"
                />
                <text 
                  x="12" 
                  y="18" 
                  textAnchor="middle" 
                  className="calendar-icon-letter"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="Arial, sans-serif"
                >
                  G
                </text>
              </svg>
            </button>
            <button 
              onClick={handleAddToYandexCalendar}
              className={`calendar-button calendar-button--yandex ${isLightTheme ? 'calendar-button--light' : 'calendar-button--dark'}`}
              title="Файл .ics для календаря"
              aria-label="Файл .ics для календаря"
            >
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="calendar-icon"
              >
                <rect 
                  x="3" 
                  y="5" 
                  width="18" 
                  height="16" 
                  rx="2" 
                  className="calendar-icon-outline"
                  strokeWidth="2"
                />
                <line 
                  x1="3" 
                  y1="8" 
                  x2="21" 
                  y2="8" 
                  className="calendar-icon-outline"
                  strokeWidth="2"
                />
                <rect 
                  x="6" 
                  y="2" 
                  width="2" 
                  height="6" 
                  rx="1" 
                  className="calendar-icon-accent"
                />
                <rect 
                  x="16" 
                  y="2" 
                  width="2" 
                  height="6" 
                  rx="1" 
                  className="calendar-icon-accent"
                />
                <text 
                  x="12" 
                  y="18" 
                  textAnchor="middle" 
                  className="calendar-icon-letter"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="Arial, sans-serif"
                >
                  .ics
                </text>
              </svg>
            </button>
          </div>
        </div>
        {optionally && optionally.trim() && (
          <Optionally text={optionally.trim()} isLightTheme={isLightTheme} />
        )}
        {commentators.length > 0 && (
          <div className="commentators-container">
            {commentators.map((name, idx) => (
              <Commentator key={`${name}-${idx}`} name={name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleRow;
