'use client';

import { useEffect, useState } from 'react';

interface ItemPantalla {
  nombre: string;
  cantidad: number;
  precio: number;
  adicionales?: { nombre: string; cantidad: number }[];
}

interface EstadoPantalla {
  empresa: string;
  items: ItemPantalla[];
  total: number;
  pedido: string | null;
}

const estadoInicial: EstadoPantalla = {
  empresa: 'PowerPOS',
  items: [],
  total: 0,
  pedido: null,
};

export default function PantallaClientePage() {
  const [estado, setEstado] = useState<EstadoPantalla>(estadoInicial);

  useEffect(() => {
    const canal = new BroadcastChannel('powerpos-pantalla-cliente');
    canal.onmessage = (evento) => setEstado({ ...estadoInicial, ...evento.data });
    return () => canal.close();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-orange-400 font-semibold tracking-widest uppercase text-sm">{estado.empresa}</p>
          <h1 className="text-3xl font-black mt-1">Resumen de su pedido</h1>
        </div>
        <div className="text-right text-slate-400 text-sm">Revise los productos antes de pagar</div>
      </header>

      <section className="flex-1 p-8 grid grid-cols-[1fr_360px] gap-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
          {estado.pedido && (
            <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-4 text-emerald-300">
              Pedido <strong>{estado.pedido}</strong> registrado. Gracias por su compra.
            </div>
          )}
          {estado.items.length === 0 ? (
            <div className="h-full min-h-72 flex items-center justify-center text-slate-500 text-2xl">
              Aquí verá su pedido
            </div>
          ) : (
            <div className="space-y-4">
              {estado.items.map((item, index) => (
                <div key={`${item.nombre}-${index}`} className="flex items-start gap-5 border-b border-slate-800 pb-4">
                  <span className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center text-xl font-black shrink-0">
                    {item.cantidad}
                  </span>
                  <div className="flex-1">
                    <span className="text-2xl font-semibold">{item.nombre}</span>
                    {item.adicionales && item.adicionales.length > 0 && (
                      <div className="mt-1 text-base text-emerald-400">
                        {item.adicionales.map((a, i) => (
                          <span key={i} className="mr-3">+ {a.nombre}{a.cantidad > 1 ? ` x${a.cantidad}` : ''}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xl text-slate-300">${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-2xl bg-orange-500 p-8 text-slate-950 flex flex-col justify-between">
          <div>
            <p className="uppercase tracking-widest font-bold text-sm opacity-70">Total a pagar</p>
            <p className="text-5xl font-black mt-3">${estado.total.toLocaleString('es-CO')}</p>
          </div>
          <p className="font-semibold text-lg">Gracias por elegirnos</p>
        </aside>
      </section>
    </main>
  );
}