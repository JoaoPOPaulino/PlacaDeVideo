import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { Avaliacao } from '../../../models/avaliacao/avaliacao.model';
import { AvaliacaoService } from '../../../services/avaliacao.service';

export const avaliacaoResolver: ResolveFn<Avaliacao> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(AvaliacaoService).findById(Number(route.paramMap.get('id')!));
};
