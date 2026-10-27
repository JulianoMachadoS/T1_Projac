import { Curso } from '../dominio/curso';

export const PLATAFORMA_APRENDIZAGEM = 'PLATAFORMA_APRENDIZAGEM';

// o que o resto do sistema espera da plataforma de aprendizagem (hoje o Moodle)
export interface PlataformaAprendizagemPorta {
  // devolve o id do curso criado na plataforma
  criarCurso(curso: Curso): Promise<number>;
}
