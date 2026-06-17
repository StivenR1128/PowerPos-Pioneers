import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get()
  listar(@Query('incluirInactivos') incluirInactivos?: string) {
    return this.inventarioService.listarIngredientes(incluirInactivos === 'true');
  }

  @Post()
  crear(@Body() body: any, @Request() req: any) {
    return this.inventarioService.crearIngrediente(body, req.user.id);
  }

  @Get('alertas')
  alertas() {
    return this.inventarioService.obtenerAlertas();
  }

  @Get(':id/historial')
  historial(@Param('id') id: string) {
    return this.inventarioService.obtenerHistorial(+id);
  }

  @Post(':id/ajuste')
  ajustar(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.inventarioService.ajustarStock(+id, body, req.user.id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() body: any) {
    return this.inventarioService.actualizarIngrediente(+id, body);
  }

  @Patch(':id/toggle-activo')
  toggleActivo(@Param('id') id: string) {
    return this.inventarioService.toggleActivo(+id);
  }
}