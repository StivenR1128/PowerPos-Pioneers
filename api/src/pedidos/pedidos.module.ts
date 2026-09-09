import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PedidosEventosService } from './pedidos-eventos.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService, PedidosEventosService, RolesGuard],
  exports: [PedidosService],
})
export class PedidosModule {}