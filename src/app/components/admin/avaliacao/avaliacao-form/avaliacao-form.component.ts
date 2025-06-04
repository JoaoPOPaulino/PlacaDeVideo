import { Component } from '@angular/core';
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
import { AvaliacaoService } from '../../../../services/avaliacao.service';
import { Avaliacao } from '../../../../models/avaliacao/avaliacao.model';
import { UsuarioService } from '../../../../services/usuario.service';
import { PlacaDeVideoService } from '../../../../services/placa-de-video.service';
import { Usuario } from '../../../../models/usuario/usuario.model';
import { PlacaDeVideo } from '../../../../models/placa-de-video/placa-de-video.model';

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
  ],
  templateUrl: './avaliacao-form.component.html',
  styleUrl: './avaliacao-form.component.css',
})
export class AvaliacaoFormComponent {
  formGroup: FormGroup;
  usuarios: Usuario[] = [];
  placas: PlacaDeVideo[] = [];
  notas = [
    { id: 1, label: '1 - Péssimo' },
    { id: 2, label: '2 - Ruim' },
    { id: 3, label: '3 - Regular' },
    { id: 4, label: '4 - Bom' },
    { id: 5, label: '5 - Excelente' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private avaliacaoService: AvaliacaoService,
    private usuarioService: UsuarioService,
    private placaService: PlacaDeVideoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    const avaliacao: Avaliacao = this.activatedRoute.snapshot.data['avaliacao'];

    this.formGroup = this.formBuilder.group({
      id: [avaliacao?.id || null],
      usuario: [avaliacao?.usuario?.id || '', Validators.required],
      placadevideo: [avaliacao?.placadevideo?.id || '', Validators.required],
      nota: [avaliacao?.nota?.id || null],
      comentario: [avaliacao?.comentario || '', Validators.required],
      dataCriacao: [avaliacao?.dataCriacao || new Date().toISOString()],
    });

    this.carregarDependencias();
  }

  carregarDependencias(): void {
    this.usuarioService
      .findAll()
      .subscribe((usuarios) => (this.usuarios = usuarios));
    this.placaService.findAll().subscribe((placas) => (this.placas = placas));
    // Notas são fixas, não precisam ser carregadas de um serviço
  }

  salvar(): void {
    if (this.formGroup.valid) {
      const avaliacao = this.formGroup.value;
      const operation = avaliacao.id
        ? this.avaliacaoService.update(avaliacao)
        : this.avaliacaoService.insert(avaliacao);

      operation.subscribe({
        next: () => this.router.navigateByUrl('/admin/avaliacoes'),
        error: (err) => console.error('Erro ao salvar avaliação:', err),
      });
    }
  }

  excluir(): void {
    const id = this.formGroup.get('id')?.value;
    if (id && confirm('Tem certeza que deseja excluir esta avaliação?')) {
      this.avaliacaoService.delete(id).subscribe({
        next: () => this.router.navigateByUrl('/admin/avaliacoes'),
        error: (err) => console.error('Erro ao excluir avaliação:', err),
      });
    }
  }
}
