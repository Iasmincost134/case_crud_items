import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Configuração compartilhada entre a aplicação real (main.ts) e os testes e2e.
 * Sem o ValidationPipe global, TODOS os decorators do class-validator nos DTOs
 * seriam ignorados e qualquer payload seria aceito.
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos que não existem no DTO
      forbidNonWhitelisted: true, // e responde 400 se vierem campos extras
      transform: true, // converte o JSON em instância do DTO (necessário p/ @Transform)
      stopAtFirstError: true, // 1 mensagem por campo (a mais básica), sem enxurrada
    }),
  );
  app.enableShutdownHooks();
}
