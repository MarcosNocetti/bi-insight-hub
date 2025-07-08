import { Router } from 'express';
import {
  createVisualization,
  deleteVisualization,
  getVisualizations,
  updateVisualization,
  getInsightsByVisualization,
} from './controllers/visualizationController';
import { generateAnalysis } from './controllers/analysisController';

const router = Router();

// Visualization routes
router.get('/visualizations', getVisualizations);
router.post('/visualizations', createVisualization);
router.put('/visualizations/:id', updateVisualization);
router.delete('/visualizations/:id', deleteVisualization);

// Insight routes
router.get('/visualizations/:id/insights', getInsightsByVisualization);
router.post('/analysis', generateAnalysis);

export default router;
