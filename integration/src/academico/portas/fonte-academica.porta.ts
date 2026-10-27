import { Turma } from '../dominio/turma';

// interface some no build, entao o Nest precisa de um token pra achar a implementacao
export const FONTE_ACADEMICA = 'FONTE_ACADEMICA';

// o que o resto do sistema espera da fonte academica (hoje o i-Educar)
export interface FonteAcademicaPorta {
  listarTurmasAtivas(): Promise<Turma[]>;
}
