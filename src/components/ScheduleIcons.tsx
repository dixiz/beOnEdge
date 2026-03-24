import React from 'react';
import './ScheduleIcons.css';

interface ScheduleIconsProps {
  showPC?: boolean;
  tgNumbers?: number[]; // массив номеров: [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]
  bcuNumbers?: number[]; // массив номеров: [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]
  showRT?: boolean;
  rtLink?: string;
  isLightTheme?: boolean;
}

const ScheduleIcons: React.FC<ScheduleIconsProps> = ({
  showPC = false,
  tgNumbers = [],
  bcuNumbers = [],
  showRT = false,
  rtLink,
  isLightTheme = false,
}) => {
  const iconSize = 22;
  const iconColor = 'white';
  const pcBg = '#0077FF'; // VK blue

  // Определяем, есть ли что показывать
  const hasPC = showPC;
  const hasTG = tgNumbers.length > 0;
  const hasBCU = bcuNumbers.length > 0;
  const trimmedRtLink = rtLink?.trim();
  const hasRT = showRT;
  const hasRtLink = !!trimmedRtLink && trimmedRtLink.toLowerCase() !== 'нет';
  const iconCount = (hasPC ? 1 : 0) + tgNumbers.length + bcuNumbers.length + (hasRT ? 1 : 0);
  const baseIconCount = iconCount - (hasRT ? 1 : 0);
  const rtOnNextRow = hasRT && baseIconCount >= 3;
  const containerClassName = [
    'icons-container',
    iconCount === 1 ? 'icons-container--single' : '',
    iconCount === 2 ? 'icons-container--double' : '',
  ].filter(Boolean).join(' ');

  // Если ни одна иконка не должна показываться, не рендерим контейнер
  if (!hasPC && !hasTG && !hasBCU && !hasRT) {
    return null;
  }

  const PC_LINK = 'https://vk.com/be_on_edge';
  const BCU_LINK = 'https://bcumedia.su/';

  const getTgLink = (number: number) => {
    switch (number) {
      case 1:
        return 'https://t.me/BoE_LIVE_1';
      case 2:
        return 'https://t.me/BoE_LIVE_2';
      case 3:
        return 'https://t.me/BoE_LIVE_3';
      default:
        return undefined;
    }
  };

  return (
    <div className={containerClassName}>
      {/* Первый ряд: иконка монитора */}
      {hasPC && (
        <div className="icon-row">
          <a
            className="icon-link icon-link--pc"
            href={PC_LINK}
            target="_blank"
            rel="noreferrer noopener"
          >
            <div className="icon-wrapper icon-wrapper--pc">
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <rect x="2" y="4" width="20" height="16" rx="3" fill={pcBg} />
                <text
                  x="12"
                  y="12.8"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#FFFFFF"
                  dominantBaseline="middle"
                >
                  VK
                </text>
              </svg>
            </div>
          </a>
        </div>
      )}

      {/* Второй ряд: иконки телеграмма с цифрами */}
      {hasTG && (
        <div className="icon-row">
          {tgNumbers.map((number) => (
            <a
              key={number}
              className="icon-link icon-link--tg"
              href={getTgLink(number)}
              target="_blank"
              rel="noreferrer noopener"
            >
              <div className="icon-wrapper icon-wrapper--tg icon-wrapper--with-number">
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
            </a>
          ))}
        </div>
      )}

      {/* Третий ряд: иконки телевизора с цифрами */}
      {hasBCU && (
        <div className="icon-row">
          {bcuNumbers.map((number) => (
            <a
              key={number}
              className="icon-link icon-link--bcu"
              href={BCU_LINK}
              target="_blank"
              rel="noreferrer noopener"
            >
              <div className="icon-wrapper icon-wrapper--bcu icon-wrapper--with-number">
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
            </a>
          ))}
        </div>
      )}

      {hasRT && (
        hasRtLink ? (
          <a
            className={`icon-link icon-link--rt ${rtOnNextRow ? 'icon-link--rt-bottom' : ''}`}
            href={trimmedRtLink}
            target="_blank"
            rel="noreferrer noopener"
            title="RuTube"
            aria-label="RuTube"
          >
            <div className="icon-wrapper icon-wrapper--rt" aria-hidden="true">
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0.75" y="0.75" width="22.5" height="22.5" rx="5.5" fill="#1B115A" />
                <path
                  d="M15 0.75H17.75C20.7886 0.75 23.25 3.21143 23.25 6.25V9C19.35 9 16.2 5.5 15 0.75Z"
                  fill="#FF164B"
                />
                <text
                  x="12"
                  y="12.8"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                  fontSize="13.5"
                  fontWeight="700"
                  dominantBaseline="middle"
                  lengthAdjust="spacingAndGlyphs"
                  textLength="10.5"
                  fill="#FFFFFF"
                >
                  R
                </text>
              </svg>
            </div>
          </a>
        ) : (
          <div
            className={`icon-link icon-link--rt icon-link--rt-static ${rtOnNextRow ? 'icon-link--rt-bottom' : ''}`}
            title="RuTube"
            aria-label="RuTube"
          >
            <div className="icon-wrapper icon-wrapper--rt" aria-hidden="true">
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0.75" y="0.75" width="22.5" height="22.5" rx="5.5" fill="#1B115A" />
                <path
                  d="M15 0.75H17.75C20.7886 0.75 23.25 3.21143 23.25 6.25V9C19.35 9 16.2 5.5 15 0.75Z"
                  fill="#FF164B"
                />
                <text
                  x="12"
                  y="12.8"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                  fontSize="13.5"
                  fontWeight="700"
                  dominantBaseline="middle"
                  lengthAdjust="spacingAndGlyphs"
                  textLength="10.5"
                  fill="#FFFFFF"
                >
                  R
                </text>
              </svg>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default React.memo(ScheduleIcons);
