import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlacaDeVideo } from '../models/placa-de-video/placa-de-video.model';

@Injectable({
  providedIn: 'root',
})
export class PlacaDeVideoService {
  public readonly url = 'http://localhost:8080/placas-de-video';

  constructor(private httpClient: HttpClient) {}

  private getCategoriaId(categoria: string): number {
    switch (categoria?.toLowerCase()) {
      case 'entrada':
        return 1;
      case 'intermediária':
        return 100;
      case 'alto desempenho':
        return 3;
      default:
        throw new Error('Categoria inválida: ' + categoria);
    }
  }

  findAll(page: number = 0, pageSize: number = 8, searchTerm?: string): Observable<PlacaDeVideo[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = searchTerm ? `${this.url}/search` : this.url;

    if (searchTerm) {
      params = params.set('nome', searchTerm);
    }

    return this.httpClient.get<PlacaDeVideo[]>(url, { params });
  }

  count(searchTerm?: string): Observable<number> {
    const params = searchTerm ? new HttpParams().set('nome', searchTerm) : new HttpParams();
    return this.httpClient.get<number>(`${this.url}/count`, { params });
  }

  findById(id: string): Observable<PlacaDeVideo> {
  return this.httpClient.get<PlacaDeVideo>(`${this.url}/${id}`, {
    params: new HttpParams().set('projection', 'placaCompleta')
  });
}

  insert(placa: PlacaDeVideo): Observable<PlacaDeVideo> {
    if (!placa.fabricante?.id || !placa.categoria || !placa.especificacaoTecnica?.id) {
      throw new Error('Fabricante, categoria ou especificação técnica inválidos');
    }

    const obj = {
      nome: placa.nome,
      preco: placa.preco,
      nomeImagem: placa.nomeImagem || null,
      idFabricante: placa.fabricante.id,
      idCategoria: this.getCategoriaId(placa.categoria),
      estoque: placa.estoque,
      idEspecificacaoTecnica: placa.especificacaoTecnica.id,
      descricao: placa.descricao || '',
    };

    return this.httpClient.post<PlacaDeVideo>(this.url, obj);
  }

  update(placa: PlacaDeVideo): Observable<PlacaDeVideo> {
    if (!placa.id || !placa.fabricante?.id || !placa.categoria || !placa.especificacaoTecnica?.id) {
      throw new Error('ID, fabricante, categoria ou especificação técnica inválidos');
    }

    const obj = {
      id: placa.id,
      nome: placa.nome,
      preco: placa.preco,
      nomeImagem: placa.nomeImagem || null,
      idFabricante: placa.fabricante.id,
      idCategoria: this.getCategoriaId(placa.categoria),
      estoque: placa.estoque,
      idEspecificacaoTecnica: placa.especificacaoTecnica.id,
      descricao: placa.descricao || '',
    };

    return this.httpClient.put<PlacaDeVideo>(`${this.url}/${placa.id}`, obj);
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/${id}`);
  }

  uploadImage(placaId: number, file: File): Observable<PlacaDeVideo> {
    const formData = new FormData();
    formData.append('nomeImagem', file.name);
    formData.append('imagem', file);

    return this.httpClient.patch<PlacaDeVideo>(`${this.url}/${placaId}/upload/imagem`, formData);
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return 'assets/images/default-card.png';
    return `${this.url}/download/imagem/${encodeURIComponent(imageName)}`;
  }
}