"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  CheckCircle,
} from "lucide-react";
import TodoItem from "@/components/todo-item";
import TodoForm from "@/components/todo-form";
import { Todo, initialTodos, createTodo } from "@/models/todo";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export default function CalendarPage() {
  // State for todos
  const [todos, setTodos] = useState<Todo[]>([]);
  // State for selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // State for todo form
  const [formOpen, setFormOpen] = useState(false);
  // State for todo being edited
  const [editTodo, setEditTodo] = useState<Todo | undefined>(undefined);
  // State for active tab
  const [activeTab, setActiveTab] = useState("calendar");

  // Initialize todos from localStorage or use initialTodos
  useEffect(() => {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) {
      try {
        // Parse stored todos and convert date strings back to Date objects
        const parsedTodos = JSON.parse(storedTodos).map((todo: any) => ({
          ...todo,
          date: new Date(todo.date),
        }));
        setTodos(parsedTodos);
      } catch (error) {
        console.error("Error parsing todos from localStorage:", error);
        setTodos(initialTodos);
      }
    } else {
      setTodos(initialTodos);
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Handle complete todo
  const handleCompleteTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Handle delete todo
  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Handle edit todo
  const handleEditTodo = (todo: Todo) => {
    setEditTodo(todo);
    setFormOpen(true);
  };

  // Handle save todo
  const handleSaveTodo = (todoData: Omit<Todo, "id" | "completed">) => {
    if (editTodo) {
      // Update existing todo
      setTodos(
        todos.map((todo) =>
          todo.id === editTodo.id ? { ...todo, ...todoData } : todo
        )
      );
      setEditTodo(undefined);
    } else {
      // Create new todo
      const newTodo = createTodo(
        todoData.title,
        todoData.description,
        todoData.date,
        todoData.priority
      );
      setTodos([...todos, newTodo]);
    }
  };

  // Filter todos for selected date
  const todosForSelectedDate = todos.filter((todo) => {
    const todoDate = new Date(todo.date);
    return todoDate.toDateString() === selectedDate.toDateString();
  });

  // Filter todos for today
  const todosForToday = todos.filter((todo) => {
    const todoDate = new Date(todo.date);
    return todoDate.toDateString() === new Date().toDateString();
  });

  // Filter todos that are upcoming (future dates)
  const upcomingTodos = todos
    .filter((todo) => {
      const todoDate = new Date(todo.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return todoDate >= today && !todo.completed;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filter completed todos
  const completedTodos = todos.filter((todo) => todo.completed);

  // Get dates with todos for calendar highlighting
  const datesWithTodos = todos.reduce((acc: Date[], todo) => {
    const todoDate = new Date(todo.date);
    if (!acc.some((date) => date.toDateString() === todoDate.toDateString())) {
      acc.push(todoDate);
    }
    return acc;
  }, []);

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Task Calendar</h1>
            <p className="text-muted-foreground">
              Manage your farming tasks and schedule
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus size={16} /> Add Task
          </Button>
        </div>

        <Tabs
          defaultValue="calendar"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon size={16} /> Calendar
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <List size={16} /> Tasks
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle size={16} /> Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-1 bg-background">
                <CardHeader className="pb-2">
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="bg-background"
                    modifiers={{
                      hasTodo: datesWithTodos,
                    }}
                    modifiersStyles={{
                      hasTodo: { fontWeight: "bold", color: "var(--primary)" },
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle>
                    Tasks for {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                  <CardDescription>
                    {todosForSelectedDate.length === 0
                      ? "No tasks scheduled for this date"
                      : `${todosForSelectedDate.length} task(s) scheduled`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todosForSelectedDate.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <CalendarIcon
                        size={48}
                        strokeWidth={1}
                        className="mb-2"
                      />
                      <p>No tasks for this day</p>
                      <Button
                        variant="outline"
                        onClick={() => setFormOpen(true)}
                        className="mt-4 gap-2"
                      >
                        <Plus size={16} /> Add Task
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todosForSelectedDate.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onComplete={handleCompleteTodo}
                          onDelete={handleDeleteTodo}
                          onEdit={handleEditTodo}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {todosForToday.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Today's Tasks</CardTitle>
                  <CardDescription>
                    {todosForToday.length} task(s) for today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todosForToday.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onComplete={handleCompleteTodo}
                        onDelete={handleDeleteTodo}
                        onEdit={handleEditTodo}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>
                  {upcomingTodos.length} upcoming task(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTodos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <List size={48} strokeWidth={1} className="mb-2" />
                    <p>No upcoming tasks</p>
                    <Button
                      variant="outline"
                      onClick={() => setFormOpen(true)}
                      className="mt-4 gap-2"
                    >
                      <Plus size={16} /> Add Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group todos by date */}
                    {Array.from(
                      new Set(
                        upcomingTodos.map((todo) => todo.date.toDateString())
                      )
                    ).map((dateString) => {
                      const date = new Date(dateString);
                      const todosForDate = upcomingTodos.filter(
                        (todo) => todo.date.toDateString() === dateString
                      );

                      return (
                        <div key={dateString}>
                          <div className="flex items-center mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                              {format(date, "EEEE, MMMM d, yyyy")}
                            </h3>
                            <Separator className="flex-1 ml-2" />
                          </div>
                          <div className="space-y-3 pl-0">
                            {todosForDate.map((todo) => (
                              <TodoItem
                                key={todo.id}
                                todo={todo}
                                onComplete={handleCompleteTodo}
                                onDelete={handleDeleteTodo}
                                onEdit={handleEditTodo}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks</CardTitle>
                <CardDescription>
                  {completedTodos.length} completed task(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedTodos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <CheckCircle size={48} strokeWidth={1} className="mb-2" />
                    <p>No completed tasks yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onComplete={handleCompleteTodo}
                        onDelete={handleDeleteTodo}
                        onEdit={handleEditTodo}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Todo Form Dialog */}
      <TodoForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTodo(undefined);
        }}
        onSave={handleSaveTodo}
        editTodo={editTodo}
      />
    </div>
  );
}
