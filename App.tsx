import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import { Visualization } from './types';
import { getVisualizations, saveVisualization, deleteVisualization } from './services/geminiService';

const App: React.FC = () => {
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [activeVisualizationId, setActiveVisualizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisualizations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedVisualizations = await getVisualizations();
      setVisualizations(fetchedVisualizations);
      if (fetchedVisualizations.length > 0 && !activeVisualizationId) {
        setActiveVisualizationId(fetchedVisualizations[0].id);
      } else if(fetchedVisualizations.length === 0) {
        setActiveVisualizationId(null);
      }
    } catch (err) {
      setError("Falha ao carregar os dashboards. Verifique se o serviço de backend está em execução.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeVisualizationId]);

  useEffect(() => {
    fetchVisualizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas na montagem inicial

  const handleSaveVisualization = async (vis: Omit<Visualization, 'id'> | Visualization) => {
    try {
      const savedVis = await saveVisualization(vis);
      const isEditing = 'id' in vis;
      if (isEditing) {
        setVisualizations(prev => prev.map(v => v.id === savedVis.id ? savedVis : v));
      } else {
        setVisualizations(prev => [...prev, savedVis]);
        setActiveVisualizationId(savedVis.id);
      }
    } catch (err) {
      setError("Não foi possível salvar o dashboard.");
      console.error(err);
    }
  };

  const handleDeleteVisualization = async (id: string) => {
    try {
      await deleteVisualization(id);
      
      let newActiveId: string | null = null;
      setVisualizations(prev => {
        const remaining = prev.filter(v => v.id !== id);
        if (activeVisualizationId === id) {
          if (remaining.length > 0) {
            newActiveId = remaining[0].id;
          }
        } else {
            newActiveId = activeVisualizationId;
        }
        return remaining;
      });
      setActiveVisualizationId(newActiveId);

    } catch (err) {
      setError("Não foi possível excluir o dashboard.");
      console.error(err);
    }
  };

  const activeVisualization = visualizations.find(v => v.id === activeVisualizationId) || null;

  return (
    <div className="flex h-screen font-sans text-text-primary bg-background">
      <Sidebar
        visualizations={visualizations}
        activeVisualizationId={activeVisualizationId}
        onSelect={setActiveVisualizationId}
        onSave={handleSaveVisualization}
        onDelete={handleDeleteVisualization}
      />
      {isLoading ? (
          <div className="flex-1 flex items-center justify-center">Carregando...</div>
      ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-400">{error}</div>
      ): (
        <DashboardView visualization={activeVisualization} />
      )}
    </div>
  );
};

export default App;