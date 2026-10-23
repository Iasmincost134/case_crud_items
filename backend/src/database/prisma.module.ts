import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global: assim os módulos de domínio não precisam importar o PrismaModule
// um a um (esquecer isso quebrava a injeção de dependência na inicialização).
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
