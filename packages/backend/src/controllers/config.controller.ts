import { Request, Response } from 'express';
import {
  findMonorepoRoot,
  scanConfigFiles,
  getFileType,
  containsSecrets,
} from '../services/config.service';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db/prisma';
import { AppLogger } from '../middleware/logger';

export const getConfigFiles = async (req: Request, res: Response) => {
  try {
    const rootDir = findMonorepoRoot();

    const configFiles = await scanConfigFiles(rootDir);

    const transformedFiles = configFiles.map(file => ({
      id: file.id,
      name: file.name,
      path: file.path,
      type: file.type,
      content: file.content,
      size: file.size,
      lastModified: file.lastModified,
      hasSecrets: file.hasSecrets,
      isEditable: true,
    }));

    res.json({
      success: true,
      files: transformedFiles,
      total: transformedFiles.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration files',
    });
  }
};

export const updateConfigFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const rootDir = path.resolve(findMonorepoRoot());
    // eslint-disable-next-line no-useless-escape
    const normalizedId = id.replace(/^[\/\\]+/, ''); // Remove leading slashes/backslashes
    const filePath = path.resolve(rootDir, normalizedId);

    // Strict path traversal check
    if (
      !filePath.startsWith(rootDir) ||
      path.relative(rootDir, filePath).startsWith('..')
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Invalid file path',
      });
    }

    try {
      await fs.promises.access(filePath, fs.constants.W_OK);
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'File is not writable or does not exist',
      });
    }

    // Validate JSON before saving
    if (filePath.endsWith('.json')) {
      try {
        JSON.parse(content);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON format.',
        });
      }
    }

    await fs.promises.writeFile(filePath, content, 'utf8');

    const stats = await fs.promises.stat(filePath);
    const filename = path.basename(filePath);

    const updatedFile = {
      id: id,
      name: filename,
      path: id,
      type: getFileType(filename),
      content: content,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      hasSecrets: containsSecrets(content, filename),
      isEditable: true,
    };

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          type: 'config_update',
          packageName: filename,
          message: `Updated configuration file: ${filename}`,
          metadata: JSON.stringify({ filePath: id, size: stats.size }),
        },
      });
    } catch (logError) {
      AppLogger.warn(`Failed to log config update activity: ${logError}`);
    }

    res.json({
      success: true,
      file: updatedFile,
      message: 'File saved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save configuration file',
    });
  }
};
