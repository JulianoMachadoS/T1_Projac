import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Turma } from '../../dominio/turma';
import { FonteAcademicaPorta } from '../../portas/fonte-academica.porta';
import { TurmaIEducar, paraTurma } from './ieducar-turma.mapeador';

interface PaginaIEducar {
  data: TurmaIEducar[];
  meta: { last_page: number };
}

@Injectable()
export class IEducarApiAdaptador implements FonteAcademicaPorta {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async listarTurmasAtivas(): Promise<Turma[]> {
    const url = `${this.config.getOrThrow('IEDUCAR_URL')}/api/school-class`;
    const token = this.config.getOrThrow<string>('IEDUCAR_TOKEN');
    // so turmas do ano letivo atual, as de anos anteriores ja encerraram
    const anoAtual = new Date().getFullYear();
    const turmas: Turma[] = [];

    // a API devolve 15 por pagina, entao segue ate a ultima
    // ultimaPagina comeca em 1 e e atualizada com o valor que vem na resposta
    let pagina = 1;
    let ultimaPagina = 1;
    while (pagina <= ultimaPagina) {
      const resposta = await firstValueFrom(
        this.http.get<PaginaIEducar>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json', // sem isso o laravel responde html em caso de erro
          },
          params: {
            active: 1,
            year_eq: anoAtual,
            only: 'cod_turma,nm_turma,ano,ref_ref_cod_escola', // evita trazer as ~80 colunas
            page: pagina,
          },
        }),
      );
      for (const turmaIEducar of resposta.data.data) {
        turmas.push(paraTurma(turmaIEducar));
      }
      ultimaPagina = resposta.data.meta.last_page;
      pagina++;
    }

    return turmas;
  }
}
