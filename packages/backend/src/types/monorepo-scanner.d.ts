// This declaration explicitly tells TypeScript about the specific functions
// exported by the '@monodog/monorepo-scanner' package, bypassing TS7016 errors.

declare module '@monodog/monorepo-scanner' {
  /**
   * Declares the exported function 'funCheckSecurityAudit'.
   * The actual implementation and return type reside in the source package.
   */
  export function funCheckSecurityAudit(options?: any): any;
  export function funCheckTestCoverage(options?: any): any;
  export function funCheckLintStatus(options?: any): any;
  export function funCheckBuildStatus(options?: any): any;
  export function generateReports(options?: any): any;
  export function quickScan(options?: any): any;

  /**
   * Defines the exported class structure, including the constructor
   * and the methods used in the backend.
   */
  export class MonorepoScanner {
    // Constructor (when called with `new`)
    constructor(options?: any);

    /** * Resets any internal cache state for the scanner.
     */
    clearCache(): void;

    /** * Retrieves the processed results from the scan.
     */
    exportResults(result: any, format: 'json' | 'csv' | 'html'): any;
  }
}
