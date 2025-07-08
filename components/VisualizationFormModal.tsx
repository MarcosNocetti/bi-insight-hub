
import React, { useState, useEffect } from 'react';
import { Visualization } from '../types';
import Icon from './Icon';

interface VisualizationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visualization: Omit<Visualization, 'id'> | Visualization) => void;
  initialData?: Visualization | null;
}

const VisualizationFormModal: React.FC<VisualizationFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUrl(initialData.url);
    } else {
      setName('');
      setUrl('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && url.trim()) {
      onSave({
        ...(initialData ? { id: initialData.id } : {}),
        name,
        url,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">{initialData ? 'Edit Visualization' : 'Add New Visualization'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <Icon name="close" className="w-7 h-7" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">Dashboard Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q3 Sales Performance"
              className="w-full bg-background border border-border text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="url" className="block text-sm font-medium text-text-secondary mb-2">Iframe URL</label>
            <textarea
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://lookerstudio.google.com/embed/..."
              className="w-full bg-background border border-border text-text-primary rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-text-primary font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={!name.trim() || !url.trim()}>
              {initialData ? 'Save Changes' : 'Add Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisualizationFormModal;
