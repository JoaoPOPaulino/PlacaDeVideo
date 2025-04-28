import { Routes } from '@angular/router';
import { UsuarioListComponent } from './components/usuario/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './components/usuario/usuario-form/usuario-form.component';
import { AvaliacaoFormComponent } from './components/avaliacao/avaliacao-form/avaliacao-form.component';
import { AvaliacaoListComponent } from './components/avaliacao/avaliacao-list/avaliacao-list.component';
import { PlacaDeVideoListComponent } from './components/placa-de-video/placa-de-video-list/placa-de-video-list.component';
import { PlacaDeVideoFormComponent } from './components/placa-de-video/placa-de-video-form/placa-de-video-form.component';
import { placaDeVideoResolver } from './components/placa-de-video/placa-de-video.resolver';
import { usuarioResolver } from './components/usuario/usuario.resolver';
import { FabricanteFormComponent } from './components/fabricante/fabricante-form/fabricante-form.component';
import { FabricanteListComponent } from './components/fabricante/fabricante-list/fabricante-list.component';
import { fabricanteResolver } from './components/fabricante/fabricante.resolver';
import { EspecificacaoTecnicaListComponent } from './components/especificacao-tecnica/especificacao-tecnica-list/especificacao-tecnica-list.component';
import { EspecificacaoTecnicaFormComponent } from './components/especificacao-tecnica/especificacao-tecnica-form/especificacao-tecnica-form.component';
import { especificacaoTecnicaResolver } from './components/especificacao-tecnica/especificacao-tecnica.resolver';
import { AdminTemplateComponent } from './components/template/admin-template/admin-template.component';
import { HomeComponent } from './components/pages/home/home.component';
import { NotFoundComponent } from './components/pages/not-found/not-found.component';
import { PublicTemplateComponent } from './components/template/public/public-template/public-template.component';
import { PublicHomeComponent } from './components/pages/public/public-home/public-home.component';
import { LoginComponent } from './components/pages/public/login/login.component';
import { SobreComponent } from './components/pages/public/sobre/sobre.component';
import { CadastroComponent } from './components/pages/public/cadastro/cadastro.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicTemplateComponent,
    children: [
      {
        path: '',
        component: PublicHomeComponent,
        title: 'NexusGPU - Melhores Placas de Vídeo',
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
      },
      {
        path: 'cadastro',
        component: CadastroComponent,
        title: 'Cadastro',
        data: { isPublic: true }
      },
      {
        path: 'sobre',
        component: SobreComponent,
        title: 'Sobre Nós'
      }
    ],
  },

  //-------------------------------------------------------
  {
    path: 'admin',
    component: AdminTemplateComponent,
    title: 'Administrativo',
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Dashboard',
      },
      //------------------------------------------------------
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
        path: 'placasdevideo/edit/:id',
        component: PlacaDeVideoFormComponent,
        title: 'Edição de Placa de Vídeo',
        resolve: { placa: placaDeVideoResolver },
      },
      //-------------------------------------------------------
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
        path: 'usuarios/edit/:id',
        component: UsuarioFormComponent,
        title: 'Edição de Usuário',
        resolve: { usuario: usuarioResolver },
      },
      //-------------------------------------------------------
      {
        path: 'avaliacoes',
        component: AvaliacaoListComponent,
        title: 'Lista de Avaliações',
      },
      {
        path: 'avaliacoes/new',
        component: AvaliacaoFormComponent,
        title: 'Nova Avaliação',
      },
      //-------------------------------------------------------
      {
        path: 'fabricantes',
        component: FabricanteListComponent,
        title: 'Lista de Fabricantes',
      },
      {
        path: 'fabricantes/new',
        component: FabricanteFormComponent,
        title: 'Novo Fabricante',
      },
      {
        path: 'fabricantes/edit/:id',
        component: FabricanteFormComponent,
        title: 'Edição de Fabricante',
        resolve: { fabricante: fabricanteResolver },
      },
      //-------------------------------------------------------
      {
        path: 'especificacoes-tecnicas',
        component: EspecificacaoTecnicaListComponent,
        title: 'Lista de Especificações Técnicas',
      },
      {
        path: 'especificacoes-tecnicas/new',
        component: EspecificacaoTecnicaFormComponent,
        title: 'Nova Especificação Técnica',
      },
      {
        path: 'especificacoes-tecnicas/edit/:id',
        component: EspecificacaoTecnicaFormComponent,
        title: 'Edição de Especificação Técnica',
        resolve: { especificacaoTecnica: especificacaoTecnicaResolver },
      },
      //---------------------------------------------------------
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
        path: 'placasdevideo/edit/:id',
        component: PlacaDeVideoFormComponent,
        title: 'Edição de Placa de Vídeo',
        resolve: { placa: placaDeVideoResolver },
      },
    ],
  },
  //-------------------------------------------------------------------------
  {
    path: '404',
    component: NotFoundComponent,
    title: 'Página não encontrada',
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
