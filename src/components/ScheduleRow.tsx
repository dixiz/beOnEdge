import React, { useMemo } from 'react';
import './ScheduleRow.css';
import ScheduleIcons from './ScheduleIcons';
import Commentator from './Commentator';
import Optionally from './Optionally';
import { normalizeTime } from '../utils/timeUtils';

interface ScheduleRowProps {
  time: string;
  championship: string;
  stage: string;
  place: string;
  session: string;
  isLightTheme?: boolean;
  showPC?: boolean;
  showTG?: boolean;
  showBCU?: boolean;
  commentator1?: string;
  commentator2?: string;
  optionally?: string;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  time,
  championship,
  stage,
  place,
  session,
  isLightTheme = false,
  showPC = false,
  showTG = false,
  showBCU = false,
  commentator1,
  commentator2,
  optionally,
}) => {
  const commentators = useMemo(() => {
    return [commentator1, commentator2].filter(Boolean) as string[];
  }, [commentator1, commentator2]);
  
  // Нормализуем время к формату ЧЧ:ММ
  const normalizedTime = useMemo(() => normalizeTime(time), [time]);
  
  // Форматируем чемпионат
  const formatChampionship = useMemo(() => {
    const champ = championship?.trim() || '';
    return champ.endsWith('.') ? champ : champ + '.';
  }, [championship]);

  // Форматируем этап
  const formatStage = useMemo(() => {
    const stageText = stage?.trim() || '';
    return stageText.endsWith('.') ? stageText.slice(0, -1) : stageText;
  }, [stage]);
  
  return (
    <div className={`schedule-row ${isLightTheme ? 'schedule-row--light' : 'schedule-row--dark'}`}>
      <div className="time-container">
        <div className="time">{normalizedTime}</div>
        <ScheduleIcons showPC={showPC} showTG={showTG} showBCU={showBCU} />
      </div>
      <div className="content-container">
        <div className="championship">
          {formatChampionship}
        </div>
        <div className="stage">
          {formatStage}
        </div>
        <div className="place-session">
          {place}. {session}
        </div>
        {optionally && optionally.trim() && (
          <Optionally text={optionally.trim()} isLightTheme={isLightTheme} />
        )}
        {commentators.length > 0 && (
          <div className="commentators-container">
            {commentators.map((name, idx) => (
              <Commentator key={`${name}-${idx}`} name={name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleRow;
