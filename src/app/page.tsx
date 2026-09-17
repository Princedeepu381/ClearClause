"use client";

import { useState, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { AnalysisResult } from "@/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Dynamically import heavy UI components for maximum efficiency
const RiskCard = dynamic(() => import("@/components/RiskCard").then(mod => mod.RiskCard), { ssr: false });
const ScoreCircle = dynamic(() => import("@/components/RiskCard").then(mod => mod.ScoreCircle), { ssr: false });
const MetricBar = dynamic(() => import("@/components/RiskCard").then(mod => mod.MetricBar), { ssr: false });
import {
  Shield, ShieldAlert, FileSearch, ArrowRight, Loader2,
  Database, Brain, Lock, Sparkles, Zap, Eye, Cloud, Box,
  Upload, FileText, X
} from "lucide-react";

export default function Home() {
  const [contractText, setContractText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // If it's a text file, also show content in textarea
      if (file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (ev) => setContractText(ev.target?.result as string || "");
        reader.readAsText(file);
      } else {
        setContractText("");
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!contractText.trim() && !uploadedFile) return;
    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      }
      if (contractText.trim()) {
        formData.append("contractText", contractText);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred during analysis.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasInput = contractText.trim().length > 0 || uploadedFile !== null;

  return (
    <main className="min-h-screen">
      {/* Skip to content link for keyboard users */}
      <a href="#demo" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Skip to Demo
      </a>

      {/* Navbar */}
      <nav aria-label="Main navigation" className="border-b border-[#333333] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold tracking-widest text-white">CLEARCLAUSE</span>
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-400">
            <a href="#problem" className="hover:text-white transition-colors">Problem</a>
            <a href="#solution" className="hover:text-white transition-colors">Solution</a>
            <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
            <a href="#tech" className="hover:text-white transition-colors">Tech Stack</a>
          </div>
          <a href="#demo" aria-label="Try the live contract analysis demo" className="hidden md:flex bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors items-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]">
            Try Demo
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#171717] border border-[#333333] px-4 py-2 rounded-full text-sm text-gray-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Powered by Google Gemini 3.6 Flash</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            AI That Reads<br />the Fine Print
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            ClearClause detects hidden liabilities, exploitative clauses, and one-sided obligations in legal agreements — delivering explainable, severity-scored risk analysis in seconds.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#demo" className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors flex items-center">
              Launch Live Demo <ArrowRight className="ml-2 w-4 h-4" />
            </a>
            <a href="#solution" className="border border-[#333333] text-gray-300 px-8 py-3 rounded-md font-semibold hover:bg-[#171717] transition-colors">
              Learn How It Works
            </a>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto">
            <div className="bg-[#171717] border border-[#333333] rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-500">PDF+TXT</p>
              <p className="text-xs text-gray-500 mt-1">File Support</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] rounded-xl p-4">
              <p className="text-2xl font-bold text-amber-500">&lt; 10s</p>
              <p className="text-xs text-gray-500 mt-1">Analysis Time</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] rounded-xl p-4">
              <p className="text-2xl font-bold text-red-500">6 Metrics</p>
              <p className="text-xs text-gray-500 mt-1">Risk Scorecard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-[#171717] border-y border-[#333333]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Bias is Invisible — Until It Harms</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Individuals and organizations routinely accept legally binding agreements containing hidden liabilities, IP traps, and privacy violations — without understanding the real-world consequences.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0a] border border-[#333333] p-8 rounded-2xl hover:border-red-500/50 transition-colors">
              <Lock className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Employment</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Restrictive non-compete clauses lock professionals out of their own industry for years. Hidden IP transfers strip creators of their work.</p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#333333] p-8 rounded-2xl hover:border-amber-500/50 transition-colors">
              <Database className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Privacy</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Excessive personal data collection, third-party selling, and device monitoring buried in dense terms of service agreements.</p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#333333] p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
              <ShieldAlert className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Vendor Terms</h3>
              <p className="text-gray-400 text-sm leading-relaxed">One-sided arbitration mechanisms, $50 liability caps, and unfavorable termination conditions that leave you completely exposed.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="text-center p-4">
              <p className="text-red-500 font-bold text-sm">No Visibility</p>
              <p className="text-gray-500 text-xs mt-1">Can&apos;t quantify risk exposure</p>
            </div>
            <div className="text-center p-4">
              <p className="text-amber-500 font-bold text-sm">No Tooling</p>
              <p className="text-gray-500 text-xs mt-1">Legal review is expensive &amp; slow</p>
            </div>
            <div className="text-center p-4">
              <p className="text-blue-500 font-bold text-sm">High Barrier</p>
              <p className="text-gray-500 text-xs mt-1">Legal jargon blocks understanding</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">One Platform. Complete Contract Defense.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              ClearClause provides the full detect-analyze-explain loop through an adversarial AI pipeline powered by Google Gemini.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-[#171717] border border-[#333333] p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-white font-bold mb-2">Upload or Paste</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Upload PDF/TXT files or paste contract text directly. ClearClause handles both seamlessly.</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-white font-bold mb-2">AI Reasoning</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Gemini 3.6 Flash performs adversarial analysis with multi-agent legal reasoning.</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-white font-bold mb-2">Explainable Risks</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Every risk includes plain-English explanations and real-world consequence scenarios.</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-white font-bold mb-2">Full Scorecard</h3>
              <p className="text-gray-500 text-xs leading-relaxed">6-metric risk scorecard with overall safety score, category breakdowns, and severity classification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Dashboard Section */}
      <section id="demo" className="py-24 px-6 bg-[#171717] border-y border-[#333333] relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-blue-500" />
              See Risk Disappear in Real Time
            </h2>
            <p className="text-gray-400">This live dashboard connects to the Google Gemini 3.6 Flash engine. Upload a PDF or paste contract text to begin.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-2xl overflow-hidden flex flex-col">
              <div className="border-b border-[#333333] p-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">Contract Input Stream</span>
                <span className="text-xs text-gray-600">PDF · TXT · Paste</span>
              </div>

              {/* File Upload Zone */}
              <div className="p-4 border-b border-[#333333]">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  aria-label="Upload PDF or TXT file for analysis"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                  className="border-2 border-dashed border-[#333333] rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {uploadedFile ? (
                    <div className="flex items-center justify-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-300">{uploadedFile.name}</span>
                      <span className="text-xs text-gray-500">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                      <button aria-label="Remove uploaded file" onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-gray-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Click to upload PDF or TXT file</p>
                      <p className="text-xs text-gray-600 mt-1">Max size: 10MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  aria-label="Choose file to upload"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Text Input */}
              <div className="flex-1 p-4 min-h-[250px]">
                <textarea
                  id="contract-input"
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Or paste your legal document, terms of service, or employment contract here..."
                  className="w-full h-full min-h-[230px] bg-transparent text-gray-300 resize-none outline-none font-mono text-sm placeholder:text-gray-600"
                />
              </div>

              {/* Action Button */}
              <div className="border-t border-[#333333] p-4">
                <button
                  id="analyze-button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !hasInput}
                  aria-label={isAnalyzing ? "Analyzing contract..." : "Analyze contract for risks"}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Contract...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-5 h-5 mr-2" />
                      Run Intelligence Matrix
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-2xl overflow-hidden flex flex-col">
              <div className="border-b border-[#333333] p-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">The Tactical Briefing Feed</span>
                {result && result.risks && (
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-white">
                    {result.risks.length} Risks Detected
                  </span>
                )}
              </div>

              <div className="flex-1 p-6 overflow-y-auto max-h-[700px]" aria-live="polite" aria-atomic="true">
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {!result && !error && !isAnalyzing && (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                    <Brain className="w-12 h-12 mb-4 opacity-50" />
                    <p>Awaiting document ingestion.</p>
                    <p className="text-xs mt-2">Upload a file or paste text, then click &quot;Run&quot; to begin.</p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-2 border-[#333333]"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="font-mono text-sm animate-pulse">Running Adversarial Agent Pipeline...</p>
                    <p className="text-xs text-gray-600">Google Gemini 3.6 Flash processing</p>
                  </div>
                )}

                {/* === SCORECARD === */}
                {result && (
                  <ErrorBoundary fallback={<div className="p-4 bg-red-500/10 text-red-500">Failed to load scorecard UI.</div>}>
                    <Suspense fallback={<div className="animate-pulse h-32 bg-[#171717] rounded-xl"></div>}>
                      <div className="space-y-6">
                    {/* Overall Score + Summary */}
                    <div className="bg-[#171717] border border-[#333333] rounded-xl p-6">
                      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                        <ScoreCircle score={result.overallScore} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">Contract Safety Score</h3>
                            {result.documentType && (
                              <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {result.documentType}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{result.summary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="bg-[#171717] border border-[#333333] rounded-xl p-6">
                      <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Risk Metrics Breakdown</h3>
                      <MetricBar label="Privacy Protection" score={result.metrics.privacyScore} />
                      <MetricBar label="Financial Safety" score={result.metrics.financialRiskScore} />
                      <MetricBar label="Employment Fairness" score={result.metrics.employmentFairnessScore} />
                      <MetricBar label="IP Protection" score={result.metrics.ipProtectionScore} />
                      <MetricBar label="Termination Fairness" score={result.metrics.terminationFairnessScore} />
                      <MetricBar label="Clause Clarity" score={result.metrics.ambiguityScore} />
                    </div>

                    {/* Risk Summary Badges */}
                    {result.risks && result.risks.length > 0 && (
                      <>
                        <div className="flex space-x-4">
                          <span className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                            {result.risks.filter(r => r.severity === "High").length} High
                          </span>
                          <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                            {result.risks.filter(r => r.severity === "Medium").length} Medium
                          </span>
                          <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
                            {result.risks.filter(r => r.severity === "Low").length} Low
                          </span>
                        </div>

                        {/* Individual Risk Cards */}
                        <div className="space-y-4">
                          {result.risks.map((risk) => (
                            <RiskCard key={risk.id} risk={risk} />
                          ))}
                        </div>
                      </>
                    )}

                    {result.risks && result.risks.length === 0 && (
                      <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-xl text-center">
                        <h3 className="font-bold mb-1">All Clear!</h3>
                        <p className="text-sm">No significant risks or liabilities detected in this document.</p>
                      </div>
                    )}
                    </div>
                  </Suspense>
                </ErrorBoundary>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Built on Google-First Infrastructure</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every layer of ClearClause is powered by Google Cloud services — from AI reasoning to deployment.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#171717] border border-[#333333] p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
              <Sparkles className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Google Gemini 3.6 Flash</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Core AI engine powering the adversarial multi-agent legal reasoning pipeline with structured JSON output for explainable risk analysis.</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] p-8 rounded-2xl hover:border-amber-500/50 transition-colors">
              <Cloud className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Google Cloud Run</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Serverless container hosting with automatic HTTPS, horizontal scaling, and zero infrastructure management for both frontend and API backend.</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] p-8 rounded-2xl hover:border-green-500/50 transition-colors">
              <Box className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Google Artifact Registry</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Centralized container image storage enabling versioned deployments, rollback capabilities, and audit trails across the Google ecosystem.</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="bg-[#171717] border border-[#333333] rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-white">&lt; 10s</p>
              <p className="text-xs text-gray-500 mt-2">End-to-End Analysis</p>
              <p className="text-xs text-gray-600">Upload to scorecard</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-white">6</p>
              <p className="text-xs text-gray-500 mt-2">Risk Metrics</p>
              <p className="text-xs text-gray-600">Comprehensive scoring</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-white">0 KB</p>
              <p className="text-xs text-gray-500 mt-2">Data Stored</p>
              <p className="text-xs text-gray-600">Fully stateless</p>
            </div>
            <div className="bg-[#171717] border border-[#333333] rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-xs text-gray-500 mt-2">Server-Side AI</p>
              <p className="text-xs text-gray-600">Keys never exposed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#333333] py-12 text-center text-gray-500 text-sm">
        <p className="mb-2">
          <span className="text-white font-bold tracking-wider">CLEARCLAUSE</span> — Built with Google Gemini AI · Deployed on Google Cloud Run · Open Innovation Hackathon 2026
        </p>
        <p>Disclaimer: This tool provides AI-assisted analysis and does not constitute formal legal advice.</p>
      </footer>
    </main>
  );
}
