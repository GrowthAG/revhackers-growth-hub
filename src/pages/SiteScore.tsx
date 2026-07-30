import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { runCompetitiveBenchmark, BenchmarkResult } from "@/api/cruxApi";
import { getDiagnosticInsights } from '@/utils/diagnosticMapping';
import SEO from '@/components/shared/SEO';
import { DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';

import { SiteScoreHero } from '@/components/scores/site/SiteScoreHero';
import { SiteScoreQuiz, QUESTIONS } from '@/components/scores/site/SiteScoreQuiz';
import { SiteScoreResult } from '@/components/scores/site/SiteScoreResult';

type Step = 'url-input' | 'questions' | 'analyzing' | 'lead-capture' | 'results';

const SiteScore = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('url-input');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const insights = getDiagnosticInsights('site', score);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showLog, setShowLog] = useState(false);

  const [targetUrl, setTargetUrl] = useState('');
  const [psiResults, setPsiResults] = useState<{
    mobile: any,
    desktop: any,
    techStack: string[],
    pixels: string[],
    vitals: { lcp: string, cls: string, tbt: string, score: number },
    seoMetadata?: { title: string, description: string, h1?: string },
    compliance?: { lgpd: boolean, privacy: boolean, security: boolean },
    crux?: { lcp: string, fid?: string, cls: string, assessment: string },
    error?: boolean
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Iniciando análise...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === 'analyzing') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 5 + 1;
          return Math.min(90, Math.floor(prev + increment));
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [step]);

  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['', '']);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const runPageSpeed = async (url: string) => {
    setIsAnalyzing(true);
    setPsiResults(null);
    setLoadingStatus('Conectando ao Google PageSpeed Insights...');

    try {
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;

      if (finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1')) {
        console.warn("Localhost detected. Using Mock Data.");

        setLoadingStatus('Ambiente de Desenvolvimento Detectado...');
        await new Promise(r => setTimeout(r, 1500));

        const mockResult = {
          mobile: { lighthouseResult: { categories: { performance: { score: 0.85 }, seo: { score: 0.92 } } } },
          desktop: null,
          techStack: ["React", "Vite", "Tailwind (Dev Mode)"],
          pixels: ["Pixel de Teste"],
          vitals: { lcp: "1.2s", cls: "0.05", tbt: "120ms", score: 85 },
          seoMetadata: { title: "Localhost Development", description: "Ambiente de teste local." },
          compliance: { lgpd: true, privacy: true, security: false },
          crux: { lcp: "1.0s", cls: "0.01", assessment: "PASS" },
          error: false
        };

        setPsiResults(mockResult);
        setProgress(100);

        toast({
          className: "bg-white border-zinc-200 text-zinc-900",
          title: "MODO DESENVOLVEDOR",
          description: "Simulação de análise ativa para Localhost."
        });

        setStep('results');
        return;
      }

      setLoadingStatus('Auditando Core Web Vitals (Mobile)...');

      const { data, error } = await supabase.functions.invoke('analyze-site', {
        body: { url: finalUrl, strategy: 'mobile' }
      });

      if (error) throw new Error(error.message || 'Edge Function error');
      if (data?.error) throw new Error(data.error?.message || JSON.stringify(data.error));

      const lighthouse = data.lighthouseResult;

      setLoadingStatus('Processando Árvore de Renderização...');
      await new Promise(r => setTimeout(r, 800));

      const scoreValue = Math.round((lighthouse?.categories?.performance?.score || 0) * 100);
      const audits = lighthouse?.audits || {};

      const lcp = audits['largest-contentful-paint']?.displayValue || "N/A";
      const cls = audits['cumulative-layout-shift']?.displayValue || "N/A";
      const tbt = audits['total-blocking-time']?.displayValue || "N/A";

      const detectedTech = lighthouse?.stackPacks?.map((p: any) => p.title) || [];

      const realResults = {
        mobile: data,
        desktop: null,
        techStack: detectedTech.length > 0 ? detectedTech : ["Tecnologia Web Padrão"],
        pixels: ["Análise Profunda Pendente"],
        vitals: { lcp, cls, tbt, score: scoreValue },
        seoMetadata: {
          title: audits['document-title']?.details?.title || "Título não detectado",
          description: audits['meta-description']?.details?.items?.[0]?.description || "Descrição não encontrada",
        },
        compliance: {
          lgpd: audits['bf-cache']?.score === 1,
          privacy: url.includes('https'),
          security: url.includes('https')
        },
        crux: {
          lcp: data.loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile
            ? `${(data.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000).toFixed(1)}s`
            : "N/A",
          cls: data.loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile
            ? (data.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100).toFixed(2)
            : "N/A",
          assessment: data.loadingExperience?.overall_category || "DADOS INSUFICIENTES"
        },
        error: false
      };

      setPsiResults(realResults);
      setProgress(100);

      toast({
        className: "bg-white border-zinc-200 text-zinc-900",
        title: "DIAGNÓSTICO REAL CONCLUÍDO",
        description: `Auditoria oficial do Google finalizada. Score: ${scoreValue}`
      });

      setStep('results');

    } catch (error: any) {
      console.error(error);

      let userMessage = "Falha ao conectar ao Google PSI.";
      if (error.message?.includes("FAILED_DOCUMENT_REQUEST") || error.message?.includes("ERR_CONNECTION_FAILED")) {
        userMessage = "Não foi possível acessar o site. Verifique se a URL está correta e acessível publicamente.";
      } else if (error.message?.includes("400")) {
        userMessage = "URL inválida ou não encontrada.";
      } else if (error.message?.includes("500")) {
        userMessage = "Erro no servidor do Google. Tente novamente.";
      }

      toast({
        variant: "destructive",
        title: "Erro na Análise",
        description: userMessage
      });

      setPsiResults({
        error: true,
        mobile: null, desktop: null, techStack: [], pixels: [],
        vitals: { lcp: "Erro", cls: "Erro", tbt: "Erro", score: 0 },
        seoMetadata: { title: "Erro na Leitura", description: "Não foi possível acessar o site." },
        compliance: { lgpd: false, privacy: false, security: false },
        crux: { lcp: "N/A", cls: "N/A", assessment: "ERRO DE CONEXÃO" }
      });

      setProgress(100);
      setTimeout(() => {
        setStep('results');
      }, 1000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runBenchmark = async () => {
    const validCompetitors = competitorUrls.filter(url => url.trim() !== '');
    if (validCompetitors.length === 0 || !targetUrl) return;

    setIsBenchmarking(true);
    try {
      const result = await runCompetitiveBenchmark(
        targetUrl,
        validCompetitors,
        viewMode === 'mobile' ? 'PHONE' : 'DESKTOP'
      );
      setBenchmarkResult(result);
      toast({
        className: "bg-white border-zinc-200 text-zinc-900",
        title: "BENCHMARK CONCLUÍDO",
        description: `Comparação com ${validCompetitors.length} concorrente(s) finalizada.`
      });
    } catch (error) {
      console.error('Benchmark error:', error);
      toast({
        variant: "destructive",
        title: "Erro no Benchmark",
        description: "Não foi possível comparar com os concorrentes."
      });
    } finally {
      setIsBenchmarking(false);
    }
  };

  useEffect(() => {
    if (step === 'results' && !benchmarkResult && competitorUrls.some(u => u.trim())) {
      runBenchmark();
    }
  }, [step]);

  const handleAnswer = (optionScore: number, optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    setShowLog(true);

    const newScore = score + optionScore;
    setScore(newScore);
    setAnswers([...answers, optionScore]);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setShowLog(false);
        setSelectedOption(null);
        setCurrentQ(prev => prev + 1);
      } else {
        setStep('analyzing');
        runPageSpeed(targetUrl);
      }
    }, 2000);
  };

  const handleFormSubmit = async (data: DiagnosticFormData) => {
    setIsSubmitting(true);
    try {
      await submitPublicDiagnostic(
        { ...data, phone: '' },
        { answers, diagnostic_type: 'site', psi: psiResults ? 'captured' : 'failed', target_url: targetUrl, source: 'site-score' },
        score,
        { level: "Auditoria Técnica", description: "Diagnóstico Finalizado", action: "Revisão Recomendada", color: "revgreen" },
        'score_captured'
      );

      setHasSubmittedLead(true);
      toast({
        className: "bg-white border-zinc-200 text-zinc-900",
        title: "RELATÓRIO LIBERADO",
        description: "Acesso completo concedido."
      });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Erro", description: "Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFinalScore = () => {
    const baseScore = score;
    const psiScore = psiResults?.mobile?.vitals?.score || 0;
    if (psiScore > 0) return psiScore;
    return baseScore;
  };

  const finalScore = getFinalScore();
  const currentData = viewMode === 'mobile' ? psiResults?.mobile : psiResults?.desktop;
  const computedCurrentScore = currentData?.vitals?.score || finalScore;
  const psiSeoScore = psiResults?.mobile?.lighthouseResult?.categories?.seo?.score ? Math.round(psiResults.mobile.lighthouseResult.categories.seo.score * 100) : null;

  const seoComponent = (
    <SEO
      title="Auditoria de Site B2B - Diagnóstico de Performance Gratuito"
      description="Analise gratuitamente a performance, SEO e conformidade do seu site B2B. Auditoria técnica com PageSpeed Insights e análise de Core Web Vitals."
      canonical="https://revhackers.com.br/score-site"
      breadcrumbs={[
        { name: "Home", url: "https://revhackers.com.br/" },
        { name: "Diagnósticos", url: "https://revhackers.com.br/diagnostico" },
        { name: "Score Site", url: "https://revhackers.com.br/score-site" }
      ]}
    />
  );

  return (
    <>
      {seoComponent}
      {step === 'url-input' || step === 'analyzing' ? (
        <SiteScoreHero
          step={step}
          targetUrl={targetUrl}
          setTargetUrl={setTargetUrl}
          competitorUrls={competitorUrls}
          setCompetitorUrls={setCompetitorUrls}
          onStart={() => setStep('questions')}
          progress={progress}
          loadingStatus={loadingStatus}
        />
      ) : step === 'questions' ? (
        <SiteScoreQuiz
          currentQ={currentQ}
          selectedOption={selectedOption}
          showLog={showLog}
          onAnswer={handleAnswer}
        />
      ) : step === 'results' ? (
        <SiteScoreResult
          finalScore={finalScore}
          psiResults={psiResults}
          hasSubmittedLead={hasSubmittedLead}
          onSubmitLead={handleFormSubmit}
          isSubmitting={isSubmitting}
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentScore={computedCurrentScore}
          psiSeoScore={psiSeoScore}
          benchmarkResult={benchmarkResult}
          isBenchmarking={isBenchmarking}
          score={score}
          insights={insights}
          isBookingModalOpen={isBookingModalOpen}
          setIsBookingModalOpen={setIsBookingModalOpen}
        />
      ) : null}
    </>
  );
};

export default SiteScore;
