import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'node:net';

const INICIO = Buffer.from([0x1b, 0x40]);
const CORTE = Buffer.from([0x1d, 0x56, 0x41, 0x03]);
const TIMEOUT_MS = 3000;

@Injectable()
export class ImpresionService {
  private readonly logger = new Logger(ImpresionService.name);

  // Envía un buffer a la impresora ESC/POS por TCP. Nunca lanza: devuelve
  // el mensaje de error para que el llamador pueda degradar a impresión por navegador.
  private enviarTcp(host: string, port: number, datos: Buffer): Promise<string | null> {
    return new Promise((resolve) => {
      const socket = new Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(`Tiempo agotado conectando a ${host}:${port}`);
      }, TIMEOUT_MS);

      socket.once('error', (error: Error) => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(error.message);
      });
      socket.connect(port, host, () => {
        socket.end(datos, () => {
          clearTimeout(timeout);
          resolve(null);
        });
      });
    });
  }

  async imprimirComanda(pedido: any, empresaId: number) {
    if (String(process.env.ESC_POS_ENABLED).toLowerCase() !== 'true') {
      return {
        impreso: false,
        modo: 'browser',
        fallbackBrowser:
          String(process.env.ESC_POS_BROWSER_FALLBACK).toLowerCase() === 'true',
        motivo: 'ESC_POS_ENABLED no está activo',
      };
    }

    const contenido = this.formatearComanda(pedido, empresaId);
    const tipo = (process.env.ESC_POS_TYPE || 'tcp').toLowerCase();

    if (tipo !== 'tcp') {
      return {
        impreso: false,
        modo: tipo,
        motivo: 'El modo configurado no está soportado por el servidor',
      };
    }

    const host = process.env.ESC_POS_HOST;
    const port = Number(process.env.ESC_POS_PORT || 9100);
    if (!host) {
      return {
        impreso: false,
        modo: 'tcp',
        fallbackBrowser: true,
        motivo: 'Falta ESC_POS_HOST',
      };
    }

    const error = await this.enviarTcp(
      host,
      port,
      Buffer.concat([INICIO, contenido, CORTE]),
    );

    if (error) {
      this.logger.warn(`No se pudo imprimir la comanda en ${host}:${port}: ${error}`);
      return { impreso: false, modo: 'tcp', fallbackBrowser: true, motivo: error };
    }

    return { impreso: true, modo: 'tcp' };
  }

  async imprimirRecibo(pedido: any, empresaId: number) {
    if (String(process.env.ESC_POS_ENABLED).toLowerCase() !== 'true') {
      return {
        impreso: false,
        modo: 'browser',
        fallbackBrowser:
          String(process.env.ESC_POS_BROWSER_FALLBACK).toLowerCase() === 'true',
        motivo: 'ESC_POS_ENABLED no está activo',
      };
    }

    const contenido = this.formatearRecibo(pedido, empresaId);
    const tipo = (process.env.ESC_POS_TYPE || 'tcp').toLowerCase();

    if (tipo !== 'tcp') {
      return {
        impreso: false,
        modo: tipo,
        motivo: 'El modo configurado no está soportado por el servidor',
      };
    }

    const host = process.env.ESC_POS_HOST;
    const port = Number(process.env.ESC_POS_PORT || 9100);
    if (!host) {
      return {
        impreso: false,
        modo: 'tcp',
        fallbackBrowser: true,
        motivo: 'Falta ESC_POS_HOST',
      };
    }

    const error = await this.enviarTcp(
      host,
      port,
      Buffer.concat([INICIO, contenido, CORTE]),
    );

    if (error) {
      this.logger.warn(`No se pudo imprimir el recibo en ${host}:${port}: ${error}`);
      return { impreso: false, modo: 'tcp', fallbackBrowser: true, motivo: error };
    }

    return { impreso: true, modo: 'tcp' };
  }

  async abrirCajon() {
    if (String(process.env.ESC_POS_ENABLED).toLowerCase() !== 'true') {
      return { abierto: false, motivo: 'ESC_POS_ENABLED no está activo' };
    }

    const host = process.env.ESC_POS_HOST;
    const port = Number(process.env.ESC_POS_PORT || 9100);
    if (!host) return { abierto: false, motivo: 'Falta ESC_POS_HOST' };

    const error = await this.enviarTcp(
      host,
      port,
      Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]),
    );

    if (error) {
      this.logger.warn(`No se pudo abrir el cajón en ${host}:${port}: ${error}`);
      return { abierto: false, motivo: error };
    }

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
      lineas.push(
        `${detalle.cantidad}x ${detalle.producto?.nombre || 'Producto'}\n`,
      );
      if (detalle.exclusiones?.length) {
        lineas.push(`   SIN: ${detalle.exclusiones.join(', ')}\n`);
      }
      if (detalle.adicionales?.length) {
        const extras = detalle.adicionales
          .map((a: any) =>
            a.cantidad > 1 ? `${a.nombre} x${a.cantidad}` : a.nombre,
          )
          .join(', ');
        lineas.push(`   ADIC: ${extras}\n`);
      }
      if (detalle.observacion) {
        lineas.push(`   NOTA: ${detalle.observacion}\n`);
      }
    }

    if (pedido.observacion) {
      lineas.push(
        '--------------------------------\n',
        `NOTA: ${pedido.observacion}\n`,
      );
    }
    lineas.push('\n\n');
    return Buffer.from(lineas.join(''), 'ascii');
  }

  private formatearRecibo(pedido: any, empresaId: number) {
    const lineas = [
      '\n',
      '           RECIBO CLIENTE\n',
      `           ${pedido.numero}\n`,
      `${new Date().toLocaleString('es-CO')}\n`,
      `Empresa #${empresaId}\n`,
      '--------------------------------\n',
    ];

    let total = Number(pedido.total ?? 0);
    for (const detalle of pedido.detalles || []) {
      const subtotal = Number(detalle.precio ?? 0) * Number(detalle.cantidad ?? 1);
      lineas.push(
        `${detalle.cantidad}x ${detalle.producto?.nombre || 'Producto'} ${subtotal.toFixed(0)}\n`,
      );
      if (detalle.exclusiones?.length) {
        lineas.push(`   SIN: ${detalle.exclusiones.join(', ')}\n`);
      }
      if (detalle.adicionales?.length) {
        const extras = detalle.adicionales
          .map((a: any) =>
            a.cantidad > 1 ? `${a.nombre} x${a.cantidad}` : a.nombre,
          )
          .join(', ');
        lineas.push(`   ADIC: ${extras}\n`);
      }
      if (detalle.observacion) {
        lineas.push(`   NOTA: ${detalle.observacion}\n`);
      }
    }

    lineas.push('--------------------------------\n');
    if (pedido.observacion) {
      lineas.push(`NOTA GENERAL: ${pedido.observacion}\n`);
    }
    lineas.push(`TOTAL: ${total.toFixed(0)}\n`);
    if (pedido.metodoPago) {
      lineas.push(`PAGO: ${pedido.metodoPago}\n`);
    }
    lineas.push('\nGracias por su compra\n\n');
    return Buffer.from(lineas.join(''), 'ascii');
  }
}
