import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Usuario } from '../models/usuario/usuario.model';
import { Perfil } from '../models/usuario/perfil';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private url = 'http://localhost:8080/usuarios';

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
      .pipe(map((usuarios) => usuarios.map((usuario) => this.convertToModel(usuario))));
  }

  findById(id: string): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.url}/${id}`)
      .pipe(map(usuario => this.convertToModel(usuario)));
  }

  insert(usuario: any): Observable<any> {
    const payload = {
      nome: usuario.nome,
      email: usuario.email,
      login: usuario.login,
      senha: usuario.senha,
      idPerfil: usuario.idPerfil || usuario.perfil,
      telefones: usuario.telefones || [],
      enderecos: usuario.enderecos || []
    };
    return this.httpClient.post<any>(this.url, payload);
  }
  
  update(usuario: any, id: number): Observable<any> {
    const payload = {
      nome: usuario.nome,
      email: usuario.email,
      login: usuario.login,
      senha: usuario.senha,
      idPerfil: usuario.idPerfil || usuario.perfil,
      telefones: usuario.telefones || [],
      enderecos: usuario.enderecos || []
    };
    return this.httpClient.put<any>(`${this.url}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/${id}`);
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

    if (usuario.perfil) {
      result.perfil = Perfil.fromValue(usuario.perfil);
    } else {
      console.warn('Perfil não encontrado, usando padrão USER');
      result.perfil = Perfil.USER;
    }

    return result;
  }
}