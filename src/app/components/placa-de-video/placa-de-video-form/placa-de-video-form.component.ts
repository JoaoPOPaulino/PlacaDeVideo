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
import { PlacaDeVideo } from '../../../models/placa-de-video/placa-de-video.model';
import { FabricanteService } from '../../../services/fabricante.service';
import { EspecificacaoTecnicaService } from '../../../services/especificacao-tecnica.service';
import { Fabricante } from '../../../models/placa-de-video/fabricante.model';
import { EspecificacaoTecnica } from '../../../models/placa-de-video/especificacao-tecnica.model';
import { forkJoin } from 'rxjs';
import { Categoria } from '../../../models/placa-de-video/categoria';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NovaEspecificacaoDialogComponent } from '../../dialog/nova-especificacao-dialog/nova-especificacao-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  ],
  templateUrl: './placa-de-video-form.component.html',
  styleUrl: './placa-de-video-form.component.css',
})
export class PlacaDeVideoFormComponent implements OnInit {
  formGroup: FormGroup;
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
    private formBuilder: FormBuilder,
    private placaService: PlacaDeVideoService,
    private fabricanteService: FabricanteService,
    private especificacaoService: EspecificacaoTecnicaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {
    const placa: PlacaDeVideo = this.activatedRoute.snapshot.data['placa'];

    this.formGroup = this.formBuilder.group({
      id: [placa && placa.id ? placa.id : null],
      nome: [
        placa && placa.nome ? placa.nome : '',
        [Validators.required, Validators.minLength(3)],
      ],
      preco: [
        placa && placa.preco ? placa.preco : 0,
        [Validators.required, Validators.min(0)],
      ],
      nomeImagem: [placa && placa.nomeImagem ? placa.nomeImagem : ''],
      especificacaoTecnica: [
        placa && placa.especificacaoTecnica ? placa.especificacaoTecnica : null,
        Validators.required,
      ],
      fabricante: [
        placa && placa.fabricante ? placa.fabricante : null,
        Validators.required,
      ],
      categoria: [
        placa && placa.categoria
          ? this.categorias.find((c) => c.id === placa.categoria)?.id
          : Categoria.ENTRADA,
        Validators.required,
      ],
      estoque: [
        placa && placa.estoque ? placa.estoque : 0,
        [Validators.required, Validators.min(0)],
      ],
    });
  }

  ngOnInit(): void {
    this.loadDependencies();

    const placa: PlacaDeVideo = this.activatedRoute.snapshot.data['placa'];

    if (placa) {
      this.carregarDadosPlaca(placa);
    }
  }

  carregarDadosPlaca(placa: PlacaDeVideo): void {
    this.formGroup.patchValue({
      id: placa.id,
      nome: placa.nome,
      preco: placa.preco,
      nomeImagem: placa.nomeImagem,
      estoque: placa.estoque,
      categoria: this.categorias.find((c) => c.id === placa.categoria)?.id,
      fabricante: this.fabricantes.find((f) => f.id === placa.fabricante.id),
      especificacaoTecnica: this.especificacoes.find(
        (e) => e.id === placa.especificacaoTecnica.id
      ),
    });
  }

  loadDependencies(): void {
    forkJoin({
      fabricantes: this.fabricanteService.findAll(),
      especificacoes: this.especificacaoService.findAll(),
    }).subscribe({
      next: ({ fabricantes, especificacoes }) => {
        this.fabricantes = fabricantes;
        this.especificacoes = especificacoes;

        const placa: PlacaDeVideo = this.activatedRoute.snapshot.data['placa'];
        if (placa) {
          this.carregarDadosPlaca(placa);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dependências:', error);
      },
    });
  }
  salvar(): void {
    console.log('Formulário válido?', this.formGroup.valid);
    console.log('Valores do formulário:', this.formGroup.value);

    if (this.formGroup.valid) {
      const formValue = this.formGroup.value;
      const placa: PlacaDeVideo = {
        id: formValue.id,
        nome: formValue.nome,
        preco: formValue.preco,
        nomeImagem: formValue.nomeImagem,
        estoque: formValue.estoque,
        categoria: formValue.categoria,
        fabricante: formValue.fabricante,
        especificacaoTecnica: formValue.especificacaoTecnica,
      };

      console.log('Objeto placa antes de enviar:', placa);

      if (placa.id == null) {
        this.placaService.insert(placa).subscribe({
          next: (placaCadastrada) => {
            this.router.navigateByUrl('/admin/placasdevideo');
          },
          error: (error) => {
            console.error('Erro completo:', error);
            console.error('Mensagem de erro:', error.message);
            console.error('Status:', error.status);
            console.error('Detalhes:', error.error);
            alert(
              'Erro ao salvar placa de vídeo. Verifique os dados e tente novamente.'
            );
          },
        });
      } else {
        this.placaService.update(placa).subscribe({
          next: (placaAlterada) => {
            this.router.navigateByUrl('/admin/placasdevideo');
          },
          error: (er) => {
            console.log('Erro ao alterar' + JSON.stringify(er));
          },
        });
      }
    } else {
      console.log('Erros no formulário:', this.formGroup.errors);
      console.log('Erros no campo nome:', this.formGroup.get('nome')?.errors);
      console.log('Erros no campo preco:', this.formGroup.get('preco')?.errors);
      console.log(
        'Erros no campo fabricante:',
        this.formGroup.get('fabricante')?.errors
      );
      console.log(
        'Erros no campo especificacaoTecnica:',
        this.formGroup.get('especificacaoTecnica')?.errors
      );
    }
  }

  excluir(): void {
    const id = this.formGroup.get('id')?.value;
    if (confirm('Tem certeza que deseja excluir esta placa de vídeo?')) {
      if (id) {
        this.placaService.delete(id).subscribe({
          next: () => {
            this.router.navigateByUrl('/admin/placasdevideo');
          },
          error: (error) => {
            console.error('Erro ao excluir:', error);
          },
        });
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
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
    this.placaService
      .uploadImage(this.formGroup.get('id')?.value, this.selectedFile)
      .subscribe({
        next: (placaAtualizada) => {
          this.formGroup.patchValue({
            nomeImagem: placaAtualizada.nomeImagem,
          });
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
      window.open(
        `${this.placaService.url}/download/imagem/${nomeImagem}`,
        '_blank'
      );
    }
  }
  abrirDialogNovaEspecificacao(): void {
    const dialogRef = this.dialog.open(NovaEspecificacaoDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((novaEspecificacao) => {
      if (novaEspecificacao) {
        this.especificacoes.push(novaEspecificacao);
        this.formGroup.patchValue({ especificacaoTecnica: novaEspecificacao });
      }
    });
  }
}
