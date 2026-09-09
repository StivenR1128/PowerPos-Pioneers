import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class SuperadminService {
  constructor(private readonly prisma: PrismaService, private readonly auditoria: AuditoriaService) {}

  async crearEmpresa(datos: any, usuarioId?: number) {
    const { empresa, admin, plan = 'BASICO', permisos = {} } = datos;
    const [empresaExistente, usuarioExistente] = await Promise.all([
      this.prisma.empresa.findUnique({ where: { nit: empresa.nit } }),
      this.prisma.usuario.findUnique({ where: { email: admin.email } }),
    ]);
    if (empresaExistente) throw new ConflictException('Ya existe una empresa con ese NIT');
    if (usuarioExistente) throw new ConflictException('Ya existe un usuario con ese email');

    const creada = await this.prisma.empresa.create({
      data: {
        nombre: empresa.nombre,
        nit: empresa.nit,
        email: empresa.email,
        telefono: empresa.telefono || null,
        direccion: empresa.direccion || null,
        plan,
        permisos,
        sucursales: { create: { nombre: 'Sucursal Principal', direccion: empresa.direccion || null, telefono: empresa.telefono || null } },
      },
      include: { sucursales: true },
    });

    const password = await bcrypt.hash(admin.password, 10);
    await this.prisma.usuario.create({
      data: {
        nombre: admin.nombre,
        email: admin.email,
        password,
        rol: 'ADMIN_EMPRESA',
        empresaId: creada.id,
        sucursalId: creada.sucursales[0].id,
        permisos: { global: true },
      },
    });

    await this.auditoria.registrar({ accion: 'CREAR', entidad: 'EMPRESA', entidadId: creada.id, usuarioId, detalle: { plan, adminEmail: admin.email } });
    return { id: creada.id, nombre: creada.nombre, nit: creada.nit, plan: creada.plan, adminEmail: admin.email };
  }

  async resumen() {
    const [empresas, activas, usuarios] = await Promise.all([
      this.prisma.empresa.count(),
      this.prisma.empresa.count({ where: { activo: true } }),
      this.prisma.usuario.count({ where: { activo: true } }),
    ]);

    return {
      empresas,
      empresasActivas: activas,
      usuariosActivos: usuarios,
    };
  }

  async listarEmpresas() {
    const empresas = await this.prisma.empresa.findMany({
      include: {
        _count: { select: { usuarios: true, sucursales: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return empresas;
  }

  async cambiarEstadoEmpresa(id: number, activo: boolean) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    const actualizada = await this.prisma.empresa.update({
      where: { id },
      data: { activo },
      select: { id: true, nombre: true, nit: true, activo: true },
    });
    await this.auditoria.registrar({ accion: activo ? 'ACTIVAR' : 'DESACTIVAR', entidad: 'EMPRESA', entidadId: id, detalle: { activo } });
    return actualizada;
  }

  async actualizarConfiguracion(
    id: number,
    datos: {
      plan?: 'BASICO' | 'MEDIUM' | 'PREMIUM';
      permisos?: Record<string, boolean>;
      modoPreparacion?: 'KDS' | 'COMANDAS';
      facturacionElectronicaHabilitada?: boolean;
    },
    usuarioId?: number,
  ) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    const actualizada = await this.prisma.empresa.update({
      where: { id },
      data: {
        ...(datos.plan ? { plan: datos.plan } : {}),
        ...(datos.permisos ? { permisos: datos.permisos } : {}),
        ...(datos.modoPreparacion ? { modoPreparacion: datos.modoPreparacion } : {}),
        ...(datos.facturacionElectronicaHabilitada !== undefined ? { facturacionElectronicaHabilitada: datos.facturacionElectronicaHabilitada } : {}),
      },
      select: { id: true, nombre: true, plan: true, permisos: true, modoPreparacion: true, facturacionElectronicaHabilitada: true, activo: true },
    });
    await this.auditoria.registrar({ accion: 'CONFIGURAR', entidad: 'EMPRESA', entidadId: id, usuarioId, detalle: datos });
    return actualizada;
  }

  listarAuditoria() {
    return this.prisma.auditoria.findMany({
      include: {
        usuario: { select: { nombre: true, email: true } },
        empresa: { select: { nombre: true } },
      },
      orderBy: { creadoEn: 'desc' },
      take: 100,
    });
  }
}