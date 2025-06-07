import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../../../models/pedido/pedido.model';

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.css'],
})
export class OrderDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public pedido: Pedido) {}

  formatDate(date: string): string {
    if (!date) return 'Data não disponível';
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Data inválida';
    }
  }

  getStatusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'concluído':
        return 'status-concluido';
      case 'pendente':
        return 'status-pendente';
      case 'cancelado':
        return 'status-cancelado';
      default:
        return 'status-pendente';
    }
  }
}
