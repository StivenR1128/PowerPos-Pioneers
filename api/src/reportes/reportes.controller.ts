import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('empleados')
  rendimientoPorEmpleado(@Request() req: any) {
    return this.reportesService.rendimientoPorEmpleado(req.user.empresaId);
  }

  @Get('clientes')
  mejoresClientes(@Request() req: any, @Query('limite') limite?: string) {
    return this.reportesService.mejoresClientes(req.user.empresaId, limite ? +limite : 10);
  }

  @Get('periodos')
  comparativaPorPeriodo(@Request() req: any) {
    return this.reportesService.comparativaPorPeriodo(req.user.empresaId);
  }

  @Get('rentabilidad')
  rentabilidadPorProducto(@Request() req: any) {
    return this.reportesService.rentabilidadPorProducto(req.user.empresaId);
  }
}