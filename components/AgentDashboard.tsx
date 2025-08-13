import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { AkiliiBrand } from "./AkiliiBrand";
import { RobotMascot } from "./AkiliiLogo";
import {
  Bot,
  Brain,
  Shield,
  MessageSquare,
  User,
  FileText,
  Calendar,
  Search,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Settings,
  Activity,
  Target,
  Users,
  BookOpen,
  Briefcase,
  PieChart,
  BarChart3,
  LineChart,
  Cpu,
  Network,
  Layers,
  GitBranch,
  Workflow
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: "core" | "persona";
  status: "active" | "idle" | "processing" | "error";
  description: string;
  icon: any;
  metrics: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
  };
  lastActivity: Date;
  capabilities: string[];
}

interface DataSchema {
  id: string;
  name: string;
  type: "pitch_deck" | "compliance" | "technical_roadmap" | "lesson_plan" | "report_template";
  description: string;
  fields: number;
  lastUpdated: Date;
  usage: number;
}

interface ErrorStatus {
  id: string;
  message: string;
  type: "warning" | "error" | "info";
  timestamp: Date;
  resolved: boolean;
}

const coreAgents: Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator Agent",
    type: "core",
    status: "active",
    description: "Central coordination and task routing for all agent interactions",
    icon: Workflow,
    metrics: { tasksCompleted: 1247, successRate: 98.2, avgResponseTime: 0.34 },
    lastActivity: new Date(Date.now() - 2 * 60 * 1000),
    capabilities: ["Task Routing", "Load Balancing", "Priority Management", "Conflict Resolution"]
  },
  {
    id: "socratic",
    name: "Socratic Dialogue Agent",
    type: "core", 
    status: "active",
    description: "Facilitates learning through guided questioning and critical thinking",
    icon: MessageSquare,
    metrics: { tasksCompleted: 892, successRate: 95.7, avgResponseTime: 0.89 },
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    capabilities: ["Guided Learning", "Question Generation", "Critical Analysis", "Reflection Prompting"]
  },
  {
    id: "profile_memory",
    name: "Profile & Memory Agent",
    type: "core",
    status: "processing",
    description: "Manages user profiles, preferences, and contextual memory across sessions",
    icon: User,
    metrics: { tasksCompleted: 2156, successRate: 99.1, avgResponseTime: 0.12 },
    lastActivity: new Date(Date.now() - 1 * 60 * 1000),
    capabilities: ["Profile Management", "Context Retention", "Preference Learning", "Personalization"]
  },
  {
    id: "security",
    name: "Security Agent",
    type: "core",
    status: "active",
    description: "Ensures data privacy, compliance, and secure communications",
    icon: Shield,
    metrics: { tasksCompleted: 3421, successRate: 99.8, avgResponseTime: 0.05 },
    lastActivity: new Date(Date.now() - 30 * 1000),
    capabilities: ["Data Encryption", "Access Control", "Threat Detection", "Compliance Monitoring"]
  }
];

const personaAgents: Agent[] = [
  {
    id: "executive_planning",
    name: "Executive Planning Agent",
    type: "persona",
    status: "active",
    description: "Manages high-level scheduling and protects deep work time for executives",
    icon: Calendar,
    metrics: { tasksCompleted: 156, successRate: 94.3, avgResponseTime: 0.67 },
    lastActivity: new Date(Date.now() - 15 * 60 * 1000),
    capabilities: ["Schedule Optimization", "Deep Work Protection", "Meeting Management", "Priority Blocking"]
  },
  {
    id: "document_summarization",
    name: "Document Summarisation Agent",
    type: "persona",
    status: "processing",
    description: "Ingests meeting agendas and reports, extracts key points and action items",
    icon: FileText,
    metrics: { tasksCompleted: 423, successRate: 96.8, avgResponseTime: 1.23 },
    lastActivity: new Date(Date.now() - 3 * 60 * 1000),
    capabilities: ["Document Analysis", "Key Point Extraction", "Action Item Identification", "Summary Generation"]
  },
  {
    id: "strategic_query",
    name: "Strategic Query Agent",
    type: "persona",
    status: "idle",
    description: "Answers high-level questions about pilot progress by querying KPI databases",
    icon: Search,
    metrics: { tasksCompleted: 89, successRate: 98.9, avgResponseTime: 0.45 },
    lastActivity: new Date(Date.now() - 45 * 60 * 1000),
    capabilities: ["KPI Analysis", "Progress Reporting", "Trend Analysis", "Strategic Insights"]
  },
  {
    id: "impact_reporting",
    name: "Impact Reporting Agent",
    type: "persona",
    status: "active",
    description: "Ingests pilot KPI data and drafts compelling narrative sections for reports",
    icon: TrendingUp,
    metrics: { tasksCompleted: 67, successRate: 97.1, avgResponseTime: 2.14 },
    lastActivity: new Date(Date.now() - 8 * 60 * 1000),
    capabilities: ["Data Visualization", "Narrative Generation", "Stakeholder Communication", "Impact Measurement"]
  }
];

