import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Eye, 
  EyeOff, 
  Loader2,
  ChevronDown,
  HelpCircle,
  Zap,
  Key,
  Globe,
  Database,
  TestTube,
  Lightbulb,
  ArrowRight,
  Code,
  Shield
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface FlowiseSetupProps {
  onConfigurationComplete?: () => void;
  showMinimal?: boolean;
}

interface TestResult {
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
  httpStatus?: number;
}

export function FlowiseSetup({ onConfigurationComplete, showMinimal = false }: FlowiseSetupProps) {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [chatflowId, setChatflowId] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    quickStart: true,
    setup: true,
    testing: false,
    troubleshooting: false,
    examples: false,
    envVars: false
  });

  // Auto-focus first empty field
  useEffect(() => {
    if (!apiUrl) {
      const urlInput = document.getElementById('flowise-url');
      urlInput?.focus();
    } else if (!apiKey) {
      const keyInput = document.getElementById('flowise-key');
      keyInput?.focus();
    } else if (!chatflowId) {
      const chatflowInput = document.getElementById('flowise-chatflow');
      chatflowInput?.focus();
    }
  }, [apiUrl, apiKey, chatflowId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const getUrlStatus = () => {
    if (!apiUrl) return { status: 'empty', message: 'Required' };
    if (!validateUrl(apiUrl)) return { status: 'error', message: 'Invalid URL format' };
    return { status: 'success', message: 'Valid' };
  };

  const getApiKeyStatus = () => {
    if (!apiKey) return { status: 'empty', message: 'Required' };
    if (apiKey.length < 10) return { status: 'warning', message: 'Seems too short' };
    return { status: 'success', message: 'Present' };
  };

  const getChatflowIdStatus = () => {
    if (!chatflowId) return { status: 'empty', message: 'Required' };
    if (chatflowId.length < 8) return { status: 'warning', message: 'Seems too short' };
    return { status: 'success', message: 'Present' };
  };

  const isConfigurationComplete = () => {
    const urlStatus = getUrlStatus();
    const keyStatus = getApiKeyStatus();
    const chatflowStatus = getChatflowIdStatus();
    
    return urlStatus.status === 'success' && 
           (keyStatus.status === 'success' || keyStatus.status === 'warning') &&
           (chatflowStatus.status === 'success' || chatflowStatus.status === 'warning');
  };

  const testConfiguration = async () => {
    if (!isConfigurationComplete()) {
      toast.error('Please fill in all required fields first');
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: 'pending', message: 'Testing connection...' });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/flowise/test-config`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiUrl: apiUrl.trim(),
            apiKey: apiKey.trim(),
            chatflowId: chatflowId.trim(),
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setTestResult({
          status: 'success',
          message: 'Configuration test passed! ✅',
          details: 'All settings are correct and the connection to Flowise is working.'
        });
        
        toast.success('Flowise configuration is working!');
        
        // Auto-collapse setup section and expand testing section
        setExpandedSections(prev => ({
          ...prev,
          setup: false,
          testing: true
        }));
        
        // Call completion callback after a brief delay
        setTimeout(() => {
          onConfigurationComplete?.();
        }, 1000);
        
      } else {
        const errorMessage = result.message || 'Configuration test failed';
        const details = result.test_results ? 
          `Connection: ${result.test_results.connection_test?.message || 'Failed'}` : 
          result.details || 'Please check your configuration and try again.';
          
        setTestResult({
          status: 'error',
          message: errorMessage,
          details,
          httpStatus: response.status
        });
        
        toast.error('Configuration test failed');
        
        // Expand troubleshooting section
        setExpandedSections(prev => ({
          ...prev,
          troubleshooting: true
        }));
      }
    } catch (error: any) {
      console.error('Configuration test error:', error);
      
      setTestResult({
        status: 'error',
        message: 'Failed to test configuration',
        details: `Network error: ${error.message}. Please check your internet connection.`
      });
      
      toast.error('Configuration test failed');
      
      setExpandedSections(prev => ({
        ...prev,
        troubleshooting: true
      }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (showMinimal) {
    return (
      <Alert className="border-yellow-500/20 bg-yellow-500/10">
        <Settings className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-sm">
          <div className="font-medium text-yellow-300 mb-2">AI Service Setup Required</div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="quick-url" className="text-xs">Flowise URL:</Label>
                <Input
                  id="quick-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://your-flowise-instance.com"
                  className="text-xs h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="quick-key" className="text-xs">API Key:</Label>
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    id="quick-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Your Flowise API key"
                    className="text-xs h-8 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="h-8 w-8 p-0"
                  >
                    {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="quick-chatflow" className="text-xs">Chatflow ID:</Label>
                <Input
                  id="quick-chatflow"
                  value={chatflowId}
                  onChange={(e) => setChatflowId(e.target.value)}
                  placeholder="Your chatflow ID"
                  className="text-xs h-8"
                />
              </div>
            </div>
            <Button
              onClick={testConfiguration}
              disabled={!isConfigurationComplete() || isTestingConnection}
              size="sm"
              className="w-full akilii-gradient-primary"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-3 w-3 mr-2" />
                  Test Configuration
                </>
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto akilii-gradient-primary rounded-full flex items-center justify-center">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold akilii-gradient-text">Flowise AI Setup</h1>
          <p className="text-muted-foreground mt-2">
            Configure your Flowise AI instance to enable intelligent chat functionality
          </p>
          
          {/* Configuration Notice */}
          <Alert className="border-blue-500/20 bg-blue-500/10 text-left mt-4">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription>
              <div className="font-medium text-blue-300 mb-1">🔧 Flowise Configuration Required</div>
              <div className="text-sm text-blue-200/80 mb-3">
                Your akilii™ application is securely configured and ready for Flowise AI. 
                You can use Flowise Cloud or your own self-hosted instance.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://cloud.flowiseai.com', '_blank')}
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Get Flowise Cloud
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://docs.flowiseai.com/getting-started', '_blank')}
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Setup Guide
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </motion.div>

      {/* Quick Start Guide */}
      <Collapsible 
        open={expandedSections.quickStart} 
        onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, quickStart: open }))}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Quick Start Guide</CardTitle>
                    <p className="text-sm text-muted-foreground">Get up and running in minutes</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.quickStart ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">1</span>
                    Choose Your Flowise Option
                  </h4>
                  <div className="ml-8 space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">🌩️ Flowise Cloud (Recommended)</p>
                      <p className="text-xs text-muted-foreground mt-1">Hosted solution, no setup required</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://cloud.flowiseai.com', '_blank')}
                        className="mt-2"
                      >
                        <ArrowRight className="h-3 w-3 mr-2" />
                        Sign Up for Cloud
                      </Button>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">🏠 Self-Hosted</p>
                      <p className="text-xs text-muted-foreground mt-1">Deploy your own Flowise instance</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://docs.flowiseai.com/getting-started', '_blank')}
                        className="mt-2"
                      >
                        <ArrowRight className="h-3 w-3 mr-2" />
                        Setup Guide
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">2</span>
                    Get Your Credentials
                  </h4>
                  <div className="ml-8 space-y-2 text-sm text-muted-foreground">
                    <p>• API URL (your Flowise instance URL)</p>
                    <p>• API Key (from your Flowise settings)</p>
                    <p>• Chatflow ID (from your created chatflow)</p>
                  </div>
                  
                  <h4 className="font-medium text-foreground flex items-center gap-2 mt-4">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">3</span>
                    Configure Below
                  </h4>
                  <div className="ml-8 text-sm text-muted-foreground">
                    <p>Enter your credentials and test the connection</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Configuration Section */}
      <Collapsible 
        open={expandedSections.setup} 
        onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, setup: open }))}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Configuration</CardTitle>
                    <p className="text-sm text-muted-foreground">Set up your Flowise connection</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConfigurationComplete() && (
                    <Badge variant="outline" className="text-green-400 border-green-400/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.setup ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              
              {/* API URL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="flowise-url" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Flowise API URL
                  </Label>
                  <StatusIcon status={getUrlStatus().status} />
                  <span className="text-xs text-muted-foreground">{getUrlStatus().message}</span>
                </div>
                <Input
                  id="flowise-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://cloud.flowiseai.com or https://your-flowise-instance.com"
                  className={`${getUrlStatus().status === 'error' ? 'border-red-500/50' : ''}`}
                />
                <p className="text-xs text-muted-foreground">
                  The base URL of your Flowise instance (include http:// or https://)
                </p>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="flowise-key" className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    API Key
                  </Label>
                  <StatusIcon status={getApiKeyStatus().status} />
                  <span className="text-xs text-muted-foreground">{getApiKeyStatus().message}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="flowise-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Your Flowise API key"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get this from your Flowise settings or API documentation
                </p>
              </div>

              {/* Chatflow ID */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="flowise-chatflow" className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    Chatflow ID
                  </Label>
                  <StatusIcon status={getChatflowIdStatus().status} />
                  <span className="text-xs text-muted-foreground">{getChatflowIdStatus().message}</span>
                </div>
                <Input
                  id="flowise-chatflow"
                  value={chatflowId}
                  onChange={(e) => setChatflowId(e.target.value)}
                  placeholder="Your chatflow ID (usually a UUID)"
                />
                <p className="text-xs text-muted-foreground">
                  Found in your Flowise chatflow URL or chatflow settings
                </p>
              </div>

              {/* Test Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={testConfiguration}
                  disabled={!isConfigurationComplete() || isTestingConnection}
                  className="w-full akilii-gradient-primary"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing Configuration...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Configuration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Environment Variables Option */}
      <Collapsible 
        open={expandedSections.envVars} 
        onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, envVars: open }))}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Environment Variables</CardTitle>
                    <p className="text-sm text-muted-foreground">Secure credential storage option</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.envVars ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <Alert className="border-green-500/20 bg-green-500/10">
                <Shield className="h-4 w-4 text-green-400" />
                <AlertDescription>
                  <div className="font-medium text-green-300 mb-2">🔒 Secure Environment Configuration</div>
                  <div className="text-sm text-green-200/80">
                    Your akilii™ application includes pre-configured environment variable slots for secure credential storage.
                    This is the recommended approach for production use.
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Available Environment Variables:</h4>
                <div className="space-y-2 text-sm font-mono bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>FLOWISE_API_URL</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('FLOWISE_API_URL')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>FLOWISE_API_KEY</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('FLOWISE_API_KEY')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>FLOWISE_CHATFLOW_ID</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('FLOWISE_CHATFLOW_ID')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  These environment variables are securely managed by your Supabase project. 
                  Set them through your Supabase dashboard for production deployments.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Test Results */}
      {testResult && (
        <Collapsible 
          open={expandedSections.testing} 
          onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, testing: open }))}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TestTube className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Test Results</CardTitle>
                      <p className="text-sm text-muted-foreground">Configuration test status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResult.status === 'success' && (
                      <Badge variant="outline" className="text-green-400 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Passed
                      </Badge>
                    )}
                    {testResult.status === 'error' && (
                      <Badge variant="outline" className="text-red-400 border-red-400/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.testing ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <Alert className={
                  testResult.status === 'success' ? 'border-green-500/20 bg-green-500/10' :
                  testResult.status === 'error' ? 'border-red-500/20 bg-red-500/10' :
                  'border-yellow-500/20 bg-yellow-500/10'
                }>
                  <StatusIcon status={testResult.status} />
                  <AlertDescription>
                    <div className="font-medium mb-1">{testResult.message}</div>
                    {testResult.details && (
                      <div className="text-sm text-muted-foreground">{testResult.details}</div>
                    )}
                    {testResult.httpStatus && (
                      <div className="text-xs text-muted-foreground mt-1">
                        HTTP Status: {testResult.httpStatus}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Troubleshooting Guide */}
      <Collapsible 
        open={expandedSections.troubleshooting} 
        onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, troubleshooting: open }))}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Troubleshooting</CardTitle>
                    <p className="text-sm text-muted-foreground">Common issues and solutions</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.troubleshooting ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Common HTTP 401 (Unauthorized) Fixes:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Invalid API Key:</strong> Double-check your API key is correct and hasn't expired</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Wrong Endpoint:</strong> Ensure your URL is the correct Flowise instance URL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>API Permissions:</strong> Make sure your API key has admin or API access permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Flowise Version:</strong> Ensure you're using a compatible Flowise version</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Setup Checklist:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>Flowise instance is running and accessible</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>API is enabled in Flowise settings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>API key has been generated and is valid</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>Chatflow is created and published</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>Network allows outbound connections to Flowise</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://docs.flowiseai.com/', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Flowise Documentation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://docs.flowiseai.com/getting-started', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Getting Started Guide
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Examples Section */}
      <Collapsible 
        open={expandedSections.examples} 
        onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, examples: open }))}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Copy className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Configuration Examples</CardTitle>
                    <p className="text-sm text-muted-foreground">Sample configurations and formats</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.examples ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Example Configurations:</h4>
                
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Flowise Cloud:</p>
                    <div className="space-y-1 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>API URL: https://cloud.flowiseai.com</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('https://cloud.flowiseai.com')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Example Chatflow ID: a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Local Development:</p>
                    <div className="space-y-1 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>API URL: http://localhost:3000</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('http://localhost:3000')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Chatflow ID: a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Self-hosted Examples:</p>
                    <div className="space-y-1 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>API URL: https://flowiseai-production.up.railway.app</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('https://flowiseai-production.up.railway.app')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>API URL: https://your-app.herokuapp.com</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('https://your-app.herokuapp.com')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}