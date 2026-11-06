import React, { useState, useEffect } from 'react';
import { useLiveStore } from '../store/useLiveStore';
import { Package, Plus, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export const PreLivePage = () => {
  const {
    sesionActual,
    productos,
    cargando,
    cargarSesionActiva,
    iniciarSesion,
    agregarProducto
  } = useLiveStore();

  const [codigo, setCodigo] = useState('');
  const [stock, setStock] = useState('');
  const [precio, setPrecio] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    cargarSesionActiva();
  }, []);

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!codigo || !stock || !precio) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    const res = await agregarProducto({
      codigo_chat: codigo,
      stock_inicial: stock,
      precio: precio
    });

    if (res.success) {
      setFormSuccess(`Producto ${codigo.toUpperCase()} cargado con éxito.`);
      setCodigo('');
      setStock('');
      setPrecio('');
    } else {
      setFormError(res.error || 'Error al cargar producto.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header / Session Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Configuración Pre-Live (Inventario)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Carga los códigos de prendas y stock disponible antes de iniciar la transmisión.
          </p>
        </div>

        {!sesionActual || sesionActual.estado === 'finalizada' ? (
          <button
            onClick={iniciarSesion}
            disabled={cargando}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Crear Nueva Sesión Live
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Sesión Activa: <strong className="font-mono">{sesionActual.id.slice(0, 8)}...</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Carga */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Cargar Prenda / Producto
          </h2>

          {!sesionActual || sesionActual.estado !== 'activa' ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Primero crea o activa una sesión live para comenzar a cargar productos al catálogo.</p>
            </div>
          ) : (
            <form onSubmit={handleCrearProducto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Código de Chat (Ej: R38, V04)
                </label>
                <input
                  type="text"
                  placeholder="R38"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="2"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="15000"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {formError && (
                <div className="text-red-400 bg-red-500/10 border border-red-500/20 text-xs p-3 rounded-lg">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs p-3 rounded-lg">
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Registrar Producto
              </button>
            </form>
          )}
        </div>

        {/* Tabla / Listado de Productos */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Catálogo Registrado ({productos.length})
            </h2>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <Package className="w-10 h-10 mx-auto stroke-slate-600 mb-2" />
              <p>No hay productos cargados en esta sesión todavía.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Stock Inicial</th>
                    <th className="px-4 py-3 font-semibold">Stock Disp.</th>
                    <th className="px-4 py-3 font-semibold">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {productos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                        {prod.codigo_chat}
                      </td>
                      <td className="px-4 py-3">{prod.stock_inicial} u.</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            prod.stock_disponible > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {prod.stock_disponible} disponibles
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        ${Number(prod.precio).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
