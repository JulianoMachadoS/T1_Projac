import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Turma } from '../src/academico/dominio/turma';
import { FonteAcademicaPorta } from '../src/academico/portas/fonte-academica.porta';
import { Curso } from '../src/plataforma-aprendizagem/dominio/curso';
import { PlataformaAprendizagemPorta } from '../src/plataforma-aprendizagem/portas/plataforma-aprendizagem.porta';
import { HistoricoSincronizacao } from '../src/sincronizacao/persistencia/historico-sincronizacao.entidade';
import { VinculoTurmaCurso } from '../src/sincronizacao/persistencia/vinculo-turma-curso.entidade';
import {
  SincronizarTurmasCasoDeUso,
  turmaParaCurso,
} from '../src/sincronizacao/aplicacao/sincronizar-turmas.caso-de-uso';

// o @nestjs/typeorm e so ESM e o jest nao carrega; como o teste nao usa banco, troca o decorator por um vazio
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

// versoes falsas das portas e do banco: o teste roda sem i-Educar, Moodle e Postgres
class FonteAcademicaFalsa implements FonteAcademicaPorta {
  turmas: Turma[] = [];
  listarTurmasAtivas() {
    return Promise.resolve(this.turmas);
  }
}

class PlataformaFalsa implements PlataformaAprendizagemPorta {
  cursos: Curso[] = [];
  nomesQueFalham: string[] = [];
  criarCurso(curso: Curso) {
    if (this.nomesQueFalham.includes(curso.nomeCurto)) {
      return Promise.reject(new Error('Moodle: erro simulado'));
    }
    this.cursos.push(curso);
    return Promise.resolve(100 + this.cursos.length); // id do curso criado
  }
}

class VinculosFalsos {
  linhas: { turmaId: number; cursoId: number }[] = [];
  findOneBy(filtro: { turmaId: number }) {
    const achou = this.linhas.find((v) => v.turmaId === filtro.turmaId);
    return Promise.resolve(achou ?? null);
  }
  save(vinculo: { turmaId: number; cursoId: number }) {
    this.linhas.push(vinculo);
    return Promise.resolve(vinculo);
  }
}

class HistoricoFalso {
  linhas: object[] = [];
  save(linha: object) {
    this.linhas.push(linha);
    return Promise.resolve(linha);
  }
}

const turma3: Turma = {
  id: 3,
  nome: '1º ano Matutino',
  ano: 2026,
  escolaId: 2,
};
const turma4: Turma = {
  id: 4,
  nome: '2º ano Matutino',
  ano: 2026,
  escolaId: 2,
};

describe('SincronizarTurmasCasoDeUso', () => {
  let fonte: FonteAcademicaFalsa;
  let plataforma: PlataformaFalsa;
  let vinculos: VinculosFalsos;
  let historico: HistoricoFalso;
  let casoDeUso: SincronizarTurmasCasoDeUso;

  beforeAll(() => {
    Logger.overrideLogger(false); // sem log no meio da saida do teste
  });

  beforeEach(() => {
    fonte = new FonteAcademicaFalsa();
    plataforma = new PlataformaFalsa();
    vinculos = new VinculosFalsos();
    historico = new HistoricoFalso();
    casoDeUso = new SincronizarTurmasCasoDeUso(
      fonte,
      plataforma,
      vinculos as unknown as Repository<VinculoTurmaCurso>,
      historico as unknown as Repository<HistoricoSincronizacao>,
    );
  });

  it('converte a turma em curso (nome, nome curto e codigo externo)', () => {
    expect(turmaParaCurso(turma3)).toEqual({
      nomeCompleto: '1º ano Matutino',
      nomeCurto: 'turma-3',
      codigoExterno: 'ieducar-turma-3',
    });
  });

  it('uma turma nova vira um curso e o vinculo fica gravado', async () => {
    fonte.turmas = [turma3];

    const resultado = await casoDeUso.executar();

    expect(resultado.cursosCriados).toBe(1);
    expect(plataforma.cursos[0].nomeCurto).toBe('turma-3');
    expect(vinculos.linhas).toEqual([{ turmaId: 3, cursoId: 101 }]);
  });

  it('rodando de novo, a turma que ja tem curso e ignorada', async () => {
    fonte.turmas = [turma3];
    await casoDeUso.executar();

    const resultado = await casoDeUso.executar();

    expect(resultado.cursosCriados).toBe(0);
    expect(resultado.turmasIgnoradas).toBe(1);
    expect(plataforma.cursos).toHaveLength(1); // nao criou outro curso
  });

  it('turma criada depois: so ela ganha curso', async () => {
    fonte.turmas = [turma3];
    await casoDeUso.executar();

    fonte.turmas = [turma3, turma4]; // turma 4 criada no i-Educar
    const resultado = await casoDeUso.executar();

    expect(resultado.cursosCriados).toBe(1);
    expect(resultado.turmasIgnoradas).toBe(1);
    expect(vinculos.linhas.map((v) => v.turmaId)).toEqual([3, 4]);
  });

  it('erro em uma turma nao impede as outras e fica registrado', async () => {
    fonte.turmas = [turma3, turma4];
    plataforma.nomesQueFalham = ['turma-3'];

    const resultado = await casoDeUso.executar();

    expect(resultado.cursosCriados).toBe(1);
    expect(resultado.falhas).toEqual([
      { turmaId: 3, erro: 'Moodle: erro simulado' },
    ]);
    expect(vinculos.linhas).toEqual([{ turmaId: 4, cursoId: 101 }]); // turma 3 sem vinculo, tenta de novo depois
  });

  it('cada execucao grava uma linha no historico', async () => {
    fonte.turmas = [turma3];
    await casoDeUso.executar();
    await casoDeUso.executar();

    expect(historico.linhas).toHaveLength(2);
  });
});
