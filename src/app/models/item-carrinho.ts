export interface ItemCarrinho {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  nomeImagem?: string; // Alterado de imagemUrl para nomeImagem
}
