import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles('ADMIN_EMPRESA', 'GERENTE')
  crear(@Body() body: any, @Request() req: any) {
    return this.productosService.crear(body, req.user.empresaId);
  }

  @Get()
  listar(@Request() req: any, @Query('categoriaId') categoriaId?: string) {
    return this.productosService.listar(req.user.empresaId, categoriaId ? +categoriaId : undefined);
  }

  @Get(':id')
  obtener(@Param('id') id: string, @Request() req: any) {
    return this.productosService.obtener(+id, req.user.empresaId);
  }

  @Patch(':id')
  @Roles('ADMIN_EMPRESA', 'GERENTE')
  actualizar(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.productosService.actualizar(+id, body, req.user.empresaId);
  }

  @Delete(':id')
  @Roles('ADMIN_EMPRESA', 'GERENTE')
  eliminar(@Param('id') id: string, @Request() req: any) {
    return this.productosService.eliminar(+id, req.user.empresaId);
  }
}
