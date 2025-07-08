import * as visualizationRepository from '../repositories/visualizationRepository';
import { Visualization } from '../types';

export const getAll = () => {
  return visualizationRepository.findAll();
};

export const create = (data: Omit<Visualization, 'id'>) => {
  return visualizationRepository.create(data);
};

export const update = (id: string, data: Partial<Omit<Visualization, 'id'>>) => {
  return visualizationRepository.update(id, data);
};

export const remove = (id: string) => {
  return visualizationRepository.remove(id);
};
