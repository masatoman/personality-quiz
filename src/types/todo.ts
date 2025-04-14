export type Task = {
  id: string;
  title: string;
  description?: string;
  points: number;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  type: 'custom' | 'suggested';
}; 