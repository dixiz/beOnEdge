export interface ScheduleItem {
  date: string;
  day: string;
  time: string;
  championship: string;
  stage: string;
  place: string;
  session: string;
  PC?: string;  // флажок для иконки монитора
  TG?: string;  // флажок для иконки телеграмма
  BCU?: string; // флажок для иконки телевизора
  Commentator1?: string; // первый комментатор
  Commentator2?: string; // второй комментатор
  Optionally?: string; // опциональная информация
}

