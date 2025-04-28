import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlacaDeVideoService } from '../../../services/placa-de-video.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDivider } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PlacaDeVideo } from '../../../models/placa-de-video/placa-de-video.model';
import { Fabricante } from '../../../models/placa-de-video/fabricante.model';
import { EspecificacaoTecnica } from '../../../models/placa-de-video/especificacao-tecnica.model';
import { Categoria } from '../../../models/placa-de-video/categoria';
import { FabricanteService } from '../../../services/fabricante.service';
import { EspecificacaoTecnicaService } from '../../../services/especificacao-tecnica.service';
import { NovaEspecificacaoDialogComponent } from '../../dialog/nova-especificacao-dialog/nova-especificacao-dialog.component';

@Component({
  selector: 'app-placa-de-video-form',
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
    MatDivider,
  ],
  templateUrl: './placa-de-video-form.component.html',
  styleUrl: './placa-de-video-form.component.css',
})
export class PlacaDeVideoFormComponent implements OnInit {
  formGroup!: FormGroup;
  fabricantes: Fabricante[] = [];
  especificacoes: EspecificacaoTecnica[] = [];
  categorias = [
    { id: Categoria.ENTRADA, label: 'Entrada' },
    { id: Categoria.INTERMEDIARIA, label: 'Intermediária' },
    { id: Categoria.ALTO_DESEMPENHO, label: 'Alto Desempenho' },
  ];
  selectedFile: File | null = null;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private placaService: PlacaDeVideoService,
    private fabricanteService: FabricanteService,
    private especificacaoService: EspecificacaoTecnicaService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDependencies();
  }

  private initForm(): void {
    const placa = this.route.snapshot.data['placa'] as PlacaDeVideo;

    this.formGroup = this.fb.group({
      id: [placa?.id ?? null],
      nome: [placa?.nome ?? '', [Validators.required, Validators.minLength(3)]],
      preco: [placa?.preco ?? 0, [Validators.required, Validators.min(0)]],
      nomeImagem: [placa?.nomeImagem ?? ''],
      especificacaoTecnica: [placa?.especificacaoTecnica ?? null, Validators.required],
      fabricante: [placa?.fabricante ?? null, Validators.required],
      categoria: [placa?.categoria ?? Categoria.ENTRADA, Validators.required],
      estoque: [placa?.estoque ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  private loadDependencies(): void {
    forkJoin({
      fabricantes: this.fabricanteService.findAll(),
      especificacoes: this.especificacaoService.findAll(),
    }).subscribe({
      next: ({ fabricantes, especificacoes }) => {
        this.fabricantes = fabricantes;
        this.especificacoes = especificacoes;
      },
      error: (error) => {
        console.error('Erro ao carregar dependências:', error);
      },
    });
  }

  salvar(): void {
    if (this.formGroup.invalid) {
      this.snackBar.open('Formulário inválido. Verifique os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return;
    }

    const placa: PlacaDeVideo = this.formGroup.value;

    const request = placa.id ? this.placaService.update(placa) : this.placaService.insert(placa);

    request.subscribe({
      next: () => {
        this.snackBar.open('Placa salva com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigateByUrl('/admin/placasdevideo');
      },
      error: (error) => {
        console.error('Erro ao salvar placa:', error);
        this.snackBar.open('Erro ao salvar placa. Tente novamente.', 'Fechar', { duration: 3000 });
      },
    });
  }

  excluir(): void {
    const id = this.formGroup.get('id')?.value;
    if (id && confirm('Tem certeza que deseja excluir esta placa de vídeo?')) {
      this.placaService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Placa excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigateByUrl('/admin/placasdevideo');
        },
        error: (error) => {
          console.error('Erro ao excluir placa:', error);
          this.snackBar.open('Erro ao excluir placa.', 'Fechar', { duration: 3000 });
        },
      });
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      this.formGroup.patchValue({ nomeImagem: file.name });
    }
  }

  removeImage(): void {
    if (confirm('Remover a imagem atual?')) {
      this.formGroup.patchValue({ nomeImagem: '' });
      this.selectedFile = null;
    }
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.formGroup.get('id')?.value) return;

    this.uploading = true;
    this.placaService.uploadImage(this.formGroup.get('id')!.value, this.selectedFile).subscribe({
      next: (placaAtualizada) => {
        this.formGroup.patchValue({ nomeImagem: placaAtualizada.nomeImagem });
        this.selectedFile = null;
        this.uploading = false;
      },
      error: (err) => {
        console.error('Erro no upload:', err);
        this.uploading = false;
      },
    });
  }

  previewImage(): void {
    const nomeImagem = this.formGroup.get('nomeImagem')?.value;
    if (nomeImagem) {
      window.open(`${this.placaService.url}/download/imagem/${nomeImagem}`, '_blank');
    }
  }

  abrirDialogNovaEspecificacao(): void {
    const dialogRef = this.dialog.open(NovaEspecificacaoDialogComponent, { width: '400px' });

    dialogRef.afterClosed().subscribe((novaEspecificacao: EspecificacaoTecnica) => {
      if (novaEspecificacao) {
        this.especificacoes.push(novaEspecificacao);
        this.formGroup.patchValue({ especificacaoTecnica: novaEspecificacao });
      }
    });
  }
}
