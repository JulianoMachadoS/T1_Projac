import { Curso } from '../../dominio/curso';

// categoria padrao que ja vem no Moodle
const CATEGORIA_PADRAO = 1;

// traduz o nosso curso pro formato de core_course_create_courses
export function paraParametrosMoodle(curso: Curso): Record<string, string> {
  return {
    'courses[0][fullname]': curso.nomeCompleto,
    'courses[0][shortname]': curso.nomeCurto,
    'courses[0][idnumber]': curso.codigoExterno,
    'courses[0][categoryid]': String(CATEGORIA_PADRAO),
  };
}
