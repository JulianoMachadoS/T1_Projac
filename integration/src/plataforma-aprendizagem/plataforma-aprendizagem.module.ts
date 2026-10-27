import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MoodleApiAdaptador } from './adaptadores/moodle/moodle-api.adaptador';
import { PLATAFORMA_APRENDIZAGEM } from './portas/plataforma-aprendizagem.porta';

@Module({
  imports: [HttpModule],
  providers: [
    { provide: PLATAFORMA_APRENDIZAGEM, useClass: MoodleApiAdaptador },
  ],
  exports: [PLATAFORMA_APRENDIZAGEM],
})
export class PlataformaAprendizagemModule {}
