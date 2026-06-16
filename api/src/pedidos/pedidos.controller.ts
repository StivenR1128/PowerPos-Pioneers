import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  crear(@Body() body: any, @Request() req: any) {
    return this.pedidosService.crearPedido(
      body,
      req.user.id,
      req.user.empresaId,
    );
  }

  @Get()
  listar(@Request() req: any, @Query('sucursalId') sucursalId?: string) {
    return this.pedidosService.listarPedidos(
      req.user.empresaId,
      sucursalId ? +sucursalId : undefined,
    );
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.pedidosService.obtenerPedido(+id);
  }

  @Patch(':id/estado')
  actualizarEstado(@Param('id') id: string, @Body() body: { estado: string }) {
    return this.pedidosService.actualizarEstado(+id, body.estado);
  }
}