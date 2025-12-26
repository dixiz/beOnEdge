import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import DateDisplay from './components/DateDisplay';
import DayOfWeekDisplay from './components/DayOfWeekDisplay';
import ScheduleRow from './components/ScheduleRow';
import Menu from './components/Menu';
import { ScheduleItem } from './types/schedule';
import { CSV_URL } from './constants';
import { parseCSV } from './utils/csvParser';
import { groupBy } from './utils/dataUtils';
import { convertFromGMT3ToLocal, isDateEqualOrAfterToday } from './utils/dateUtils';
import { parseBooleanFlag } from './utils/flagUtils';
import { getTgNumbers, getBcuNumbers } from './utils/iconUtils';

function App() {
  const [originalSchedule, setOriginalSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [useLocalTime, setUseLocalTime] = useState(false);

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

  // Мемоизация конвертированного расписания с фильтрацией по дате
  const convertedSchedule = useMemo(() => {
    let schedule = originalSchedule;
    
    // Конвертируем время, если нужно
    if (useLocalTime && schedule.length > 0) {
      schedule = schedule.map(convertFromGMT3ToLocal);
    }
    
    // Фильтруем: оставляем только дни, которые равны или старше текущего дня
    return schedule.filter(item => isDateEqualOrAfterToday(item.date));
  }, [useLocalTime, originalSchedule]);

  // Мемоизация группировки по дням
  const byDay = useMemo(() => {
    return groupBy(convertedSchedule, r => `${r.date}_${r.day}`);
  }, [convertedSchedule]);

  // Мемоизация обработчиков
  const handleToggleTheme = useCallback(() => {
    setIsLightTheme(prev => !prev);
  }, []);

  const handleToggleTime = useCallback((useLocal: boolean) => {
    setUseLocalTime(useLocal);
  }, []);

  const showMenu = !loading && !error && Object.keys(byDay).length > 0;

  return (
    <div className={`app-container ${isLightTheme ? 'app-container--light' : 'app-container--dark'}`}>
      {showMenu && (
        <Menu
          isLightTheme={isLightTheme}
          onToggleTheme={handleToggleTheme}
          useLocalTime={useLocalTime}
          onToggleTime={handleToggleTime}
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
              <div className="day-rows-container">
                {rows.map((row, index) => {
                  // Создаем уникальный ключ, включая все возможные уникальные поля
                  const rowKey = `${row.date}_${row.time}_${row.championship}_${row.stage || ''}_${row.session}_${row.place}_${row.Commentator1 || ''}_${row.Commentator2 || ''}_${row.Optionally || ''}_${index}`;
                  return (
                  <ScheduleRow
                      key={rowKey}
                      date={row.date}
                    time={row.time}
                    championship={row.championship}
                    stage={row.stage}
                    place={row.place}
                    session={row.session}
                    isLightTheme={isLightTheme}
                      showPC={parseBooleanFlag(row.PC)}
                      tgNumbers={getTgNumbers(row)}
                      bcuNumbers={getBcuNumbers(row)}
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
