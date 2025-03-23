import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fabricante } from '../models/placa-de-video/fabricante.model';

@Injectable({
  providedIn: 'root',
})
export class FabricanteService {
  private url = 'http://localhost:8080/fabricantes';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Fabricante[]> {
    let params = {};

    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString(),
      };
    }

    console.log(this.url);
    console.log({ params });

    return this.httpClient.get<Fabricante[]>(this.url, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.url}/count`);
  }

  findById(id: string): Observable<Fabricante> {
    return this.httpClient.get<Fabricante>(`${this.url}/${id}`);
  }

  insert(fabricante: Fabricante): Observable<Fabricante> {
    return this.httpClient.post<Fabricante>(this.url, fabricante);
  }

  update(fabricante: Fabricante): Observable<any> {
    return this.httpClient.put<Fabricante>(
      `${this.url}/${fabricante.id}`,
      fabricante
    );
  }

  delete(fabricante: Fabricante): Observable<any> {
    return this.httpClient.delete<Fabricante>(`${this.url}/${fabricante.id}`);
  }
}
