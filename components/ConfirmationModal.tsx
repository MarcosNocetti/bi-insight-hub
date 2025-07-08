import React from 'react';
import Icon from './Icon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <Icon name="warning" className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-4 text-left">
                <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                <div className="mt-2">
                    <p className="text-sm text-text-secondary">{message}</p>
                </div>
            </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-text-primary font-semibold transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;