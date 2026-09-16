import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { PedidosEventosService } from './pedidos-eventos.service';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private readonly eventos: PedidosEventosService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  async crearPedido(datos: any, usuarioId: number, empresaId: number) {
    const { items, metodoPago, clienteId, observacion, sucursalId, cajaId } =
      datos;

    const cajaAbierta = await this.prisma.caja.findFirst({
      where: { sucursalId, estado: 'ABIERTA' },
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    if (!cajaAbierta) {
      throw new BadRequestException('Debe abrir la caja antes de registrar pedidos. Solo el administrador puede abrirla.');
    }

    const cajaActivaId = cajaId ? Number(cajaId) : cajaAbierta.id;
    if (cajaId && Number(cajaId) !== cajaAbierta.id) {
      throw new BadRequestException('La caja seleccionada no está abierta en esta sucursal');
    }

    const usuarioVendedor = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true, rol: true },
    });

    const esSupervisor = usuarioVendedor?.rol === 'ADMIN_EMPRESA' || usuarioVendedor?.rol === 'GERENTE';
    if (cajaAbierta.usuarioId !== usuarioId && !esSupervisor) {
      throw new BadRequestException(`La caja abierta está asignada a ${cajaAbierta.usuario?.nombre || 'el cajero seleccionado'}. Solo ese usuario o un administrador puede registrar ventas.`);
    }

    const sucursal = await this.prisma.sucursal.findFirst({
      where: { id: sucursalId, empresaId, activo: true },
    });
    if (!sucursal)
      throw new NotFoundException('Sucursal no encontrada para esta empresa');
    if (clienteId) {
      const cliente = await this.prisma.cliente.findFirst({
        where: { id: clienteId, empresaId, activo: true },
      });
      if (!cliente)
        throw new NotFoundException('Cliente no encontrado para esta empresa');
    }
    if (cajaId) {
      const caja = await this.prisma.caja.findFirst({
        where: { id: cajaId, sucursalId, usuarioId },
      });
      if (!caja)
        throw new NotFoundException('Caja no encontrada para este usuario');
    }

    let subtotal = 0;
    const itemsValidados = [];

    for (const item of items) {
      const producto = await this.prisma.producto.findFirst({
        where: { id: item.productoId, empresaId, activo: true },
        include: {
          ingredientes: { include: { ingrediente: true } },
          adicionales: {
            include: { adicional: { include: { ingrediente: true } } },
          },
        },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto ${item.productoId} no encontrado`,
        );
      }

      if (!producto.disponible) {
        throw new BadRequestException(`${producto.nombre} no está disponible`);
      }

      // Adicionales habilitados para este producto: los marcados en el producto,
      // o todo el catálogo activo de la empresa si el producto no tiene ninguno marcado
      // y "aceptaAdicionales" (las bebidas suelen tenerlo en false).
      const adicionalesPermitidos = new Map<number, any>();
      if (producto.adicionales.length > 0) {
        for (const pa of producto.adicionales) {
          if (pa.adicional.activo && pa.adicional.disponible) {
            adicionalesPermitidos.set(pa.adicional.id, pa.adicional);
          }
        }
      } else if (
        producto.aceptaAdicionales &&
        Array.isArray(item.adicionales) &&
        item.adicionales.length > 0
      ) {
        const catalogo = await this.prisma.adicional.findMany({
          where: { empresaId, activo: true, disponible: true },
          include: { ingrediente: true },
        });
        for (const ad of catalogo) adicionalesPermitidos.set(ad.id, ad);
      }

      const adicionalesValidados = [];
      let extrasPorUnidad = 0;
      for (const solicitud of Array.isArray(item.adicionales)
        ? item.adicionales
        : []) {
        const adicional = adicionalesPermitidos.get(solicitud.adicionalId);
        if (!adicional) {
          throw new BadRequestException(
            `El adicional ${solicitud.adicionalId} no está disponible para ${producto.nombre}`,
          );
        }
        const cantidadAdicional = Math.max(
          1,
          Math.floor(Number(solicitud.cantidad) || 1),
        );
        const precioAdicional = Number(adicional.precio);
        extrasPorUnidad += precioAdicional * cantidadAdicional;
        adicionalesValidados.push({
          adicional,
          cantidad: cantidadAdicional,
          precio: precioAdicional,
          subtotal: precioAdicional * cantidadAdicional * item.cantidad,
        });
      }

      const itemSubtotal =
        (Number(producto.precio) + extrasPorUnidad) * item.cantidad;
      subtotal += itemSubtotal;

      itemsValidados.push({
        producto,
        cantidad: item.cantidad,
        exclusiones: item.exclusiones || [],
        observacion: item.observacion || null,
        adicionales: adicionalesValidados,
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
        cajaId: cajaActivaId,
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
            // precioUnitario guarda el precio base del producto; subtotal ya incluye adicionales
            precioUnitario: item.producto.precio,
            subtotal: item.subtotal,
            exclusiones: item.exclusiones,
            observacion: item.observacion,
            adicionales:
              item.adicionales.length > 0
                ? {
                    create: item.adicionales.map((a) => ({
                      adicionalId: a.adicional.id,
                      nombre: a.adicional.nombre,
                      precio: a.precio,
                      cantidad: a.cantidad,
                      subtotal: a.subtotal,
                    })),
                  }
                : undefined,
          })),
        },
      },
      include: {
        detalles: {
          include: {
            producto: true,
            adicionales: { include: { adicional: true } },
          },
        },
        usuario: { select: { nombre: true } },
        cliente: { select: { nombre: true, telefono: true } },
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

    // Sumar puntos de fidelización si el pedido tiene cliente asociado
    if (clienteId) {
      const puntosGanados = Math.floor(total / 1000); // 1 punto por cada $1.000 gastado
      if (puntosGanados > 0) {
        await this.prisma.cliente.update({
          where: { id: clienteId },
          data: { puntos: { increment: puntosGanados } },
        });
      }
    }

    this.eventos.emitir(empresaId, {
      tipo: 'CREADO',
      pedidoId: pedido.id,
      estado: pedido.estado,
    });

    const mensajeVenta = `💰 Venta registrada por ${usuarioVendedor?.nombre || 'cajero'} (${usuarioVendedor?.rol || 'CAJERO'}) en ${sucursal.nombre}. Pedido #${pedido.numero}. Total: $${Number(total).toLocaleString()}.`;

    await this.notificaciones.enviarAlerta({
      tipo: 'VENTA REGISTRADA',
      mensaje: mensajeVenta,
      empresa: sucursal?.nombre || 'PowerPOS',
      sucursal: sucursal.nombre,
      empresaId,
    });

    return pedido;
  }

  private obtenerCantidadInventario(ingrediente: any, cantidadReceta: number) {
    const factorConversion = Number(ingrediente?.factorConversion ?? 0);
    const tieneUnidadCompra =
      !!ingrediente?.unidadCompra &&
      String(ingrediente.unidadCompra).trim() !== '' &&
      factorConversion > 0;

    if (!tieneUnidadCompra) {
      return Number(cantidadReceta);
    }

    return Number(cantidadReceta) * factorConversion;
  }

  private async descontarInventario(items: any[]) {
    for (const item of items) {
      for (const productoIngrediente of item.producto.ingredientes) {
        const excluido = item.exclusiones.includes(
          productoIngrediente.ingrediente.nombre,
        );

        if (!excluido) {
          const cantidadADescontar =
            this.obtenerCantidadInventario(
              productoIngrediente.ingrediente,
              Number(productoIngrediente.cantidad),
            ) * item.cantidad;

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

      // Descontar inventario de los adicionales enlazados a un ingrediente
      for (const adicionalValidado of item.adicionales || []) {
        const { adicional } = adicionalValidado;
        if (adicional.ingredienteId && adicional.cantidad) {
          const cantidadADescontar =
            Number(adicional.cantidad) *
            adicionalValidado.cantidad *
            item.cantidad;

          await this.prisma.ingrediente.update({
            where: { id: adicional.ingredienteId },
            data: { stock: { decrement: cantidadADescontar } },
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
        detalles: {
          include: {
            producto: true,
            adicionales: { include: { adicional: true } },
          },
        },
        usuario: { select: { nombre: true } },
        cliente: { select: { nombre: true, telefono: true } },
      },
      orderBy: { creadoEn: 'desc' },
      take: 50,
    });
  }

  async obtenerPedido(id: number, empresaId: number) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, sucursal: { empresaId } },
      include: {
        detalles: {
          include: {
            producto: {
              include: { ingredientes: { include: { ingrediente: true } } },
            },
            adicionales: { include: { adicional: true } },
          },
        },
        usuario: { select: { nombre: true } },
        cliente: { select: { nombre: true, telefono: true } },
        sucursal: { select: { nombre: true } },
      },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  async actualizarEstado(id: number, estado: string, empresaId: number) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, sucursal: { empresaId } },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    const actualizado = await this.prisma.pedido.update({
      where: { id },
      data: { estado: estado as any },
    });
    this.eventos.emitir(empresaId, {
      tipo: 'ACTUALIZADO',
      pedidoId: id,
      estado: actualizado.estado,
    });
    return actualizado;
  }

  async obtenerEstadisticas(empresaId: number) {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        sucursal: { empresaId },
        estado: { not: 'ANULADO' },
      },
      include: {
        detalles: { include: { producto: { include: { categoria: true } } } },
      },
    });

    const haceTreintaDias = new Date();
    haceTreintaDias.setDate(haceTreintaDias.getDate() - 29);

    // Ventas por día (últimos 7 días)
    const ventasPorDiaMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const clave = fecha.toLocaleDateString('es-CO', {
        weekday: 'short',
        day: 'numeric',
      });
      ventasPorDiaMap.set(clave, 0);
    }
    for (const pedido of pedidos) {
      if (new Date(pedido.creadoEn) < haceTreintaDias) continue;
      const clave = new Date(pedido.creadoEn).toLocaleDateString('es-CO', {
        weekday: 'short',
        day: 'numeric',
      });
      if (ventasPorDiaMap.has(clave)) {
        ventasPorDiaMap.set(
          clave,
          ventasPorDiaMap.get(clave) + Number(pedido.total),
        );
      }
    }
    const ventasPorDia = Array.from(ventasPorDiaMap.entries()).map(
      ([dia, total]) => ({ dia, total }),
    );

    // Productos más vendidos
    const productosMap = new Map<string, number>();
    for (const pedido of pedidos) {
      for (const detalle of pedido.detalles) {
        const nombre = detalle.producto.nombre;
        productosMap.set(
          nombre,
          (productosMap.get(nombre) || 0) + detalle.cantidad,
        );
      }
    }
    const productosMasVendidos = Array.from(productosMap.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);

    // Ventas por método de pago
    const metodoPagoMap = new Map<string, number>();
    for (const pedido of pedidos) {
      metodoPagoMap.set(
        pedido.metodoPago,
        (metodoPagoMap.get(pedido.metodoPago) || 0) + Number(pedido.total),
      );
    }
    const ventasPorMetodoPago = Array.from(metodoPagoMap.entries()).map(
      ([metodo, total]) => ({ metodo, total }),
    );

    // Ventas por categoría
    const categoriaMap = new Map<string, number>();
    for (const pedido of pedidos) {
      for (const detalle of pedido.detalles) {
        const categoria = detalle.producto.categoria?.nombre || 'Sin categoría';
        categoriaMap.set(
          categoria,
          (categoriaMap.get(categoria) || 0) + Number(detalle.subtotal),
        );
      }
    }
    const ventasPorCategoria = Array.from(categoriaMap.entries()).map(
      ([categoria, total]) => ({ categoria, total }),
    );

    const ventasPorMesMap = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(1);
      fecha.setMonth(fecha.getMonth() - i);
      const clave = fecha.toLocaleDateString('es-CO', {
        month: 'short',
        year: 'numeric',
      });
      ventasPorMesMap.set(clave, 0);
    }
    for (const pedido of pedidos) {
      const fecha = new Date(pedido.creadoEn);
      const clave = fecha.toLocaleDateString('es-CO', {
        month: 'short',
        year: 'numeric',
      });
      if (ventasPorMesMap.has(clave)) {
        ventasPorMesMap.set(
          clave,
          ventasPorMesMap.get(clave) + Number(pedido.total),
        );
      }
    }

    const hoy = new Date();
    const pedidosHoy = pedidos.filter((pedido) => {
      const fecha = new Date(pedido.creadoEn);
      return (
        fecha.getFullYear() === hoy.getFullYear() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getDate() === hoy.getDate()
      );
    });

    return {
      ventasPorDia,
      ventasPorMes: Array.from(ventasPorMesMap.entries()).map(
        ([mes, total]) => ({ mes, total }),
      ),
      productosMasVendidos,
      ventasPorMetodoPago,
      ventasPorCategoria,
      totalHistorico: pedidos.reduce(
        (acc, pedido) => acc + Number(pedido.total),
        0,
      ),
      pedidosHistoricos: pedidos.length,
      totalHoy: pedidosHoy.reduce(
        (acc, pedido) => acc + Number(pedido.total),
        0,
      ),
      pedidosHoy: pedidosHoy.length,
    };
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
