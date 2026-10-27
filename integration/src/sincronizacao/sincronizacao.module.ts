import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicoModule } from '../academico/academico.module';
import { PlataformaAprendizagemModule } from '../plataforma-aprendizagem/plataforma-aprendizagem.module';
import { SincronizarTurmasAgendamento } from './agendamento/sincronizar-turmas.agendamento';
import { SincronizarTurmasCasoDeUso } from './aplicacao/sincronizar-turmas.caso-de-uso';
import { SincronizacaoController } from './http/sincronizacao.controller';
import { HistoricoSincronizacao } from './persistencia/historico-sincronizacao.entidade';
import { VinculoTurmaCurso } from './persistencia/vinculo-turma-curso.entidade';

@Module({
  imports: [
    AcademicoModule,
    PlataformaAprendizagemModule,
    TypeOrmModule.forFeature([VinculoTurmaCurso, HistoricoSincronizacao]),
  ],
  controllers: [SincronizacaoController],
  providers: [SincronizarTurmasCasoDeUso, SincronizarTurmasAgendamento],
})
export class SincronizacaoModule {}
