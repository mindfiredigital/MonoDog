/**
 * Controller Request and Response types
 */

declare module 'express' {
  interface Request {
    user?: {
      id: number;
      login: string;
      avatar_url: string;
    };
    accessToken?: string;
  }
}

export {};
