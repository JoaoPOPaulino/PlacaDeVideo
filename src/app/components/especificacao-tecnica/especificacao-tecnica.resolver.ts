import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { EspecificacaoTecnica } from '../../models/placa-de-video/especificacao-tecnica.model';
import { EspecificacaoTecnicaService } from '../../services/especificacao-tecnica.service';
import { inject } from '@angular/core';

export const especificacaoTecnicaResolver: ResolveFn<EspecificacaoTecnica> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(EspecificacaoTecnicaService).findById(
    route.paramMap.get('id')!
  );
};
