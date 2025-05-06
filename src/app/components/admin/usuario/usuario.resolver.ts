import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Usuario } from '../../../models/usuario/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';

export const usuarioResolver: ResolveFn<Usuario | null> = (route): Observable<Usuario | null> => {
  const usuarioService = inject(UsuarioService);
  const id = route.paramMap.get('id');
  if (id && id !== 'new') {
    return usuarioService.findById(id);
  }
  return of(null);
};