import { Controller, Get, Param, Patch, Post, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SuperadminService } from './superadmin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
@Controller('superadmin')
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Get('resumen')
  resumen() {
    return this.superadminService.resumen();
  }

  @Get('empresas')
  empresas() {
    return this.superadminService.listarEmpresas();
  }

  @Get('auditoria')
  auditoria() {
    return this.superadminService.listarAuditoria();
  }

  @Post('empresas')
  crearEmpresa(@Body() body: any, @Request() req: any) {
    return this.superadminService.crearEmpresa(body, req.user.id);
  }

  @Patch('empresas/:id/estado')
  cambiarEstado(@Param('id') id: string, @Body() body: { activo: boolean }) {
    return this.superadminService.cambiarEstadoEmpresa(+id, body.activo);
  }

  @Patch('empresas/:id/configuracion')
  actualizarConfiguracion(
    @Param('id') id: string,
    @Body() body: {
      plan?: 'BASICO' | 'MEDIUM' | 'PREMIUM';
      permisos?: Record<string, boolean>;
      modoPreparacion?: 'KDS' | 'COMANDAS';
      facturacionElectronicaHabilitada?: boolean;
      consumoEmpleadosHabilitado?: boolean;
    },
    @Request() req: any,
  ) {
    return this.superadminService.actualizarConfiguracion(+id, body, req.user.id);
  }
}