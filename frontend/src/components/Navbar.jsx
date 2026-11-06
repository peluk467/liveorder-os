import React from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, Package, BarChart3, ShoppingBag } from 'lucide-react';
import { useLiveStore } from '../store/useLiveStore';

export const Navbar = () => {
  const { sesionActual } = useLiveStore();
  const isLiveActive = sesionActual?.estado === 'activa';

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-lg text-red-500 border border-red-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              LiveOrder OS
            </span>
            <span className="ml-2 text-xs font-mono text-slate-500">v1.0</span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <Package className="w-4 h-4" />
            Pre-Live (Inventario)
          </NavLink>

          <NavLink
            to="/monitor"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
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
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            Post-Live (Cierre)
          </NavLink>
        </nav>

        {/* Status Indicator */}
        <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveActive ? 'bg-red-500 animate-ping' : 'bg-slate-500'
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
