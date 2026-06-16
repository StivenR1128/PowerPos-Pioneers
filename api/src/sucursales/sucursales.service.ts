import { Injectable } from '@nestjs/common';
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

  async listar(empresaId: number) {
    return this.prisma.sucursal.findMany({
      where: { empresaId, activo: true },
    });
  }
}