import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const uploadsPath = path.join(process.cwd(), 'uploads');
  console.log('Sirviendo archivos estáticos desde:', uploadsPath);
  
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}
bootstrap();