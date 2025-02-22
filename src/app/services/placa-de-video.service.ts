import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlacaDeVideoService {
  private url = 'http://localhost:8080/placas';

  constructor(private httpClient: HttpClient) {}

  getPlacas() {
    this.getPlacas;
  }
}
