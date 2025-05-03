import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { EspecificacaoTecnica } from '../../../models/placa-de-video/especificacao-tecnica.model';
import { EspecificacaoTecnicaService } from '../../../services/especificacao-tecnica.service';

export const especificacaoTecnicaResolver: ResolveFn<EspecificacaoTecnica> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(EspecificacaoTecnicaService).findById(
    route.paramMap.get('id')!
  );
};
