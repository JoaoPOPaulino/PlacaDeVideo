import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Usuario } from '../models/usuario/usuario.model';
import { Perfil } from '../models/usuario/perfil';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private url = 'http://localhost:8080/usuario';

  constructor(private httpClient: HttpClient) {}

   findAll(
      page: number = 0,
      pageSize: number = 8,
      searchTerm?: string
    ): Observable<Usuario[]> {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());
  
      const url = searchTerm ? `${this.url}/search` : this.url;
  
      if (searchTerm) {
        params = params.set('nome', searchTerm);
      }
  
      return this.httpClient
        .get<Usuario[]>(url, { params })
        .pipe(map((usuarios) => usuarios.map((usuarios) => this.convertToModel(usuarios))));
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

  count(searchTerm?: string): Observable<number> {
      const params = searchTerm
        ? new HttpParams().set('nome', searchTerm)
        : new HttpParams();
  
      return this.httpClient.get<number>(`${this.url}/count`, { params });
    }

    private convertToModel(usuario: any): Usuario {
        const result = new Usuario();
        Object.assign(result, usuario);
    
        // Conversão segura da categoria
        if (usuario.perfil) {
          result.perfil = Perfil.fromValue(usuario.perfil);
        } else {
          console.warn('Perfil não encontrada, usando padrão USER');
          result.perfil = Perfil.USER;
        }
    
        return result;
      }
}
