'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Upload } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';

export default function ConfiguracionPage() {
  const [empresa, setEmpresa] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargarEmpresa();
  }, []);

  const cargarEmpresa = async () => {
    const { data } = await api.get('/empresa');
    setEmpresa(data);
  };

  const subirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const { data } = await api.post('/empresa/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEmpresa({ ...empresa, logo: data.logoUrl });
      setMensaje('✅ Logo actualizado correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (e) {
      setMensaje('❌ Error al subir el logo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <h2 className="text-white text-xl font-bold mb-6">Configuración de empresa</h2>

        {mensaje && (
          <div className={`rounded-lg p-3 mb-4 text-sm ${mensaje.includes('✅') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {mensaje}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          {/* Logo */}
          <div>
            <h3 className="text-white font-semibold mb-4">Logo de la empresa</h3>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
                {empresa?.logo ? (
                  <img src={empresa.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🍔</span>
                )}
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-3">El logo aparece en los tickets de venta</p>
                <input
                  type="file"
                  ref={fileRef}
                  onChange={subirLogo}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  <Upload size={16} />
                  {loading ? 'Subiendo...' : 'Subir logo'}
                </button>
                <p className="text-gray-600 text-xs mt-2">PNG, JPG o WebP — máximo 2MB</p>
              </div>
            </div>
          </div>

          {/* Info empresa */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-white font-semibold mb-4">Información de la empresa</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Nombre</span>
                <span className="text-white">{empresa?.nombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">NIT</span>
                <span className="text-white">{empresa?.nit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{empresa?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Teléfono</span>
                <span className="text-white">{empresa?.telefono || 'No registrado'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}