// Curso no formato da integracao, sem os nomes de campo do Moodle
export interface Curso {
  nomeCompleto: string;
  nomeCurto: string; // precisa ser unico na plataforma
  codigoExterno: string; // liga o curso a origem dele (ex.: a turma do i-Educar)
}
