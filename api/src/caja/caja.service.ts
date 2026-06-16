import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class CajaService {
  constructor(
    private prisma: PrismaService,
    private notificaciones: NotificacionesService,
  ) {}

  async abrirCaja(datos: any, usuarioId: number, sucursalId: number) {
    const cajaAbierta = await this.prisma.caja.findFirst({
      where: { sucursalId, estado: 'ABIERTA' },
    });

    if (cajaAbierta) {
      throw new BadRequestException('Ya existe una caja abierta en esta sucursal');
    }

    const caja = await this.prisma.caja.create({
      data: {
        sucursalId,
        usuarioId,
        montoInicial: datos.montoInicial,
        estado: 'ABIERTA',
      },
      include: {
        usuario: { select: { nombre: true } },
        sucursal: { select: { nombre: true } },
      },
    });

    await this.registrarEvento({
      cajaId: caja.id,
      tipo: 'APERTURA',
      descripcion: `Caja abierta por ${caja.usuario.nombre} con monto inicial $${Number(datos.montoInicial).toLocaleString()}`,
      usuarioId,
      esAlerta: false,
    });

    await this.notificaciones.enviarAlerta({
      tipo: 'APERTURA DE CAJA',
      mensaje: `✅ Caja abierta por ${caja.usuario.nombre} con monto inicial $${Number(datos.montoInicial).toLocaleString()} en ${caja.sucursal.nombre}`,
      empresa: 'PowerPOS',
      sucursal: caja.sucursal.nombre,
    });

    return caja;
  }

  async cerrarCaja(cajaId: number, datos: any, usuarioId: number) {
    const caja = await this.prisma.caja.findUnique({
      where: { id: cajaId },
      include: {
        pedidos: true,
        sucursal: { select: { nombre: true } },
        usuario: { select: { nombre: true } },
      },
    });

    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado === 'CERRADA') throw new BadRequestException('La caja ya está cerrada');

    const totalVentas = caja.pedidos
      .filter(p => p.estado !== 'ANULADO')
      .reduce((acc, p) => acc + Number(p.total), 0);

    const montoEsperado = Number(caja.montoInicial) + totalVentas;
    const diferencia = Number(datos.montoFinal) - montoEsperado;

    const cajaActualizada = await this.prisma.caja.update({
      where: { id: cajaId },
      data: {
        estado: 'CERRADA',
        montoFinal: datos.montoFinal,
        diferencia,
        cerradaEn: new Date(),
      },
    });

    await this.registrarEvento({
      cajaId,
      tipo: 'CIERRE',
      descripcion: `Caja cerrada. Total ventas: $${totalVentas.toLocaleString()}. Diferencia: $${diferencia.toLocaleString()}`,
      usuarioId,
      esAlerta: false,
    });

    if (Math.abs(diferencia) > 1000) {
      await this.registrarEvento({
        cajaId,
        tipo: 'DIFERENCIA',
        descripcion: `⚠️ Diferencia en cierre de caja: $${diferencia.toLocaleString()}. Esperado: $${montoEsperado.toLocaleString()}, Contado: $${datos.montoFinal}`,
        usuarioId,
        esAlerta: true,
      });

      await this.notificaciones.enviarAlerta({
        tipo: 'DIFERENCIA EN CAJA',
        mensaje: `⚠️ Diferencia de $${diferencia.toLocaleString()} detectada al cerrar caja. Esperado: $${montoEsperado.toLocaleString()}, Contado: $${Number(datos.montoFinal).toLocaleString()}`,
        empresa: 'PowerPOS',
        sucursal: caja.sucursal.nombre,
      });
    }

    await this.notificaciones.enviarAlerta({
      tipo: 'CIERRE DE CAJA',
      mensaje: `Caja cerrada por ${caja.usuario.nombre}. Total ventas: $${totalVentas.toLocaleString()}. Monto final: $${Number(datos.montoFinal).toLocaleString()}`,
      empresa: 'PowerPOS',
      sucursal: caja.sucursal.nombre,
    });

    return { ...cajaActualizada, totalVentas, montoEsperado, diferencia };
  }

  async obtenerCajaAbierta(sucursalId: number) {
    const caja = await this.prisma.caja.findFirst({
      where: { sucursalId, estado: 'ABIERTA' },
      include: {
        usuario: { select: { nombre: true } },
        sucursal: { select: { nombre: true } },
        pedidos: {
          where: { estado: { not: 'ANULADO' } },
          select: { total: true, metodoPago: true },
        },
      },
    });

    if (!caja) return null;

    const totalVentas = caja.pedidos.reduce((acc, p) => acc + Number(p.total), 0);
    const totalEsperado = Number(caja.montoInicial) + totalVentas;

    return { ...caja, totalVentas, totalEsperado };
  }

  async registrarAperturaIrregular(cajaId: number, usuarioId: number, descripcion: string) {
    await this.registrarEvento({
      cajaId,
      tipo: 'APERTURA_IRREGULAR',
      descripcion: `🚨 ALERTA: ${descripcion}`,
      usuarioId,
      esAlerta: true,
    });

    const caja = await this.prisma.caja.findUnique({
      where: { id: cajaId },
      include: { sucursal: { select: { nombre: true } } },
    });

    await this.notificaciones.enviarAlerta({
      tipo: 'APERTURA IRREGULAR DE CAJA',
      mensaje: `🚨 ${descripcion}`,
      empresa: 'PowerPOS',
      sucursal: caja?.sucursal.nombre || 'Desconocida',
    });
  }

  async obtenerEventos(sucursalId: number) {
    return this.prisma.eventoCaja.findMany({
      where: { caja: { sucursalId } },
      include: { usuario: { select: { nombre: true } } },
      orderBy: { creadoEn: 'desc' },
      take: 50,
    });
  }

  async obtenerAlertas(sucursalId: number) {
    return this.prisma.eventoCaja.findMany({
      where: { caja: { sucursalId }, esAlerta: true },
      include: { usuario: { select: { nombre: true } } },
      orderBy: { creadoEn: 'desc' },
      take: 20,
    });
  }

  private async registrarEvento(datos: any) {
    return this.prisma.eventoCaja.create({
      data: {
        cajaId: datos.cajaId,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        usuarioId: datos.usuarioId,
        esAlerta: datos.esAlerta || false,
      },
    });
  }
}