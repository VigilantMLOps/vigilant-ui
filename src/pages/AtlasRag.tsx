import { useNavigate } from 'react-router-dom';
import {
  Zap, BookOpen, ArrowLeft, ExternalLink, Sun, Moon,
  Search, Database, Brain, BarChart3, Eye, FolderOpen,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const stack = [
  {
    icon: FolderOpen,
    title: 'Obsidian Vault',
    desc: 'Points to your Obsidian vault via VAULT_PATH. Watches for file changes and re-indexes automatically using a background watchdog.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Database,
    title: 'Qdrant',
    desc: 'Vector database for dense + sparse embeddings. Stores chunked notes with source metadata. Async client for non-blocking queries.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Search,
    title: 'Hybrid Retrieval',
    desc: 'Dense search (nomic-embed-text via Ollama) + BM25 sparse retrieval in parallel. Cross-encoder reranker narrows to the top-k most relevant chunks.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Brain,
    title: 'Ollama Generation',
    desc: 'Runs llama3.2:3b locally. Query mode routing (factual / synthesis / task / reasoning) selects the right prompt template before calling the LLM.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    icon: BarChart3,
    title: 'Trace Observability',
    desc: 'Every query emits a structured trace: retrieval latency, generation latency, top retrieval score, token count, and source file paths.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Eye,
    title: 'Atlas LLMOps Integration',
    desc: 'Traces are pushed in real time to vigilant-api and visible in the LLMOps dashboard — latency breakdowns, retrieval score trends, query history.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
];

const queryModes = [
  { mode: 'factual', desc: 'Direct lookup — single best matching note', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' },
  { mode: 'synthesis', desc: 'Combines multiple sources into a unified answer', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { mode: 'task', desc: 'Action-oriented — extracts todos and next steps', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { mode: 'reasoning', desc: 'Multi-hop: builds a chain of reasoning across notes', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
];

export default function AtlasRag() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-20 border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-950/80">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft size={14} /> All Products
            </button>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <BookOpen size={13} className="text-rose-500" strokeWidth={1.8} />
              </div>
              <span className="font-semibold text-gray-900 text-sm dark:text-white">Atlas RAG</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <a
              href="https://github.com/VigilantMLOps/vigilant-rag"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors dark:border-gray-700 dark:hover:border-gray-500 dark:text-gray-300 dark:hover:text-white"
            >
              <ExternalLink size={12} /> GitHub
            </a>
          </div>
        </div>
      </nav>

      <div className="pt-14">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium mb-5">
            <BookOpen size={11} />
            Self-hosted · Runs on Ollama + Qdrant
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-3">
            Atlas RAG
          </h1>
          <p className="text-rose-600 dark:text-rose-400 font-medium text-lg mb-4">
            Production-grade RAG over your Obsidian notes
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-2xl leading-relaxed mb-6">
            A local, self-hosted retrieval-augmented generation system that indexes your Obsidian vault
            and lets you query it with natural language. Hybrid dense + sparse retrieval, cross-encoder
            reranking, and query mode routing — all running on Ollama, with every query traced to Atlas LLMOps.
          </p>
          <div className="flex items-center gap-3 mb-3">
            <a
              href="https://github.com/VigilantMLOps/vigilant-rag"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-medium transition-colors"
            >
              View on GitHub <ExternalLink size={14} />
            </a>
            <button
              onClick={() => navigate('/llm-ops')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 font-medium transition-colors dark:border-gray-700 dark:hover:border-gray-500 dark:text-gray-300 dark:hover:text-white"
            >
              View traces in LLMOps
            </button>
          </div>
        </section>

        {/* Architecture */}
        <section className="max-w-5xl mx-auto px-6 pb-10">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            How it works
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {[
                { label: 'Obsidian vault', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' },
                { label: '→', color: 'text-gray-400' },
                { label: 'Watchdog indexer', color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
                { label: '→', color: 'text-gray-400' },
                { label: 'Chunk + embed (nomic-embed-text)', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' },
                { label: '→', color: 'text-gray-400' },
                { label: 'Qdrant (dense + sparse)', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' },
              ].map((item, i) => (
                item.label === '→'
                  ? <span key={i} className={`font-bold ${item.color}`}>{item.label}</span>
                  : <span key={i} className={`px-2 py-1 rounded border font-medium ${item.color}`}>{item.label}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
              {[
                { label: 'POST /api/v1/query', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' },
                { label: '→', color: 'text-gray-400' },
                { label: 'Hybrid retrieval (dense + BM25)', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400' },
                { label: '→', color: 'text-gray-400' },
                { label: 'Cross-encoder reranker', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400' },
                { label: '→', color: 'text-gray-400' },
                { label: 'Ollama (llama3.2:3b)', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400' },
                { label: '→', color: 'text-gray-400' },
                { label: 'Trace → Atlas LLMOps', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400' },
              ].map((item, i) => (
                item.label === '→'
                  ? <span key={i} className={`font-bold ${item.color}`}>{item.label}</span>
                  : <span key={i} className={`px-2 py-1 rounded border font-medium ${item.color}`}>{item.label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Query modes */}
        <section className="max-w-5xl mx-auto px-6 pb-10">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Query modes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {queryModes.map(({ mode, desc, color }) => (
              <div key={mode} className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-900/60 dark:border-gray-800">
                <span className={`inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border shrink-0 mt-0.5 ${color}`}>
                  {mode}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="max-w-5xl mx-auto px-6 pb-10">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stack.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-900/60 dark:border-gray-800 p-5"
                >
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border mb-3 ${f.bg}`}>
                    <Icon size={15} className={f.color} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Start with Pack */}
        <section className="max-w-5xl mx-auto px-6 pb-10">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
            <p className="text-xs font-medium text-rose-500 uppercase tracking-wider mb-3">Start with Atlas Pack</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Atlas RAG ships with a <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">vigilant.yaml</code> manifest.
              Use Atlas Pack to bring up Qdrant and Ollama, pull the models, and start the app in one command:
            </p>
            <div className="bg-gray-950 rounded-xl border border-gray-800 px-4 py-3 font-mono text-sm inline-flex items-center gap-2">
              <span className="text-amber-400">$</span>
              <span className="text-gray-200">vigilantpack run</span>
            </div>
            <div className="mt-3">
              <button
                onClick={() => navigate('/pack')}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline"
              >
                Learn about Atlas Pack →
              </button>
            </div>
          </div>
        </section>

        {/* Env config */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Setup
          </h2>
          <div className="bg-gray-950 rounded-xl border border-gray-800 p-5 font-mono text-xs">
            <p className="text-gray-500 mb-2"># .env</p>
            <p className="text-gray-200">VAULT_PATH=<span className="text-amber-400">/path/to/your/obsidian/vault</span></p>
            <p className="text-gray-500 mt-3 mb-1"># optional overrides</p>
            <p className="text-gray-400">QDRANT_URL=http://localhost:6333</p>
            <p className="text-gray-400">OLLAMA_URL=http://localhost:11434</p>
            <p className="text-gray-400">VIGILANT_API_URL=http://localhost:8000</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
            <code className="font-mono">VAULT_PATH</code> is required — vigilant-rag will refuse to start if the directory doesn't exist.
            Traces are sent to Atlas LLMOps automatically when <code className="font-mono">VIGILANT_API_URL</code> is reachable.
          </p>
        </section>

        <footer className="border-t border-gray-200/60 dark:border-gray-800/60 py-8">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600">
                <Zap size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Atlas AI</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600">Atlas RAG · RAG over Obsidian notes</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
