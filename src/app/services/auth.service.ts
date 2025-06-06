import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Usuario } from '../models/usuario/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseURL = 'http://localhost:8080/auth';
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
    const usuario = this.localStorageService.getItem<Usuario>(
      this.usuarioLogadoKey
    );
    if (usuario) {
      this.setUsuarioLogado(usuario);
      this.usuarioLogadoSubject.next(usuario);
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

  getUsuario(): Usuario | null {
    return this.getUsuarioLogadoSnapshot();
  }

  getPerfil(): string | null {
    const usuario = this.localStorageService.getItem<Usuario>(
      this.usuarioLogadoKey
    );
    if (usuario) {
      return usuario.perfil?.label?.toUpperCase() || null;
    }
    return null;
  }

  setUsuarioLogado(usuario: Usuario): void {
    this.localStorageService.setItem(this.usuarioLogadoKey, usuario);
  }

  setToken(token: string): void {
    this.localStorageService.setItem(this.tokenKey, token);
  }

  getUsuarioLogado(): Observable<Usuario | null> {
    return this.usuarioLogadoSubject.asObservable();
  }

  getToken(): string | null {
    return this.localStorageService.getItem<string>(this.tokenKey);
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

  solicitarRecuperacaoSenha(loginOuEmail: string): Observable<any> {
    return this.http.post(`${this.baseURL}/solicitar-recuperacao`, {
      loginOuEmail,
    });
  }

  resetarSenha(token: string, novaSenha: string): Observable<any> {
    return this.http.post(`${this.baseURL}/resetar-senha`, {
      token,
      novaSenha,
    });
  }

  validarSenha(usuarioId: number, senha: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.baseURL}/validar-senha`, {
        usuarioId,
        senha,
      })
      .pipe(catchError(() => of(false)));
  }
}
