import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { PlacaDeVideo } from '../../../../models/placa-de-video/placa-de-video.model';
import { FabricanteService } from '../../../../services/fabricante.service';
import { EspecificacaoTecnicaService } from '../../../../services/especificacao-tecnica.service';
import { Fabricante } from '../../../../models/placa-de-video/fabricante.model';
import { EspecificacaoTecnica } from '../../../../models/placa-de-video/especificacao-tecnica.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Importar MatDialog
import { NovaEspecificacaoDialogComponent } from '../../../shared/dialog/nova-especificacao-dialog/nova-especificacao-dialog.component';

@Component({
  selector: 'app-placa-de-video-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    MatDialogModule,
    NovaEspecificacaoDialogComponent,
  ],
  templateUrl: './placa-de-video-form.component.html',
  styleUrls: ['./placa-de-video-form.component.css'],
})
export class PlacaDeVideoFormComponent implements OnInit {
  placaForm: FormGroup;
  fabricantes: Fabricante[] = [];
  especificacoes: EspecificacaoTecnica[] = [];
  categorias = [
    { label: 'Entrada', id: 1 },
    { label: 'Intermediária', id: 2 },
    { label: 'Alto Desempenho', id: 3 },
  ];
  selectedFile: File | null = null;
  uploading = false;
  placaId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private placaService: PlacaDeVideoService,
    private fabricanteService: FabricanteService,
    private especificacaoService: EspecificacaoTecnicaService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // Injetar MatDialog
  ) {
    this.placaForm = this.fb.group({
      nome: ['', Validators.required],
      preco: ['', [Validators.required, Validators.min(0)]],
      idFabricante: ['', Validators.required],
      categoria: ['', Validators.required],
      estoque: ['', [Validators.required, Validators.min(0)]],
      idEspecificacaoTecnica: ['', Validators.required],
      nomeImagem: [''],
      descricao: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    // Carregar fabricantes
    this.fabricanteService.findAll().subscribe({
      next: (fabricantes) => {
        this.fabricantes = fabricantes;
      },
      error: (error) => {
        console.error('Erro ao carregar fabricantes:', error);
        this.snackBar.open('Erro ao carregar fabricantes.', 'Fechar', {
          duration: 3000,
        });
      },
    });

    // Carregar especificações técnicas
    this.especificacaoService.findAll().subscribe({
      next: (especificacoes) => {
        console.log('Especificações retornadas:', especificacoes);
        this.especificacoes = especificacoes;
        if (especificacoes.length === 0) {
          this.snackBar.open(
            'Nenhuma especificação técnica encontrada.',
            'Fechar',
            { duration: 3000 }
          );
        }
      },
      error: (error) => {
        console.error('Erro ao carregar especificações:', error);
        this.snackBar.open('Erro ao carregar especificações.', 'Fechar', {
          duration: 3000,
        });
      },
    });

    // Carregar placa existente, se houver
    this.placaId = this.route.snapshot.paramMap.get('id');
    if (this.placaId) {
      this.placaService.findById(this.placaId).subscribe({
        next: (placa) => {
          console.log(
            'Dados completos da placa:',
            JSON.stringify(placa, null, 2)
          );
          const categoriaId = this.mapCategoriaToId(placa.categoria);
          this.placaForm.patchValue({
            nome: placa.nome,
            preco: placa.preco,
            idFabricante: placa.fabricante?.id,
            categoria: categoriaId,
            estoque: placa.estoque,
            idEspecificacaoTecnica: placa.especificacaoTecnica?.id,
            nomeImagem: placa.nomeImagem,
            descricao: placa.descricao,
          });
        },
        error: (error) => {
          console.error('Erro ao carregar placa:', error);
          this.snackBar.open('Erro ao carregar placa.', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Nenhuma imagem selecionada.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    if (!this.placaId) {
      this.snackBar.open(
        'Salve a placa antes de fazer upload da imagem.',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    this.uploading = true;
    console.log('Iniciando upload para placaId:', this.placaId);
    console.log('Arquivo selecionado:', {
      name: this.selectedFile.name,
      type: this.selectedFile.type,
      size: this.selectedFile.size,
    });

    this.placaService
      .uploadImage(Number(this.placaId), this.selectedFile)
      .subscribe({
        next: (placa) => {
          this.uploading = false;
          this.placaForm.patchValue({ nomeImagem: placa.nomeImagem });
          this.selectedFile = null;
          console.log('Upload concluído. Nome da imagem:', placa.nomeImagem);
          this.snackBar.open('Imagem enviada com sucesso!', 'Fechar', {
            duration: 3000,
          });
          // Opcional: redirecionar após o upload
          this.router.navigate(['/admin/placasdevideo']);
        },
        error: (error) => {
          this.uploading = false;
          console.error(
            'Erro ao enviar imagem:',
            error.status,
            error.statusText,
            error.error
          );
          this.snackBar.open(
            `Erro ao enviar imagem: ${
              error.error?.message || 'Tente novamente.'
            }`,
            'Fechar',
            { duration: 5000 }
          );
        },
      });
  }

  previewImage(): void {
    const imageName = this.placaForm.get('nomeImagem')?.value;
    if (imageName) {
      window.open(this.placaService.getImageUrl(imageName), '_blank');
    } else {
      this.snackBar.open('Nenhuma imagem para visualizar.', 'Fechar', {
        duration: 3000,
      });
    }
  }

  removeImage(): void {
    this.placaForm.patchValue({ nomeImagem: null });
    this.selectedFile = null;
  }

  salvar(): void {
    if (!this.placaForm.valid) {
      this.snackBar.open('Preencha corretamente o formulário.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const idFabricante = Number(this.placaForm.get('idFabricante')!.value);
    const idEspecificacao = Number(
      this.placaForm.get('idEspecificacaoTecnica')!.value
    );

    const fabricante = this.fabricantes.find((f) => f.id === idFabricante);
    if (!fabricante) {
      this.snackBar.open('Fabricante inválido.', 'Fechar', { duration: 3000 });
      return;
    }

    const especificacao = this.especificacoes.find(
      (e) => e.id === idEspecificacao
    );
    if (!especificacao) {
      this.snackBar.open('Especificação técnica inválida.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const placa: PlacaDeVideo = {
      id: this.placaId ? Number(this.placaId) : 0,
      nome: this.placaForm.get('nome')!.value,
      preco: Number(this.placaForm.get('preco')!.value),
      fabricante: fabricante,
      categoria: this.placaForm.get('categoria')!.value,
      estoque: Number(this.placaForm.get('estoque')!.value),
      especificacaoTecnica: especificacao,
      nomeImagem: this.placaForm.get('nomeImagem')!.value || null,
      descricao: this.placaForm.get('descricao')!.value,
    };

    const action = placa.id
      ? this.placaService.update(placa)
      : this.placaService.insert(placa);

    action.subscribe({
      next: (placaRetornada: PlacaDeVideo) => {
        this.placaId = placaRetornada.id.toString(); // Atualiza placaId após salvar
        console.log('Placa salva com sucesso. placaId:', this.placaId);
        this.snackBar.open(
          `Placa ${placa.id ? 'atualizada' : 'criada'} com sucesso!`,
          'Fechar',
          { duration: 3000 }
        );
        // Não redireciona para permitir o upload da imagem
      },
      error: (error) => {
        console.error(
          'Erro ao salvar placa:',
          error.status,
          error.statusText,
          error.error
        );
        const mensagem = error.error?.message || 'Erro ao salvar placa.';
        this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
      },
    });
  }

  excluir(): void {
    if (
      this.placaId &&
      confirm('Tem certeza que deseja excluir esta placa de vídeo?')
    ) {
      this.placaService.delete(Number(this.placaId)).subscribe({
        next: () => {
          this.snackBar.open('Placa excluída com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.router.navigate(['/admin/placasdevideo']);
        },
        error: (error) => {
          console.error('Erro ao excluir:', error);
          this.snackBar.open('Erro ao excluir placa.', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }

  // Método para abrir o diálogo de nova especificação
  openNovaEspecificacaoDialog(): void {
    const dialogRef = this.dialog.open(NovaEspecificacaoDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: EspecificacaoTecnica | null) => {
      if (result) {
        this.especificacoes = [...this.especificacoes, result];
        this.placaForm.patchValue({ idEspecificacaoTecnica: result.id });
        this.snackBar.open(
          'Especificação técnica criada com sucesso!',
          'Fechar',
          { duration: 3000 }
        );
      }
    });
  }

  private mapCategoriaToId(categoria: string): number {
    if (!categoria) return 1; // Valor padrão caso categoria seja null/undefined

    // Converter para minúsculas e remover caracteres especiais para comparação
    const normalized = categoria
      .toLowerCase()
      .replace(/_/g, ' ') // Remove underscores
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos

    if (normalized.includes('entrada')) return 1;
    if (
      normalized.includes('intermediária') ||
      normalized.includes('intermediaria')
    )
      return 2;
    if (
      normalized.includes('alto desempenho') ||
      normalized.includes('altodesempenho')
    )
      return 3;

    console.warn('Categoria não reconhecida:', categoria);
    return 1; // Valor padrão para categoria desconhecida
  }
}
