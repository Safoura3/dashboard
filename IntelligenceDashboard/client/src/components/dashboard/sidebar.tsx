import { TrendingUp, LayoutDashboard, Search, BarChart3, Bell, Settings, MoreVertical, Cloud } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white dark:bg-slate-800 shadow-sm border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900 dark:text-white">
            VeilleScope
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Tableau de bord</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span>Recherche avancée</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          <span>Analytics</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span>Alertes</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
        </a>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              Jean Dupont
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Analyste
            </p>
          </div>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
