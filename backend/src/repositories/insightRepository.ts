import pool from '../config/database';
import { Insight, AnalysisResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const create = async (visualizationId: string, data: AnalysisResult): Promise<Insight> => {
  const newId = uuidv4();
  const { summary, key_insights, recommendations } = data;
  const result = await pool.query(
    'INSERT INTO insights (id, visualization_id, summary, key_insights, recommendations) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [newId, visualizationId, summary, key_insights, recommendations]
  );
  return result.rows[0];
};

export const findByVisualizationId = async (visualizationId: string): Promise<Insight[]> => {
  const result = await pool.query(
    'SELECT * FROM insights WHERE visualization_id = $1 ORDER BY created_at DESC',
    [visualizationId]
  );
  return result.rows;
};
