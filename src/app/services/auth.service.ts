import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Usuario } from '../models/usuario/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseURL: string = 'http://localhost:8080/auth';
  private tokenKey = 'jwt_token';
  private usuarioLogadoKey = 'usuario_logado';
  private usuarioLogadoSubject = new BehaviorSubject<Usuario | null>(null);

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private jwtHelper: JwtHelperService
  ) {
    this.initUsuarioLogado();
  }

  private initUsuarioLogado() {
    const usuario = this.localStorageService.getItem(this.usuarioLogadoKey);
    if (usuario) {
      try {
        const usuarioLogado = JSON.parse(usuario);
        this.setUsuarioLogado(usuarioLogado);
        this.usuarioLogadoSubject.next(usuarioLogado);
      } catch (error) {
        console.error('Erro ao parsear usuário logado:', error);
        this.removeUsuarioLogado();
      }
    }
  }

  login(login: string, senha: string): Observable<any> {
    const params = { login, senha };
    return this.http.post(this.baseURL, params, { observe: 'response' }).pipe(
      tap((res: any) => {
        let authToken = res.headers.get('Authorization') ?? '';
        if (authToken.startsWith('Bearer ')) {
          authToken = authToken.replace('Bearer ', '');
        }
        const usuarioLogado = res.body as Usuario;
        if (authToken && usuarioLogado) {
          this.setToken(authToken);
          this.setUsuarioLogado(usuarioLogado);
          this.usuarioLogadoSubject.next(usuarioLogado);
        } else {
          console.error('Token ou usuário não retornado pelo backend');
        }
      })
    );
  }

  getPerfil(): string | null {
    const usuario = this.localStorageService.getItem(this.usuarioLogadoKey);
    if (usuario) {
      try {
        const usuarioLogado = JSON.parse(usuario);
        return usuarioLogado.perfil?.label?.toUpperCase() || null;
      } catch (error) {
        console.error('Erro ao obter perfil:', error);
        return null;
      }
    }
    return null;
  }

  setUsuarioLogado(usuario: Usuario): void {
    this.localStorageService.setItem(
      this.usuarioLogadoKey,
      JSON.stringify(usuario)
    );
  }

  setToken(token: string): void {
    this.localStorageService.setItem(this.tokenKey, token);
  }

  getUsuarioLogado(): Observable<Usuario | null> {
    return this.usuarioLogadoSubject.asObservable();
  }

  getToken(): string | null {
    return this.localStorageService.getItem(this.tokenKey);
  }

  removeToken(): void {
    this.localStorageService.removeItem(this.tokenKey);
  }

  removeUsuarioLogado(): void {
    this.localStorageService.removeItem(this.usuarioLogadoKey);
    this.usuarioLogadoSubject.next(null);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Token inválido:', error);
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  logout(): void {
    this.removeToken();
    this.removeUsuarioLogado();
  }

  getUsuarioLogadoSnapshot(): Usuario | null {
    return this.usuarioLogadoSubject.getValue();
  }

  getUsuarioId(): number | null {
    const usuario = this.getUsuarioLogadoSnapshot();
    return usuario ? usuario.id : null;
  }

  updateUsuarioLogado(updatedUsuario: Usuario): void {
    this.setUsuarioLogado(updatedUsuario);
  }

  solicitarRecuperacaoSenha(loginOuEmail: string): Observable<void> {
      return this.http.post<void>(`${this.baseURL}/solicitar-recuperacao`, { loginOuEmail });
  }

  resetarSenha(token: string, novaSenha: string): Observable<void> {
    return this.http.post<void>(`${this.baseURL}/resetar-senha`, { token, novaSenha });
}
}
