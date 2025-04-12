import { Pipe, PipeTransform } from '@angular/core';
import {
  Categoria,
  getCategoriaLabel,
} from '../models/placa-de-video/categoria';

@Pipe({
  name: 'categoriaLabel',
  standalone: true,
})
export class CategoriaPipe implements PipeTransform {
  transform(value: Categoria | string): string {
    const categoria =
      typeof value === 'string' ? Categoria.fromValue(value) : value;
    return getCategoriaLabel(categoria);
  }
}
