export type EntityType = 'business' | 'legal' | 'territorial';

// Интерфейс для комментария с флагом выполнения
export interface Comment {
  text: string;
  completed: boolean;
  date: string;
}

export interface EntityNode {
  id: string;
  name: string;
  type: EntityType;
  position?: string;
  manager?: string;
  avatar?: string; // URL аватарки сотрудника
  comments?: Comment[]; // Комментарии к узлу со статусом выполнения
}

export type RelationType = 'manager' | 'department' | 'functional' | 'other';

export interface EntityRelation {
  id: string;
  from: string;
  to: string;
  type: RelationType;
  label?: string;
} 