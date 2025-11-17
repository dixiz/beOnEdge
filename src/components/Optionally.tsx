import React from 'react';
import './Optionally.css';

interface OptionallyProps {
  text: string;
  isLightTheme?: boolean;
}

const Optionally: React.FC<OptionallyProps> = ({ text, isLightTheme = false }) => {
  return (
    <div className={`optionally ${isLightTheme ? 'optionally--light' : 'optionally--dark'}`}>
      <strong>Важно: </strong>{text}
    </div>
  );
};

export default React.memo(Optionally);

