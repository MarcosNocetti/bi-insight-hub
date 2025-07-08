import pool from '../config/database';
import { Visualization } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const findAll = async (): Promise<Visualization[]> => {
  const result = await pool.query('SELECT * FROM visualizations ORDER BY created_at ASC');
  return result.rows;
};

export const create = async (data: Omit<Visualization, 'id' | 'created_at' | 'updated_at'>): Promise<Visualization> => {
  const newId = uuidv4();
  const { name, url } = data;
  const result = await pool.query(
    'INSERT INTO visualizations (id, name, url) VALUES ($1, $2, $3) RETURNING *',
    [newId, name, url]
  );
  return result.rows[0];
};

export const update = async (id: string, data: Partial<Omit<Visualization, 'id'>>): Promise<Visualization | null> => {
  const { name, url } = data;
  const result = await pool.query(
    'UPDATE visualizations SET name = $1, url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [name, url, id]
  );
  return result.rows[0] || null;
};

export const remove = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM visualizations WHERE id = $1', [id]);
};
