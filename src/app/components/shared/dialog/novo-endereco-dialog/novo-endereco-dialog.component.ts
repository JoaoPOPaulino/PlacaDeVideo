import { Component, Inject } from '@angular/core';
import { 
  MAT_DIALOG_DATA, 
  MatDialogRef, 
  MatDialogTitle, 
  MatDialogContent, 
  MatDialogActions, 
  MatDialogClose 
} from '@angular/material/dialog';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Endereco } from '../../../../models/usuario/endereco.model';

@Component({
  selector: 'app-novo-endereco-dialog',
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
    MatInputModule
  ],
  templateUrl: './novo-endereco-dialog.component.html',
  styleUrls: ['./novo-endereco-dialog.component.css']
})
export class NovoEnderecoDialogComponent {
  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NovoEnderecoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formGroup = this.fb.group({
      cep: ['', [
        Validators.required, 
        Validators.pattern(/^\d{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      estado: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2)
      ]],
      cidade: ['', Validators.required],
      quadra: [''],
      rua: ['', Validators.required],
      numero: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/)
      ]]
    });
  }

  formatarCEP(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      value = value.substring(0, 8);
    }
    
    input.value = value;
    this.formGroup.get('cep')?.setValue(value);
  }

  formatarEstado(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (value.length > 0) {
      value = value.substring(0, 2);
    }
    
    input.value = value;
    this.formGroup.get('estado')?.setValue(value);
  }

  salvar(): void {
    if (this.formGroup.valid) {
      const endereco: Endereco = {
        id: 0,
        cep: this.formGroup.value.cep,
        estado: this.formGroup.value.estado,
        cidade: this.formGroup.value.cidade,
        quadra: this.formGroup.value.quadra,
        rua: this.formGroup.value.rua,
        numero: parseInt(this.formGroup.value.numero)
      };
      this.dialogRef.close(endereco);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  apenasNumeros(event: KeyboardEvent): boolean {
  const charCode = (event.which) ? event.which : event.keyCode;
  
  // Permitir apenas números (0-9)
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault();
    return false;
  }
  
  return true;
}
}