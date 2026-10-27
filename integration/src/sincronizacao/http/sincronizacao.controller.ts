import { Controller, HttpCode, Post } from '@nestjs/common';
import {
  ResultadoSincronizacao,
  SincronizarTurmasCasoDeUso,
} from '../aplicacao/sincronizar-turmas.caso-de-uso';

// entrada HTTP (MVC): so recebe o pedido e chama o caso de uso
@Controller('sincronizacao')
export class SincronizacaoController {
  constructor(private readonly casoDeUso: SincronizarTurmasCasoDeUso) {}

  // POST /sincronizacao/turmas -> roda na hora e devolve o resumo
  @Post('turmas')
  @HttpCode(200) // nao cria um recurso novo na nossa API, entao 200 e nao 201
  sincronizarTurmas(): Promise<ResultadoSincronizacao> {
    return this.casoDeUso.executar();
  }
}
