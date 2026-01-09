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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedSeries, setAppliedSeries] = useState<string[]>([]);
  const [tempSeries, setTempSeries] = useState<string[]>([]);
  const [filterError, setFilterError] = useState<string | null>(null);

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

  // Все серии, присутствующие в текущем расписании
  const seriesList = useMemo(() => {
    const set = new Set<string>();
    convertedSchedule.forEach(item => {
      if (item.championship) set.add(item.championship);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [convertedSchedule]);

  // Инициализируем выбранные серии, когда данные появились
  useEffect(() => {
    if (seriesList.length > 0 && appliedSeries.length === 0) {
      setAppliedSeries(seriesList);
      setTempSeries([]); // не отмечаем по умолчанию при старте
    }
  }, [seriesList, appliedSeries.length]);

  // Применяем фильтр по сериям
  const filteredSchedule = useMemo(() => {
    if (appliedSeries.length === 0) return convertedSchedule;
    const set = new Set(appliedSeries);
    return convertedSchedule.filter(item => set.has(item.championship));
  }, [convertedSchedule, appliedSeries]);

  // Мемоизация группировки по дням
  const byDay = useMemo(() => {
    return groupBy(filteredSchedule, r => `${r.date}_${r.day}`);
  }, [filteredSchedule]);

  // Мемоизация обработчиков
  const handleToggleTheme = useCallback(() => {
    setIsLightTheme(prev => !prev);
  }, []);

  const handleToggleTime = useCallback((useLocal: boolean) => {
    setUseLocalTime(useLocal);
  }, []);

  const showMenu = !loading && !error && Object.keys(byDay).length > 0;

  const handleOpenFilter = useCallback(() => {
    setTempSeries([]); // при открытии все чекбоксы пустые
    setFilterError(null);
    setIsFilterOpen(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setTempSeries(appliedSeries); // возврат к применённому при закрытии крестом
    setFilterError(null);
    setIsFilterOpen(false);
  }, [appliedSeries]);

  const handleToggleSeries = useCallback((series: string) => {
    setTempSeries(prev => {
      if (prev.includes(series)) {
        return prev.filter(s => s !== series);
      }
      return [...prev, series];
    });
  }, []);

  const handleToggleAllSeries = useCallback(() => {
    const allChecked = tempSeries.length === seriesList.length;
    if (allChecked) {
      setTempSeries([]);
    } else {
      setTempSeries(seriesList);
    }
  }, [tempSeries.length, seriesList]);

  const handleApplyFilter = useCallback(() => {
    if (tempSeries.length === 0) {
      setFilterError('Не выбрана ни одна серия');
      return;
    }
    setAppliedSeries(tempSeries);
    setFilterError(null);
    setIsFilterOpen(false);
  }, [tempSeries]);

  return (
    <div className={`app-container ${isLightTheme ? 'app-container--light' : 'app-container--dark'}`}>
      {showMenu && (
        <Menu
          isLightTheme={isLightTheme}
          onToggleTheme={handleToggleTheme}
          useLocalTime={useLocalTime}
          onToggleTime={handleToggleTime}
          onOpenFilter={handleOpenFilter}
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
      {isFilterOpen && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-modal__header">
              <h3>Фильтр по сериям</h3>
              <button className="filter-close" aria-label="Закрыть" onClick={handleCloseFilter}>✕</button>
            </div>
            <div className="filter-modal__list">
              {seriesList.map(series => {
                const checked = tempSeries.includes(series);
                return (
                  <label key={series} className="filter-item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleSeries(series)}
                    />
                    <span>{series}</span>
                  </label>
                );
              })}
              <label className="filter-item">
                <input
                  type="checkbox"
                  checked={tempSeries.length === seriesList.length && seriesList.length > 0}
                  onChange={handleToggleAllSeries}
                />
                <span>Все серии</span>
              </label>
            </div>
            {filterError && <div className="filter-error">{filterError}</div>}
            <div className="filter-modal__footer">
              <button className="filter-ok" onClick={handleApplyFilter}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
