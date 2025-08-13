import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Check, X, Zap } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { PremiumBackgroundElements } from '../PremiumBackgroundElements';
import { User, Task } from '../../utils/appTypes';

interface DailyTasksInterfaceProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export function DailyTasksInterface({ user, onBack, onUpdateUser }: DailyTasksInterfaceProps) {
  const [tasks, setTasks] = useState<Task[]>(user.tasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      createdAt: new Date(),
      priority: 'medium'
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    onUpdateUser({ ...user, tasks: updatedTasks });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    onUpdateUser({ ...user, tasks: updatedTasks });
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    onUpdateUser({ ...user, tasks: updatedTasks });
  };

  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-background flex flex-col"
    >
      <PremiumBackgroundElements />
      
      {/* Premium Header */}
      <motion.div 
        className="akilii-glass-premium premium-spacing-lg border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent flex items-center justify-center transition-premium hover-lift"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-foreground">Daily Tasks</h1>
            <p className="text-base text-muted-foreground">
              {completedTasks} of {tasks.length} completed
            </p>
          </div>
          <ThemeToggle size="md" />
          <motion.button
            onClick={() => setShowAddTask(true)}
            className="w-12 h-12 rounded-2xl akilii-gradient-animated-button text-primary-foreground flex items-center justify-center hover-lift transition-premium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </div>
      </motion.div>

      {/* Premium Tasks */}
      <div className="flex-1 premium-spacing-lg space-y-4">
        {/* Add Task Modal */}
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="akilii-glass-premium premium-spacing-lg rounded-3xl border border-border mb-6"
          >
            <h3 className="text-foreground font-bold text-lg mb-4">Add New Task</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Enter task title..."
                className="flex-1 input-responsive akilii-glass border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-premium"
                autoFocus
              />
              <motion.button
                onClick={addTask}
                className="btn-responsive akilii-gradient-animated-button text-primary-foreground hover-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={() => setShowAddTask(false)}
                className="btn-responsive bg-muted text-muted-foreground hover:bg-accent hover-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {tasks.length === 0 ? (
          <motion.div 
            className="text-center premium-spacing-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-foreground mb-4">No tasks yet</h3>
            <p className="text-lg text-muted-foreground mb-8">Add your first task to get started!</p>
            <motion.button
              onClick={() => setShowAddTask(true)}
              className="btn-responsive akilii-gradient-animated-button text-primary-foreground font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Task
            </motion.button>
          </motion.div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
              className={`premium-spacing-lg rounded-3xl border-2 transition-premium ${
                task.completed
                  ? 'bg-accent/50 border-accent opacity-75'
                  : 'akilii-glass border-border hover:akilii-glass-elevated hover-lift'
              }`}
            >
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => toggleTask(task.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-premium ${
                    task.completed
                      ? 'akilii-gradient-animated-button border-primary'
                      : 'border-muted-foreground hover:border-primary'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {task.completed && <Check className="h-4 w-4 text-primary-foreground" />}
                </motion.button>
                <div className="flex-1">
                  <h4 className={`font-bold text-lg transition-premium ${
                    task.completed 
                      ? 'text-muted-foreground line-through' 
                      : 'text-foreground'
                  }`}>
                    {task.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Created {task.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <motion.button
                  onClick={() => deleteTask(task.id)}
                  className="w-8 h-8 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 flex items-center justify-center transition-premium"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}