const dataSchemas: DataSchema[] = [
  {
    id: "pitch_deck_schema",
    name: "Pitch Deck Structure",
    type: "pitch_deck",
    description: "Standardized format for startup pitch presentations with market analysis",
    fields: 12,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    usage: 89
  },
  {
    id: "compliance_checklist",
    name: "Compliance Checklist Framework", 
    type: "compliance",
    description: "Regulatory compliance verification system for educational technology",
    fields: 28,
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    usage: 156
  },
  {
    id: "technical_roadmap",
    name: "Technical Roadmap Template",
    type: "technical_roadmap", 
    description: "Development milestone tracking and resource allocation planning",
    fields: 18,
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    usage: 203
  },
  {
    id: "lesson_plan_schema",
    name: "Lesson Plan Structure",
    type: "lesson_plan",
    description: "Educational content organization with learning objectives and assessments",
    fields: 15,
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    usage: 478
  }
];

const systemErrors: ErrorStatus[] = [
  {
    id: "api_latency",
    message: "LLM API response times elevated (avg 2.3s vs 1.1s baseline)",
    type: "warning",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    resolved: false
  },
  {
    id: "vector_db_sync",
    message: "Vector database synchronization completed successfully",
    type: "info", 
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    resolved: true
  }
];

interface AgentDashboardProps {
  userRole: string;
  userName: string;
}

