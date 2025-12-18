import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  
  // CORS configuration for deployment
  const allowedOrigins = process.env.CLIENT_ORIGIN 
    ? process.env.CLIENT_ORIGIN.split(',')
    : ['http://localhost:3000'];
  
  app.enableCors({ 
    origin: allowedOrigins,
    credentials: true 
  });
  
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`API running on port ${port}`);
}
bootstrap();
