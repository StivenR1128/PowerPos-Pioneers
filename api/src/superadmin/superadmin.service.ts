import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class SuperadminService {
  constructor(private readonly prisma: PrismaService, private readonly auditoria: AuditoriaService) {}

  async crearEmpresa(datos: any, usuarioId?: number) {
    const { empresa, admin, administradores, plan = 'BASICO', permisos = {} } = datos;
    const listaAdministradores = Array.isArray(administradores) && administradores.length > 0
      ? administradores
      : admin
        ? [admin]
        : [];

    if (listaAdministradores.length === 0) {
      throw new ConflictException('Debe indicar al menos 1 administrador para la empresa');
    }

    if (listaAdministradores.length > 3) {
      throw new ConflictException('La empresa puede tener máximo 3 administradores');
    }

    const empresaExistente = await this.prisma.empresa.findUnique({ where: { nit: empresa.nit } });
    if (empresaExistente) throw new ConflictException('Ya existe una empresa con ese NIT');

    const emailsUsados = new Set<string>();
    for (const administrador of listaAdministradores) {
      if (!administrador?.nombre || !administrador?.email || !administrador?.password) {
        throw new ConflictException('Cada administrador debe tener nombre, email y contraseña');
      }

      const emailNormalizado = administrador.email.trim().toLowerCase();
      if (emailsUsados.has(emailNormalizado)) {
        throw new ConflictException(`El email ${emailNormalizado} está repetido en la lista de administradores`);
      }

      const usuarioExistente = await this.prisma.usuario.findUnique({ where: { email: emailNormalizado } });
      if (usuarioExistente) {
        throw new ConflictException(`Ya existe un usuario con el email ${emailNormalizado}`);
      }

      emailsUsados.add(emailNormalizado);
    }

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

    const administradoresCreados = [] as Array<{ id: number; nombre: string; email: string; rol: string }>;

    for (const administrador of listaAdministradores) {
      const password = await bcrypt.hash(administrador.password, 10);
      const usuarioCreado = await this.prisma.usuario.create({
        data: {
          nombre: administrador.nombre,
          email: administrador.email.trim().toLowerCase(),
          password,
          rol: 'ADMIN_EMPRESA',
          empresaId: creada.id,
          sucursalId: creada.sucursales[0].id,
          permisos: { global: true },
        },
      });

      administradoresCreados.push({
        id: usuarioCreado.id,
        nombre: usuarioCreado.nombre,
        email: usuarioCreado.email,
        rol: usuarioCreado.rol,
      });
    }

    await this.auditoria.registrar({
      accion: 'CREAR',
      entidad: 'EMPRESA',
      entidadId: creada.id,
      usuarioId,
      detalle: { plan, administradores: administradoresCreados.map((admin) => ({ nombre: admin.nombre, email: admin.email })) },
    });

    return {
      id: creada.id,
      nombre: creada.nombre,
      tiendaRuta: `/tienda/${creada.tiendaSlug}`,
      nit: creada.nit,
      plan: creada.plan,
      administradores: administradoresCreados,
      sucursal: {
        id: creada.sucursales[0].id,
        nombre: creada.sucursales[0].nombre,
      },
    };
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
      consumoEmpleadosHabilitado?: boolean;
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
        ...(datos.consumoEmpleadosHabilitado !== undefined ? { consumoEmpleadosHabilitado: datos.consumoEmpleadosHabilitado } : {}),
      },
      select: { id: true, nombre: true, plan: true, permisos: true, modoPreparacion: true, facturacionElectronicaHabilitada: true, consumoEmpleadosHabilitado: true, activo: true },
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
