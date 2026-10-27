import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IEducarApiAdaptador } from './adaptadores/ieducar/ieducar-api.adaptador';
import { FONTE_ACADEMICA } from './portas/fonte-academica.porta';

@Module({
  imports: [HttpModule],
  providers: [{ provide: FONTE_ACADEMICA, useClass: IEducarApiAdaptador }],
  exports: [FONTE_ACADEMICA],
})
export class AcademicoModule {}
