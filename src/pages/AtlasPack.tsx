import { useNavigate } from 'react-router-dom';
import {
  Zap, Package, ArrowLeft, Terminal, CheckCircle2,
  ExternalLink, Sun, Moon, AlertCircle, Play, Stethoscope,
  Activity, StopCircle, FileText,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const stages = [
  { name: 'VALIDATE', desc: 'Parse and validate vigilant.yaml', color: 'text-blue-500', dot: 'bg-blue-500' },
  { name: 'PREFLIGHT', desc: 'Check Docker, env vars, ports, disk space', color: 'text-purple-500', dot: 'bg-purple-500' },
  { name: 'INFRA', desc: 'docker compose up + poll health endpoints', color: 'text-amber-500', dot: 'bg-amber-500' },
  { name: 'MODELS', desc: 'Pull missing Ollama models, optional warmup', color: 'text-orange-500', dot: 'bg-orange-500' },
  { name: 'RUNTIME', desc: 'Start app service, wait for health endpoint', color: 'text-emerald-500', dot: 'bg-emerald-500' },
  { name: 'READY', desc: 'Print ready banner with elapsed time and URL', color: 'text-teal-500', dot: 'bg-teal-500' },
];

const commands = [
  {
    icon: Play,
    name: 'run',
    desc: 'Start the full stack — runs all 6 stages and prints live progress',
    example: 'vigilantpack run',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Stethoscope,
    name: 'doctor',
    desc: 'Check prerequisites without starting anything. Exits 0 if all checks pass',
    example: 'vigilantpack doctor',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Activity,
    name: 'status',
    desc: 'Show the current health of all services and models',
    example: 'vigilantpack status',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: StopCircle,
    name: 'stop',
    desc: 'Stop all services. Data volumes are preserved',
    example: 'vigilantpack stop',
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  {
    icon: FileText,
    name: 'logs',
    desc: 'Stream or tail logs for all services or a specific one',
    example: 'vigilantpack logs ollama --follow',
    color: 'text-gray-500',
    bg: 'bg-gray-100 border-gray-200 dark:bg-gray-800/60 dark:border-gray-700',
  },
];

const manifestYaml = `vigilantpack: "1"

app:
  name: vigilant-rag
  version: 1.2.0

compose: docker-compose.yml

env:
  file: .env
  require:
    - VAULT_PATH

services:
  qdrant:
    health: http://localhost:6333/health
    timeout: 30
  ollama:
    health: http://localhost:11434/api/version
    timeout: 60

models:
  - name: nomic-embed-text
    required: true
    warmup: true
  - name: llama3.2:3b
    required: true
    warmup: false

runtime:
  service: vigilant-rag
  health: http://localhost:8080/health
  timeout: 45`;

export default function AtlasPack() {
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
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Package size={13} className="text-amber-500" strokeWidth={1.8} />
              </div>
              <span className="font-semibold text-gray-900 text-sm dark:text-white">Atlas Pack</span>
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
              href="https://github.com/VigilantMLOps/vigilant-pack"
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium mb-5">
            <Terminal size={11} />
            CLI Tool · pip install vigilantpack
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-3">
            Atlas Pack
          </h1>
          <p className="text-amber-600 dark:text-amber-400 font-medium text-lg mb-4">
            Deterministic Startup Runner for ML/LLM Applications
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-2xl leading-relaxed mb-8">
            A single command that reads a <code className="px-1 py-0.5 text-sm bg-gray-100 dark:bg-gray-800 rounded font-mono">vigilant.yaml</code> manifest,
            brings up your Docker services, pulls required Ollama models, warms up inference,
            and waits for your app to be healthy — in one deterministic 6-stage pipeline.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/VigilantMLOps/vigilant-pack"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-medium transition-colors"
            >
              View on GitHub <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* Terminal demo */}
        <section className="max-w-5xl mx-auto px-6 pb-10">
          <div className="bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden font-mono text-sm">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-xs text-gray-500">terminal</span>
            </div>
            <div className="p-5 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 shrink-0">$</span>
                <span className="text-gray-200">vigilantpack run</span>
              </div>
              {stages.map((s, i) => (
                <div key={s.name} className="flex items-start gap-3 pl-2">
                  <span className="text-gray-600 shrink-0 tabular-nums">{String(i + 1).padStart(2, ' ')}.</span>
                  <span className={`shrink-0 font-semibold ${s.color}`}>{s.name.padEnd(10)}</span>
                  <span className="text-gray-400">{s.desc}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                <span className="text-gray-500">───────────── </span>
                <span className="text-emerald-400 font-semibold">vigilant-rag  v1.2.0  ready  (38s)</span>
                <span className="text-gray-500"> ─────────────</span>
              </div>
              <div className="text-center">
                <span className="text-gray-500 mr-4">API</span>
                <span className="text-blue-400">http://localhost:8080</span>
              </div>
            </div>
          </div>
        </section>

        {/* vigilant.yaml manifest */}
        <section className="max-w-5xl mx-auto px-6 pb-10">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            vigilant.yaml — manifest format
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-950 rounded-xl border border-gray-800 p-5 font-mono text-xs overflow-x-auto">
              <pre className="text-gray-300 whitespace-pre">{manifestYaml}</pre>
            </div>
            <div className="space-y-3">
              {[
                { key: 'app', desc: 'Your application name and version — shown in the ready banner' },
                { key: 'compose', desc: 'Path to your docker-compose.yml. VigilantPack calls this to bring up services' },
                { key: 'env.require', desc: 'Variable names that must be set before any stage runs. Missing vars abort immediately' },
                { key: 'services', desc: 'Each entry is a Docker Compose service with a health URL. Pack polls it until healthy or timeout' },
                { key: 'models', desc: 'Ollama models to pull. required: true aborts on failure. warmup: true sends a test inference to pre-load into memory' },
                { key: 'runtime', desc: 'Your application service name and health endpoint. Final stage — pack waits here until your app is ready' },
              ].map(({ key, desc }) => (
                <div key={key} className="flex gap-3">
                  <code className="text-amber-500 font-mono text-xs shrink-0 mt-0.5 dark:text-amber-400">{key}</code>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commands */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Commands
          </h2>
          <div className="space-y-3">
            {commands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <div key={cmd.name} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-900/60 dark:border-gray-800">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${cmd.bg}`}>
                    <Icon size={15} className={cmd.color} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-0.5">
                      <code className="text-sm font-semibold font-mono text-gray-900 dark:text-white">vigilantpack {cmd.name}</code>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{cmd.desc}</span>
                    </div>
                    <code className="text-xs text-gray-400 dark:text-gray-600 font-mono">{cmd.example}</code>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Preflight checks */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Preflight checks
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                { check: 'Docker daemon', pass: 'running', warn: '—', fail: 'not found / not running' },
                { check: 'Required env vars', pass: 'all set', warn: '—', fail: 'any missing' },
                { check: 'VAULT_PATH', pass: 'directory exists', warn: '—', fail: 'directory missing' },
                { check: 'Ports', pass: 'free, or service already healthy on port', warn: '—', fail: 'occupied by unknown process' },
                { check: 'Disk space', pass: '≥ 10 GB free', warn: '< 10 GB free', fail: '—' },
              ].map(({ check, pass, warn, fail }) => (
                <div key={check} className="grid grid-cols-4 gap-4 px-4 py-3 text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{check}</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={11} /> {pass}
                  </span>
                  <span className={`${warn !== '—' ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`}>{warn}</span>
                  <span className={`${fail !== '—' ? 'flex items-center gap-1.5 text-red-500' : 'text-gray-300 dark:text-gray-700'}`}>
                    {fail !== '—' && <AlertCircle size={11} />} {fail}
                  </span>
                </div>
              ))}
              <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/40">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Check</span>
                <span className="text-[10px] text-emerald-500 uppercase tracking-wider">PASS</span>
                <span className="text-[10px] text-amber-500 uppercase tracking-wider">WARN</span>
                <span className="text-[10px] text-red-500 uppercase tracking-wider">FAIL</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">WARN checks are advisory — the run continues. FAIL checks abort immediately.</p>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <Package size={32} className="text-amber-500 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              One command to start everything
            </h3>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-950 rounded-lg border border-gray-800 font-mono text-sm mb-5">
              <span className="text-amber-400">$</span>
              <span className="text-gray-200">pip install vigilantpack && vigilantpack run</span>
            </div>
            <div className="block">
              <a
                href="https://github.com/VigilantMLOps/vigilant-pack"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-medium transition-colors"
              >
                View on GitHub <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200/60 dark:border-gray-800/60 py-8">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600">
                <Zap size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Atlas AI</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600">Atlas Pack · Deterministic Startup Runner</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
