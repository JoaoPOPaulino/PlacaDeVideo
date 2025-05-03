import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { EspecificacaoTecnica } from '../../../../models/placa-de-video/especificacao-tecnica.model';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EspecificacaoTecnicaService } from '../../../../services/especificacao-tecnica.service';

@Component({
  selector: 'app-nova-especificacao-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './nova-especificacao-dialog.component.html',
  styleUrl: './nova-especificacao-dialog.component.css',
})
export class NovaEspecificacaoDialogComponent {
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private especificacaoService: EspecificacaoTecnicaService,
    private dialogRef: MatDialogRef<NovaEspecificacaoDialogComponent>
  ) {
    this.formGroup = this.formBuilder.group({
      memoria: ['', Validators.required],
      clock: ['', Validators.required],
      barramento: ['', Validators.required],
      consumoEnergia: ['', Validators.required],
    });
  }

  salvar() {
    if (this.formGroup.valid) {
      const novaEspecificacao: EspecificacaoTecnica = this.formGroup.value;
      this.especificacaoService.insert(novaEspecificacao).subscribe({
        next: (nova) => this.dialogRef.close(nova),
        error: (err) => console.error('Erro ao criar especificação:', err),
      });
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
