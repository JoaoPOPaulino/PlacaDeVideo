import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (state.url === '/admin/login') {
    return true;
  }

  if (!authService.isLoggedIn()) {
    authService.removeToken();
    authService.removeUsuarioLogado();
    router.navigate(['/admin/login']);
    return false;
  }

  const perfil = authService.getPerfil();
  if (perfil !== 'ADMIN') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
