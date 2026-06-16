import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CajaModule } from './caja/caja.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EmpresaModule } from './empresa/empresa.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    NotificacionesModule,
    CategoriasModule,
    ProductosModule,
    PedidosModule,
    SucursalesModule,
    UsuariosModule,
    CajaModule,
    EmpresaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}