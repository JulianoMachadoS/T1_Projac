import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

// guarda so os ids, os dados da turma e do curso ficam no i-Educar e no Moodle
@Entity('vinculo_turma_curso')
export class VinculoTurmaCurso {
  // chave primaria: cada turma tem no maximo um curso
  @PrimaryColumn({ name: 'turma_id' })
  turmaId: number;

  @Column({ name: 'curso_id' })
  cursoId: number;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
