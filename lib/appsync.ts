import { ValidationError } from "yup";

export type AppSyncEvent<T> = {
  identity: {
    sub: string;
    email: string;
  };
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
