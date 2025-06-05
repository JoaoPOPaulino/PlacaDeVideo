import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resetar-senha',
  templateUrl: './resetar-senha.component.html',
  styleUrls: ['./resetar-senha.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatIconModule,
  ],
})
export class ResetarSenhaComponent implements OnInit {
  resetarForm: FormGroup;
  isLoading = false;
  token: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.resetarForm = this.fb.group(
      {
        novaSenha: ['', [Validators.required, Validators.minLength(6)]],
        confirmarSenha: ['', [Validators.required]],
      },
      { validators: this.senhasIguaisValidator }
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.snackBar.open('Token inválido.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login']);
    }
  }

  senhasIguaisValidator(group: FormGroup): { [key: string]: any } | null {
    const novaSenha = group.get('novaSenha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return novaSenha === confirmarSenha ? null : { senhasDiferentes: true };
  }

  onSubmit() {
    if (this.resetarForm.valid && this.token) {
      this.isLoading = true;
      const novaSenha = this.resetarForm.get('novaSenha')!.value;

      this.authService.resetarSenha(this.token, novaSenha).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          // Trata tanto resposta JSON quanto texto
          const message = response?.message || response;
          this.snackBar.open(message, 'Fechar', {
            duration: 3000,
          });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Erro ao redefinir senha:', err);
          this.isLoading = false;
          // Mostra a mensagem de erro do servidor ou uma mensagem padrão
          const errorMessage =
            err.error?.text ||
            err.error?.message ||
            'Erro ao redefinir senha. Tente novamente.';
          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 5000,
          });
        },
      });
    }
  }
}
