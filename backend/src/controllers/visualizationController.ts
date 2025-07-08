import { Request, Response } from 'express';
import * as visualizationService from '../services/visualizationService';
import * as insightRepository from '../repositories/insightRepository';

export const getVisualizations = async (req: Request, res: Response) => {
  try {
    const visualizations = await visualizationService.getAll();
    res.json(visualizations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visualizations' });
  }
};

export const createVisualization = async (req: Request, res: Response) => {
  try {
    const newVisualization = await visualizationService.create(req.body);
    res.status(201).json(newVisualization);
  } catch (error) {
    res.status(500).json({ message: 'Error creating visualization' });
  }
};

export const updateVisualization = async (req: Request, res: Response) => {
  try {
    const updatedVisualization = await visualizationService.update(req.params.id, req.body);
    if (!updatedVisualization) {
      return res.status(404).json({ message: 'Visualization not found' });
    }
    res.json(updatedVisualization);
  } catch (error) {
    res.status(500).json({ message: 'Error updating visualization' });
  }
};

export const deleteVisualization = async (req: Request, res: Response) => {
  try {
    await visualizationService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting visualization' });
  }
};

export const getInsightsByVisualization = async (req: Request, res: Response) => {
    try {
        const insights = await insightRepository.findByVisualizationId(req.params.id);
        res.json(insights);
    } catch(error) {
        res.status(500).json({ message: 'Error fetching insights' });
    }
}