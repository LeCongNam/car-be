export {};

declare global {
  namespace BaseResponse {
    export type List<T> = {
      total: number;
      items: T[];
    };
  }

  declare interface Class {
    new (...arg): InstanceType;
  }
  export type NlpDefaultResponse = {
    text: string;
    terms: NlpTerm[];
  };

  export type OrderConditionSQL = 'ASC' | 'DESC';

  export type PromiseCallbackFunctionArgs = (...args: any[]) => Promise<void>;

  export type Header = {
    os: string | null;
    deviceId: string | null;
    userAgent: string | null;
    requestId: string | null;
    ipAddress: string;
    country: string;
  };
}
