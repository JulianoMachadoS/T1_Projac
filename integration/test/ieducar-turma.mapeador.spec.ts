import { paraTurma } from '../src/academico/adaptadores/ieducar/ieducar-turma.mapeador';

describe('paraTurma', () => {
  it('traduz os campos do i-Educar para o nosso modelo', () => {
    const turmaIEducar = {
      cod_turma: 23,
      nm_turma: 'Pré-Escolar Integral',
      ano: 2026,
      ref_ref_cod_escola: 3,
    };

    expect(paraTurma(turmaIEducar)).toEqual({
      id: 23,
      nome: 'Pré-Escolar Integral',
      ano: 2026,
      escolaId: 3,
    });
  });
});
