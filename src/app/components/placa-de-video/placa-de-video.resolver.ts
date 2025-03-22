import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { PlacaDeVideo } from '../../models/placa-de-video/placa-de-video.model';
import { inject } from '@angular/core';
import { PlacaDeVideoService } from '../../services/placa-de-video.service';

export const placaDeVideoResolver: ResolveFn<PlacaDeVideo> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(PlacaDeVideoService).findById(route.paramMap.get('id')!);
};
