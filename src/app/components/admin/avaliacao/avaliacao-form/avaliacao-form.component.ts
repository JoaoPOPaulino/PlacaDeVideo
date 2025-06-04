import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Avaliacao } from '../../../../models/avaliacao/avaliacao.model';
import { Usuario } from '../../../../models/usuario/usuario.model';
import { PlacaDeVideo } from '../../../../models/placa-de-video/placa-de-video.model';
import { AvaliacaoService } from '../../../../services/avaliacao.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-avaliacao-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: './avaliacao-form.component.html',
  styleUrl: './avaliacao-form.component.css',
})
export class AvaliacaoFormComponent implements OnInit {
  formGroup!: FormGroup;
  usuarios: Usuario[] = [];
  placas: PlacaDeVideo[] = [];
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private avaliacaoService: AvaliacaoService,
    private usuarioService: UsuarioService,
    private placaService: PlacaDeVideoService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDependencies();
  }

  private initForm(): void {
    const avaliacao =
      (this.route.snapshot.data['avaliacao'] as Avaliacao) || {};

    this.formGroup = this.fb.group({
      id: [avaliacao?.id ?? null],
      comentario: [
        avaliacao?.comentario ?? '',
        [Validators.required, Validators.maxLength(500)],
      ],
      nota: [avaliacao?.nota ?? null],
      usuario: [avaliacao?.usuario?.id ?? null, Validators.required],
      placaDeVideo: [avaliacao?.placaDeVideo?.id ?? null, Validators.required],
    });
  }

  private loadDependencies(): void {
    forkJoin({
      usuarios: this.usuarioService.findAll(),
      placas: this.placaService.findAll(),
    }).subscribe({
      next: ({ usuarios, placas }) => {
        this.usuarios = usuarios;
        this.placas = placas;
      },
      error: (error) => {
        console.error('Erro ao carregar dependências:', error);
        this.snackBar.open('Erro ao carregar dependências.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  salvar(): void {
  if (this.formGroup.invalid) {
    this.snackBar.open(
      'Formulário inválido. Verifique os campos obrigatórios.',
      'Fechar',
      { duration: 3000 }
    );
    return;
  }

  const formValue = this.formGroup.value;
  console.log('IDs:', formValue.usuario, formValue.placaDeVideo);

  // Encontra o usuário e placa selecionados nas listas carregadas
  const usuarioSelecionado = this.usuarios.find(u => u.id === formValue.usuario);
  const placaSelecionada = this.placas.find(p => p.id === formValue.placaDeVideo);

  if (!usuarioSelecionado || !placaSelecionada) {
    this.snackBar.open('Usuário ou Placa de Vídeo inválidos', 'Fechar', { duration: 3000 });
    return;
  }

  const avaliacao: Avaliacao = {
    id: formValue.id || 0,
    comentario: formValue.comentario,
    nota: formValue.nota ? +formValue.nota : undefined,
    usuario: usuarioSelecionado,
    placaDeVideo: placaSelecionada,
    dataCriacao: new Date().toISOString(),
  };

  const request = avaliacao.id
    ? this.avaliacaoService.update(avaliacao)
    : this.avaliacaoService.insert(avaliacao);

  request.subscribe({
    next: () => {
      this.snackBar.open('Avaliação salva com sucesso!', 'Fechar', {
        duration: 3000,
      });
      this.router.navigateByUrl('/admin/avaliacoes');
    },
    error: (error) => {
      console.error('Erro ao salvar avaliação:', error);
      this.snackBar.open(
        'Erro ao salvar avaliação. Tente novamente.',
        'Fechar',
        { duration: 3000 }
      );
    },
  });
}
  excluir(): void {
    const id = this.formGroup.get('id')?.value;
    if (id && confirm('Tem certeza que deseja excluir esta avaliação?')) {
      this.avaliacaoService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Avaliação excluída com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.router.navigateByUrl('/admin/avaliacoes');
        },
        error: (error) => {
          console.error('Erro ao excluir avaliação:', error);
          this.snackBar.open('Erro ao excluir avaliação.', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }
}