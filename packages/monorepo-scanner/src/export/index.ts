import { ScanResult } from '../types';

export function exportResults(
  results: ScanResult,
  format: 'json' | 'csv' | 'html'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(results, null, 2);
    case 'csv':
      return exportToCSV(results);
    case 'html':
      return exportToHTML(results);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function exportToCSV(results: ScanResult): string {
  const headers = [
    'Package',
    'Type',
    'Version',
    'Dependencies',
    'Health Score',
  ];
  const rows = results.packages.map(pkg => [
    pkg.name,
    pkg.type,
    pkg.version,
    Object.keys(pkg.dependencies || {}).length,
    'N/A', // Would need health calculation
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

function exportToHTML(results: ScanResult): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Monorepo Scan Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Monorepo Scan Report</h1>
        <p>Generated: ${results.scanTimestamp}</p>
        <p>Duration: ${results.scanDuration}ms</p>

        <h2>Summary</h2>
        <ul>
          <li>Total Packages: ${results.stats.totalPackages}</li>
          <li>Applications: ${results.stats.apps}</li>
          <li>Libraries: ${results.stats.libraries}</li>
          <li>Tools: ${results.stats.tools}</li>
        </ul>

        <h2>Packages</h2>
        <table>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Version</th>
            <th>Dependencies</th>
          </tr>
          ${results.packages
            .map(
              pkg => `
            <tr>
              <td>${pkg.name}</td>
              <td>${pkg.type}</td>
              <td>${pkg.version}</td>
              <td>${Object.keys(pkg.dependencies || {}).length}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      </body>
    </html>
  `;
}
