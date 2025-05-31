import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BbApiService {
  private readonly API_URL = 'https://api.bb.com.br'; // Sandbox: https://api.sandbox.bb.com.br
  private readonly CLIENT_ID =
    'eyJpZCI6IjQzYzgwZDMtY2E4My00NDBmLWEiLCJjb2RpZ29QdWJsaWNhZG9yIjowLCJjb2RpZ29Tb2Z0d2FyZSI6MTM2NDI3LCJzZXF1ZW5jaWFsSW5zdGFsYWNhbyI6MX0';
  private readonly CLIENT_SECRET =
    'eyJpZCI6IjZmMGM3YTUtMjEiLCJjb2RpZ29QdWJsaWNhZG9yIjowLCJjb2RpZ29Tb2Z0d2FyZSI6MTM2NDI3LCJzZXF1ZW5jaWFsSW5zdGFsYWNhbyI6MSwic2VxdWVuY2lhbENyZWRlbmNpYWwiOjIsImFtYmllbnRlIjoiaG9tb2xvZ2FjYW8iLCJpYXQiOjE3NDg2NTQxODg1MTR9';
  private accessToken = '';

  constructor(private http: HttpClient) {}

  // Autenticação OAuth2
  async getAccessToken() {
    const authUrl = `${this.API_URL}/oauth/token?grant_type=client_credentials`;
    const headers = {
      Authorization: `Basic ${btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const response: any = await this.http
        .post(authUrl, null, { headers })
        .toPromise();
      this.accessToken = response.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw error;
    }
  }

  // Criar Cobrança Pix
  async criarCobrancaPix(valor: number, chavePix: string) {
    await this.getAccessToken();
    const url = `${this.API_URL}/pix/v1/cob`;
    const payload = {
      valor: valor.toFixed(2),
      chave: chavePix,
    };
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    return this.http.post(url, payload, { headers }).toPromise();
  }

  // Criar Boleto
  async criarBoleto(valor: number, cpfCnpj: string) {
    await this.getAccessToken();
    const url = `${this.API_URL}/boletos/v1/boletos`;
    const payload = {
      valor: valor.toFixed(2),
      pagador: { cpfCnpj },
    };
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    return this.http.post(url, payload, { headers }).toPromise();
  }
}
