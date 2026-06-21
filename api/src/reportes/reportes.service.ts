import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async rendimientoPorEmpleado(empresaId: number) {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        sucursal: { empresaId },
        estado: { not: 'ANULADO' },
      },
      include: {
        usuario: { select: { id: true, nombre: true } },
      },
    });

    const porEmpleado = new Map<number, { nombre: string; totalVentas: number; cantidadPedidos: number }>();

    for (const pedido of pedidos) {
      const actual = porEmpleado.get(pedido.usuarioId) || {
        nombre: pedido.usuario.nombre,
        totalVentas: 0,
        cantidadPedidos: 0,
      };
      actual.totalVentas += Number(pedido.total);
      actual.cantidadPedidos += 1;
      porEmpleado.set(pedido.usuarioId, actual);
    }

    return Array.from(porEmpleado.values())
      .map((e) => ({
        ...e,
        ticketPromedio: e.cantidadPedidos > 0 ? e.totalVentas / e.cantidadPedidos : 0,
      }))
      .sort((a, b) => b.totalVentas - a.totalVentas);
  }

  async mejoresClientes(empresaId: number, limite = 10) {
    const clientes = await this.prisma.cliente.findMany({
      where: { empresaId, activo: true },
      include: {
        pedidos: { where: { estado: { not: 'ANULADO' } } },
      },
    });

    return clientes
      .map((c) => ({
        id: c.id,
        nombre: c.nombre,
        totalGastado: c.pedidos.reduce((acc, p) => acc + Number(p.total), 0),
        cantidadPedidos: c.pedidos.length,
        puntos: c.puntos,
      }))
      .filter((c) => c.cantidadPedidos > 0)
      .sort((a, b) => b.totalGastado - a.totalGastado)
      .slice(0, limite);
  }

  async comparativaPorPeriodo(empresaId: number) {
    const ahora = new Date();

    const inicioSemanaActual = new Date(ahora);
    inicioSemanaActual.setDate(ahora.getDate() - ahora.getDay());
    inicioSemanaActual.setHours(0, 0, 0, 0);

    const inicioSemanaPasada = new Date(inicioSemanaActual);
    inicioSemanaPasada.setDate(inicioSemanaActual.getDate() - 7);

    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesPasado = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesPasado = new Date(inicioMesActual.getTime() - 1);

    const sumarVentas = async (desde: Date, hasta?: Date) => {
      const pedidos = await this.prisma.pedido.findMany({
        where: {
          sucursal: { empresaId },
          estado: { not: 'ANULADO' },
          creadoEn: { gte: desde, ...(hasta && { lte: hasta }) },
        },
      });
      return {
        total: pedidos.reduce((acc, p) => acc + Number(p.total), 0),
        cantidadPedidos: pedidos.length,
      };
    };

    const [semanaActual, semanaPasada, mesActual, mesPasado] = await Promise.all([
      sumarVentas(inicioSemanaActual),
      sumarVentas(inicioSemanaPasada, inicioSemanaActual),
      sumarVentas(inicioMesActual),
      sumarVentas(inicioMesPasado, finMesPasado),
    ]);

    const variacionSemana = semanaPasada.total > 0
      ? ((semanaActual.total - semanaPasada.total) / semanaPasada.total) * 100
      : null;

    const variacionMes = mesPasado.total > 0
      ? ((mesActual.total - mesPasado.total) / mesPasado.total) * 100
      : null;

    return {
      semana: { actual: semanaActual, anterior: semanaPasada, variacionPorcentual: variacionSemana },
      mes: { actual: mesActual, anterior: mesPasado, variacionPorcentual: variacionMes },
    };
  }

  async rentabilidadPorProducto(empresaId: number) {
    const productos = await this.prisma.producto.findMany({
      where: { empresaId, activo: true },
      include: {
        ingredientes: { include: { ingrediente: true } },
      },
    });

    return productos.map((producto) => {
      const costoReceta = producto.ingredientes.reduce((acc, pi) => {
        const costoUnitario = pi.ingrediente.costoUnitario ? Number(pi.ingrediente.costoUnitario) : 0;
        return acc + costoUnitario * Number(pi.cantidad);
      }, 0);

      const precioVenta = Number(producto.precio);
      const margenAbsoluto = precioVenta - costoReceta;
      const margenPorcentual = precioVenta > 0 ? (margenAbsoluto / precioVenta) * 100 : 0;
      const tieneCostosDefinidos = producto.ingredientes.length > 0 &&
        producto.ingredientes.every((pi) => pi.ingrediente.costoUnitario !== null);

      return {
        id: producto.id,
        nombre: producto.nombre,
        precioVenta,
        costoReceta: Math.round(costoReceta * 100) / 100,
        margenAbsoluto: Math.round(margenAbsoluto * 100) / 100,
        margenPorcentual: Math.round(margenPorcentual * 10) / 10,
        tieneCostosDefinidos,
      };
    }).sort((a, b) => b.margenPorcentual - a.margenPorcentual);
  }
}