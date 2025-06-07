import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
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
      telefone: ['', [Validators.required, this.telefoneValidator()]],
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
        telefone:
          usuario.telefones && usuario.telefones.length > 0
            ? this.formatarTelefoneValue(usuario.telefones[0].numero)
            : '',
      });
    }
  }

  private telefoneValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const onlyNumbers = value.replace(/\D/g, '');
      const isValid = /^\d{11}$/.test(onlyNumbers);

      return isValid ? null : { invalidTelefone: true };
    };
  }

  private formatarTelefoneValue(value: string): string {
    const onlyNumbers = value.replace(/\D/g, '');
    if (onlyNumbers.length === 11) {
      return `(${onlyNumbers.substring(0, 2)}) ${onlyNumbers.substring(
        2,
        7
      )}-${onlyNumbers.substring(7, 11)}`;
    }
    return value;
  }

  formatarTelefone(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 0) {
      value = `(${value.substring(0, 2)}) ${value.substring(
        2,
        7
      )}-${value.substring(7, 11)}`;
    }

    input.value = value;
    this.checkoutForm.get('telefone')?.setValue(value, { emitEvent: false });
  }

  nextStep() {
    if (this.step === 1 && this.checkoutForm.valid) {
      const usuario = this.authService.getUsuario();
      if (usuario?.cpf !== this.checkoutForm.get('cpfCnpj')?.value) {
        this.snackBar.open(
          'CPF informado não corresponde ao usuário autenticado.',
          'Fechar',
          {
            duration: 5000,
          }
        );
        return;
      }
      this.step = 2;
    } else {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, preencha todos os campos corretamente.',
        'Fechar',
        {
          duration: 3000,
        }
      );
    }
  }

  criarPedido() {
    if (this.checkoutForm.invalid || !this.items.length) {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open('Formulário inválido ou carrinho vazio.', 'Fechar', {
        duration: 5000,
      });
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.snackBar.open('Usuário não autenticado.', 'Fechar', {
        duration: 5000,
      });
      return;
    }

    const customer = {
      name: this.checkoutForm.get('nome')?.value,
      email: this.checkoutForm.get('email')?.value,
      cellphone: this.checkoutForm.get('telefone')?.value.replace(/\D/g, ''),
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
        this.step = 3; // Avança para a etapa de pagamento
        this.snackBar.open(
          'Pedido criado com sucesso! Prossiga com o pagamento.',
          'Fechar',
          {
            duration: 3000,
          }
        );
      })
      .catch((error: any) => {
        console.error('Erro:', error);
        this.snackBar.open(
          error.message || 'Falha ao criar pedido. Tente novamente.',
          'Fechar',
          {
            duration: 5000,
          }
        );
      });
  }

  processarPagamento() {
    if (!this.pedidoId) {
      this.snackBar.open('Nenhum pedido criado. Tente novamente.', 'Fechar', {
        duration: 5000,
      });
      return;
    }

    const customer = {
      name: this.checkoutForm.get('nome')?.value,
      email: this.checkoutForm.get('email')?.value,
      cellphone: this.checkoutForm.get('telefone')?.value.replace(/\D/g, ''),
      taxId: this.checkoutForm.get('cpfCnpj')?.value,
    };

    this.pagamentoService
      .processarPagamento(this.pedidoId, this.subtotal, 'PIX', customer)
      .toPromise()
      .then((pagamento: Pagamento | undefined) => {
        if (!pagamento || !pagamento.chavePix || !pagamento.qrCodeBase64) {
          throw new Error('Chave Pix ou QR Code não retornados.');
        }
        this.chavePix = pagamento.chavePix;
        this.pixCode = pagamento.qrCodeBase64;
        this.cartService.clearCart();
        this.snackBar.open('Pagamento gerado com sucesso!', 'Fechar', {
          duration: 3000,
        });
      })
      .catch((error: any) => {
        console.error('Erro:', error);
        this.snackBar.open(
          error.message || 'Falha ao processar pagamento. Tente novamente.',
          'Fechar',
          {
            duration: 5000,
          }
        );
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
      ? `${this.placaService.url}/download/imagem/${encodeURIComponent(
          imageName
        )}`
      : 'assets/images/default-card.png';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default-card.png';
  }

  copyToClipboard(text: string | null): void {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.snackBar.open('Chave PIX copiada!', 'Fechar', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
      })
      .catch((err) => {
        console.error('Falha ao copiar texto: ', err);
        this.snackBar.open('Falha ao copiar chave PIX', 'Fechar', {
          duration: 3000,
          panelClass: 'error-snackbar',
        });
      });
  }
}
