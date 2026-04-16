import { Request, Response } from 'express';
import {
  findMonorepoRoot,
  scanConfigFiles,
  getFileType,
  containsSecrets,
} from '../services/config.service';
import fs from 'fs';
import path from 'path';

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

    const rootDir = findMonorepoRoot();
    const filePath = path.join(rootDir, id.startsWith('/') ? id.slice(1) : id);

    if (!filePath.startsWith(rootDir)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
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
