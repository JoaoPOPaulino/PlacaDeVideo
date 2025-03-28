export enum Categoria {
  ENTRADA = 1,
  INTERMEDIARIA = 2,
  ALTO_DESEMPENHO = 3,
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
