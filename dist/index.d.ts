type ApiSuccessResponse<T = unknown> = {
    success: true;
    data?: T;
};
type ApiErrorResponse = {
    success: false;
    errors: string | string[] | {
        [key: string]: string;
    }[];
};
type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export type { ApiErrorResponse, ApiResponse, ApiSuccessResponse };
