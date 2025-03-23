import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Fabricante } from '../../models/placa-de-video/fabricante.model';
import { FabricanteService } from '../../services/fabricante.service';
import { inject } from '@angular/core';

export const fabricanteResolver: ResolveFn<Fabricante> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(FabricanteService).findById(route.paramMap.get('id')!);
};
