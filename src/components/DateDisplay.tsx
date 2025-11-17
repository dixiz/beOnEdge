import React from 'react';
import './DateDisplay.css';

interface DateDisplayProps {
  date: string;
  isLightTheme?: boolean;
}

const DateDisplay: React.FC<DateDisplayProps> = ({ date, isLightTheme = false }) => {
  return (
    <div className={`date-display ${isLightTheme ? 'date-display--light' : 'date-display--dark'}`}>
      {date}
    </div>
  );
};

export default React.memo(DateDisplay);
