import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { PlacaDeVideo } from '../../models/placa-de-video/placa-de-video.model';
import { PlacaDeVideoService } from '../../services/placa-de-video.service';
import { inject } from '@angular/core';

export const placaDeVideoResolver: ResolveFn<PlacaDeVideo> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(PlacaDeVideoService).findById(route.paramMap.get('id')!);
};
