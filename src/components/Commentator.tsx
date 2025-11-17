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
            d="M12 1C13.1 1 14 1.9 14 3V11C14 12.1 13.1 13 12 13C10.9 13 10 12.1 10 11V3C10 1.9 10.9 1 12 1Z"
            fill="#000000"
          />
          <path
            d="M19 10V11C19 15.42 15.42 19 11 19H9C4.58 19 1 15.42 1 11V10H3V11C3 14.31 5.69 17 9 17H11C14.31 17 17 14.31 17 11V10H19Z"
            fill="#000000"
          />
          <path
            d="M23 11V12C23 16.97 18.97 21 14 21H13V23H14C19.52 23 24 18.52 24 13V11H23Z"
            fill="#000000"
          />
        </svg>
      </div>
      <span className="commentator-name">{name}</span>
    </div>
  );
};

export default React.memo(Commentator);

