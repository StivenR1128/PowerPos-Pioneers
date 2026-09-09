import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'node:net';

const INICIO = Buffer.from([0x1b, 0x40]);
const CORTE = Buffer.from([0x1d, 0x56, 0x41, 0x03]);

@Injectable()
export class ImpresionService {
  private readonly logger = new Logger(ImpresionService.name);

  async imprimirComanda(pedido: any, empresaId: number) {
    if (String(process.env.ESC_POS_ENABLED).toLowerCase() !== 'true') {
      return {
        impreso: false,
        modo: 'browser',
        fallbackBrowser: String(process.env.ESC_POS_BROWSER_FALLBACK).toLowerCase() === 'true',
        motivo: 'ESC_POS_ENABLED no está activo',
      };
    }

    const contenido = this.formatearComanda(pedido, empresaId);
    const tipo = (process.env.ESC_POS_TYPE || 'tcp').toLowerCase();

    if (tipo !== 'tcp') {
      return { impreso: false, modo: tipo, motivo: 'El modo configurado no está soportado por el servidor' };
    }

    const host = process.env.ESC_POS_HOST;
    const port = Number(process.env.ESC_POS_PORT || 9100);
    if (!host) {
      return { impreso: false, modo: 'tcp', motivo: 'Falta ESC_POS_HOST' };
    }

    await new Promise<void>((resolve, reject) => {
      const socket = new Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error(`Tiempo agotado conectando a ${host}:${port}`));
      }, 5000);

      socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      socket.connect(port, host, () => {
        socket.end(Buffer.concat([INICIO, contenido, CORTE]), () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }).catch((error: Error) => {
      this.logger.warn(`No se pudo imprimir comanda: ${error.message}`);
      throw error;
    });

    return { impreso: true, modo: 'tcp' };
  }

  async abrirCajon() {
    if (String(process.env.ESC_POS_ENABLED).toLowerCase() !== 'true') {
      return { abierto: false, motivo: 'ESC_POS_ENABLED no está activo' };
    }

    const host = process.env.ESC_POS_HOST;
    const port = Number(process.env.ESC_POS_PORT || 9100);
    if (!host) return { abierto: false, motivo: 'Falta ESC_POS_HOST' };

    await new Promise<void>((resolve, reject) => {
      const socket = new Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error(`Tiempo agotado conectando a ${host}:${port}`));
      }, 5000);
      socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      socket.connect(port, host, () => {
        socket.end(Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]), () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    });

    return { abierto: true };
  }

  private formatearComanda(pedido: any, empresaId: number) {
    const lineas = [
      '\n',
      '              COMANDA\n',
      `              ${pedido.numero}\n`,
      `${new Date().toLocaleString('es-CO')}\n`,
      `Empresa #${empresaId}\n`,
      '--------------------------------\n',
    ];

    for (const detalle of pedido.detalles || []) {
      lineas.push(`${detalle.cantidad}x ${detalle.producto?.nombre || 'Producto'}\n`);
      if (detalle.exclusiones?.length) {
        lineas.push(`   SIN: ${detalle.exclusiones.join(', ')}\n`);
      }
      if (detalle.observacion) {
        lineas.push(`   NOTA: ${detalle.observacion}\n`);
      }
    }

    if (pedido.observacion) {
      lineas.push('--------------------------------\n', `NOTA: ${pedido.observacion}\n`);
    }
    lineas.push('\n\n');
    return Buffer.from(lineas.join(''), 'ascii');
  }
}