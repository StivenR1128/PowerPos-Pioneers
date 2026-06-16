import { Controller, Get, Patch, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EmpresaService } from './empresa.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Get()
  obtener(@Request() req: any) {
    return this.empresaService.obtener(req.user.empresaId);
  }

  @Patch()
  actualizar(@Body() body: any, @Request() req: any) {
    return this.empresaService.actualizar(req.user.empresaId, body);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: './uploads/logos',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(new Error('Solo se permiten imágenes'), false);
      } else {
        cb(null, true);
      }
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  async subirLogo(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const logoUrl = `http://localhost:3000/uploads/logos/${file.filename}`;
    await this.empresaService.actualizarLogo(req.user.empresaId, logoUrl);
    return { logoUrl };
  }
}