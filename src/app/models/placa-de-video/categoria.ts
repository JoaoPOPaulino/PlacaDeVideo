export enum Categoria {
  ENTRADA = 'ENTRADA',
  INTERMEDIARIA = 'INTERMEDIARIA',
  ALTO_DESEMPENHO = 'ALTO_DESEMPENHO',
}

export namespace Categoria {
  export function fromValue(value: string | number): Categoria {
    const strValue = String(value).toUpperCase();

    switch (strValue) {
      case '1':
      case 'ENTRADA':
        return Categoria.ENTRADA;
      case '2':
      case 'INTERMEDIARIA':
        return Categoria.INTERMEDIARIA;
      case '3':
      case 'ALTO_DESEMPENHO':
        return Categoria.ALTO_DESEMPENHO;
      default:
        console.warn('Valor de categoria inválido:', value);
        return Categoria.ENTRADA;
    }
  }

  export function toId(categoria: Categoria): number {
    switch (categoria) {
      case Categoria.ENTRADA:
        return 1;
      case Categoria.INTERMEDIARIA:
        return 2;
      case Categoria.ALTO_DESEMPENHO:
        return 3;
      default:
        return 1;
    }
  }
}

export function getCategoriaLabel(categoria: Categoria): string {
  switch (categoria) {
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
