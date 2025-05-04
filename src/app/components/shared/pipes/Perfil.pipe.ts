import { Pipe, PipeTransform } from '@angular/core';
import { Perfil } from '../../../models/usuario/perfil.model';

@Pipe({
  name: 'perfilLabel',
  standalone: true,
})
export class PerfilPipe implements PipeTransform {
  transform(perfil: Perfil): string {
    return perfil?.label || 'Sem perfil';
  }
}
