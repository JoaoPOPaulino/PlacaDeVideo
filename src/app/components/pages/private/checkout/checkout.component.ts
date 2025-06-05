import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ItemCarrinho } from '../../../../models/item-carrinho';
import { CartService } from '../../../../services/cart.service';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { PagamentoService } from '../../../../services/pagamento.service';
import { AuthService } from '../../../../services/auth.service';
import { Pedido } from '../../../../models/pedido/pedido.model';
import { Pagamento } from '../../../../models/pagamento/pagamento.model';
import { PedidoService } from '../../../../services/pedido.service';

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
    MatSnackBarModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  step = 1;
  checkoutForm: FormGroup;
  items: ItemCarrinho[] = [];
  subtotal = 0;
  pixCode: string | null = null;
  chavePix: string | null = null;
  pedidoId: number | null = null;

  constructor(
    private cartService: CartService,
    private placaService: PlacaDeVideoService,
    private pedidoService: PedidoService,
    private pagamentoService: PagamentoService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      formaPagamento: ['PIX', Validators.required],
      cpfCnpj: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
    });
  }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items) => {
      this.items = items;
      this.subtotal = this.cartService.getSubtotal();
    });

    const usuario = this.authService.getUsuario();
    if (usuario) {
      this.checkoutForm.patchValue({
        cpfCnpj: usuario.cpf,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefones, // Corrigido de 'telefones' para 'telefone'
      });
    }
  }

  nextStep() {
    if (this.step === 1 && this.checkoutForm.valid) {
      const usuario = this.authService.getUsuario();
      if (usuario?.cpf !== this.checkoutForm.get('cpfCnpj')?.value) {
        this.snackBar.open('CPF informado não corresponde ao usuário autenticado.', 'Fechar', {
          duration: 5000,
        });
        return;
      }
      this.step = 2;
    } else {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', {
        duration: 3000,
      });
    }
  }

  finalizarPedido() {
    if (this.checkoutForm.invalid || !this.items.length) {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open('Formulário inválido ou carrinho vazio.', 'Fechar', { duration: 5000 });
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.snackBar.open('Usuário não autenticado.', 'Fechar', { duration: 5000 });
      return;
    }

    const customer = {
      name: this.checkoutForm.get('nome')?.value,
      email: this.checkoutForm.get('email')?.value,
      cellphone: this.checkoutForm.get('telefone')?.value,
      taxId: this.checkoutForm.get('cpfCnpj')?.value,
    };

    this.pedidoService
      .criarPedido(this.items, usuarioId)
      .toPromise()
      .then((pedido: Pedido | undefined) => {
        if (!pedido || !pedido.id) {
          throw new Error('Falha ao criar pedido.');
        }
        this.pedidoId = pedido.id;

        return this.pagamentoService
          .processarPagamento(this.pedidoId, this.subtotal, 'PIX', customer)
          .toPromise();
      })
      .then((pagamento: Pagamento | undefined) => {
        if (!pagamento || !pagamento.chavePix || !pagamento.qrCodeBase64) {
          throw new Error('Chave Pix ou QR Code não retornados.');
        }
        this.chavePix = pagamento.chavePix;
        this.pixCode = pagamento.qrCodeBase64;
        this.cartService.clearCart();
        this.step = 3;
        this.snackBar.open('Pagamento gerado com sucesso!', 'Fechar', { duration: 3000 });
      })
      .catch((error: any) => {
        console.error('Erro:', error);
        this.snackBar.open(error.message || 'Falha ao finalizar pedido. Tente novamente.', 'Fechar', {
          duration: 5000,
        });
      });
  }

  voltar() {
    if (this.step > 1) this.step--;
  }

  finalizar() {
    this.router.navigate(['/']);
  }

  get formaPagamento() {
    return this.checkoutForm.get('formaPagamento')?.value;
  }

  getImageUrl(imageName: string | undefined): string {
    return imageName
      ? `${this.placaService.url}/download/imagem/${encodeURIComponent(imageName)}`
      : 'assets/images/default-card.png';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default-card.png';
  }
}