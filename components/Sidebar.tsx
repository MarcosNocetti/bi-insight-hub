import React, { useState } from 'react';
import { Visualization } from '../types';
import Icon from './Icon';
import VisualizationFormModal from './VisualizationFormModal';
import ConfirmationModal from './ConfirmationModal';

interface SidebarProps {
  visualizations: Visualization[];
  activeVisualizationId: string | null;
  onSelect: (id: string) => void;
  onSave: (visualization: Omit<Visualization, 'id'> | Visualization) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ visualizations, activeVisualizationId, onSelect, onSave, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingVisualization, setEditingVisualization] = useState<Visualization | null>(null);
  const [deletingVisualizationId, setDeletingVisualizationId] = useState<string | null>(null);

  const handleAddNew = () => {
    setEditingVisualization(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vis: Visualization) => {
    setEditingVisualization(vis);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingVisualizationId(id);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
      if(deletingVisualizationId) {
          await onDelete(deletingVisualizationId);
      }
      setIsDeleteConfirmOpen(false);
      setDeletingVisualizationId(null);
  }

  const handleSave = async (vis: Omit<Visualization, 'id'> | Visualization) => {
    await onSave(vis);
    setIsFormOpen(false);
    setEditingVisualization(null);
  };

  return (
    <>
      <aside className="w-80 bg-surface flex flex-col h-screen p-4 border-r border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary p-2 rounded-lg">
            <Icon name="chart" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">BI Insight Hub</h1>
        </div>
        
        <button
          onClick={handleAddNew}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-hover transition-all mb-6"
        >
          <Icon name="plus" className="w-5 h-5" />
          <span>Adicionar Dashboard</span>
        </button>

        <nav className="flex-grow overflow-y-auto pr-2 -mr-2">
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Dashboards</p>
          <ul className="space-y-2">
            {visualizations.map((vis) => (
              <li key={vis.id}>
                <div
                  onClick={() => onSelect(vis.id)}
                  className={`group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    activeVisualizationId === vis.id ? 'bg-primary/20 text-primary-hover' : 'text-text-secondary hover:bg-gray-700/50 hover:text-text-primary'
                  }`}
                >
                  <span className="font-medium truncate pr-2">{vis.name}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(vis); }} className="p-1 hover:text-blue-400">
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRequest(vis.id); }} className="p-1 hover:text-red-400">
                      <Icon name="delete" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <VisualizationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        initialData={editingVisualization}
      />
      
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Dashboard"
        message={`Você tem certeza que deseja excluir o dashboard "${visualizations.find(v => v.id === deletingVisualizationId)?.name}"? Esta ação não pode ser desfeita.`}
      />
    </>
  );
};

export default Sidebar;