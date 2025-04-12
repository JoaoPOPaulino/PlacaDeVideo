// src/app/pipes/categoria.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Categoria } from '../models/placa-de-video/categoria';

@Pipe({
  name: 'categoriaLabel',
  standalone: true, // Importante para componentes standalone
})
export class CategoriaPipe implements PipeTransform {
  transform(value: Categoria): string {
    switch (value) {
      case Categoria.ENTRADA:
        return 'Entrada';
      case Categoria.INTERMEDIARIA:
        return 'Intermediária';
      case Categoria.ALTO_DESEMPENHO:
        return 'Alto Desempenho';
      default:
        return 'Desconhecida';
    }
  }
}
