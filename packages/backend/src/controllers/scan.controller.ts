import { Request, Response } from 'express';
import {
  performMonorepoScan,
  getMonorepoScanResults,
  exportMonorepoScanResults,
} from '../services/scan.service';

export const performScan = async (req: Request, res: Response) => {
  try {
    const { force } = req.body;

    const result = await performMonorepoScan(force);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to perform scan',
    });
  }
};

export const getScanResults = async (req: Request, res: Response) => {
  try {
    const result = await getMonorepoScanResults();

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch scan results',
    });
  }
};

export const exportScanResults = async (req: Request, res: Response) => {
  try {
    const { format } = req.params;
    const { filename } = req.query;

    const { result, exportData } = await exportMonorepoScanResults(
      format,
      filename as string
    );

    if (format === 'json') {
      return res.json(result);
    }

    const contentType = format === 'csv' ? 'text/csv' : 'text/html';

    const contentDisposition = filename
      ? `attachment; filename="${filename}"`
      : `attachment; filename="monorepo-scan.${format}"`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDisposition);
    res.send(exportData);
  } catch (error) {
    const statusCode =
      error instanceof Error && error.message === 'Invalid export format'
        ? 400
        : 500;

    res.status(statusCode).json({
      error:
        error instanceof Error
          ? error.message
          : 'Failed to export scan results',
    });
  }
};
