import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SucursalesService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: any, empresaId: number) {
    return this.prisma.sucursal.create({
      data: {
        nombre: datos.nombre,
        direccion: datos.direccion,
        telefono: datos.telefono,
        empresaId,
      },
    });
  }

  async listar(empresaId: number, incluirInactivas = false) {
    return this.prisma.sucursal.findMany({
      where: { empresaId, ...(incluirInactivas ? {} : { activo: true }) },
      orderBy: { creadoEn: 'asc' },
    });
  }

  async toggleActivo(id: number, empresaId: number) {
    const sucursal = await this.prisma.sucursal.findFirst({ where: { id, empresaId } });
    if (!sucursal) throw new NotFoundException('Sucursal no encontrada');
    return this.prisma.sucursal.update({
      where: { id },
      data: { activo: !sucursal.activo },
    });
  }
}