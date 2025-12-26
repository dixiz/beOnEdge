import React from 'react';

interface CalendarIconProps {
  letter: string;
  fontSize?: string;
  isLightTheme: boolean;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({ 
  letter, 
  fontSize = '10',
  isLightTheme 
}) => {
  return (
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
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        {letter}
      </text>
    </svg>
  );
};

export default CalendarIcon;

