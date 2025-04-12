import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PlacaDeVideo } from '../models/placa-de-video/placa-de-video.model';
import { Categoria } from '../models/placa-de-video/categoria';

@Injectable({
  providedIn: 'root',
})
export class PlacaDeVideoService {
  public readonly url = 'http://localhost:8080/placas-de-video';

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

    return this.httpClient
      .get<PlacaDeVideo[]>(url, { params })
      .pipe(map((placas) => placas.map((placa) => this.convertToModel(placa))));
  }

  count(searchTerm?: string): Observable<number> {
    const params = searchTerm
      ? new HttpParams().set('nome', searchTerm)
      : new HttpParams();

    return this.httpClient.get<number>(`${this.url}/count`, { params });
  }

  findById(id: string): Observable<PlacaDeVideo> {
    return this.httpClient
      .get<PlacaDeVideo>(`${this.url}/${id}`)
      .pipe(map((placa) => this.convertToModel(placa)));
  }

  insert(placa: PlacaDeVideo): Observable<PlacaDeVideo> {
    const placaDTO = this.convertToDTO(placa);
    return this.httpClient.post<PlacaDeVideo>(this.url, placaDTO);
  }

  update(placa: PlacaDeVideo): Observable<any> {
    const placaDTO = this.convertToDTO(placa);
    return this.httpClient.put(`${this.url}/${placa.id}`, placaDTO);
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/${id}`);
  }

  uploadImage(placaId: number, file: File): Observable<PlacaDeVideo> {
    const formData = new FormData();
    formData.append('nomeImagem', file.name);
    formData.append('imagem', file);

    return this.httpClient.patch<PlacaDeVideo>(
      `${this.url}/${placaId}/upload/imagem`,
      formData
    );
  }

  private convertToModel(placa: any): PlacaDeVideo {
    const result = new PlacaDeVideo();
    Object.assign(result, placa);

    // Conversão segura da categoria
    if (placa.categoria) {
      result.categoria = Categoria.fromValue(placa.categoria);
    } else {
      console.warn('Categoria não encontrada, usando padrão ENTRADA');
      result.categoria = Categoria.ENTRADA;
    }

    return result;
  }

  private convertToDTO(placa: PlacaDeVideo): any {
    return {
      nome: placa.nome,
      preco: placa.preco,
      nomeImagem: placa.nomeImagem,
      idFabricante: placa.fabricante.id,
      idCategoria: Categoria.toId(placa.categoria),
      estoque: placa.estoque,
      idEspecificacaoTecnica: placa.especificacaoTecnica.id,
    };
  }
}
