import { Endereco } from './endereco.model';
import { Perfil } from './perfil.model';
import { Telefone } from './telefone.model';

export class Usuario {
  id!: number;
  nome!: string;
  email!: string;
  login!: string;
  senha!: string;
  telefones: Telefone[] = [];
  enderecos: Endereco[] = [];
  perfil!: Perfil;
  nomeImagem!: string;
}
