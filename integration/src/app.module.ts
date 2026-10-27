import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicoModule } from './academico/academico.module';
import { PlataformaAprendizagemModule } from './plataforma-aprendizagem/plataforma-aprendizagem.module';
import { SincronizacaoModule } from './sincronizacao/sincronizacao.module';

@Module({
  imports: [
    // isGlobal: qualquer modulo le as variaveis do .env sem importar de novo
    ConfigModule.forRoot({ isGlobal: true }),
    // as variaveis ja chegam no process.env pelo docker compose (env_file e environment)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.INTEGRATION_DB_HOST,
      port: Number(process.env.INTEGRATION_DB_PORT),
      username: process.env.INTEGRATION_DB_USER,
      password: process.env.INTEGRATION_DB_PASSWORD,
      database: process.env.INTEGRATION_DB_NAME,
      autoLoadEntities: true, // pega as entidades registradas nos modulos
      synchronize: true, // cria as tabelas sozinho, sem migration (ok pro trabalho, nao pra producao)
    }),
    // liga os @Cron do projeto
    ScheduleModule.forRoot(),
    AcademicoModule,
    PlataformaAprendizagemModule,
    SincronizacaoModule,
  ],
})
export class AppModule {}
