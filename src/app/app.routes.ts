import { Routes } from '@angular/router';
import { PlacaDeVideoListComponent } from './components/PlacaDeVideo/placa-de-video-list/placa-de-video-list.component';

export const routes: Routes = [
  {
    path: 'placasDeVideo',
    component: PlacaDeVideoListComponent,
    title: 'Lista de Placas de Vídeo',
  },
];
