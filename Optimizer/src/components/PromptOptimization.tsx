import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Lightbulb, 
  Zap, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  RotateCcw,
  Target,
  Clock
} from 'lucide-react';
import { optimizePrompt } from '../lib/api';
import { applyRules, rules } from '../lib/ruleEngine';

interface OptimizationSuggestion {
  title: string;
  description: string;
  tokenSaving: number;
  priority: string;
}

interface PromptTemplate {
  name: string;
  category: string;
  description: string;
  template: string;
  avgTokens: number;
}

function countTokens(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function PromptOptimization() {
  const [originalPrompt, setOriginalPrompt] = useState(`Please analyze the following code and provide detailed suggestions for improvement. Consider performance, readability, maintainability, and best practices. Also include examples of how to implement each suggestion and explain why each change would be beneficial.\nHere's the code:\n[CODE_PLACEHOLDER]\nPlease be thorough in your analysis and provide specific, actionable recommendations.`);
  const [profile, setProfile] = useState('neutral');
  const [optimResult, setOptimResult] = useState<any>(null);
  const [localResult, setLocalResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string|undefined>(undefined);
  const templates: PromptTemplate[] = [
    {
      name: 'Code Review',
      category: 'Development',
      description: 'Analyze code for improvements',
      template: 'Review this code for:\n• Performance issues\n• Best practices\n• Readability\n\nCode: [CODE]\n\nFormat: Issue | Fix | Impact',
      avgTokens: 32
    },
    {
      name: 'Bug Fix',
      category: 'Development', 
      description: 'Debug and fix code issues',
      template: 'Debug this error:\nCode: [CODE]\nError: [ERROR]\n\nProvide: Root cause, fix, prevention',
      avgTokens: 28
    },
    {
      name: 'Documentation',
      category: 'Development',
      description: 'Generate concise documentation',
      template: 'Document this function:\n[CODE]\n\nInclude: Purpose, params, returns, example',
      avgTokens: 24
    },
    {
      name: 'Test Generation',
      category: 'Testing',
      description: 'Create unit tests',
      template: 'Generate tests for:\n[CODE]\n\nCover: Happy path, edge cases, errors',
      avgTokens: 26
    }
  ];
  const [backendMetrics, setBackendMetrics] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(undefined);
    setOptimResult(null);
    setLocalResult(null);
    setBackendMetrics(null);
    try {
      // Local (NLP, rule-based)
      const local = applyRules(originalPrompt, { profile });
      setLocalResult(local);
      // Backend LLM
      const data = await optimizePrompt(originalPrompt, profile);
      setOptimResult(data);
      // Try fetch backend metrics as well
      try {
        const res = await fetch('/metrics');
        if (res.ok) setBackendMetrics(await res.json());
      } catch {}
    } catch (e: any) {
      setError(e.message || 'Unexpected error');
      setOptimResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleUseTemplate = (template: PromptTemplate) => {
    setOriginalPrompt(template.template);
    setOptimResult(null);
    setLocalResult(null);
    setBackendMetrics(null);
  };
  const originalTokenCount = optimResult?.original?.tokens ?? countTokens(originalPrompt);
  const optimizedTokenCount = optimResult?.chosen?.tokens ?? 0;
  const tokenSavings = originalTokenCount - optimizedTokenCount;
  const savingsPercentage = originalTokenCount > 0 ? (tokenSavings / originalTokenCount) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Prompt Optimization</h1>
        <p className="text-muted-foreground">Reduce token usage and improve prompt efficiency</p>
      </div>
      <Tabs defaultValue="analyzer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analyzer">Prompt Analyzer</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>
        <TabsContent value="analyzer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Original Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Original Prompt
                </CardTitle>
                <CardDescription>
                  {originalTokenCount} tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your prompt here..."
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex gap-2 items-center">
                  <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                      </>
                    ) : (<>
                      <Target className="w-4 h-4 mr-2" /> Analyze & Optimize
                    </>)}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setOriginalPrompt("");
                    setOptimResult(null);
                    setLocalResult(null);
                    setBackendMetrics(null);
                  }}>Clear</Button>
                  <select value={profile} className="ml-2 px-2 py-1 border rounded" onChange={e => setProfile(e.target.value)}>
                    <option value="neutral">neutral</option>
                    <option value="concise">concise</option>
                    <option value="formal">formal</option>
                    <option value="creative">creative</option>
                  </select>
                </div>
                {error && <div className="text-red-700 font-semibold">{error}</div>}
              </CardContent>
            </Card>
            {/* Rule-based (NLP) Optimized Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Rule-based (NLP) Optimized
                </CardTitle>
                <CardDescription>
                  {localResult && <>
                    {countTokens(localResult.candidate)} tokens
                    {localResult.applied_rules.length > 0 &&
                      <span className="ml-2 text-xs text-blue-600">rules: {localResult.applied_rules.join(', ')}</span>
                    }
                  </>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  readOnly
                  value={localResult ? localResult.candidate : ''}
                  className="min-h-[120px]"
                />
                {localResult && localResult.applied_rules.length > 0 && (
                  <div className="text-xs text-blue-800">
                    Applied rules: {localResult.applied_rules.join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* LLM Backend Optimized Prompt (from backend chosen) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> LLM Backend Optimized
                  {optimResult?.chosen?.source && (
                    <Badge className="ml-2">{optimResult.chosen.source}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {optimizedTokenCount ? `${optimizedTokenCount} tokens` : ''}
                  {tokenSavings > 0 && (
                    <span className="text-green-600 ml-2">
                      {tokenSavings} tokens saved ({savingsPercentage.toFixed(1)}%)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={optimResult?.chosen?.prompt ?? ''}
                  readOnly
                  className="min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button onClick={() => navigator.clipboard.writeText(optimResult?.chosen?.prompt || '')}>
                    <Copy className="w-4 h-4 mr-2" /> Copy Optimized
                  </Button>
                </div>
                {optimResult?.chosen?.reason && (
                  <div className="text-xs text-gray-500">Reason: {optimResult.chosen.reason}</div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Candidates with semantic validation */}
          {optimResult?.optimized && (
            <Card>
              <CardHeader>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>All optimization outputs (semantic, pass/fail shown)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimResult.optimized.map((c: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded mb-1 flex flex-col md:flex-row md:items-center gap-2 bg-slate-50 dark:bg-slate-800">
                      <span><b>{c.source}</b></span>
                      {c.latency_ms && <span className="text-xs text-gray-500 ml-2">{c.latency_ms}ms</span>}
                      <span className="text-xs text-muted-foreground ml-2">{c.tokens} tokens</span>
                      <span className={"text-xs ml-2 " + (c.semantic_passed ? "text-green-700" : "text-red-700")}>semantic: {c.semantic_score?.toFixed ? c.semantic_score.toFixed(2) : c.semantic_score} ({c.semantic_passed ? 'pass' : 'fail'})</span>
                      {Array.isArray(c.applied_rules) && c.applied_rules.length > 0 && (
                        <span className="text-xs text-blue-700 ml-2">rules: {c.applied_rules.join(', ')}</span>
                      )}
                      <div className="w-full mt-2 md:mt-0 md:ml-4 border bg-white dark:bg-slate-900 p-2 rounded text-xs">
                        {c.prompt}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Token Savings Summary */}
          {optimResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-600" /> Optimization Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl">{tokenSavings}</div>
                    <p className="text-sm text-muted-foreground">Tokens Saved</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">{savingsPercentage.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Reduction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">{((tokenSavings||0) * 0.002).toFixed(3)}</div>
                    <p className="text-sm text-muted-foreground">Cost Saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Provenance and Stats */}
          {optimResult?.provenance && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Provenance</CardTitle>
                <CardDescription>Sources and rules applied in this run</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Sources used: <span className="ml-2 text-blue-700">{optimResult.provenance.sources_used.join(', ')}</span></div>
                <div>Rule trace:</div>
                <ul className="ml-4 text-xs">
                  {Object.entries(optimResult.provenance.rule_trace).map(([k, v]: any, i) => (
                    <li key={i}><b>{k}</b>: {Array.isArray(v) ? v.join(', ') : v}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {/* LLM aggregated metrics summary */}
          {backendMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>LLM Metrics Summary</CardTitle>
                <CardDescription>Aggregated performance metrics from backend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex flex-col"><span className="font-bold">Total Requests</span><span>{backendMetrics.total_requests}</span></div>
                  <div className="flex flex-col"><span className="font-bold">Errors</span><span>{backendMetrics.total_errors}</span></div>
                  <div className="flex flex-col"><span className="font-bold">Avg Latency</span><span>{backendMetrics.avg_time_ms} ms</span></div>
                  <div className="flex flex-col"><span className="font-bold">LLM Calls</span><span>{backendMetrics.llm_calls}</span></div>
                  <div className="flex flex-col"><span className="font-bold">Tokens Saved</span><span>{backendMetrics.tokens_saved}</span></div>
                  <div className="flex flex-col"><span className="font-bold">Error Rate</span><span>{backendMetrics.error_rate}%</span></div>
                  <div className="flex flex-col"><span className="font-bold">Uptime(s)</span><span>{Math.round(backendMetrics.uptime_seconds)}</span></div>
                  <div className="flex flex-col"><span className="font-bold">Last Updated</span><span>{backendMetrics.last_updated}</span></div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Templates & Benchmarks tabs unchanged */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimized Prompt Templates</CardTitle>
              <CardDescription>
                Pre-optimized templates for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                          <CardDescription>{template.category}</CardDescription>
                        </div>
                        <Badge variant="outline">{template.avgTokens} tokens</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="bg-muted p-3 rounded text-sm mb-3">
                        <code>{template.template.substring(0, 80)}...</code>
                      </div>
                      <Button size="sm" onClick={() => handleUseTemplate(template)}>
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="benchmarks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Efficiency Benchmarks</CardTitle>
                <CardDescription>
                  Compare your prompts against industry standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Code Review Prompts</span>
                    <span className="text-sm text-muted-foreground">25-40 tokens</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span>Documentation Generation</span>
                    <span className="text-sm text-muted-foreground">15-30 tokens</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span>Bug Fixing</span>
                    <span className="text-sm text-muted-foreground">20-35 tokens</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span>Test Generation</span>
                    <span className="text-sm text-muted-foreground">18-28 tokens</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
                <CardDescription>
                  Tips for writing efficient prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Lightbulb className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Be specific:</strong> Clear requirements reduce back-and-forth and over-generation.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Target className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Use structure:</strong> Bullet points and numbered lists are more token-efficient than prose.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Clock className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Set limits:</strong> Specify desired output length to prevent over-generation.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Remove politeness:</strong> Skip "please", "thank you" - they add tokens without value.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}