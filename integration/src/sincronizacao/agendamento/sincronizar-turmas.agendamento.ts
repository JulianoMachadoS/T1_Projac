import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SincronizarTurmasCasoDeUso } from '../aplicacao/sincronizar-turmas.caso-de-uso';

// roda a sincronizacao sozinha, sem ninguem precisar chamar
@Injectable()
export class SincronizarTurmasAgendamento {
  constructor(private readonly casoDeUso: SincronizarTurmasCasoDeUso) {}

  // a cada 1 minuto: turma nova no i-Educar aparece logo no Moodle
  @Cron(CronExpression.EVERY_MINUTE)
  async executar() {
    await this.casoDeUso.executar();
  }
}
