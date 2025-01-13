export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT = 'RATE_LIMIT'
}

export interface ApiErrorOptions {
  message: string;
  status: number;
  type: ErrorType;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly type: ErrorType;
  readonly details?: Record<string, unknown>;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.type = options.type;
    this.details = options.details;
  }

  toJSON() {
    return {
      error: this.message,
      type: this.type,
      status: this.status,
      ...(this.details && { details: this.details })
    };
  }
}

export const createError = (options: ApiErrorOptions): ApiError => {
  return new ApiError(options);
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export default ApiError; 