import { Routes } from '@angular/router';
import { UsuarioListComponent } from './components/usuario/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './components/usuario/usuario-form/usuario-form.component';
import { AvaliacaoFormComponent } from './components/avaliacao/avaliacao-form/avaliacao-form.component';
import { AvaliacaoListComponent } from './components/avaliacao/avaliacao-list/avaliacao-list.component';
import { PlacaDeVideoListComponent } from './components/placa-de-video/placa-de-video-list/placa-de-video-list.component';

export const routes: Routes = [
  {
    path: 'placasdevideo',
    component: PlacaDeVideoListComponent,
    title: 'Lista de Placas de Vídeo',
  },

  {
    path: 'placasdevideo/new',
    component: PlacaDeVideoListComponent,
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
  {
    path: 'avaliacao',
    component: AvaliacaoListComponent,
    title: 'Lista de Avaliações',
  },
  {
    path: 'avaliacao/new',
    component: AvaliacaoFormComponent,
    title: 'Nova Avaliação',
  },
];
