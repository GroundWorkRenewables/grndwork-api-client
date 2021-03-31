export declare class ServerError extends Error {
    readonly status: number;
    readonly errors: Array<{
        field: string;
        message: string;
    }>;
    constructor(message?: string, status?: number, errors?: Array<{
        field: string;
        message: string;
    }>);
}
