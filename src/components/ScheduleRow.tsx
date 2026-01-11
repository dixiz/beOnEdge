import React, { useMemo, useCallback } from 'react';
import './ScheduleRow.css';
import ScheduleIcons from './ScheduleIcons';
import Commentator from './Commentator';
import Optionally from './Optionally';
import CalendarIcon from './CalendarIcon';
import { normalizeTime } from '../utils/timeUtils';
import { generateGoogleCalendarUrl, downloadICalendarFile } from '../utils/calendarUtils';
import { formatChampionship, formatStage } from '../utils/textUtils';
import { ScheduleItem } from '../types/schedule';

interface ScheduleRowProps {
  date: string;
  time: string;
  championship: string;
  stage?: string;
  place: string;
  session: string;
  isLightTheme?: boolean;
  showPC?: boolean;
  tgNumbers?: number[];
  bcuNumbers?: number[];
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
  tgNumbers = [],
  bcuNumbers = [],
  commentator1,
  commentator2,
  optionally,
}) => {
  const commentators = useMemo(() => {
    const filtered = [commentator1, commentator2].filter(Boolean) as string[];
    // Если оба комментатора пустые, возвращаем "Оригинальная дорожка"
    if (filtered.length === 0) {
      return ['Оригинальная дорожка'];
    }
    return filtered;
  }, [commentator1, commentator2]);
  
  // Нормализуем время к формату ЧЧ:ММ
  const normalizedTime = useMemo(() => normalizeTime(time), [time]);
  
  // Форматируем чемпионат и этап
  const formattedChampionship = useMemo(() => formatChampionship(championship), [championship]);
  const formattedStage = useMemo(() => formatStage(stage), [stage]);
  
  // Создаем объект ScheduleItem для календарей (мемоизируем)
  const scheduleItem = useMemo<ScheduleItem>(() => ({
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
  }), [date, time, championship, stage, place, session, commentator1, commentator2, optionally]);
  
  // Обработчик добавления в Google Calendar
  const handleAddToGoogleCalendar = useCallback(() => {
    const calendarUrl = generateGoogleCalendarUrl(scheduleItem);
    window.open(calendarUrl, '_blank');
  }, [scheduleItem]);

  // Обработчик добавления в Яндекс Календарь
  const handleAddToYandexCalendar = useCallback(() => {
    downloadICalendarFile(scheduleItem);
  }, [scheduleItem]);
  
  return (
    <div className="schedule-row-wrapper">
      <div className="time-container">
        <div className="time">{normalizedTime}</div>
        <ScheduleIcons showPC={showPC} tgNumbers={tgNumbers} bcuNumbers={bcuNumbers} isLightTheme={isLightTheme} />
      </div>
      <div className={`content-container ${isLightTheme ? 'schedule-row--light' : 'schedule-row--dark'}`}>
        <div className="content-header">
          <div className="content-text">
            <div className="championship">
              {formattedChampionship}
        </div>
            {formattedStage && (
              <div className="stage">
                {formattedStage}
        </div>
            )}
            <div className="place-session">
              {place ? `${place}. ${session}` : session}
            </div>
          </div>
          <div className="calendar-buttons">
            <button 
              onClick={handleAddToGoogleCalendar}
              className={`calendar-button calendar-button--google ${isLightTheme ? 'calendar-button--light' : 'calendar-button--dark'}`}
              title="Добавить в Google Calendar"
              aria-label="Добавить в Google Calendar"
            >
              <CalendarIcon letter="G" fontSize="10" isLightTheme={isLightTheme} />
            </button>
            <button 
              onClick={handleAddToYandexCalendar}
              className={`calendar-button calendar-button--yandex ${isLightTheme ? 'calendar-button--light' : 'calendar-button--dark'}`}
              title="Файл .ics для календаря"
              aria-label="Файл .ics для календаря"
            >
              <CalendarIcon letter=".ics" fontSize="8" isLightTheme={isLightTheme} />
            </button>
          </div>
        </div>
        <div className="commentators-container">
            {commentators.map((name, idx) => (
            <Commentator key={`${name}-${idx}`} name={name} />
            ))}
          </div>
        {optionally && optionally.trim() && (
          <Optionally text={optionally.trim()} isLightTheme={isLightTheme} />
        )}
      </div>
    </div>
  );
};

export default ScheduleRow;