export function AgentDashboard({ userRole, userName }: AgentDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [systemHealth, setSystemHealth] = useState(97.3);
  const [processingTasks, setProcessingTasks] = useState(12);

  const allAgents = [...coreAgents, ...personaAgents];
  const activeAgents = allAgents.filter(agent => agent.status === "active" || agent.status === "processing");
  const unresolvedErrors = systemErrors.filter(error => !error.resolved);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      setProcessingTasks(prev => Math.max(0, Math.min(25, prev + Math.floor((Math.random() - 0.5) * 4))));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400 border-green-400/30 bg-green-500/20";
      case "processing": return "text-blue-400 border-blue-400/30 bg-blue-500/20";
      case "idle": return "text-yellow-400 border-yellow-400/30 bg-yellow-500/20";
      case "error": return "text-red-400 border-red-400/30 bg-red-500/20";
      default: return "text-gray-400 border-gray-400/30 bg-gray-500/20";
    }
  };

  const getSchemaIcon = (type: string) => {
    switch (type) {
      case "pitch_deck": return Briefcase;
      case "compliance": return Shield;
      case "technical_roadmap": return GitBranch;
      case "lesson_plan": return BookOpen;
      default: return FileText;
    }
  };

  return (
    <div className="p-6 space-y-6 responsive-container">

      {/* System Health Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 akilii-gradient-primary rounded-2xl flex items-center justify-center">
              <Network className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-white mb-1">
              Agent Orchestration Hub
            </h1>
            <p className="text-white/80 text-fit">
              Real-time monitoring and management of <AkiliiBrand size="sm" inline /> AI agent swarms
            </p>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{systemHealth.toFixed(1)}%</div>
            <div className="text-xs text-white/60">System Health</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{activeAgents.length}</div>
            <div className="text-xs text-white/60">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{processingTasks}</div>
            <div className="text-xs text-white/60">Processing</div>
          </div>
        </div>
      </motion.div>

      {/* Error Status Bar */}
      {unresolvedErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          {unresolvedErrors.map((error) => (
            <Alert 
              key={error.id} 
              className={`akilii-glass border ${
                error.type === "warning" ? "border-yellow-400/30" : "border-red-400/30"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-white">
                <span className="font-medium">System Notice:</span> {error.message}
                <span className="text-white/60 ml-2">• {formatTimeAgo(error.timestamp)}</span>
              </AlertDescription>
            </Alert>
          ))}
        </motion.div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="akilii-glass border border-white/20 p-1">
          <TabsTrigger value="overview" className="text-white data-[state=active]:akilii-gradient-primary">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="agents" className="text-white data-[state=active]:akilii-gradient-primary">
            <Bot className="h-4 w-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="schemas" className="text-white data-[state=active]:akilii-gradient-primary">
            <Database className="h-4 w-4 mr-2" />
            Data Schemas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:akilii-gradient-primary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Core Agents Status */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <Cpu className="h-5 w-5" />
                  Core Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coreAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <agent.icon className="h-4 w-4 text-white/80 flex-shrink-0" />
                      <span className="text-white text-fit-sm text-truncate">{agent.name}</span>
                    </div>
                    <Badge className={`${getStatusColor(agent.status)} badge-text-fit`}>
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Persona Agents Status */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <Users className="h-5 w-5" />
                  Persona Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {personaAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <agent.icon className="h-4 w-4 text-white/80 flex-shrink-0" />
                      <span className="text-white text-fit-sm text-truncate">{agent.name}</span>
                    </div>
                    <Badge className={`${getStatusColor(agent.status)} badge-text-fit`}>
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* System Performance */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-fit-sm">
                    <span className="text-white/80">System Health</span>
                    <span className="text-green-400 font-medium">{systemHealth.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth} className="h-2 bg-white/10" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-fit-sm">
                    <span className="text-white/80">Agent Utilization</span>
                    <span className="text-blue-400 font-medium">73.2%</span>
                  </div>
                  <Progress value={73.2} className="h-2 bg-white/10" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-fit-sm">
                    <span className="text-white/80">Response Quality</span>
                    <span className="text-yellow-400 font-medium">96.8%</span>
                  </div>
                  <Progress value={96.8} className="h-2 bg-white/10" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="akilii-glass-elevated border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                <Clock className="h-5 w-5" />
                Recent Agent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allAgents
                  .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
                  .slice(0, 6)
                  .map((agent) => (
                    <div key={agent.id} className="flex items-center gap-3 p-3 akilii-glass rounded-lg">
                      <agent.icon className="h-5 w-5 text-white/80 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-fit-sm text-truncate">
                          {agent.name}
                        </div>
                        <div className="text-white/60 text-xs text-truncate">
                          {agent.description}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge className={`${getStatusColor(agent.status)} badge-text-fit mb-1`}>
                          {agent.status}
                        </Badge>
                        <div className="text-white/60 text-xs">
                          {formatTimeAgo(agent.lastActivity)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {allAgents.map((agent) => (
              <motion.div
                key={agent.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  className={`akilii-glass-elevated border-white/20 cursor-pointer transition-all duration-200 ${
                    selectedAgent?.id === agent.id ? 'border-blue-400/50 bg-blue-500/10' : ''
                  }`}
                  onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                >
                  <CardContent className="p-6 space-y-4">
                    
                    {/* Agent Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 akilii-gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                          <agent.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-semibold text-fit text-truncate">
                            {agent.name}
                          </h3>
                          <Badge className={`${getStatusColor(agent.status)} badge-text-fit mt-1`}>
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="text-white/60 text-xs">
                          {formatTimeAgo(agent.lastActivity)}
                        </div>
                      </div>
                    </div>

                    {/* Agent Description */}
                    <p className="text-white/80 text-fit-sm leading-relaxed">
                      {agent.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 akilii-glass rounded-lg">
                        <div className="text-green-400 font-bold text-fit">{agent.metrics.tasksCompleted}</div>
                        <div className="text-white/60 text-xs">Tasks</div>
                      </div>
                      <div className="text-center p-2 akilii-glass rounded-lg">
                        <div className="text-blue-400 font-bold text-fit">{agent.metrics.successRate}%</div>
                        <div className="text-white/60 text-xs">Success</div>
                      </div>
                      <div className="text-center p-2 akilii-glass rounded-lg">
                        <div className="text-yellow-400 font-bold text-fit">{agent.metrics.avgResponseTime}s</div>
                        <div className="text-white/60 text-xs">Response</div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedAgent?.id === agent.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-3 border-t border-white/10"
                        >
                          <div>
                            <h4 className="text-white font-medium text-fit-sm mb-2">Capabilities</h4>
                            <div className="flex flex-wrap gap-2">
                              {agent.capabilities.map((capability, idx) => (
                                <Badge key={idx} className="bg-white/10 text-white border-white/20 badge-text-fit">
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Data Schemas Tab */}
        <TabsContent value="schemas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataSchemas.map((schema) => {
              const SchemaIcon = getSchemaIcon(schema.type);
              return (
                <Card key={schema.id} className="akilii-glass-elevated border-white/20">
                  <CardContent className="p-6 space-y-4">
                    
                    {/* Schema Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 akilii-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                        <SchemaIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold text-fit text-truncate">
                          {schema.name}
                        </h3>
                        <p className="text-white/80 text-fit-sm mt-1 leading-relaxed">
                          {schema.description}
                        </p>
                      </div>
                    </div>

                    {/* Schema Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 akilii-glass rounded-lg">
                        <div className="text-blue-400 font-bold text-fit">{schema.fields}</div>
                        <div className="text-white/60 text-xs">Fields</div>
                      </div>
                      <div className="text-center p-2 akilii-glass rounded-lg">
                        <div className="text-green-400 font-bold text-fit">{schema.usage}</div>
                        <div className="text-white/60 text-xs">Uses</div>
                      </div>
                      <div className="text-center p-2 akilii-glass rounded-lg">
                        <div className="text-yellow-400 font-bold text-fit">
                          {Math.floor((Date.now() - schema.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))}d
                        </div>
                        <div className="text-white/60 text-xs">Updated</div>
                      </div>
                    </div>

                    {/* Schema Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="flex-1 akilii-glass hover:akilii-glass-elevated border border-white/20 text-white btn-responsive"
                      >
                        <Settings className="h-3 w-3 mr-2" />
                        Configure
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="flex-1 akilii-glass hover:akilii-glass-elevated border border-white/20 text-white btn-responsive"
                      >
                        <FileText className="h-3 w-3 mr-2" />
                        View Schema
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Schema Management */}
          <Card className="akilii-glass-elevated border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                <Database className="h-5 w-5" />
                AI Model Grounding & Data Schemas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="akilii-glass border-blue-400/30">
                <Zap className="h-4 w-4" />
                <AlertDescription className="text-white">
                  <span className="font-medium">Prototype Architecture:</span> Data schemas are pre-configured 
                  for rapid iteration and validation, designed to be migratable to the Phase 1 production system.
                  All structures support both personal co-pilot and professional portal workflows.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-fit">Universal Schemas</h4>
                  <div className="space-y-2">
                    {["User Profile", "Learning Context", "Conversation History", "Preference Matrix"].map((schema) => (
                      <div key={schema} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-white/80 text-fit-sm text-truncate">{schema}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium text-fit">Domain-Specific</h4>
                  <div className="space-y-2">
                    {["Educational Templates", "Executive Workflows", "Compliance Frameworks", "Impact Metrics"].map((schema) => (
                      <div key={schema} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-white/80 text-fit-sm text-truncate">{schema}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* System Overview */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <PieChart className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6">
                  <div className="text-4xl font-bold text-white mb-2">{systemHealth.toFixed(1)}%</div>
                  <div className="text-white/60 text-fit">Overall System Health</div>
                  <Progress value={systemHealth} className="h-3 bg-white/10 mt-4" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 akilii-glass rounded-lg">
                    <div className="text-2xl font-bold text-green-400">99.2%</div>
                    <div className="text-white/60 text-xs">Uptime</div>
                  </div>
                  <div className="text-center p-3 akilii-glass rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">0.45s</div>
                    <div className="text-white/60 text-xs">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Handling & Fallbacks */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <Shield className="h-5 w-5" />
                  Resilience & Fallbacks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="akilii-glass border-green-400/30">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-white">
                    <span className="font-medium">System Status:</span> All fallback mechanisms are operational. 
                    Users will see: <em>"I am currently processing your request. This may take a moment longer than usual."</em>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 akilii-glass rounded-lg">
                    <span className="text-white/80 text-fit-sm">API Timeout Handling</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30 badge-text-fit">
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 akilii-glass rounded-lg">
                    <span className="text-white/80 text-fit-sm">Context Preservation</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30 badge-text-fit">
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 akilii-glass rounded-lg">
                    <span className="text-white/80 text-fit-sm">Graceful Degradation</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30 badge-text-fit">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Overview */}
          <Card className="akilii-glass-elevated border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                <Layers className="h-5 w-5" />
                Phase 0 Prototype Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-fit flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    Frontend Layer
                  </h4>
                  <div className="space-y-2">
                    {["Responsive Web App", "Figma-Based Design", "Secure Views", "Accessible UI"].map((item) => (
                      <div key={item} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        <span className="text-white/80 text-xs text-truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium text-fit flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Backend Orchestration
                  </h4>
                  <div className="space-y-2">
                    {["Flowise Core", "Visual AI Workflows", "Low-Code Approach", "Rapid Prototyping"].map((item) => (
                      <div key={item} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                        <CheckCircle className="h-3 w-3 text-blue-400 flex-shrink-0" />
                        <span className="text-white/80 text-xs text-truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium text-fit flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI & Memory
                  </h4>
                  <div className="space-y-2">
                    {["GPT-4 API", "Vector Database", "RAG Responses", "Context Memory"].map((item) => (
                      <div key={item} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                        <CheckCircle className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                        <span className="text-white/80 text-xs text-truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Alert className="akilii-glass border-purple-400/30 mt-6">
                <Target className="h-4 w-4" />
                <AlertDescription className="text-white">
                  <span className="font-medium">Migration Ready:</span> All agentic logic and data structures 
                  built in this prototype are designed to accelerate Phase 1 development of the production-scale system.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}