import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ItemCarrinho } from '../../../../models/item-carrinho';
import { BbApiService } from '../../../../services/bb-api.service';
import { CartService } from '../../../../services/cart.service';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  step = 1;
  checkoutForm: FormGroup;
  items: ItemCarrinho[] = [];
  subtotal: number = 0;
  pixCode: string = '';
  boletoLink: string = '';

  constructor(
    private bbApi: BbApiService,
    private cartService: CartService,
    private placaService: PlacaDeVideoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      formaPagamento: ['', Validators.required],
      cpfCnpj: [
        '',
        [Validators.required, Validators.pattern(/^\d{11}|\d{14}$/)],
      ],
    });
  }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items) => {
      this.items = items;
      this.subtotal = this.cartService.subtotal;
    });
  }

  nextStep() {
    if (this.step === 1 && this.checkoutForm.valid) {
      this.step = 2;
    } else {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, preencha todos os campos corretamente',
        'Fechar',
        { duration: 3000 }
      );
    }
  }

  async finalizarPedido() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    try {
      const valor = this.subtotal;
      const { formaPagamento, cpfCnpj } = this.checkoutForm.value;

      if (formaPagamento === 'pix') {
        const response: any = await this.bbApi.criarCobrancaPix(
          valor,
          'sua_chave_pix@bb.com.br'
        );
        this.pixCode = response.qrcode;
      } else if (formaPagamento === 'boleto') {
        const response: any = await this.bbApi.criarBoleto(valor, cpfCnpj);
        this.boletoLink = response.pdf;
      }

      this.cartService.clearCart();
      this.step = 3;
      this.snackBar.open('Pagamento gerado com sucesso!', 'Fechar', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro:', error);
      this.snackBar.open(
        'Falha ao gerar pagamento. Tente novamente.',
        'Fechar',
        { duration: 5000 }
      );
    }
  }

  voltar() {
    if (this.step > 1) {
      this.step--;
    }
  }

  finalizar() {
    this.router.navigate(['/']);
  }

  get formaPagamento() {
    return this.checkoutForm.get('formaPagamento')?.value;
  }

  getImageUrl(imageName: string | undefined): string {
    if (!imageName) {
      return 'assets/images/default-card.png';
    }
    return `${this.placaService.url}/download/imagem/${encodeURIComponent(
      imageName
    )}`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default-card.png';
  }
}
