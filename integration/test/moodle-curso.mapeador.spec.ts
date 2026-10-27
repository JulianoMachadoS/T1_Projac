import { paraParametrosMoodle } from '../src/plataforma-aprendizagem/adaptadores/moodle/moodle-curso.mapeador';

describe('paraParametrosMoodle', () => {
  it('monta os parametros de core_course_create_courses', () => {
    const curso = {
      nomeCompleto: 'Pré-Escolar Integral',
      nomeCurto: 'turma-23',
      codigoExterno: 'ieducar-turma-23',
    };

    expect(paraParametrosMoodle(curso)).toEqual({
      'courses[0][fullname]': 'Pré-Escolar Integral',
      'courses[0][shortname]': 'turma-23',
      'courses[0][idnumber]': 'ieducar-turma-23',
      'courses[0][categoryid]': '1',
    });
  });
});
