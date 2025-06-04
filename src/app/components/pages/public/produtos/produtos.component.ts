import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { PlacaDeVideo } from '../../../../models/placa-de-video/placa-de-video.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CartService } from '../../../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FabricanteService } from '../../../../services/fabricante.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    FormsModule,
    MatGridListModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css'],
})
export class ProdutosComponent implements OnInit, OnDestroy {
  placas: PlacaDeVideo[] = [];
  totalItems: number = 0;
  pageSize = 8;
  currentPage = 0;
  searchTerm: string = '';
  filterFabricante: number | null = null; // Alterado para number
  filterCategoria: string | null = null; // Mantido como string
  loading = true;
  fabricantes: { id: number; nome: string }[] = []; // Lista de fabricantes
  categorias = ['Entrada', 'Intermediária', 'Alto Desempenho']; // Categorias válidas
  private subscription: Subscription = new Subscription();

  constructor(
    private placaDeVideoService: PlacaDeVideoService,
    private fabricanteService: FabricanteService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFabricantes();
    this.loadPlacas();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadFabricantes(): void {
    this.subscription.add(
      this.fabricanteService.findAll().subscribe({
        next: (fabricantes) => {
          this.fabricantes = fabricantes;
        },
        error: (err) => {
          console.error('Erro ao carregar fabricantes:', err);
          this.snackBar.open('Erro ao carregar fabricantes.', 'Fechar', { duration: 3000 });
        },
      })
    );
  }

  loadPlacas(): void {
    this.loading = true;
    let params = new URLSearchParams();
    params.set('page', this.currentPage.toString());
    params.set('pageSize', this.pageSize.toString());
    if (this.searchTerm) params.set('nome', this.searchTerm);
    if (this.filterFabricante) params.set('idFabricante', this.filterFabricante.toString());
    if (this.filterCategoria) params.set('categoria', this.filterCategoria);

    this.subscription.add(
      this.placaDeVideoService
        .findAll(this.currentPage, this.pageSize, this.searchTerm)
        .subscribe({
          next: (placas) => {
            // Filtro manual no frontend enquanto a API não suporta filtros
            this.placas = placas.filter((placa) => {
              const matchFabricante = this.filterFabricante
                ? placa.fabricante.id === this.filterFabricante
                : true;
              const matchCategoria = this.filterCategoria
                ? placa.categoria === this.filterCategoria
                : true;
              return matchFabricante && matchCategoria;
            });
            this.loading = false;
          },
          error: (err) => {
            console.error('Erro ao carregar produtos:', err);
            this.loading = false;
            this.snackBar.open('Erro ao carregar produtos.', 'Fechar', { duration: 3000 });
          },
        })
    );

    this.subscription.add(
      this.placaDeVideoService.count(this.searchTerm).subscribe({
        next: (count) => {
          this.totalItems = count;
          // Ajuste manual do totalItems com base nos filtros
          if (this.filterFabricante || this.filterCategoria) {
            this.totalItems = this.placas.length;
          }
        },
        error: (err) => {
          console.error('Erro ao contar produtos:', err);
        },
      })
    );
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadPlacas();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPlacas();
  }

  viewDetails(placaId: number): void {
    this.router.navigate(['/produto', placaId]);
  }

  addToCart(placa: PlacaDeVideo): void {
    this.cartService.addToCart({
      id: placa.id,
      nome: placa.nome,
      preco: placa.preco,
      nomeImagem: placa.nomeImagem,
      quantidade: 1,
    });
    this.snackBar.open(`${placa.nome} adicionado ao carrinho!`, 'Fechar', { duration: 3000 });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadPlacas();
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return 'assets/images/default-card.png';
    return `${this.placaDeVideoService.url}/download/imagem/${encodeURIComponent(imageName)}`;
  }
}