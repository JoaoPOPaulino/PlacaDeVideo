import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private url = 'http://localhost:8080/usuario';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(this.url);
  }

  findById(id: string): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.url}/${id}`);
  }

  insert(usuario: Usuario): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.url, usuario);
  }

  update(usuario: Usuario): Observable<any> {
    return this.httpClient.put<Usuario>(`${this.url}/${usuario.id}`, usuario);
  }

  delete(usuario: Usuario): Observable<any> {
    return this.httpClient.delete<Usuario>(`${this.url}/${usuario.id}`);
  }
}
