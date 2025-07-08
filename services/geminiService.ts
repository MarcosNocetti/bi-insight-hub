import { Visualization, AnalysisResult, Insight } from '../types';

const API_BASE_URL = 'http://localhost:3001/api'; // Assume o backend rodando na porta 3001

export const getVisualizations = async (): Promise<Visualization[]> => {
  console.log("Fetching visualizations from:", `${API_BASE_URL}/visualizations`);
  const response = await fetch(`${API_BASE_URL}/visualizations`);
  if (!response.ok) {
    throw new Error('Failed to fetch visualizations');
  }
  return response.json();
};

export const saveVisualization = async (visualization: Omit<Visualization, 'id'> | Visualization): Promise<Visualization> => {
  const isEditing = 'id' in visualization && visualization.id;
  const url = isEditing ? `${API_BASE_URL}/visualizations/${visualization.id}` : `${API_BASE_URL}/visualizations`;
  const method = isEditing ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(visualization),
  });

  if (!response.ok) {
    throw new Error('Failed to save visualization');
  }
  return response.json();
};

export const deleteVisualization = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/visualizations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete visualization');
  }
};

export const analyzeDashboard = async (visualizationId: string, base64Image: string): Promise<AnalysisResult> => {
    const response = await fetch(`${API_BASE_URL}/analysis`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visualizationId, image: base64Image }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to analyze dashboard' }));
        throw new Error(errorData.message || 'Failed to analyze dashboard');
    }
    return response.json();
};

export const getInsightsForVisualization = async (visualizationId: string): Promise<Insight[]> => {
    const response = await fetch(`${API_BASE_URL}/visualizations/${visualizationId}/insights`);
    if (!response.ok) {
        throw new Error('Failed to fetch insights history');
    }
    return response.json();
};
