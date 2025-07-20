"use client";

import React from "react";
import { Check, Trash2, Edit, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Todo } from "@/models/todo";

interface TodoItemProps {
  todo: Todo;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onComplete,
  onDelete,
  onEdit,
}) => {
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-3 rounded-lg border transition-all",
        todo.completed
          ? "bg-muted/40 border-muted"
          : "bg-background border-border hover:shadow-sm"
      )}
    >
      <button
        onClick={() => onComplete(todo.id)}
        className={cn(
          "flex-none mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center",
          todo.completed
            ? "bg-primary border-primary text-primary-foreground"
            : "border-primary/30 text-transparent hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              "font-medium truncate",
              todo.completed && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </h4>
          <span
            className={cn(
              "inline-flex h-1.5 w-1.5 rounded-full",
              getPriorityColor(todo.priority)
            )}
          />
        </div>
        {todo.description && (
          <p
            className={cn(
              "text-sm text-muted-foreground mt-0.5 line-clamp-2",
              todo.completed && "line-through"
            )}
          >
            {todo.description}
          </p>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          {todo.date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(todo)}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
