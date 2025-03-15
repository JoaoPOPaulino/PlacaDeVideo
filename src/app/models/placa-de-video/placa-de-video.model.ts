import { Categoria } from './categoria';
import { EspecificacaoTecnica } from './especificacao-tecnica.model';
import { Fabricante } from './fabricante.model';

export class PlacaDeVideo {
  id!: number;
  nome!: string;
  preco!: number;
  especificacaoTecnica!: EspecificacaoTecnica;
  fabricante!: Fabricante;
  categoria!: Categoria;
  estoque!: number;
}
