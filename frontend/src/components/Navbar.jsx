import React from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, Package, BarChart3, MessageSquare, History } from 'lucide-react';
import { useLiveStore } from '../store/useLiveStore';

export const Navbar = () => {
  const { sesionActual } = useLiveStore();
  const isLiveActive = sesionActual?.estado === 'activa';

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-40 w-auto max-w-[160px] object-contain"
          />
        </div>

        {/* Links */}
        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <Package className="w-4 h-4" />
            Inventario / Stock
          </NavLink>

          <NavLink
            to="/monitor"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <Radio className="w-4 h-4" />
            Live Monitor
          </NavLink>

          <NavLink
            to="/post-live"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            Post-Live (Cierre)
          </NavLink>

          <NavLink
            to="/auditoria"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <History className="w-4 h-4" />
            Auditoría
          </NavLink>

          <NavLink
            to="/simulador-chat"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <MessageSquare className="w-4 h-4" />
            Simulador Chat TikTok
          </NavLink>
        </nav>

        {/* Status Indicator */}
        <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-red-500 animate-ping' : 'bg-slate-500'
              }`}
          />
          <span className={isLiveActive ? 'text-red-400 font-semibold' : 'text-slate-400'}>
            {isLiveActive ? 'TRANSMISIÓN EN VIVO' : 'SIN LIVE ACTIVO'}
          </span>
        </div>
      </div>
    </header>
  );
};
