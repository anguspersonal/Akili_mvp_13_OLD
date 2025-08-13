import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Check, X, Sparkles, Brain, Target, Calendar, Clock, Star, Zap, Trash2, Edit3, MoreVertical } from 'lucide-react';
import { AnimatedAkiliiLogo } from '../AnimatedAkiliiLogo';
import { ThemeToggle } from '../ThemeToggle';
import { PremiumBackgroundElements } from '../PremiumBackgroundElements';
import { AuthUser, NPRUserProfile, NPRTask } from '../../utils/nprTypes';
import { nprService } from '../../utils/nprService';

interface NPRDailyTasksInterfaceProps {
  user: AuthUser;
  nprProfile: NPRUserProfile;
  onBack: () => void;
}

export function NPRDailyTasksInterface({ user, nprProfile, onBack }: NPRDailyTasksInterfaceProps) {
  const [tasks, setTasks] = useState<NPRTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const result = await nprService.getTasks(user.id);
      if (result.success && result.tasks) {
        setTasks(result.tasks);
      }
    } catch (error) {
      console.error('Load tasks error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskText.trim()) return;

    try {
      const result = await nprService.createTask(newTaskText.trim());
      if (result.success && result.task) {
        setTasks(prev => [result.task!, ...prev]);
        setNewTaskText('');
        setIsAddingTask(false);
      }
    } catch (error) {
      console.error('Create task error:', error);
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const result = await nprService.updateTaskCompletion(taskId, isCompleted);
      if (result.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, is_completed: isCompleted } : task
        ));
      }
    } catch (error) {
      console.error('Toggle task error:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await nprService.deleteTask(taskId);
      if (result.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const handleGenerateAITask = async () => {
    setIsGenerating(true);
    try {
      const result = await nprService.generateFirstTask();
      if (result.success && result.task) {
        setTasks(prev => [result.task!, ...prev]);
      }
    } catch (error) {
      console.error('Generate AI task error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeTasks = tasks.filter(task => !task.is_completed);
  const completedTasks = tasks.filter(task => task.is_completed);
  const aiTasks = tasks.filter(task => task.is_ai_generated);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative">
      <PremiumBackgroundElements />
      
      {/* Premium Header */}
      <motion.header 
        className="akilii-glass-premium border-b border-border/20 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={onBack}
                className="w-12 h-12 rounded-2xl akilii-glass-elevated flex items-center justify-center hover:akilii-glass-premium transition-all duration-300 group"
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
              </motion.button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div
                    className="w-12 h-12 rounded-2xl akilii-gradient-animated-button flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                  
                  {/* Active tasks indicator */}
                  {activeTasks.length > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-xs font-bold text-primary-foreground">{activeTasks.length}</span>
                    </motion.div>
                  )}
                </div>
                
                <div>
                  <h1 className="font-black text-xl text-foreground">Daily Tasks</h1>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-primary" />
                    <p className="text-sm akilii-two-tone-text-subtle">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <AnimatedAkiliiLogo size="sm" animated={true} />
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        
        {/* Stats Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: 'Total Tasks',
                value: tasks.length,
                icon: Target,
                color: 'from-blue-500/20 to-purple-500/20',
                textColor: 'text-blue-500'
              },
              {
                label: 'Completed',
                value: completedTasks.length,
                icon: Check,
                color: 'from-green-500/20 to-emerald-500/20',
                textColor: 'text-green-500'
              },
              {
                label: 'AI Generated',
                value: aiTasks.length,
                icon: Sparkles,
                color: 'from-yellow-500/20 to-orange-500/20',
                textColor: 'text-yellow-500'
              },
              {
                label: 'Completion',
                value: `${completionRate}%`,
                icon: Star,
                color: 'from-pink-500/20 to-red-500/20',
                textColor: 'text-pink-500'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
                className="akilii-glass-premium p-6 rounded-2xl border border-border/30 hover:border-primary/30 transition-all duration-300 group"
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                
                <motion.div 
                  className="text-2xl font-black text-foreground mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-xs akilii-two-tone-text-subtle font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Action Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            <motion.button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-3 px-6 py-4 akilii-glass-premium rounded-2xl border border-border/30 hover:akilii-glass-elevated hover:border-primary/30 transition-all duration-300 group"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                Add Task
              </span>
            </motion.button>

            <motion.button
              onClick={handleGenerateAITask}
              disabled={isGenerating}
              className="flex items-center gap-3 px-6 py-4 akilii-gradient-animated-button text-primary-foreground rounded-2xl disabled:opacity-50 transition-all duration-300 group relative overflow-hidden"
              whileHover={{ scale: isGenerating ? 1 : 1.02, y: isGenerating ? 0 : -1 }}
              whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            >
              <div className="flex items-center gap-3 relative z-10">
                {isGenerating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {isGenerating ? 'Generating...' : 'AI Task'}
                </span>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:translate-x-full"
                   style={{ left: '-100%' }} />
            </motion.button>
          </div>
        </motion.section>

        {/* Add Task Form */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.section
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-8 overflow-hidden"
            >
              <div className="akilii-glass-premium p-6 rounded-2xl border border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl akilii-gradient-animated-button flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground">Create New Task</h3>
                </div>
                
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="What would you like to accomplish?"
                    className="flex-1 px-4 py-3 akilii-glass border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                  />
                  
                  <motion.button
                    onClick={handleCreateTask}
                    disabled={!newTaskText.trim()}
                    className="px-6 py-3 akilii-gradient-animated-button text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    whileHover={{ scale: newTaskText.trim() ? 1.05 : 1 }}
                    whileTap={{ scale: newTaskText.trim() ? 0.95 : 1 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskText('');
                    }}
                    className="px-6 py-3 akilii-glass-elevated border border-border/50 rounded-xl hover:akilii-glass-premium transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Tasks Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Tasks */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="akilii-glass-premium p-6 rounded-3xl border border-border/30 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Active Tasks</h2>
                  <p className="text-sm akilii-two-tone-text-subtle">{activeTasks.length} pending</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {activeTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="group akilii-glass-elevated p-4 rounded-2xl border border-border/30 hover:akilii-glass-premium hover:border-primary/30 transition-all duration-300"
                      whileHover={{ y: -1, scale: 1.01 }}
                    >
                      <div className="flex items-start gap-4">
                        <motion.button
                          onClick={() => handleToggleTask(task.id, true)}
                          className="w-6 h-6 rounded-xl border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 flex items-center justify-center group"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Check className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </motion.button>
                        
                        <div className="flex-1">
                          <p className="text-foreground leading-relaxed">
                            {task.task_text}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {task.is_ai_generated && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10">
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-yellow-500 font-medium">AI</span>
                              </div>
                            )}
                            <span className="text-xs akilii-two-tone-text-subtle">
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {activeTasks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <p className="akilii-two-tone-text-subtle mb-2">No active tasks</p>
                    <p className="text-xs akilii-two-tone-text-subtle">
                      Create a task or generate one with AI
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Completed Tasks */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="akilii-glass-premium p-6 rounded-3xl border border-border/30 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Completed</h2>
                  <p className="text-sm akilii-two-tone-text-subtle">{completedTasks.length} done</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {completedTasks.slice(0, 10).map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="group akilii-glass-elevated p-4 rounded-2xl border border-border/30 hover:akilii-glass-premium transition-all duration-300 opacity-60 hover:opacity-100"
                    >
                      <div className="flex items-start gap-4">
                        <motion.button
                          onClick={() => handleToggleTask(task.id, false)}
                          className="w-6 h-6 rounded-xl bg-green-500 border-2 border-green-500 transition-all duration-300 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Check className="h-3 w-3 text-white" />
                        </motion.button>
                        
                        <div className="flex-1">
                          <p className="text-foreground leading-relaxed line-through">
                            {task.task_text}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {task.is_ai_generated && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10">
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-yellow-500 font-medium">AI</span>
                              </div>
                            )}
                            <span className="text-xs akilii-two-tone-text-subtle">
                              Completed {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {completedTasks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="akilii-two-tone-text-subtle mb-2">No completed tasks yet</p>
                    <p className="text-xs akilii-two-tone-text-subtle">
                      Complete some tasks to see them here
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}