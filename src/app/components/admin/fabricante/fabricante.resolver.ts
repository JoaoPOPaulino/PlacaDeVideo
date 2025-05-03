import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { Fabricante } from '../../../models/placa-de-video/fabricante.model';
import { FabricanteService } from '../../../services/fabricante.service';

export const fabricanteResolver: ResolveFn<Fabricante> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(FabricanteService).findById(route.paramMap.get('id')!);
};
