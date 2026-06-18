import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async listar(empresaId: number, busqueda?: string) {
    return this.prisma.cliente.findMany({
      where: {
        empresaId,
        activo: true,
        ...(busqueda && {
          OR: [
            { nombre: { contains: busqueda, mode: 'insensitive' } },
            { telefono: { contains: busqueda } },
            { documento: { contains: busqueda } },
          ],
        }),
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async crear(datos: any, empresaId: number) {
    return this.prisma.cliente.create({
      data: {
        empresaId,
        nombre: datos.nombre,
        documento: datos.documento || null,
        telefono: datos.telefono || null,
        email: datos.email || null,
        direccion: datos.direccion || null,
        fechaNacimiento: datos.fechaNacimiento ? new Date(datos.fechaNacimiento) : null,
      },
    });
  }

  async actualizar(id: number, datos: any) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    return this.prisma.cliente.update({
      where: { id },
      data: {
        nombre: datos.nombre ?? cliente.nombre,
        documento: datos.documento !== undefined ? datos.documento : cliente.documento,
        telefono: datos.telefono !== undefined ? datos.telefono : cliente.telefono,
        email: datos.email !== undefined ? datos.email : cliente.email,
        direccion: datos.direccion !== undefined ? datos.direccion : cliente.direccion,
        fechaNacimiento: datos.fechaNacimiento !== undefined
          ? (datos.fechaNacimiento ? new Date(datos.fechaNacimiento) : null)
          : cliente.fechaNacimiento,
      },
    });
  }

  async toggleActivo(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    return this.prisma.cliente.update({
      where: { id },
      data: { activo: !cliente.activo },
    });
  }

  async obtenerDetalle(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        pedidos: {
          orderBy: { creadoEn: 'desc' },
          take: 50,
          include: { detalles: { include: { producto: true } } },
        },
      },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const totalGastado = cliente.pedidos
      .filter(p => p.estado !== 'ANULADO')
      .reduce((acc, p) => acc + Number(p.total), 0);

    const totalPedidos = cliente.pedidos.filter(p => p.estado !== 'ANULADO').length;

    return { ...cliente, totalGastado, totalPedidos };
  }

  async agregarPuntos(clienteId: number, puntos: number) {
    return this.prisma.cliente.update({
      where: { id: clienteId },
      data: { puntos: { increment: puntos } },
    });
  }

  async redimirPuntos(clienteId: number, puntos: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    if (cliente.puntos < puntos) {
      throw new NotFoundException('El cliente no tiene suficientes puntos');
    }

    return this.prisma.cliente.update({
      where: { id: clienteId },
      data: { puntos: { decrement: puntos } },
    });
  }
}