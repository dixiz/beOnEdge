import React, { useEffect, useMemo, useCallback, useState } from 'react';
import './ScheduleRow.css';
import ScheduleIcons from './ScheduleIcons';
import Commentator from './Commentator';
import Optionally from './Optionally';
import CalendarIcon from './CalendarIcon';
import { normalizeTime } from '../utils/timeUtils';
import { generateGoogleCalendarUrl, downloadICalendarFile } from '../utils/calendarUtils';
import { formatChampionship, formatStage } from '../utils/textUtils';
import { CommentatorScheduleData, ScheduleItem } from '../types/schedule';
import { WeatherForecastPoint } from '../types/weather';
import WeatherBadge from './WeatherBadge';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

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
  showRT?: boolean;
  ruTube?: string;
  commentator1?: string;
  commentator2?: string;
  optionally?: string;
  duration?: string;
  liveTiming?: string;
  spotter?: string;
  displayTime?: string;
  startedLabel?: string;
  commentatorSchedule?: CommentatorScheduleData | null;
  commentatorScheduleLoading?: boolean;
  commentatorScheduleError?: string | null;
  weatherForecast?: WeatherForecastPoint[];
  isEnded?: boolean;
  isCancelled?: boolean;
  isLive?: boolean;
}

const COMMENTATOR_SCHEDULE_COLORS = [
  '#F6C90E',
  '#4CC9F0',
  '#F72585',
  '#80ED99',
  '#B5179E',
  '#FF9F1C',
  '#2EC4B6',
  '#A3CEF1',
  '#E76F51',
  '#CDB4DB',
  '#90BE6D',
  '#F28482'
];

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
  showRT = false,
  ruTube,
  commentator1,
  commentator2,
  optionally,
  duration,
  liveTiming,
  spotter,
  displayTime,
  startedLabel,
  commentatorSchedule,
  commentatorScheduleLoading = false,
  commentatorScheduleError,
  weatherForecast,
  isEnded = false,
  isCancelled = false,
  isLive = false,
}) => {
  const [isCommentatorScheduleOpen, setIsCommentatorScheduleOpen] = useState(false);
  useBodyScrollLock(isCommentatorScheduleOpen);

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
  const timeLabel = displayTime ?? normalizedTime;
  const timeParts = timeLabel.match(/^(\d{1,2}):(\d{2})$/);
  
  // Форматируем чемпионат и этап
  const formattedChampionship = useMemo(() => formatChampionship(championship), [championship]);
  const formattedStage = useMemo(() => formatStage(stage), [stage]);
  const weatherEventDetails = useMemo(
    () => [formattedStage, place, session].filter(Boolean).join(' · '),
    [formattedStage, place, session]
  );
  
  // Создаем объект ScheduleItem для календарей (мемоизируем)
  const scheduleItem = useMemo<ScheduleItem>(() => ({
    date,
    time,
    championship,
    stage,
    place,
    session,
    Duration: duration,
    day: '', // не используется для календаря
    Commentator1: commentator1,
    Commentator2: commentator2,
    Optionally: optionally
  }), [date, time, championship, stage, place, session, duration, commentator1, commentator2, optionally]);
  
  // Обработчик добавления в Google Calendar
  const handleAddToGoogleCalendar = useCallback(() => {
    const calendarUrl = generateGoogleCalendarUrl(scheduleItem);
    window.open(calendarUrl, '_blank');
  }, [scheduleItem]);

  // Обработчик добавления в Яндекс Календарь
  const handleAddToYandexCalendar = useCallback(() => {
    downloadICalendarFile(scheduleItem);
  }, [scheduleItem]);

  const liveTimingUrl = useMemo(() => {
    const trimmed = liveTiming?.trim();
    if (!trimmed) return null;
    if (trimmed.toLowerCase() === 'нет') return null;
    return trimmed;
  }, [liveTiming]);

  const handleOpenLiveTiming = useCallback(() => {
    if (!liveTimingUrl) return;
    window.open(liveTimingUrl, '_blank');
  }, [liveTimingUrl]);

  const spotterUrl = useMemo(() => {
    const trimmed = spotter?.trim();
    if (!trimmed) return null;
    if (trimmed.toLowerCase() === 'нет') return null;
    return trimmed;
  }, [spotter]);

  const handleOpenSpotter = useCallback(() => {
    if (!spotterUrl) return;
    window.open(spotterUrl, '_blank');
  }, [spotterUrl]);

  const shouldShowCommentatorSchedule = commentatorScheduleLoading || !!commentatorSchedule || !!commentatorScheduleError;

  const handleOpenCommentatorSchedule = useCallback(() => {
    setIsCommentatorScheduleOpen(true);
  }, []);

  const handleCloseCommentatorSchedule = useCallback(() => {
    setIsCommentatorScheduleOpen(false);
  }, []);

  const handleCommentatorScheduleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleCloseCommentatorSchedule();
    }
  }, [handleCloseCommentatorSchedule]);

  useEffect(() => {
    if (!isCommentatorScheduleOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseCommentatorSchedule();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCommentatorScheduleOpen, handleCloseCommentatorSchedule]);
  
  return (
    <div className="schedule-row-wrapper">
      <div
        className={`time-container ${isLightTheme ? 'time-container--light' : 'time-container--dark'}`}
      >
        {startedLabel && <div className="time-started">{startedLabel}</div>}
        <div
          className={`time ${isLive ? 'time--live' : ''}`}
          aria-label={`Время начала ${timeLabel}`}
        >
          {timeParts ? (
            <>
              <span aria-hidden="true">{timeParts[1]}</span>
              <span className="time__separator" aria-hidden="true">:</span>
              <span aria-hidden="true">{timeParts[2]}</span>
            </>
          ) : (
            <span aria-hidden="true">{timeLabel}</span>
          )}
        </div>
        {isLive && (
          <div className="event-status-strip event-status-strip--live event-status-strip--time">
            <svg
              className="event-status-strip__live-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M5.5 5.5a9.2 9.2 0 0 0 0 13M18.5 5.5a9.2 9.2 0 0 1 0 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span>В эфире</span>
          </div>
        )}
        {isCancelled && (
          <div className="event-status-strip event-status-strip--cancelled event-status-strip--time">
            <span>ОТМЕНЕНО</span>
          </div>
        )}
        {isEnded && (
          <div className="event-status-strip event-status-strip--ended event-status-strip--time">
            <span className="event-status-strip__ended-dot" aria-hidden="true" />
            <span>ЗАВЕРШЕНО</span>
          </div>
        )}
        <ScheduleIcons
          showPC={showPC}
          tgNumbers={tgNumbers}
          bcuNumbers={bcuNumbers}
          showRT={showRT}
          rtLink={ruTube}
          isLightTheme={isLightTheme}
        />
        {spotterUrl && (
          <button
            className={`spotter-button ${isLightTheme ? 'spotter-button--light' : 'spotter-button--dark'}`}
            onClick={handleOpenSpotter}
            type="button"
            title="Spotter"
            aria-label="Spotter"
          >
            SPOTTER GUIDE
          </button>
        )}
      </div>
      <div className={`content-container ${isLightTheme ? 'schedule-row--light' : 'schedule-row--dark'}`}>
        <div className="content-header">
          <div className="content-text">
            <div className="championship">
              {formattedChampionship}
        </div>
            {(formattedStage || place) && (
              <div className="event-stage-row">
                {formattedStage && <div className="stage">{formattedStage}</div>}
                {place && <span className="event-meta__place">{place}</span>}
              </div>
            )}
            {session && (
              <div className="event-meta">
                <span className="event-meta__session">{session}</span>
              </div>
            )}
            <div className="commentators-container">
                {commentators.map((name, idx) => (
                <Commentator key={`${name}-${idx}`} name={name} />
                ))}
              </div>
            {shouldShowCommentatorSchedule && (
              <button
                type="button"
                className={`commentator-schedule-trigger ${isLightTheme ? 'commentator-schedule-trigger--light' : 'commentator-schedule-trigger--dark'}`}
                onClick={handleOpenCommentatorSchedule}
              >
                Расписание комментаторов
              </button>
            )}
          </div>
          <div className="calendar-buttons">
            <button 
              onClick={handleAddToGoogleCalendar}
              className={`calendar-button calendar-button--google ${isLightTheme ? 'calendar-button--light' : 'calendar-button--dark'}`}
              title="Добавить в Google Calendar"
              aria-label="Добавить в Google Calendar"
            >
              <CalendarIcon letter="G" fontSize="10" />
            </button>
            <button 
              onClick={handleAddToYandexCalendar}
              className={`calendar-button calendar-button--yandex ${isLightTheme ? 'calendar-button--light' : 'calendar-button--dark'}`}
              title="Файл .ics для календаря"
              aria-label="Файл .ics для календаря"
            >
              <CalendarIcon letter=".ics" fontSize="8" />
            </button>
            {liveTimingUrl && (
              <button
                onClick={handleOpenLiveTiming}
                className={`calendar-button calendar-button--timer ${isLightTheme ? 'calendar-button--light' : 'calendar-button--dark'}`}
                title="Live timing"
                aria-label="Live timing"
                type="button"
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="calendar-button__stopwatch"
                >
                  <circle
                    cx="12"
                    cy="13"
                    r="8"
                    stroke={isLightTheme ? '#000000' : '#FFD600'}
                    strokeWidth="2"
                  />
                  <path
                    d="M9 2H15"
                    stroke={isLightTheme ? '#000000' : '#FFD600'}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                <path
                  d="M12 13V9"
                  stroke={isLightTheme ? '#000000' : '#FFD600'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="calendar-button__stopwatch-hand"
                />
                </svg>
              </button>
            )}
          </div>
        </div>
        {optionally && optionally.trim() && (
          <Optionally text={optionally.trim()} isLightTheme={isLightTheme} />
        )}
        {!isEnded && !isCancelled && weatherForecast && weatherForecast.length > 0 && (
          <div className="weather-badge-container">
            <WeatherBadge
              forecast={weatherForecast}
              isLightTheme={isLightTheme}
              eventName={formattedChampionship}
              eventDetails={weatherEventDetails}
            />
          </div>
        )}
      </div>
      {isCommentatorScheduleOpen && (
        <div
          className="commentator-schedule-modal"
          role="presentation"
          onMouseDown={handleCommentatorScheduleBackdropClick}
        >
          <div
            className={`commentator-schedule-modal__content ${isLightTheme ? 'commentator-schedule-modal__content--light' : 'commentator-schedule-modal__content--dark'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="commentator-schedule-title"
          >
            <div className="commentator-schedule-modal__header">
              <h3 id="commentator-schedule-title">Расписание комментаторов</h3>
              <button
                type="button"
                className="commentator-schedule-modal__close"
                aria-label="Закрыть"
                onClick={handleCloseCommentatorSchedule}
              >
                x
              </button>
            </div>
            {commentatorScheduleLoading && (
              <div className="commentator-schedule-message">Загрузка расписания...</div>
            )}
            {!commentatorScheduleLoading && commentatorScheduleError && (
              <div className="commentator-schedule-message commentator-schedule-message--error">
                {commentatorScheduleError}
              </div>
            )}
            {!commentatorScheduleLoading && !commentatorScheduleError && commentatorSchedule && (
              <div className="commentator-schedule-table-wrap">
                <table className="commentator-schedule-table commentator-schedule-table--desktop">
                  <thead>
                    <tr>
                      <th className="commentator-schedule-table__name-header">Комментатор</th>
                      {commentatorSchedule.times.map((time, index) => (
                        <th key={`${time}-${index}`} className="commentator-schedule-table__time">
                          <span className="commentator-schedule-table__time-label">{time}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commentatorSchedule.rows.map((row, rowIndex) => (
                      <tr
                        key={row.commentator}
                        style={{
                          '--commentator-schedule-color': COMMENTATOR_SCHEDULE_COLORS[rowIndex % COMMENTATOR_SCHEDULE_COLORS.length]
                        } as React.CSSProperties}
                      >
                        <th className="commentator-schedule-table__name" scope="row">
                          {row.commentator}
                        </th>
                        {row.slots.map((isActive, index) => (
                          <td
                            key={`${row.commentator}-${index}`}
                            className={`commentator-schedule-table__slot ${isActive ? 'commentator-schedule-table__slot--active' : ''}`}
                            aria-label={`${row.commentator}, ${commentatorSchedule.times[index]}: ${isActive ? 'присутствует' : 'нет'}`}
                          >
                            {isActive ? <span className="commentator-schedule-table__mark" /> : null}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="commentator-schedule-table commentator-schedule-table--mobile">
                  <thead>
                    <tr>
                      <th className="commentator-schedule-mobile__time-header">Время</th>
                      {commentatorSchedule.rows.map((row, rowIndex) => (
                        <th
                          key={row.commentator}
                          className="commentator-schedule-mobile__commentator"
                          style={{
                            '--commentator-schedule-color': COMMENTATOR_SCHEDULE_COLORS[rowIndex % COMMENTATOR_SCHEDULE_COLORS.length]
                          } as React.CSSProperties}
                        >
                          {row.commentator}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commentatorSchedule.times.map((time, timeIndex) => (
                      <tr key={`${time}-${timeIndex}`}>
                        <th className="commentator-schedule-mobile__time" scope="row">
                          {time}
                        </th>
                        {commentatorSchedule.rows.map((row, rowIndex) => {
                          const isActive = row.slots[timeIndex];
                          return (
                            <td
                              key={`${time}-${row.commentator}`}
                              className={`commentator-schedule-mobile__slot ${isActive ? 'commentator-schedule-mobile__slot--active' : ''}`}
                              style={{
                                '--commentator-schedule-color': COMMENTATOR_SCHEDULE_COLORS[rowIndex % COMMENTATOR_SCHEDULE_COLORS.length]
                              } as React.CSSProperties}
                              aria-label={`${time}, ${row.commentator}: ${isActive ? 'присутствует' : 'нет'}`}
                            >
                              {isActive ? <span className="commentator-schedule-table__mark" /> : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleRow;
