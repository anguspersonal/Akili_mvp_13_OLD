import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  CheckCircle, 
  Circle, 
  Edit, 
  Trash2,
  BookOpen,
  Heart,
  Brain,
  Lightbulb,
  Star,
  Zap
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  estimatedTime?: string;
  category: string;
  dueDate?: Date;
}

interface JournalEntry {
  id: string;
  date: Date;
  mood: number;
  energy: number;
  productivity: number;
  content: string;
  highlights: string[];
  challenges: string[];
}

interface PlanningJournalProps {
  userRole: string;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200"
};

const moodEmojis = ["😔", "😕", "😐", "🙂", "😊", "😄", "🤩"];

export const PlanningJournal: React.FC<PlanningJournalProps> = ({ userRole }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Review board presentation",
      description: "Finalize slides for quarterly board meeting",
      completed: false,
      priority: "high",
      estimatedTime: "2 hours",
      category: "Strategic",
      dueDate: new Date()
    },
    {
      id: "2",
      title: "Team check-in",
      description: "1:1 meetings with co-founders",
      completed: true,
      priority: "medium",
      estimatedTime: "1 hour",
      category: "Team",
      dueDate: new Date()
    }
  ]);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    estimatedTime: "",
    category: "General"
  });
  
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: new Date(),
      mood: 4,
      energy: 3,
      productivity: 4,
      content: "Had a productive strategy session today. The team is aligned on our Q4 goals.",
      highlights: ["Successful team alignment", "Clear Q4 roadmap"],
      challenges: ["Time management with back-to-back meetings"]
    }
  ]);

  const [currentJournal, setCurrentJournal] = useState({
    mood: 3,
    energy: 3,
    productivity: 3,
    content: "",
    highlights: [""],
    challenges: [""]
  });

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      estimatedTime: newTask.estimatedTime,
      category: newTask.category,
      dueDate: selectedDate
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      estimatedTime: "",
      category: "General"
    });
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const saveJournalEntry = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      mood: currentJournal.mood,
      energy: currentJournal.energy,
      productivity: currentJournal.productivity,
      content: currentJournal.content,
      highlights: currentJournal.highlights.filter(h => h.trim()),
      challenges: currentJournal.challenges.filter(c => c.trim())
    };

    setJournalEntries(prev => [...prev, entry]);
    setCurrentJournal({
      mood: 3,
      energy: 3,
      productivity: 3,
      content: "",
      highlights: [""],
      challenges: [""]
    });
  };

  const TaskItem: React.FC<{ task: Task; index: number }> = ({ task, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl p-4 space-y-3 hover:scale-105 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleTask(task.id)}
          className="mt-0.5 p-0 h-auto"
        >
          {task.completed ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
        
        <div className="flex-1">
          <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Badge className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            {task.estimatedTime && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedTime}
              </Badge>
            )}
            <Badge variant="secondary">{task.category}</Badge>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const RatingScale: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ label, value, onChange, icon: Icon, color }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <label className="text-sm font-medium">{label}</label>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Button
            key={rating}
            variant={value >= rating ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(rating)}
            className="w-8 h-8 p-0"
          >
            {rating}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold mb-2">Planning & Reflection</h1>
        <p className="text-muted-foreground">
          Organize your thoughts, plan your day, and reflect on your progress.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="planning" className="space-y-6">
            <TabsList className="bg-white/20 backdrop-blur-md border border-white/30 w-full">
              <TabsTrigger value="planning" className="flex-1 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Planning
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex-1 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Journal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planning" className="space-y-6">
              {/* Add New Task */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add New Task
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white/20 backdrop-blur-md border border-white/30"
                      />
                      <Input
                        placeholder="Estimated time"
                        value={newTask.estimatedTime}
                        onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: e.target.value }))}
                        className="bg-white/20 backdrop-blur-md border border-white/30"
                      />
                    </div>
                    <Textarea
                      placeholder="Task description (optional)"
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white/20 backdrop-blur-md border border-white/30"
                    />
                    <div className="flex gap-4">
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="px-3 py-2 border rounded-md bg-white/20 backdrop-blur-md border-white/30"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      <Button onClick={addTask} className="bg-gradient-to-r from-blue-500 to-purple-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tasks List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle>Today's Tasks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tasks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No tasks yet. Add your first task above!
                      </p>
                    ) : (
                      tasks.map((task, index) => (
                        <TaskItem key={task.id} task={task} index={index} />
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="journal" className="space-y-6">
              {/* Mood & Energy Tracking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Daily Check-in
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <RatingScale
                        label="Mood"
                        value={currentJournal.mood}
                        onChange={(value) => setCurrentJournal(prev => ({ ...prev, mood: value }))}
                        icon={Heart}
                        color="text-pink-500"
                      />
                      <RatingScale
                        label="Energy"
                        value={currentJournal.energy}
                        onChange={(value) => setCurrentJournal(prev => ({ ...prev, energy: value }))}
                        icon={Zap}
                        color="text-yellow-500"
                      />
                      <RatingScale
                        label="Productivity"
                        value={currentJournal.productivity}
                        onChange={(value) => setCurrentJournal(prev => ({ ...prev, productivity: value }))}
                        icon={Target}
                        color="text-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reflection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Reflection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="How was your day? What did you learn or accomplish?"
                      value={currentJournal.content}
                      onChange={(e) => setCurrentJournal(prev => ({ ...prev, content: e.target.value }))}
                      className="bg-white/20 backdrop-blur-md border border-white/30 min-h-[100px]"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Highlights
                        </label>
                        {currentJournal.highlights.map((highlight, index) => (
                          <Input
                            key={index}
                            placeholder="What went well today?"
                            value={highlight}
                            onChange={(e) => {
                              const newHighlights = [...currentJournal.highlights];
                              newHighlights[index] = e.target.value;
                              setCurrentJournal(prev => ({ ...prev, highlights: newHighlights }));
                            }}
                            className="bg-white/20 backdrop-blur-md border border-white/30 mb-2"
                          />
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentJournal(prev => ({
                            ...prev,
                            highlights: [...prev.highlights, ""]
                          }))}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add highlight
                        </Button>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-orange-500" />
                          Challenges
                        </label>
                        {currentJournal.challenges.map((challenge, index) => (
                          <Input
                            key={index}
                            placeholder="What was challenging?"
                            value={challenge}
                            onChange={(e) => {
                              const newChallenges = [...currentJournal.challenges];
                              newChallenges[index] = e.target.value;
                              setCurrentJournal(prev => ({ ...prev, challenges: newChallenges }));
                            }}
                            className="bg-white/20 backdrop-blur-md border border-white/30 mb-2"
                          />
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentJournal(prev => ({
                            ...prev,
                            challenges: [...prev.challenges, ""]
                          }))}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add challenge
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={saveJournalEntry}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      Save Journal Entry
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};