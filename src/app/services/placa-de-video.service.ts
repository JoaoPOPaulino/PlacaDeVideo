import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlacaDeVideo } from '../models/placa-de-video/placa-de-video.model';

@Injectable({
  providedIn: 'root',
})
export class PlacaDeVideoService {
  private url = 'http://localhost:8080/placas';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<PlacaDeVideo[]> {
    return this.httpClient.get<PlacaDeVideo[]>(this.url);
  }

  findById(id: string): Observable<PlacaDeVideo> {
    return this.httpClient.get<PlacaDeVideo>(`${this.url}/${id}`);
  }

  insert(placa: PlacaDeVideo): Observable<PlacaDeVideo> {
    return this.httpClient.post<PlacaDeVideo>(this.url, placa);
  }

  update(placa: PlacaDeVideo): Observable<any> {
    return this.httpClient.put<PlacaDeVideo>(`${this.url}/${placa.id}`, placa);
  }

  delete(placa: PlacaDeVideo): Observable<any> {
    return this.httpClient.delete<PlacaDeVideo>(`${this.url}/${placa.id}`);
  }
}
