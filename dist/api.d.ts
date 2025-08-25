export type ApiSuccessResponse<T = unknown> = {
    success: true;
    data?: T;
};
export type ApiErrorResponse = {
    success: false;
    errors: string | string[] | {
        [key: string]: string;
    }[];
};
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
//# sourceMappingURL=api.d.ts.map