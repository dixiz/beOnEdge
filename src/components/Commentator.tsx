import React from 'react';
import './Commentator.css';

interface CommentatorProps {
  name: string;
}

const Commentator: React.FC<CommentatorProps> = ({ name }) => {
  return (
    <div className="commentator">
      <div className="commentator-icon">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C9.8 2 8 3.8 8 6V12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12V6C16 3.8 14.2 2 12 2Z"
            fill="#000000"
          />
          <path
            d="M5 10.5C5 10.05 5.35 9.7 5.8 9.7C6.25 9.7 6.6 10.05 6.6 10.5V12C6.6 14.98 9.02 17.4 12 17.4C14.98 17.4 17.4 14.98 17.4 12V10.5C17.4 10.05 17.75 9.7 18.2 9.7C18.65 9.7 19 10.05 19 10.5V12C19 15.58 16.32 18.54 12.85 18.95V21H16C16.45 21 16.8 21.35 16.8 21.8C16.8 22.25 16.45 22.6 16 22.6H8C7.55 22.6 7.2 22.25 7.2 21.8C7.2 21.35 7.55 21 8 21H11.15V18.95C7.68 18.54 5 15.58 5 12V10.5Z"
            fill="#000000"
          />
          <path
            d="M10 6.2C10 5.75 10.35 5.4 10.8 5.4H13.2C13.65 5.4 14 5.75 14 6.2C14 6.65 13.65 7 13.2 7H10.8C10.35 7 10 6.65 10 6.2ZM10 9C10 8.55 10.35 8.2 10.8 8.2H13.2C13.65 8.2 14 8.55 14 9C14 9.45 13.65 9.8 13.2 9.8H10.8C10.35 9.8 10 9.45 10 9Z"
            fill="#000000"
          />
        </svg>
      </div>
      <span className="commentator-name">{name}</span>
    </div>
  );
};

export default React.memo(Commentator);

