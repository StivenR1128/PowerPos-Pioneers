import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listar(@Request() req: any, @Query('busqueda') busqueda?: string) {
    return this.clientesService.listar(req.user.empresaId, busqueda);
  }

  @Post()
  crear(@Body() body: any, @Request() req: any) {
    return this.clientesService.crear(body, req.user.empresaId);
  }

  @Get(':id')
  detalle(@Param('id') id: string) {
    return this.clientesService.obtenerDetalle(+id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() body: any) {
    return this.clientesService.actualizar(+id, body);
  }

  @Patch(':id/toggle-activo')
  toggleActivo(@Param('id') id: string) {
    return this.clientesService.toggleActivo(+id);
  }

  @Post(':id/puntos/agregar')
  agregarPuntos(@Param('id') id: string, @Body('puntos') puntos: number) {
    return this.clientesService.agregarPuntos(+id, puntos);
  }

  @Post(':id/puntos/redimir')
  redimirPuntos(@Param('id') id: string, @Body('puntos') puntos: number) {
    return this.clientesService.redimirPuntos(+id, puntos);
  }
}