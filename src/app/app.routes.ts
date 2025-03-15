import { Routes } from '@angular/router';
import { PlacaDeVideoListComponent } from './components/PlacaDeVideo/placa-de-video-list/placa-de-video-list.component';
import { PlacaDeVideoFormComponent } from './components/PlacaDeVideo/placa-de-video-form/placa-de-video-form.component';
import { UsuarioListComponent } from './components/usuario/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './components/usuario/usuario-form/usuario-form.component';

export const routes: Routes = [
  {
    path: 'placasdevideo',
    component: PlacaDeVideoListComponent,
    title: 'Lista de Placas de Vídeo',
  },

  {
    path: 'placasdevideo/new',
    component: PlacaDeVideoFormComponent,
    title: 'Nova Placa de Vídeo',
  },
  {
    path: 'usuarios',
    component: UsuarioListComponent,
    title: 'Lista de Usuários',
  },
  {
    path: 'usuarios/new',
    component: UsuarioFormComponent,
    title: 'Novo Usuário',
  },
];
