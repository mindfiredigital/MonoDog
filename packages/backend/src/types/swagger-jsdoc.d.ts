/**
 * Type declarations for swagger-jsdoc
 * Provides TypeScript support for swagger-jsdoc module
 */

declare module 'swagger-jsdoc' {
  interface SwaggerOptions {
    definition?: Record<string, unknown>;
    apis?: string[];
  }

  function swaggerJsDoc(options: SwaggerOptions): Record<string, unknown>;

  export = swaggerJsDoc;
}
