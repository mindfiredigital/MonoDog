import { MonorepoScanner, quickScan } from '@monodog/monorepo-scanner';

export const scanner = new MonorepoScanner();

export const performMonorepoScan = async (force?: boolean) => {
  if (force) {
    scanner.clearCache();
  }

  const result = await quickScan();

  return {
    success: true,
    message: 'Scan completed successfully',
    result,
  };
};

export const getMonorepoScanResults = async () => {
  return await quickScan();
};

export const exportMonorepoScanResults = async (
  format: string,
  filename?: string
) => {
  if (!['json', 'csv', 'html'].includes(format)) {
    throw new Error('Invalid export format');
  }

  const result = await quickScan();

  const exportData = scanner.exportResults(
    result,
    format as 'json' | 'csv' | 'html'
  );

  return {
    format,
    filename,
    result,
    exportData,
  };
};
