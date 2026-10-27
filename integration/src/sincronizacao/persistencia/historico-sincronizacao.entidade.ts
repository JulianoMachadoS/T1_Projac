import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// uma linha por execucao da sincronizacao
@Entity('historico_sincronizacao')
export class HistoricoSincronizacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'iniciado_em', type: 'timestamptz' })
  iniciadoEm: Date;

  @Column({ name: 'finalizado_em', type: 'timestamptz' })
  finalizadoEm: Date;

  @Column({ name: 'total_turmas' })
  totalTurmas: number;

  @Column({ name: 'cursos_criados' })
  cursosCriados: number;

  @Column({ name: 'turmas_ignoradas' })
  turmasIgnoradas: number;

  // jsonb: lista de falhas cabe numa coluna so, sem precisar de outra tabela
  @Column({ type: 'jsonb' })
  falhas: { turmaId: number; erro: string }[];
}
