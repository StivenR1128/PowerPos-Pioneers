import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async crearPedido(datos: any, usuarioId: number, empresaId: number) {
    const { items, metodoPago, clienteId, observacion, sucursalId, cajaId } = datos;

    let subtotal = 0;
    const itemsValidados = [];

    for (const item of items) {
      const producto = await this.prisma.producto.findFirst({
        where: { id: item.productoId, empresaId, activo: true },
        include: { ingredientes: { include: { ingrediente: true } } },
      });

      if (!producto) {
        throw new NotFoundException(`Producto ${item.productoId} no encontrado`);
      }

      if (!producto.disponible) {
        throw new BadRequestException(`${producto.nombre} no está disponible`);
      }

      const itemSubtotal = Number(producto.precio) * item.cantidad;
      subtotal += itemSubtotal;

      itemsValidados.push({
        producto,
        cantidad: item.cantidad,
        exclusiones: item.exclusiones || [],
        observacion: item.observacion || null,
        subtotal: itemSubtotal,
      });
    }

    const descuento = datos.descuento || 0;
    const total = subtotal - descuento;

    const numero = await this.generarNumeroPedido(sucursalId);

    const pedido = await this.prisma.pedido.create({
      data: {
        numero,
        sucursalId,
        usuarioId,
        clienteId: clienteId || null,
        cajaId: cajaId || null,
        metodoPago: metodoPago || 'EFECTIVO',
        subtotal,
        descuento,
        total,
        observacion: observacion || null,
        estado: 'PENDIENTE',
        detalles: {
          create: itemsValidados.map((item) => ({
            productoId: item.producto.id,
            cantidad: item.cantidad,
            precioUnitario: item.producto.precio,
            subtotal: item.subtotal,
            exclusiones: item.exclusiones,
            observacion: item.observacion,
          })),
        },
      },
      include: {
        detalles: { include: { producto: true } },
        usuario: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
      },
    });

    // Descontar inventario respetando exclusiones
    await this.descontarInventario(itemsValidados);

    // Registrar ingreso automático por venta
    await this.prisma.movimientoFinanciero.create({
      data: {
        empresaId,
        sucursalId,
        usuarioId,
        tipo: 'INGRESO',
        categoria: 'VENTA',
        descripcion: `Venta ${numero} — ${itemsValidados.length} producto(s)`,
        monto: total,
        pedidoId: pedido.id,
      },
    });

    return pedido;
  }

  private async descontarInventario(items: any[]) {
    for (const item of items) {
      for (const productoIngrediente of item.producto.ingredientes) {
        const excluido = item.exclusiones.includes(
          productoIngrediente.ingrediente.nombre,
        );

        if (!excluido) {
          const cantidadADescontar =
            Number(productoIngrediente.cantidad) * item.cantidad;

          await this.prisma.ingrediente.update({
            where: { id: productoIngrediente.ingredienteId },
            data: {
              stock: {
                decrement: cantidadADescontar,
              },
            },
          });
        }
      }
    }
  }

  async listarPedidos(empresaId: number, sucursalId?: number) {
    return this.prisma.pedido.findMany({
      where: {
        sucursal: { empresaId },
        ...(sucursalId && { sucursalId }),
      },
      include: {
        detalles: { include: { producto: true } },
        usuario: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
      },
      orderBy: { creadoEn: 'desc' },
      take: 50,
    });
  }

  async obtenerPedido(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        detalles: { include: { producto: { include: { ingredientes: { include: { ingrediente: true } } } } } },
        usuario: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
        sucursal: { select: { nombre: true } },
      },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  async actualizarEstado(id: number, estado: string) {
    return this.prisma.pedido.update({
      where: { id },
      data: { estado: estado as any },
    });
  }

  private async generarNumeroPedido(sucursalId: number): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    const ultimoPedido = await this.prisma.pedido.findFirst({
      where: { sucursalId },
      orderBy: { id: 'desc' },
    });

    const consecutivo = ultimoPedido ? ultimoPedido.id + 1 : 1;
    return `PED-${año}${mes}${dia}-${String(consecutivo).padStart(4, '0')}`;
  }
}