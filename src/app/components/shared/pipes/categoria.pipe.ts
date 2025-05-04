import { Pipe, PipeTransform } from '@angular/core';
import { Categoria } from '../../../models/placa-de-video/categoria.model';

@Pipe({
  name: 'categoriaLabel',
  standalone: true,
})
export class CategoriaPipe implements PipeTransform {
  transform(categoria: Categoria): string {
    return categoria?.label || 'Sem categoria';
  }
}
