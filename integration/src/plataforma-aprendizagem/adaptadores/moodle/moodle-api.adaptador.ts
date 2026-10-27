import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Curso } from '../../dominio/curso';
import { PlataformaAprendizagemPorta } from '../../portas/plataforma-aprendizagem.porta';
import { paraParametrosMoodle } from './moodle-curso.mapeador';

interface ErroMoodle {
  errorcode: string;
  message: string;
}

interface CursoCriadoMoodle {
  id: number;
  shortname: string;
}

@Injectable()
export class MoodleApiAdaptador implements PlataformaAprendizagemPorta {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async criarCurso(curso: Curso): Promise<number> {
    const url = `${this.config.getOrThrow('MOODLE_URL')}/webservice/rest/server.php`;
    const corpo = new URLSearchParams({
      wstoken: this.config.getOrThrow<string>('MOODLE_TOKEN'),
      wsfunction: 'core_course_create_courses',
      moodlewsrestformat: 'json',
      ...paraParametrosMoodle(curso),
    });

    // POST com form, assim nome com acento e espaco vai codificado certo
    const resposta = await firstValueFrom(this.http.post(url, corpo));

    // o Moodle devolve erro com status 200: se deu certo vem uma lista, se deu erro vem um objeto
    if (!Array.isArray(resposta.data)) {
      const erro = resposta.data as ErroMoodle;
      throw new Error(`Moodle: ${erro.errorcode} - ${erro.message}`);
    }

    const cursosCriados = resposta.data as CursoCriadoMoodle[];
    return cursosCriados[0].id;
  }
}
