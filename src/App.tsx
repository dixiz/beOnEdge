import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import DateDisplay from './components/DateDisplay';
import DayOfWeekDisplay from './components/DayOfWeekDisplay';
import ScheduleRow from './components/ScheduleRow';
import Menu from './components/Menu';
import { ScheduleItem } from './types/schedule';
import { CSV_URL, DEFAULT_TIMEZONE } from './constants';
import { parseCSV } from './utils/csvParser';
import { groupBy } from './utils/dataUtils';
import { convertFromGMT3ToLocal } from './utils/dateUtils';
import { getUserTimeZone } from './utils/timezoneUtils';
import { parseBooleanFlag } from './utils/flagUtils';

function App() {
  const [originalSchedule, setOriginalSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [useLocalTime, setUseLocalTime] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState<string>('');

  // Получаем часовой пояс пользователя при загрузке
  useEffect(() => {
    setUserTimeZone(getUserTimeZone());
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(CSV_URL)
      .then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки данных.');
        return r.text();
      })
      .then(text => {
        try {
          const parsed = parseCSV(text);
          if (parsed.length === 0) {
            throw new Error('Данные не найдены');
          }
          setOriginalSchedule(parsed);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Ошибка обработки данных');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Мемоизация конвертированного расписания
  const convertedSchedule = useMemo(() => {
    if (!useLocalTime || originalSchedule.length === 0) {
      return originalSchedule;
    }
    return originalSchedule.map(convertFromGMT3ToLocal);
  }, [useLocalTime, originalSchedule]);

  // Мемоизация группировки по дням
  const byDay = useMemo(() => {
    return groupBy(convertedSchedule, r => `${r.date}_${r.day}`);
  }, [convertedSchedule]);

  // Мемоизация обработчиков
  const handleToggleTheme = useCallback(() => {
    setIsLightTheme(prev => !prev);
  }, []);

  const handleToggleTime = useCallback(() => {
    setUseLocalTime(prev => !prev);
  }, []);

  const showMenu = !loading && !error && Object.keys(byDay).length > 0;
  const currentTimeZone = useLocalTime ? userTimeZone : DEFAULT_TIMEZONE;

  return (
    <div className={`app-container ${isLightTheme ? 'app-container--light' : 'app-container--dark'}`}>
      {showMenu && (
        <Menu
          isLightTheme={isLightTheme}
          onToggleTheme={handleToggleTheme}
          useLocalTime={useLocalTime}
          onToggleTime={handleToggleTime}
          currentTimeZone={currentTimeZone}
        />
      )}
      <div className={`schedule-container ${showMenu ? 'schedule-container--with-menu' : 'schedule-container--without-menu'}`}>
        {loading && <div className={`loading-message ${isLightTheme ? 'loading-message--light' : 'loading-message--dark'}`}>BE ON EDGE IS COMING</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && Object.keys(byDay).length === 0 && (
          <div className={`empty-message ${isLightTheme ? 'empty-message--light' : 'empty-message--dark'}`}>Нет данных для отображения</div>
        )}
        {Object.entries(byDay).map(([key, rows]) => {
          const [date, day] = key.split('_');
          return (
            <div className="day-column" key={key}>
              <Header isLightTheme={isLightTheme}>
                <DateDisplay date={date} isLightTheme={isLightTheme} />
                <DayOfWeekDisplay day={day} isLightTheme={isLightTheme} />
              </Header>
              <div>
                {rows.map((row) => {
                  const rowKey = `${row.date}_${row.time}_${row.championship}_${row.stage}_${row.session}_${row.place}`;
                  return (
                    <ScheduleRow
                      key={rowKey}
                      time={row.time}
                      championship={row.championship}
                      stage={row.stage}
                      place={row.place}
                      session={row.session}
                      isLightTheme={isLightTheme}
                      showPC={parseBooleanFlag(row.PC)}
                      showTG={parseBooleanFlag(row.TG)}
                      showBCU={parseBooleanFlag(row.BCU)}
                      commentator1={row.Commentator1}
                      commentator2={row.Commentator2}
                      optionally={row.Optionally}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
