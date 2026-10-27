import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turma } from '../../academico/dominio/turma';
import {
  FONTE_ACADEMICA,
  type FonteAcademicaPorta,
} from '../../academico/portas/fonte-academica.porta';
import { Curso } from '../../plataforma-aprendizagem/dominio/curso';
import {
  PLATAFORMA_APRENDIZAGEM,
  type PlataformaAprendizagemPorta,
} from '../../plataforma-aprendizagem/portas/plataforma-aprendizagem.porta';
import { HistoricoSincronizacao } from '../persistencia/historico-sincronizacao.entidade';
import { VinculoTurmaCurso } from '../persistencia/vinculo-turma-curso.entidade';

export interface ResultadoSincronizacao {
  totalTurmas: number;
  cursosCriados: number;
  turmasIgnoradas: number;
  falhas: { turmaId: number; erro: string }[];
}

// regra de negocio: como uma turma do i-Educar vira um curso
export function turmaParaCurso(turma: Turma): Curso {
  return {
    nomeCompleto: turma.nome,
    nomeCurto: `turma-${turma.id}`, // nome da turma se repete entre escolas, o id nao
    codigoExterno: `ieducar-turma-${turma.id}`,
  };
}

@Injectable()
export class SincronizarTurmasCasoDeUso {
  private readonly logger = new Logger(SincronizarTurmasCasoDeUso.name);

  // recebe as portas, nao os adaptadores, entao nao sabe que e i-Educar e Moodle
  constructor(
    @Inject(FONTE_ACADEMICA)
    private readonly fonteAcademica: FonteAcademicaPorta,
    @Inject(PLATAFORMA_APRENDIZAGEM)
    private readonly plataforma: PlataformaAprendizagemPorta,
    @InjectRepository(VinculoTurmaCurso)
    private readonly vinculos: Repository<VinculoTurmaCurso>,
    @InjectRepository(HistoricoSincronizacao)
    private readonly historico: Repository<HistoricoSincronizacao>,
  ) {}

  async executar(): Promise<ResultadoSincronizacao> {
    const iniciadoEm = new Date();
    const turmas = await this.fonteAcademica.listarTurmasAtivas();

    const resultado: ResultadoSincronizacao = {
      totalTurmas: turmas.length,
      cursosCriados: 0,
      turmasIgnoradas: 0,
      falhas: [],
    };

    for (const turma of turmas) {
      // turma que ja tem curso nao e criada de novo
      const vinculo = await this.vinculos.findOneBy({ turmaId: turma.id });
      if (vinculo) {
        resultado.turmasIgnoradas++;
        continue;
      }

      // erro numa turma nao pode impedir as outras de serem criadas
      try {
        const cursoId = await this.plataforma.criarCurso(turmaParaCurso(turma));
        await this.vinculos.save({ turmaId: turma.id, cursoId });
        resultado.cursosCriados++;
        this.logger.log(`Turma ${turma.id} -> curso ${cursoId}`);
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : String(erro);
        resultado.falhas.push({ turmaId: turma.id, erro: mensagem });
        this.logger.warn(`Turma ${turma.id} falhou: ${mensagem}`);
      }
    }

    await this.historico.save({
      iniciadoEm,
      finalizadoEm: new Date(),
      ...resultado,
    });
    this.logger.log(
      `Fim: ${resultado.cursosCriados} criados, ${resultado.turmasIgnoradas} ignorados, ${resultado.falhas.length} falhas`,
    );

    return resultado;
  }
}
