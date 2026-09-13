import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { PrismaService } from './database/prisma.service';

async function bootstrap() {
  const logger = new Logger('CleoPlatformAPI');
  const app = await NestFactory.create(AppModule);

  // ── Security Headers (Helmet) ──
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global Interceptors and Filters
  const prismaService = app.get(PrismaService);
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new AuditInterceptor(prismaService),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Cleo Platform - Multi-Tenant SaaS REST API')
    .setDescription(
      'Documentación de endpoints de Cleo Platform (Platform Super Admin, Tenant Admin y Storefront)',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addGlobalParameters({
      name: 'x-tenant-slug',
      in: 'header',
      required: false,
      description:
        'Slug del tenant para contexto multi-tenant (ej. cleo, moda-peru, techstore)',
      schema: { type: 'string', default: 'cleo' },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Cleo Platform REST API corriendo en: http://localhost:${port}`);
  logger.log(
    `📚 Swagger OpenAPI docs disponible en: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
