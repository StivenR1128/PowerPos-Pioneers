import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  crear(@Body() body: any, @Request() req: any) {
    return this.usuariosService.crear(body, req.user.empresaId);
  }

  @Get()
  listar(@Request() req: any) {
    return this.usuariosService.listar(req.user.empresaId);
  }
}