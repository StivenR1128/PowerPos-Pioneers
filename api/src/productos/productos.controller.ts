import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
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
  actualizar(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.productosService.actualizar(+id, body, req.user.empresaId);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req: any) {
    return this.productosService.eliminar(+id, req.user.empresaId);
  }
}