// oferta.component.ts
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-oferta',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './oferta.component.html',
  styleUrl: './oferta.component.css',
})
export class OfertaComponent {
  // Mensagens divertidas alternativas
  messages = [
    'Nossas ofertas estão em atualização!',
    'As GPUs estão tão quentes que derreteram nossas promoções!',
    'Ofertas? Estão renderizando...',
    'Promoções em construção (com Ray Tracing!)',
    'Volte logo! Estamos carregando as ofertas... 5%',
    'As melhores ofertas estão vindo... assim como os drivers da NVIDIA!',
  ];

  currentMessage = this.messages[0];
  showProgress = false;
  progress = 0;

  constructor() {
    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.messages.length);
      this.currentMessage = this.messages[randomIndex];
    }, 3000);

    // Simula uma barra de progresso "fake"
    this.showProgress = true;
    setInterval(() => {
      this.progress = (this.progress + 5) % 105;
    }, 300);
  }
}
