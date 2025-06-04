import { PlacaDeVideo } from '../placa-de-video/placa-de-video.model';
import { Usuario } from '../usuario/usuario.model';
import { Nota } from './nota';

export class Avaliacao {
  id!: number;
  usuario!: Usuario;
  placaDeVideo!: PlacaDeVideo;
  nota?: number;
  comentario!: string;
  dataCriacao?: string;
}
