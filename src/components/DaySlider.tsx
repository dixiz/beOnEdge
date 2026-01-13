import React from 'react';
import './DaySlider.css';

export interface DayOption {
  date: string;
  dayName: string;
  shortLabel: string;
  dayNumber: string;
}

interface DaySliderProps {
  days: DayOption[];
  selectedDate: string | null;
  onSelect?: (date: string) => void;
  isLightTheme?: boolean;
  topOffset?: number;
}

const DAY_SLIDER_HEIGHT = 76;

const DaySlider: React.FC<DaySliderProps> = ({
  days,
  selectedDate,
  onSelect,
  isLightTheme = false,
  topOffset = 0
}) => {
  return (
    <div
      className={`day-slider ${isLightTheme ? 'day-slider--light' : 'day-slider--dark'}`}
      style={{ top: `${Math.max(0, topOffset)}px`, '--day-slider-height': `${DAY_SLIDER_HEIGHT}px` } as React.CSSProperties}
    >
      <div className="day-slider__track">
        {days.map((day) => {
          const isActive = day.date === selectedDate;
          return (
            <button
              key={day.date}
              className={`day-slider__item ${isActive ? 'day-slider__item--active' : ''}`}
              onClick={() => onSelect && onSelect(day.date)}
            >
              <span className="day-slider__day">{day.shortLabel}</span>
              <span className="day-slider__date">{day.dayNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DaySlider;

