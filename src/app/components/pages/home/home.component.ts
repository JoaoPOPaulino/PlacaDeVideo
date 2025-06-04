// home.component.ts
import { Component } from '@angular/core';
import { PlacaDeVideoService } from '../../../services/placa-de-video.service';
import { EspecificacaoTecnicaService } from '../../../services/especificacao-tecnica.service';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FabricanteService } from '../../../services/fabricante.service';
import { UsuarioService } from '../../../services/usuario.service';
import { AvaliacaoService } from '../../../services/avaliacao.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatIcon,
  ],
})
export class HomeComponent {
  totalAvaliacoes = 0;
  totalPlacas = 0;
  totalEspecificacoes = 0;
  totalFabricante = 0;
  totalUsuarios = 0;
  loading = true;

  constructor(
    private placaService: PlacaDeVideoService,
    private especificacaoService: EspecificacaoTecnicaService,
    private fabricanteService: FabricanteService,
    private usuarioService: UsuarioService,
    private avaliacaoService: AvaliacaoService
  ) {
    this.carregarDados();
  }

  carregarDados() {
    this.avaliacaoService.count().subscribe({
      next: (res) => (this.totalAvaliacoes = res),
      error: (err) => console.error('Erro ao carregar avaliações:', err),
    });
    this.placaService.count().subscribe({
      next: (res) => (this.totalPlacas = res),
      error: (err) => console.error('Erro ao carregar placas:', err),
    });

    this.especificacaoService.count().subscribe({
      next: (res) => (this.totalEspecificacoes = res),
      error: (err) => console.error('Erro ao carregar especificações:', err),
    });

    this.fabricanteService.count().subscribe({
      next: (res) => (this.totalFabricante = res),
      error: (err) => console.error('Erro ao carregar fabricantes:', err),
      complete: () => (this.loading = false),
    });

    this.usuarioService.count().subscribe({
      next: (res) => (this.totalUsuarios = res),
      error: (err) => console.error('Erro ao carregar usuários:', err),
      complete: () => (this.loading = false),
    });
  }
}
