import React, { useState, useEffect } from 'react';
import { useLiveStore } from '../store/useLiveStore';
import {
  Package,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Edit2,
  Trash2,
  Check,
  X,
  Radio
} from 'lucide-react';

export const PreLivePage = () => {
  const {
    sesionActual,
    productos,
    cargando,
    cargarSesionActiva,
    iniciarSesion,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    importarCatalogoAnterior
  } = useLiveStore();

  const [codigo, setCodigo] = useState('');
  const [stock, setStock] = useState('');
  const [precio, setPrecio] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  // Estado para edición en línea de un producto
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [editCodigo, setEditCodigo] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editPrecio, setEditPrecio] = useState('');

  useEffect(() => {
    cargarSesionActiva();
  }, []);

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!codigo.trim() || !stock || !precio) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    const res = await agregarProducto({
      codigo_chat: codigo.trim().toUpperCase(),
      stock_inicial: stock,
      precio: precio
    });

    if (res.success) {
      setFormSuccess(`Prenda "${codigo.trim().toUpperCase()}" registrada con éxito.`);
      setCodigo('');
      setStock('');
      setPrecio('');
    } else {
      setFormError(res.error || 'Error al cargar producto.');
    }
  };

  const iniciarEdicion = (prod) => {
    setProductoEditandoId(prod.id);
    setEditCodigo(prod.codigo_chat);
    setEditStock(prod.stock_disponible);
    setEditPrecio(prod.precio);
  };

  const cancelarEdicion = () => {
    setProductoEditandoId(null);
  };

  const guardarEdicion = async (id) => {
    if (!editCodigo.trim() || editStock === '' || editPrecio === '') return;

    const res = await editarProducto(id, {
      codigo_chat: editCodigo.trim().toUpperCase(),
      stock_disponible: Number(editStock),
      precio: Number(editPrecio)
    });

    if (res.success) {
      setProductoEditandoId(null);
      setFormSuccess('Producto actualizado correctamente.');
    } else {
      alert(res.error || 'Error al actualizar producto');
    }
  };

  const handleEliminar = async (prod) => {
    if (confirm(`¿Seguro que deseas eliminar la prenda "${prod.codigo_chat}" del inventario?`)) {
      const res = await eliminarProducto(prod.id);
      if (res.success) {
        setFormSuccess(`Prenda "${prod.codigo_chat}" eliminada.`);
      } else {
        alert(res.error || 'Error al eliminar producto');
      }
    }
  };

  const handleImportarAnterior = async () => {
    setImportLoading(true);
    setFormSuccess('');
    setFormError('');
    const res = await importarCatalogoAnterior();
    setImportLoading(false);
    if (res.success) {
      setFormSuccess(`Se importaron ${res.count} productos con éxito.`);
    } else {
      setFormError(res.error || 'No se pudieron importar productos.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header / Session Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Control de Stock e Inventario
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Carga y gestiona tus prendas antes, durante o después de la transmisión. El stock permanece siempre disponible.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!sesionActual || sesionActual.estado !== 'activa' ? (
            <button
              onClick={iniciarSesion}
              disabled={cargando}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              Prender Transmisión Live
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Live Activo: <strong className="font-mono">{sesionActual.id.slice(0, 8)}</strong></span>
            </div>
          )}

          <button
            onClick={handleImportarAnterior}
            disabled={importLoading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-700 transition-all cursor-pointer"
            title="Copia los productos de transmisiones anteriores"
          >
            <RotateCcw className="w-4 h-4" />
            {importLoading ? 'Importando...' : 'Reutilizar Catálogo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Carga (Siempre disponible) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Cargar Prenda al Stock
          </h2>

          <form onSubmit={handleCrearProducto} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Código o Nombre (Ej: ROJO, NEGRO, R38, V04)
              </label>
              <input
                type="text"
                placeholder="ROJO"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Stock Disponible
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
              Guardar Prenda en Stock
            </button>
          </form>
        </div>

        {/* Tabla / Listado de Productos con Edición y Eliminación */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Stock Registrado ({productos.length} prendas)
            </h2>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <Package className="w-10 h-10 mx-auto stroke-slate-600 mb-2" />
              <p>No hay prendas cargadas en el inventario.</p>
              <p className="text-xs text-slate-600 mt-1">Carga tu stock usando el formulario de la izquierda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Artículo / Código</th>
                    <th className="px-4 py-3 font-semibold">Stock Disp.</th>
                    <th className="px-4 py-3 font-semibold">Precio</th>
                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {productos.map((prod) => {
                    const isEditing = productoEditandoId === prod.id;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editCodigo}
                              onChange={(e) => setEditCodigo(e.target.value)}
                              className="bg-slate-950 border border-indigo-500 px-2 py-1 rounded text-white font-mono text-xs w-28 uppercase"
                            />
                          ) : (
                            prod.codigo_chat
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="bg-slate-950 border border-indigo-500 px-2 py-1 rounded text-white text-xs w-20"
                            />
                          ) : (
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                prod.stock_disponible > 0
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {prod.stock_disponible} disponibles
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-200">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editPrecio}
                              onChange={(e) => setEditPrecio(e.target.value)}
                              className="bg-slate-950 border border-indigo-500 px-2 py-1 rounded text-white text-xs w-24"
                            />
                          ) : (
                            `$${Number(prod.precio).toLocaleString('es-AR')}`
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => guardarEdicion(prod.id)}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                title="Guardar cambios"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelarEdicion}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => iniciarEdicion(prod)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Editar prenda y stock"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEliminar(prod)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                                title="Eliminar prenda"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
