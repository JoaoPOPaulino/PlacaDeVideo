import { Categoria } from './categoria.model';
import { EspecificacaoTecnica } from './especificacao-tecnica.model';
import { Fabricante } from './fabricante.model';

export class PlacaDeVideo {
  id!: number;
  nome!: string;
  preco!: number;
  especificacaoTecnica!: EspecificacaoTecnica;
  fabricante!: Fabricante;
  categoria!: string;
  estoque!: number;
  nomeImagem!: string;
  descricao?: string;
}
