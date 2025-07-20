// Todo model for the Calendar Todo List
export interface Todo {
  id: string;
  title: string;
  description?: string;
  date: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Helper functions for todos
export const createTodo = (
  title: string, 
  description: string = "", 
  date: Date, 
  priority: 'low' | 'medium' | 'high' = 'medium'
): Todo => {
  return {
    id: Math.random().toString(36).substring(2, 9),
    title,
    description,
    date,
    completed: false,
    priority,
  };
};

// Initial todos data
export const initialTodos: Todo[] = [
  createTodo(
    "Prepare soil for planting", 
    "Till the soil and add organic compost", 
    new Date(2025, 6, 22), 
    'high'
  ),
  createTodo(
    "Order new seeds", 
    "Need to order rice and vegetable seeds", 
    new Date(2025, 6, 25), 
    'medium'
  ),
  createTodo(
    "Check irrigation system", 
    "Ensure all irrigation lines are working properly", 
    new Date(2025, 6, 21), 
    'high'
  ),
];
