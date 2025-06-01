import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const authUser: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Rotas públicas que não precisam de guard (ajuste conforme necessidade)
  const publicPaths = ['/login', '/cadastro', '/', '/sobre', '/produtos'];

  if (publicPaths.includes(state.url)) {
    return true;
  }

  if (authService.isTokenExpired()) {
    authService.removeToken();
    authService.removeUsuarioLogado();

    router.navigate(['/login']);
    return false;
  }

  return true;
};
