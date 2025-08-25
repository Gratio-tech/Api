export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data?: T; // Данных может не быть
};

export type ApiErrorResponse = {
  success: false;
  errors: string | string[] | { [key: string]: string }[]; // Массив объектов на случай ошибок валидации - удобно использовать ключи объекта для полей
};

export type ApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;
