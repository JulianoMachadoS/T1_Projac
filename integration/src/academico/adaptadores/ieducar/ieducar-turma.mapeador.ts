import { Turma } from '../../dominio/turma';

// so os campos que usamos da resposta de /api/school-class
export interface TurmaIEducar {
  cod_turma: number;
  nm_turma: string;
  ano: number;
  ref_ref_cod_escola: number;
}

// traduz do formato do i-Educar pro nosso, se a API mudar so mexe aqui
export function paraTurma(bruta: TurmaIEducar): Turma {
  return {
    id: bruta.cod_turma,
    nome: bruta.nm_turma,
    ano: bruta.ano,
    escolaId: bruta.ref_ref_cod_escola,
  };
}
