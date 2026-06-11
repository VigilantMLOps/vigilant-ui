import { useNavigate } from 'react-router-dom';
import { Zap, ShieldAlert, BrainCircuit, Package, BookOpen, ArrowRight, Activity, BarChart3, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const products = [
  {
    id: 'mlops',
    name: 'Atlas MLOps',
    tagline: 'ML Observability Platform',
    description: 'Production-grade monitoring for binary classifiers. Real-time drift detection (PSI / KS / Chi²), incident management, pre-production evaluation, and performance decay tracking.',
    icon: BarChart3,
    color: 'blue',
    href: '/mlops',
    tags: ['Drift Detection', 'Incident Alerts', 'Model Evaluation'],
    status: 'live',
  },
  {
    id: 'detect',
    name: 'Atlas Detect',
    tagline: 'ATO Detection & Model Serving',
    description: 'Real-time Account Takeover detection. XGBoost + isotonic calibration, Redis-backed online features, ALLOW / CHALLENGE / BLOCK decisions with P95 < 50ms.',
    icon: ShieldAlert,
    color: 'emerald',
    href: '/model-serving',
    tags: ['ATO Detection', 'Live Scoring', 'Risk Classification'],
    status: 'live',
  },
  {
    id: 'llmops',
    name: 'Atlas LLMOps',
    tagline: 'LLM Observability',
    description: 'Token-level cost tracking, latency P50/P95/P99, error rates by model, and prompt/completion previews. Built for multi-provider LLM fleets.',
    icon: BrainCircuit,
    color: 'purple',
    href: '/llm-ops',
    tags: ['Cost Tracking', 'Latency P95', 'Trace Analysis'],
    status: 'live',
  },
  {
    id: 'pack',
    name: 'Atlas Pack',
    tagline: 'ML Security Toolkit',
    description: 'Pre-built datasets, attack pattern libraries, and evaluation harnesses for security-focused machine learning models.',
    icon: Package,
    color: 'amber',
    href: '/pack',
    tags: ['Attack Patterns', 'Evaluation Harness', 'Datasets'],
    status: 'live',
  },
  {
    id: 'rag',
    name: 'Atlas RAG',
    tagline: 'RAG Evaluation & Monitoring',
    description: 'End-to-end tracing for retrieval-augmented generation pipelines. Hybrid retrieval, query mode routing, and per-query observability.',
    icon: BookOpen,
    color: 'rose',
    href: '/rag',
    tags: ['Hybrid Retrieval', 'Trace Analysis', 'Self-hosted'],
    status: 'live',
  },
];

const colorMap = {
  blue: {
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'hover:border-blue-500/40',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
    icon: 'bg-blue-500/10 border-blue-500/20',
  },
  emerald: {
    border: 'border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'hover:border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    icon: 'bg-emerald-500/10 border-emerald-500/20',
  },
  purple: {
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    glow: 'hover:border-purple-500/40',
    badge: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
    icon: 'bg-purple-500/10 border-purple-500/20',
  },
  amber: {
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'hover:border-amber-500/40',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    icon: 'bg-amber-500/10 border-amber-500/20',
  },
  rose: {
    border: 'border-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    glow: 'hover:border-rose-500/40',
    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
    icon: 'bg-rose-500/10 border-rose-500/20',
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-20 border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-950/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600">
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-gray-900 text-sm dark:text-white">Atlas AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => navigate('/mlops')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              Open Dashboard <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-14">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium mb-6">
            <Activity size={11} />
            Production ML Observability
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-4">
            Intelligence for every
            <span className="text-blue-600 dark:text-blue-400"> ML system</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            A unified platform for monitoring, detecting, and explaining production ML and LLM systems.
            From feature drift to ATO detection to LLM trace analysis.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => navigate('/mlops')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              Open Dashboard <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/model-serving')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 font-medium transition-colors dark:border-gray-700 dark:hover:border-gray-500 dark:text-gray-300 dark:hover:text-white"
            >
              Try Model Serving <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* Products grid */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            Platform Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const c = colorMap[product.color as keyof typeof colorMap];
              const Icon = product.icon;
              const isLive = product.status === 'live';

              return (
                <div
                  key={product.id}
                  onClick={() => isLive && navigate(product.href)}
                  className={`group relative rounded-2xl border bg-gray-50 dark:bg-gray-900/60 p-5 transition-all duration-200 ${c.border} ${c.glow} ${
                    isLive ? 'cursor-pointer' : 'opacity-60 cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-xl border ${c.icon}`}>
                      <Icon size={17} className={c.text} strokeWidth={1.8} />
                    </div>
                    {isLive ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Live</span>
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">Coming soon</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{product.name}</h3>
                  <p className={`text-xs font-medium mb-2 ${c.text}`}>{product.tagline}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${c.badge}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {isLive && (
                    <div className={`flex items-center gap-1 text-xs font-medium transition-colors ${c.text} opacity-0 group-hover:opacity-100`}>
                      Open <ArrowRight size={11} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200/60 dark:border-gray-800/60 py-8">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600">
                <Zap size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Atlas AI</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600">Intelligence for every ML system</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
