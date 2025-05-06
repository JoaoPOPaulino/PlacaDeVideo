import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Usuario } from '../models/usuario/usuario.model';
import { Endereco } from '../models/usuario/endereco.model';
import { Perfil } from '../models/usuario/perfil.model';
import { Telefone } from '../models/usuario/telefone.model';
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
      .pipe(
        map((usuarios) =>
          usuarios.map((usuario) => this.convertToModel(usuario))
        )
      );
  }

  checkEmailExists(email: string): Observable<boolean> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return of(false);
    }

    return this.httpClient
      .get<boolean>(`${this.url}/exists`, {
        params: { email },
      })
      .pipe(catchError(() => of(false)));
  }

  findById(id: string): Observable<Usuario> {
    return this.httpClient
      .get<Usuario>(`${this.url}/${id}`)
      .pipe(map((usuario) => this.convertToModel(usuario)));
  }

  checkLoginExists(login: string): Observable<boolean> {
    if (!login || login.length < 3) {
      return of(false);
    }

    return this.httpClient
      .get<boolean>(`${this.url}/exists`, {
        params: { login },
      })
      .pipe(catchError(() => of(false)));
  }

  insert(usuario: Usuario): Observable<Usuario> {
    if (!usuario.perfil?.id || ![1, 2].includes(usuario.perfil.id)) {
      throw new Error('Perfil inválido');
    }

    const payload = {
      nome: usuario.nome,
      email: usuario.email,
      login: usuario.login,
      senha: usuario.senha,
      idPerfil: usuario.perfil.id,
      telefones:
        usuario.telefones?.map((t: Telefone) => ({
          codigoArea: t.codigoArea,
          numero: t.numero,
        })) || [],
      enderecos:
        usuario.enderecos?.map((e: Endereco) => ({
          rua: e.rua,
          numero: e.numero,
          cidade: e.cidade,
          estado: e.estado,
          cep: e.cep,
        })) || [],
    };

    return this.httpClient
      .post<Usuario>(this.url, payload)
      .pipe(catchError(this.handleError));
  }

  update(usuario: Usuario, id: number): Observable<Usuario> {
    if (!usuario.perfil?.id || ![1, 2].includes(usuario.perfil.id)) {
      throw new Error('Perfil inválido');
    }

    const payload = {
      nome: usuario.nome,
      email: usuario.email,
      login: usuario.login,
      senha: usuario.senha,
      idPerfil: usuario.perfil.id,
      telefones:
        usuario.telefones?.map((t: Telefone) => ({
          codigoArea: t.codigoArea,
          numero: t.numero,
        })) || [],
      enderecos:
        usuario.enderecos?.map((e: Endereco) => ({
          rua: e.rua,
          numero: e.numero,
          cidade: e.cidade,
          estado: e.estado,
          cep: e.cep,
        })) || [],
    };

    return this.httpClient
      .put<Usuario>(`${this.url}/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = this.getServerErrorMessage(error);
    }
    return throwError(() => new Error(errorMessage));
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return error.error?.message || 'Requisição inválida';
      case 409:
        return 'Login já está em uso';
      case 500:
        return error.error?.message || 'Erro interno no servidor';
      default:
        return `Erro ${error.status}: ${error.message}`;
    }
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.url}/${id}`);
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

    if (typeof usuario.perfil === 'number') {
      result.perfil = {
        id: usuario.perfil,
        label: usuario.perfil === 1 ? 'Usuário' : 'Administrador',
      } as Perfil;
    } else if (usuario.perfil) {
      result.perfil = usuario.perfil;
    } else {
      console.warn('Perfil não encontrado, usando padrão USER');
      result.perfil = { id: 1, label: 'Usuário' } as Perfil;
    }

    return result;
  }

  login(identificador: string, senha: string) {
    return this.httpClient.post<{ token: string }>(
      'http://localhost:8080/auth/login',
      {
        email: identificador,
        password: senha,
      }
    );
  }
}
