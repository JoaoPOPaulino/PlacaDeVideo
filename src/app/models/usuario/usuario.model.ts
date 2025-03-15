import { Endereco } from './endereco.model';
import { Perfil } from './perfil';
import { Telefone } from './telefone.model';

export class Usuario {
  id!: number;
  nome!: string;
  email!: string;
  login!: string;
  senha!: string;
  telefone!: Telefone[];
  endereco!: Endereco[];
  perfil!: Perfil;
}
