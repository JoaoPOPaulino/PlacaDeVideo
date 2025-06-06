import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Telefone } from '../../../../models/usuario/telefone.model';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-novo-telefone-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon
  ],
  templateUrl: './novo-telefone-dialog.component.html',
  styleUrls: ['./novo-telefone-dialog.component.css'],
})
export class NovoTelefoneDialogComponent {
  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NovoTelefoneDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formGroup = this.fb.group({
      codigoArea: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{2}$/),
          Validators.minLength(2),
          Validators.maxLength(2),
        ],
      ],
      numero: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{8,9}$/),
          Validators.minLength(8),
          Validators.maxLength(9),
        ],
      ],
    });
  }

  formatarTelefone(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 0) {
      value = value.substring(0, 9);
    }

    input.value = value;
    this.formGroup.get('numero')?.setValue(value);
  }

  formatarDDD(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 0) {
      value = value.substring(0, 2);
    }

    input.value = value;
    this.formGroup.get('codigoArea')?.setValue(value);
  }

  salvar(): void {
    if (this.formGroup.valid) {
      const telefone: Telefone = {
        id: 0,
        codigoArea: this.formGroup.value.codigoArea,
        numero: this.formGroup.value.numero,
      };
      this.dialogRef.close(telefone);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
