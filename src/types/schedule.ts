export interface ScheduleItem {
  date: string;
  day: string;
  time: string;
  championship: string;
  stage: string;
  place: string;
  session: string;
  PC?: string;  // флажок для иконки монитора
  TG1?: string; // флажок для иконки телеграмма 1
  TG2?: string; // флажок для иконки телеграмма 2
  TG3?: string; // флажок для иконки телеграмма 3
  BCU1?: string; // флажок для иконки телевизора 1
  BCU2?: string; // флажок для иконки телевизора 2
  BCU3?: string; // флажок для иконки телевизора 3
  Commentator1?: string; // первый комментатор
  Commentator2?: string; // второй комментатор
  Optionally?: string; // опциональная информация
}

