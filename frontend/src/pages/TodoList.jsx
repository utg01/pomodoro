import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Calendar, Flag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { getStorageData, saveStorageData } from '../utils/storage';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const TodoList = () => {
  const { toast } = useToast();
  const [todos, setTodos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    category: 'study',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = () => {
    const savedTodos = getStorageData('todos') || [];
    setTodos(savedTodos);
  };

  const addTodo = () => {
    if (!newTodo.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }

    const todo = {
      id: Date.now(),
      ...newTodo,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedTodos = [...todos, todo];
    setTodos(updatedTodos);
    saveStorageData('todos', updatedTodos);

    setNewTodo({
      title: '',
      description: '',
      category: 'study',
      priority: 'medium',
      dueDate: ''
    });
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: "Task added successfully"
    });
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveStorageData('todos', updatedTodos);
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    saveStorageData('todos', updatedTodos);
    
    toast({
      title: "Deleted",
      description: "Task removed successfully"
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'study': return 'bg-emerald-100 text-emerald-700';
      case 'work': return 'bg-blue-100 text-blue-700';
      case 'personal': return 'bg-purple-100 text-purple-700';
      case 'other': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredTodos = todos.filter(todo => {
    const categoryMatch = filterCategory === 'all' || todo.category === filterCategory;
    const priorityMatch = filterPriority === 'all' || todo.priority === filterPriority;
    return categoryMatch && priorityMatch;
  });

  const categories = ['all', 'study', 'work', 'personal', 'other'];
  const priorities = ['all', 'high', 'medium', 'low'];

  return (
    <div className="p-8">
      <Toaster />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Tasks</h1>
            <p className="text-slate-500">Manage your study and work tasks</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about your task"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newTodo.category}
                      onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="study">Study</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newTodo.priority}
                      onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <Button onClick={addTodo} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6 bg-white border-slate-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-xs text-slate-500 mb-2 block">Category</Label>
              <div className="flex gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={filterCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(cat)}
                    className={filterCategory === cat ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <Label className="text-xs text-slate-500 mb-2 block">Priority</Label>
              <div className="flex gap-2">
                {priorities.map(pri => (
                  <Button
                    key={pri}
                    variant={filterPriority === pri ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterPriority(pri)}
                    className={filterPriority === pri ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Task Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white border-slate-200">
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-800">{todos.length}</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{todos.filter(t => t.completed).length}</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{todos.filter(t => !t.completed).length}</p>
          </Card>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <Card className="p-12 bg-white border-slate-200 text-center">
              <p className="text-slate-400 text-lg">No tasks found. Create your first task to get started!</p>
            </Card>
          ) : (
            filteredTodos.map(todo => (
              <Card
                key={todo.id}
                className={`p-5 bg-white border-slate-200 hover:shadow-md transition-shadow ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'border-slate-300 hover:border-emerald-600'
                    }`}
                  >
                    {todo.completed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold text-slate-800 mb-1 ${
                      todo.completed ? 'line-through' : ''
                    }`}>
                      {todo.title}
                    </h3>
                    
                    {todo.description && (
                      <p className="text-slate-600 text-sm mb-3">{todo.description}</p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(todo.category)}`}>
                        {todo.category}
                      </span>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
                        <Flag className="w-3 h-3" />
                        {todo.priority}
                      </span>
                      
                      {todo.dueDate && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;