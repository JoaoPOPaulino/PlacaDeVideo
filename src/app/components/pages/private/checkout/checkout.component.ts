import { Component } from '@angular/core';
import { BbApiService } from '../../../../services/bb-api.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  step = 1;
  formaPagamentoSelecionada = '';
  pixCode = ''; // QR Code Pix
  boletoLink = ''; // PDF do boleto

  constructor(private bbApi: BbApiService) {}

  async finalizarPedido() {
    const valor = 100.0; // R$100,00

    try {
      if (this.formaPagamentoSelecionada === 'pix') {
        const response: any = await this.bbApi.criarCobrancaPix(
          valor,
          'sua_chave_pix@bb.com.br'
        );
        this.pixCode = response.qrcode;
      } else if (this.formaPagamentoSelecionada === 'boleto') {
        const response: any = await this.bbApi.criarBoleto(
          valor,
          '123.456.789-09'
        );
        this.boletoLink = response.pdf;
      }
      this.step = 4; // Mostrar resultado
    } catch (error) {
      console.error('Erro:', error);
      alert('Falha ao gerar pagamento!');
    }
  }
}
