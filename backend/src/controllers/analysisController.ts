import { Request, Response } from 'express';
import * as analysisService from '../services/analysisService';

export const generateAnalysis = async (req: Request, res: Response) => {
  const { visualizationId, image } = req.body;

  if (!visualizationId || !image) {
    return res.status(400).json({ message: 'visualizationId and image are required' });
  }

  try {
    const result = await analysisService.analyzeAndSave(visualizationId, image);
    res.json(result);
  } catch (error) {
    console.error('Analysis Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: `Error generating analysis: ${errorMessage}` });
  }
};