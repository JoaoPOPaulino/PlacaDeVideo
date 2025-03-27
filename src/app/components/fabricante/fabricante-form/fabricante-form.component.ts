import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FabricanteService } from '../../../services/fabricante.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Fabricante } from '../../../models/placa-de-video/fabricante.model';
@Component({
  selector: 'app-fabricante-form',
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
  templateUrl: './fabricante-form.component.html',
  styleUrl: './fabricante-form.component.css',
})
export class FabricanteFormComponent {
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private fabricanteService: FabricanteService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    const fabricante: Fabricante =
      this.activatedRoute.snapshot.data['fabricante'];

    this.formGroup = this.formBuilder.group({
      id: [fabricante && fabricante.id ? fabricante.id : null],
      nome: [
        fabricante && fabricante.nome ? fabricante.nome : '',
        Validators.required,
      ],
    });
  }

  salvar() {
    if (this.formGroup.valid) {
      const fabricante = this.formGroup.value;
      if (fabricante.id == null) {
        this.fabricanteService.insert(fabricante).subscribe({
          next: (fabricanteCadastrado) => {
            this.router.navigateByUrl('/fabricantes');
          },
          error: (er) => {
            console.log('Erro ao incluir' + JSON.stringify(er));
          },
        });
      } else {
        this.fabricanteService.update(fabricante).subscribe({
          next: (fabricanteAlterado) => {
            this.router.navigateByUrl('/fabricantes');
          },
          error: (er) => {
            console.log('Erro ao alterar' + JSON.stringify(er));
          },
        });
      }
    }
  }

  excluir() {
    const id = this.formGroup.get('id')?.value;
    if (confirm('Tem certeza que deseja excluir este fabricante?')) {
      if (id) {
        this.fabricanteService.delete(id).subscribe({
          next: () => {
            this.router.navigateByUrl('/fabricantes');
          },
          error: (err) => {
            console.error('Erro ao excluir:', err);
          },
        });
      }
    }
  }
}
