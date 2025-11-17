import React from 'react';
import './DayOfWeekDisplay.css';

interface DayOfWeekDisplayProps {
  day: string;
  isLightTheme?: boolean;
}

const DayOfWeekDisplay: React.FC<DayOfWeekDisplayProps> = ({ day, isLightTheme = false }) => {
  return (
    <div className={`day-of-week-display ${isLightTheme ? 'day-of-week-display--light' : 'day-of-week-display--dark'}`}>
      {day}
    </div>
  );
};

export default React.memo(DayOfWeekDisplay);
