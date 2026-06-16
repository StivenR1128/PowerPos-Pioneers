import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: any, empresaId: number) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email: datos.email },
    });
    if (existe) throw new ConflictException('Ya existe un usuario con ese email');

    const passwordHash = await bcrypt.hash(datos.password, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: datos.nombre,
        email: datos.email,
        password: passwordHash,
        rol: datos.rol,
        empresaId,
        sucursalId: datos.sucursalId || null,
      },
    });

    const { password, ...resultado } = usuario;
    return resultado;
  }

  async listar(empresaId: number) {
    return this.prisma.usuario.findMany({
      where: { empresaId, activo: true },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        creadoEn: true,
        sucursal: { select: { nombre: true } },
      },
    });
  }
}