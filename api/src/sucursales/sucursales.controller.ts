import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Post()
  crear(@Body() body: any, @Request() req: any) {
    return this.sucursalesService.crear(body, req.user.empresaId);
  }

  @Get()
  listar(@Request() req: any) {
    return this.sucursalesService.listar(req.user.empresaId);
  }
}