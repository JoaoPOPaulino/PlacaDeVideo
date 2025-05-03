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
import { EspecificacaoTecnicaService } from '../../../../services/especificacao-tecnica.service';
import { EspecificacaoTecnica } from '../../../../models/placa-de-video/especificacao-tecnica.model';

@Component({
  selector: 'app-especificacao-tecnica-form',
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
  ],
  templateUrl: './especificacao-tecnica-form.component.html',
  styleUrl: './especificacao-tecnica-form.component.css',
})
export class EspecificacaoTecnicaFormComponent {
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private especificacaoService: EspecificacaoTecnicaService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    const especificacao: EspecificacaoTecnica =
      this.activatedRoute.snapshot.data['especificacaoTecnica'];

    this.formGroup = this.formBuilder.group({
      id: [especificacao && especificacao.id ? especificacao.id : null],
      memoria: [
        especificacao && especificacao.memoria ? especificacao.memoria : '',
        Validators.required,
      ],
      clock: [
        especificacao && especificacao.clock ? especificacao.clock : '',
        Validators.required,
      ],
      barramento: [
        especificacao && especificacao.barramento
          ? especificacao.barramento
          : '',
        Validators.required,
      ],
      consumoEnergia: [
        especificacao && especificacao.consumoEnergia
          ? especificacao.consumoEnergia
          : '',
        Validators.required,
      ],
    });
  }

  salvar() {
    if (this.formGroup.valid) {
      const especificacao = this.formGroup.value;
      if (especificacao.id == null) {
        this.especificacaoService.insert(especificacao).subscribe({
          next: () => {
            this.router.navigateByUrl('/admin/especificacoes-tecnicas');
          },
          error: (err) => {
            console.error('Erro ao incluir:', err);
          },
        });
      } else {
        this.especificacaoService.update(especificacao).subscribe({
          next: () => {
            this.router.navigateByUrl('/admin/especificacoes-tecnicas');
          },
          error: (err) => {
            console.error('Erro ao alterar:', err);
          },
        });
      }
    }
  }

  excluir() {
    const id = this.formGroup.get('id')?.value;
    if (confirm('Tem certeza que deseja excluir esta especificação técnica?')) {
      if (id) {
        this.especificacaoService.delete(id).subscribe({
          next: () => {
            this.router.navigateByUrl('/admin/especificacoes-tecnicas');
          },
          error: (err) => {
            console.error('Erro ao excluir:', err);
          },
        });
      }
    }
  }
}
