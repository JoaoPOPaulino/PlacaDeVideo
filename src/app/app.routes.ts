import { Routes } from '@angular/router';
import { UsuarioListComponent } from './components/admin/usuario/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './components/admin/usuario/usuario-form/usuario-form.component';
import { usuarioResolver } from './components/admin/usuario/usuario.resolver';
import { AdminTemplateComponent } from './components/template/admin-template/admin-template.component';
import { HomeComponent } from './components/pages/home/home.component';
import { NotFoundComponent } from './components/pages/not-found/not-found.component';
import { PublicTemplateComponent } from './components/template/public/public-template/public-template.component';
import { PublicHomeComponent } from './components/pages/public/public-home/public-home.component';
import { LoginComponent } from './components/pages/public/login/login.component';
import { SobreComponent } from './components/pages/public/sobre/sobre.component';
import { CadastroComponent } from './components/pages/public/cadastro/cadastro.component';
import { AvaliacaoFormComponent } from './components/admin/avaliacao/avaliacao-form/avaliacao-form.component';
import { AvaliacaoListComponent } from './components/admin/avaliacao/avaliacao-list/avaliacao-list.component';
import { EspecificacaoTecnicaFormComponent } from './components/admin/especificacao-tecnica/especificacao-tecnica-form/especificacao-tecnica-form.component';
import { EspecificacaoTecnicaListComponent } from './components/admin/especificacao-tecnica/especificacao-tecnica-list/especificacao-tecnica-list.component';
import { especificacaoTecnicaResolver } from './components/admin/especificacao-tecnica/especificacao-tecnica.resolver';
import { FabricanteFormComponent } from './components/admin/fabricante/fabricante-form/fabricante-form.component';
import { FabricanteListComponent } from './components/admin/fabricante/fabricante-list/fabricante-list.component';
import { fabricanteResolver } from './components/admin/fabricante/fabricante.resolver';
import { PlacaDeVideoFormComponent } from './components/admin/placas-de-video/placa-de-video-form/placa-de-video-form.component';
import { PlacaDeVideoListComponent } from './components/admin/placas-de-video/placa-de-video-list/placa-de-video-list.component';
import { placaDeVideoResolver } from './components/admin/placas-de-video/placa-de-video.resolver';
import { ProdutosComponent } from './components/pages/public/produtos/produtos.component';
import { authUser } from './components/guard/authUser.guard';
import { authGuard } from './components/guard/authAdmin.guard';
import { CheckoutComponent } from './components/pages/private/checkout/checkout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicTemplateComponent,
    canActivate: [authUser],
    children: [
      {
        path: '',
        component: PublicHomeComponent,
        title: 'NexusGPU - Melhores Placas de Vídeo',
      },
      {
        path: 'produtos',
        component: ProdutosComponent,
        title: 'Placas de Vídeo',
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
        data: { isPublic: true },
      },
      {
        path: 'sobre',
        component: SobreComponent,
        title: 'Sobre Nós',
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        title: 'Finalizar Compra',
        canActivate: [authUser],
      },
    ],
  },
  {
    path: 'admin',
    component: AdminTemplateComponent,
    canActivate: [authGuard],
    title: 'Administrativo',
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      { path: 'login', component: LoginComponent, title: 'Login' },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Dashboard',
      },
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
    ],
  },
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
