import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: any, empresaId: number) {
    const { ingredientes, ...productoData } = datos;

    return this.prisma.producto.create({
      data: {
        ...productoData,
        empresaId,
        ingredientes: ingredientes ? {
          create: ingredientes.map((ing: any) => ({
            cantidad: ing.cantidad,
            ingrediente: {
              connectOrCreate: {
                where: { id: ing.ingredienteId || 0 },
                create: {
                  nombre: ing.nombre,
                  unidad: ing.unidad,
                  stock: ing.stockInicial || 0,
                  stockMinimo: ing.stockMinimo || 0,
                },
              },
            },
          })),
        } : undefined,
      },
      include: {
        categoria: true,
        ingredientes: { include: { ingrediente: true } },
      },
    });
  }

  async listar(empresaId: number, categoriaId?: number) {
    return this.prisma.producto.findMany({
      where: {
        empresaId,
        activo: true,
        ...(categoriaId && { categoriaId }),
      },
      include: {
        categoria: true,
        ingredientes: { include: { ingrediente: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtener(id: number, empresaId: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id, empresaId },
      include: {
        categoria: true,
        ingredientes: { include: { ingrediente: true } },
      },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async actualizar(id: number, datos: any, empresaId: number) {
    await this.obtener(id, empresaId);
    const { ingredientes, ...productoData } = datos;
    return this.prisma.producto.update({
      where: { id },
      data: productoData,
      include: {
        categoria: true,
        ingredientes: { include: { ingrediente: true } },
      },
    });
  }

  async eliminar(id: number, empresaId: number) {
    await this.obtener(id, empresaId);
    return this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });
  }
}