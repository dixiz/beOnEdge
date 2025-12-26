import React from 'react';
import './ScheduleIcons.css';

interface ScheduleIconsProps {
  showPC?: boolean;
  tgNumbers?: number[]; // массив номеров: [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]
  bcuNumbers?: number[]; // массив номеров: [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]
  isLightTheme?: boolean;
}

const ScheduleIcons: React.FC<ScheduleIconsProps> = ({
  showPC = false,
  tgNumbers = [],
  bcuNumbers = [],
  isLightTheme = false,
}) => {
  const iconSize = 22;
  const iconColor = 'white';

  // Определяем, есть ли что показывать
  const hasPC = showPC;
  const hasTG = tgNumbers.length > 0;
  const hasBCU = bcuNumbers.length > 0;

  // Если ни одна иконка не должна показываться, не рендерим контейнер
  if (!hasPC && !hasTG && !hasBCU) {
    return null;
  }

  return (
    <div className="icons-container">
      {/* Первый ряд: иконка монитора */}
      {hasPC && (
        <div className="icon-row">
          <div className="icon-wrapper icon-wrapper--pc">
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 3H4C2.9 3 2 3.9 2 5V15C2 16.1 2.9 17 4 17H10L8 19V20H16V19L14 17H20C21.1 17 22 16.1 22 15V5C22 3.9 21.1 3 20 3ZM20 15H4V5H20V15Z"
                fill="#000000"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Второй ряд: иконки телеграмма с цифрами */}
      {hasTG && (
        <div className="icon-row">
          {tgNumbers.map((number) => (
            <div key={number} className="icon-wrapper icon-wrapper--tg icon-wrapper--with-number">
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 0C5.373 0 0 5.373 0 12S5.373 24 12 24 24 18.627 24 12 18.627 0 12 0ZM17.894 8.221L15.924 17.501C15.779 18.159 15.387 18.319 14.84 18.008L12 16.3L10.553 17.694C10.413 17.874 10.196 17.989 9.953 17.989L10.166 14.945L16.726 9.423C17.056 9.21 16.762 9.086 16.333 9.299L7.669 14.111L4.681 13.167C4.041 12.964 4.021 12.527 4.546 12.214L17.457 5.505C18.002 5.178 18.47 5.502 18.297 6.363L17.894 8.221Z"
                  fill={iconColor}
                />
              </svg>
              <span className="icon-number">{number}</span>
            </div>
          ))}
        </div>
      )}

      {/* Третий ряд: иконки телевизора с цифрами */}
      {hasBCU && (
        <div className="icon-row">
          {bcuNumbers.map((number) => (
            <div key={number} className="icon-wrapper icon-wrapper--bcu icon-wrapper--with-number">
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 3H3C1.9 3 1 3.9 1 5V17C1 18.1 1.9 19 3 19H8V21H16V19H21C22.1 19 23 18.1 23 17V5C23 3.9 22.1 3 21 3ZM21 17H3V5H21V17Z"
                  fill={iconColor}
                />
                <path
                  d="M7 7H17V14H7V7ZM9 9V12H15V9H9Z"
                  fill={iconColor}
                />
              </svg>
              <span className="icon-number">{number}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ScheduleIcons);
