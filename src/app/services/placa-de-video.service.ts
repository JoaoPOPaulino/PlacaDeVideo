import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlacaDeVideo } from '../models/placa-de-video/placa-de-video.model';
import { Categoria } from '../models/placa-de-video/categoria';

@Injectable({
  providedIn: 'root',
})
export class PlacaDeVideoService {
  private url = 'http://localhost:8080/placas-de-video';

  constructor(private httpClient: HttpClient) {}

  findAll(
    page: number = 0,
    pageSize: number = 8,
    searchTerm?: string
  ): Observable<PlacaDeVideo[]> {
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
    const params = searchTerm
      ? new HttpParams().set('nome', searchTerm)
      : new HttpParams();

    return this.httpClient.get<number>(`${this.url}/count`, { params });
  }

  findById(id: string): Observable<PlacaDeVideo> {
    return this.httpClient.get<PlacaDeVideo>(`${this.url}/${id}`);
  }

  insert(placa: PlacaDeVideo): Observable<PlacaDeVideo> {
    const placaDTO = this.convertToDTO(placa);
    return this.httpClient.post<PlacaDeVideo>(this.url, placaDTO);
  }

  update(placa: PlacaDeVideo): Observable<any> {
    // Adaptar o objeto para o formato que o backend espera
    const placaDTO = this.convertToDTO(placa);
    return this.httpClient.put(`${this.url}/${placa.id}`, placaDTO);
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/${id}`);
  }

  private convertToDTO(placa: PlacaDeVideo): any {
    return {
      nome: placa.nome,
      preco: placa.preco,
      nomeImagem: placa.nomeImagem,
      idFabricante: placa.fabricante.id,
      idCategoria: this.getCategoriaId(placa.categoria),
      estoque: placa.estoque,
      idEspecificacaoTecnica: placa.especificacaoTecnica.id,
    };
  }

  private getCategoriaId(categoria: Categoria): number {
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
