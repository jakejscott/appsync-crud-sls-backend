import { ValidationError } from "yup";

export type AppSyncEvent<T> = {
  identity?: {
    sub?: string | null;
    email?: string | null;
  } | null;
  arguments: {
    input: T;
  };
};

export type AppSyncResult<T> = {
  data: T | null;
  errorInfo: any | null;
  errorType: string | null;
  errorMessage: string | null;
};

export class AppSyncError extends Error {
  type: string;
  info?: any;

  constructor(message: string, type = "UnknownError", info: any = null) {
    super(message);
    this.type = type;
    this.info = info;
  }
}

export class InternalServerException extends AppSyncError {
  constructor(message?: string) {
    super(message || "There was an internal server error.", "InternalServerException");
  }
}

export class UnauthorizedException extends AppSyncError {
  constructor(message?: string) {
    super(message || "You are not authorized to make this call.", "UnauthorizedException");
  }
}

export class NotFoundException extends AppSyncError {
  constructor(message?: string, info: any = null) {
    super(message || "Resource not found", "NotFound", info);
  }
}

export function buildResult<T>(response: T): AppSyncResult<T> {
  if (response instanceof ValidationError) {
    return {
      data: null,
      errorInfo: response.errors,
      errorType: response.name,
      errorMessage: response.message,
    };
  } else if (response instanceof AppSyncError) {
    return {
      data: null,
      errorInfo: response.info,
      errorType: response.type,
      errorMessage: response.message,
    };
  } else if (response instanceof Error) {
    throw response;
  } else {
    return {
      data: response,
      errorInfo: null,
      errorMessage: null,
      errorType: null,
    };
  }
}

export function getUserId<T>(event: AppSyncEvent<T>) {
  if (!event.identity || !event.identity.sub) {
    throw new UnauthorizedException("sub claim missing");
  }
  return event.identity.sub;
}
