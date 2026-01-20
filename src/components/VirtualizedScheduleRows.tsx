import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import ScheduleRow from './ScheduleRow';
import { ScheduleItem } from '../types/schedule';
import { parseBooleanFlag } from '../utils/flagUtils';
import { getTgNumbers, getBcuNumbers } from '../utils/iconUtils';

interface VirtualizedScheduleRowsProps {
  rows: ScheduleItem[];
  isLightTheme?: boolean;
  estimatedRowHeight?: number;
  maxHeight?: number;
}

const DEFAULT_ROW_HEIGHT = 150;

const VirtualizedScheduleRows: React.FC<VirtualizedScheduleRowsProps> = ({
  rows,
  isLightTheme = false,
  estimatedRowHeight = DEFAULT_ROW_HEIGHT,
  maxHeight = 700
}) => {
  const listRef = useRef<any>(null);
  const sizeMap = useRef(new Map<number, number>());

  const getSize = useCallback((index: number) => {
    return sizeMap.current.get(index) || estimatedRowHeight;
  }, [estimatedRowHeight]);

  const setSize = useCallback((index: number, size: number) => {
    const prev = sizeMap.current.get(index);
    if (prev === size) return;
    sizeMap.current.set(index, size);
    listRef.current?.resetAfterIndex(index);
  }, []);

  const totalEstimated = rows.length * estimatedRowHeight;
  const listHeight = Math.min(totalEstimated, maxHeight);

  const Row = useMemo(() => {
    const RowRenderer = ({ index, style }: any) => {
      const row = rows[index];
      const rowRef = (el: HTMLDivElement | null) => {
        if (!el) return;
        const height = el.getBoundingClientRect().height;
        setSize(index, height);
      };

      const rowKey = `${row.date}_${row.time}_${row.championship}_${row.stage || ''}_${row.session}_${row.place}_${row.Commentator1 || ''}_${row.Commentator2 || ''}_${row.Optionally || ''}_${index}`;

      return (
        <div style={style} className="day-row-virtual">
          <div ref={rowRef}>
            <ScheduleRow
              key={rowKey}
              date={row.date}
              time={row.time}
              championship={row.championship}
              stage={row.stage}
              place={row.place}
              session={row.session}
              isLightTheme={isLightTheme}
              showPC={parseBooleanFlag(row.PC)}
              tgNumbers={getTgNumbers(row)}
              bcuNumbers={getBcuNumbers(row)}
              commentator1={row.Commentator1}
              commentator2={row.Commentator2}
              optionally={row.Optionally}
              duration={row.Duration}
              liveTiming={row.LiveTiming}
            />
          </div>
        </div>
      );
    };

    return RowRenderer;
  }, [rows, isLightTheme, setSize]);

  useEffect(() => {
    sizeMap.current.clear();
    listRef.current?.resetAfterIndex(0, true);
  }, [rows]);

  return (
    <div className="day-rows-virtual">
      <List
        ref={listRef}
        height={listHeight}
        itemCount={rows.length}
        itemSize={getSize}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

export default VirtualizedScheduleRows;
