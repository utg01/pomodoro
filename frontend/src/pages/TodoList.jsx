import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Calendar, Flag, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { getTodos, saveTodo, updateTodo, deleteTodo as deleteTodoFirebase, subscribeToTodos } from '../utils/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const TodoList = () => {
  const { toast } = useToast();
  const { user } = useAuth();
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
    if (!user) return;
    
    // Subscribe to real-time todos updates
    const unsubscribe = subscribeToTodos((updatedTodos) => {
      setTodos(updatedTodos);
    });
    
    return () => unsubscribe();
  }, [user]);

  const addTodo = async () => {
    if (!newTodo.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }

    try {
      const todo = {
        id: `todo_${Date.now()}`,
        ...newTodo,
        completed: false,
        createdAt: new Date().toISOString()
      };

      await saveTodo(todo);

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
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      });
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        await updateTodo(id, { completed: !todo.completed });
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteTodoFirebase(id);
      
      toast({
        title: "Deleted",
        description: "Task removed successfully"
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'study': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'work': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'personal': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'other': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
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
    <div className="p-4 sm:p-6 md:p-8 relative z-0">
      <Toaster />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">Tasks</h1>
            <p className="text-gray-400 font-mono text-xs sm:text-sm">Organize your workflow</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0 shadow-lg shadow-cyan-500/30">
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#13131a] border-[#22d3ee]/20">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about your task"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Category</Label>
                    <Select
                      value={newTodo.category}
                      onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}
                    >
                      <SelectTrigger className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#13131a] border-[#22d3ee]/20">
                        <SelectItem value="study" className="text-white">Study</SelectItem>
                        <SelectItem value="work" className="text-white">Work</SelectItem>
                        <SelectItem value="personal" className="text-white">Personal</SelectItem>
                        <SelectItem value="other" className="text-white">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Priority</Label>
                    <Select
                      value={newTodo.priority}
                      onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}
                    >
                      <SelectTrigger className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#13131a] border-[#22d3ee]/20">
                        <SelectItem value="high" className="text-white">High</SelectItem>
                        <SelectItem value="medium" className="text-white">Medium</SelectItem>
                        <SelectItem value="low" className="text-white">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                    className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white"
                  />
                </div>
                
                <Button onClick={addTodo} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-5 mb-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-400 font-mono">FILTERS</span>
            </div>
            <div className="flex gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterCategory(cat)}
                  className={`font-mono ${
                    filterCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      : 'bg-[#1a1a24] text-gray-400 border-[#22d3ee]/10 hover:border-[#22d3ee]/30'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
            <div className="h-6 w-px bg-[#22d3ee]/20"></div>
            <div className="flex gap-2">
              {priorities.map(pri => (
                <Button
                  key={pri}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterPriority(pri)}
                  className={`font-mono ${
                    filterPriority === pri
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      : 'bg-[#1a1a24] text-gray-400 border-[#22d3ee]/10 hover:border-[#22d3ee]/30'
                  }`}
                >
                  {pri.charAt(0).toUpperCase() + pri.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Task Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
            <p className="text-sm text-gray-400 font-mono mb-1">TOTAL</p>
            <p className="text-3xl font-bold text-white">{todos.length}</p>
          </Card>
          <Card className="p-4 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
            <p className="text-sm text-gray-400 font-mono mb-1">COMPLETED</p>
            <p className="text-3xl font-bold text-green-400">{todos.filter(t => t.completed).length}</p>
          </Card>
          <Card className="p-4 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
            <p className="text-sm text-gray-400 font-mono mb-1">PENDING</p>
            <p className="text-3xl font-bold text-amber-400">{todos.filter(t => !t.completed).length}</p>
          </Card>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <Card className="p-12 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 text-center">
              <p className="text-gray-500 text-lg font-mono">No tasks found</p>
            </Card>
          ) : (
            filteredTodos.map(todo => (
              <Card
                key={todo.id}
                className={`p-5 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 hover:border-[#22d3ee]/40 transition-all ${
                  todo.completed ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500 border-transparent'
                        : 'border-[#22d3ee]/30 hover:border-[#22d3ee]/60'
                    }`}
                  >
                    {todo.completed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold text-white mb-1 ${
                      todo.completed ? 'line-through text-gray-500' : ''
                    }`}>
                      {todo.title}
                    </h3>
                    
                    {todo.description && (
                      <p className="text-gray-400 text-sm mb-3 font-mono">{todo.description}</p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono border ${getCategoryColor(todo.category)}`}>
                        {todo.category}
                      </span>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1 border ${getPriorityColor(todo.priority)}`}>
                        <Flag className="w-3 h-3" />
                        {todo.priority}
                      </span>
                      
                      {todo.dueDate && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
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
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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