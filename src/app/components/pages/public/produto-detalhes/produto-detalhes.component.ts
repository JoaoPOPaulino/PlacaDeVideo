import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { AvaliacaoService } from '../../../../services/avaliacao.service';
import { AuthService } from '../../../../services/auth.service';
import { CartService } from '../../../../services/cart.service';
import { PlacaDeVideo } from '../../../../models/placa-de-video/placa-de-video.model';
import { Avaliacao } from '../../../../models/avaliacao/avaliacao.model';
import { ItemCarrinho } from '../../../../models/item-carrinho';
import { Subscription } from 'rxjs';
import { PublicHeaderComponent } from '../../../template/public/public-header/public-header.component';
import { FooterComponent } from '../../../template/shared/footer/footer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-produto-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    RouterModule,
    PublicHeaderComponent,
    FooterComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './produto-detalhes.component.html',
  styleUrls: ['./produto-detalhes.component.css'],
})
export class ProdutoDetalhesComponent implements OnInit, OnDestroy {
  placa: PlacaDeVideo | null = null;
  avaliacoes: Avaliacao[] = [];
  avaliacaoForm: FormGroup;
  isLoggedIn = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private placaDeVideoService: PlacaDeVideoService,
    private avaliacaoService: AvaliacaoService,
    private authService: AuthService,
    private cartService: CartService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.avaliacaoForm = this.fb.group({
      nota: [''], // Optional
      comentario: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlaca(id);
      this.loadAvaliacoes(id);
    }
    this.subscription.add(
      this.authService.getUsuarioLogado().subscribe((usuario) => {
        this.isLoggedIn = !!usuario && this.authService.isLoggedIn();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPlaca(id: string): void {
    this.subscription.add(
      this.placaDeVideoService.findById(id).subscribe({
        next: (placa) => {
          this.placa = placa;
        },
        error: (err) => {
          this.snackBar.open('Erro ao carregar produto.', 'Fechar', {
            duration: 3000,
          });
          console.error(err);
        },
      })
    );
  }

  loadAvaliacoes(placaId: string): void {
    this.subscription.add(
      this.avaliacaoService.findByPlacaId(+placaId).subscribe({
        next: (avaliacoes) => {
          this.avaliacoes = avaliacoes;
        },
        error: (err) => {
          this.snackBar.open('Erro ao carregar avaliações.', 'Fechar', {
            duration: 3000,
          });
          console.error(err);
        },
      })
    );
  }

  addToCart(): void {
    if (this.placa) {
      const item: ItemCarrinho = {
        id: this.placa.id,
        nome: this.placa.nome,
        preco: this.placa.preco,
        quantidade: 1,
        nomeImagem: this.placa.nomeImagem,
      };
      this.cartService.addToCart(item);
      this.snackBar.open(
        `${this.placa.nome} adicionado ao carrinho!`,
        'Fechar',
        { duration: 3000 }
      );
    }
  }

  submitAvaliacao(): void {
    if (this.avaliacaoForm.invalid || !this.placa) {
      this.snackBar.open('Formulário inválido.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!this.isLoggedIn) {
      this.snackBar.open('Faça login para avaliar.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const usuario = this.authService.getUsuarioLogadoSnapshot();
    if (!usuario) {
      this.snackBar.open('Usuário não encontrado.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const avaliacao: Avaliacao = {
      id: 0,
      usuario: usuario,
      placadevideo: this.placa,
      nota: this.avaliacaoForm.value.nota
        ? {
            id: +this.avaliacaoForm.value.nota,
            label: this.getNotaLabel(+this.avaliacaoForm.value.nota),
          }
        : undefined,
      comentario: this.avaliacaoForm.value.comentario,
      dataCriacao: new Date().toISOString(),
    };

    this.subscription.add(
      this.avaliacaoService.insert(avaliacao).subscribe({
        next: (novaAvaliacao) => {
          this.avaliacoes = [...this.avaliacoes, novaAvaliacao]; // Use spread for immutability
          this.avaliacaoForm.reset({ nota: '', comentario: '' }); // Reset form
          this.snackBar.open('Avaliação enviada com sucesso!', 'Fechar', {
            duration: 3000,
          });
        },
        error: (err) => {
          this.snackBar.open('Erro ao enviar avaliação.', 'Fechar', {
            duration: 3000,
          });
          console.error('Erro ao enviar avaliação:', err);
        },
      })
    );
  }

  private getNotaLabel(valor: number): string {
    switch (valor) {
      case 1:
        return 'Péssimo';
      case 2:
        return 'Ruim';
      case 3:
        return 'Bom';
      case 4:
        return 'Ótimo';
      case 5:
        return 'Excelente';
      default:
        return '';
    }
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return 'assets/images/default-card.png';
    return `${
      this.placaDeVideoService.url
    }/download/imagem/${encodeURIComponent(imageName)}`;
  }
}
