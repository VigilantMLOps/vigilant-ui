import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Activity, Zap, BrainCircuit, ShieldAlert, Home } from 'lucide-react';

const mlopsNav = [
  { to: '/mlops', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/evaluation', label: 'Evaluation', icon: BarChart3, end: false },
  { to: '/feature-drift', label: 'Feature Drift', icon: Activity, end: false },
  { to: '/model-serving', label: 'Model Serving', icon: ShieldAlert, end: false },
];

const llmopsNav = [
  { to: '/llm-ops', label: 'LLM Traces', icon: BrainCircuit, end: true },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isLLMOps = pathname.startsWith('/llm-ops');
  const navItems = isLLMOps ? llmopsNav : mlopsNav;

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-20 dark:bg-gray-950 dark:border-gray-800">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-gray-900 font-semibold text-sm leading-tight dark:text-white">Atlas AI</p>
          <p className="text-gray-500 text-xs">Observability Platform</p>
        </div>
      </Link>

      {/* Mode switcher */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <button
            onClick={() => navigate('/mlops')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              !isLLMOps
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            MLOps
          </button>
          <button
            onClick={() => navigate('/llm-ops')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              isLLMOps
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            LLMOps
          </button>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? isLLMOps
                    ? 'bg-purple-600/15 text-purple-500 border border-purple-600/20 dark:text-purple-400'
                    : 'bg-blue-600/15 text-blue-600 border border-blue-600/20 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={
                    isActive
                      ? isLLMOps ? 'text-purple-500 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                  }
                  strokeWidth={2}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: back to home + status */}
      <div className="px-3 pb-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent transition-all dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800/60"
        >
          <Home size={14} className="text-gray-400" strokeWidth={2} />
          All Products
        </NavLink>
      </div>

      <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-500">Connected</span>
        </div>
      </div>
    </aside>
  );
}
