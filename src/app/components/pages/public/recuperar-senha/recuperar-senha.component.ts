import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.component.html',
  styleUrls: ['./recuperar-senha.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule
  ]
})
export class RecuperarSenhaComponent {
  recuperarForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.recuperarForm = this.fb.group({
      loginOuEmail: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.recuperarForm.valid) {
      this.isLoading = true;
      const loginOuEmail = this.recuperarForm.get('loginOuEmail')!.value;

      this.authService.solicitarRecuperacaoSenha(loginOuEmail).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('E-mail de recuperação enviado com sucesso!', 'Fechar', {
            duration: 3000,
          });
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Erro ao enviar e-mail. Verifique o login ou e-mail.', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }
}