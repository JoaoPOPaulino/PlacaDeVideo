import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Usuario } from '../models/usuario/usuario.model';

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
      .get<boolean>(`${this.url}/exists`, { params: { email } })
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
      .get<boolean>(`${this.url}/exists`, { params: { login } })
      .pipe(catchError(() => of(false)));
  }

  checkCpfExists(cpf: string): Observable<boolean> {
    if (!cpf || !/^\d{11}$/.test(cpf)) {
      return of(false);
    }
    return this.httpClient
      .get<boolean>(`${this.url}/exists`, { params: { cpf } })
      .pipe(catchError(() => of(false)));
  }

  insert(usuario: any): Observable<Usuario> {
    const payload = {
      nome: usuario.nome,
      email: usuario.email,
      login: usuario.login,
      senha: usuario.senha,
      cpf: usuario.cpf,
      perfil: usuario.perfil.id, // Envia apenas o ID do perfil
      telefones: usuario.telefones || [],
      enderecos: usuario.enderecos || [],
      nomeImagem: usuario.nomeImagem || null, // Garante que nomeImagem seja null se não definido
    };

    return this.httpClient
      .post<Usuario>(this.url, payload)
      .pipe(catchError(this.handleError));
  }

  update(usuario: any, id: number): Observable<Usuario> {
    const payload = {
      nome: usuario.nome,
      email: usuario.email,
      login: usuario.login,
      senha: usuario.senha,
      cpf: usuario.cpf,
      perfil: usuario.perfil.id, // Envia apenas o ID do perfil
      telefones: usuario.telefones || [],
      enderecos: usuario.enderecos || [],
      nomeImagem: usuario.nomeImagem || null, // Garante que nomeImagem seja null se não definido
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

    if (typeof usuario.perfil === 'string') {
      result.perfil = {
        id: usuario.perfil === 'USER' ? 1 : 2,
        label: usuario.perfil === 'USER' ? 'Usuário' : 'Administrador',
      };
    } else if (usuario.perfil) {
      result.perfil = usuario.perfil;
    } else {
      console.warn('Perfil não encontrado, usando padrão USER');
      result.perfil = { id: 1, label: 'Usuário' };
    }

    return result;
  }

  uploadImagem(id: number, file: File): Observable<Usuario> {
    const formData = new FormData();
    formData.append('imagem', file);
    formData.append('nomeImagem', file.name);

    return this.httpClient.patch<Usuario>(
      `${this.url}/${id}/upload/imagem`,
      formData
    );
  }
}
