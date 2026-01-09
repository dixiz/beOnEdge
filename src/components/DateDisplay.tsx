import React from 'react';
import './DateDisplay.css';

interface DateDisplayProps {
  date: string;
  isLightTheme?: boolean;
}

const formatToShortYear = (dateStr: string): string => {
  const parts = dateStr.split('.');
  if (parts.length !== 3) return dateStr;
  const [d, m, y] = parts;
  const shortYear = y.length === 2 ? y : y.slice(-2);
  return `${d}.${m}.${shortYear}`;
};

const DateDisplay: React.FC<DateDisplayProps> = ({ date, isLightTheme = false }) => {
  return (
    <div className={`date-display ${isLightTheme ? 'date-display--light' : 'date-display--dark'}`}>
      {formatToShortYear(date)}
    </div>
  );
};

export default React.memo(DateDisplay);
