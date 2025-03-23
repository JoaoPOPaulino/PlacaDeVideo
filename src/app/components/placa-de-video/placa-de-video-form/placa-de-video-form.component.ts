import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlacaDeVideoService } from '../../../services/placa-de-video.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PlacaDeVideo } from '../../../models/placa-de-video/placa-de-video.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placa-de-video-form',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './placa-de-video-form.component.html',
  styleUrl: './placa-de-video-form.component.css',
})
export class PlacaDeVideoFormComponent {
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private placaService: PlacaDeVideoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    const placa: PlacaDeVideo = this.activatedRoute.snapshot.data['placa'];

    this.formGroup = this.formBuilder.group({
      id: [placa && placa.id ? placa.id : null],
      nome: [placa && placa.nome ? placa.nome : '', Validators.required],
      fabricante: [
        placa && placa.fabricante ? placa.fabricante : '',
        Validators.required,
      ],
    });
  }

  salvar() {
    if (this.formGroup.valid) {
      const placa = this.formGroup.value;
      if (placa.id == null) {
        this.placaService.insert(placa).subscribe({
          next: (placaCadastrada) => {
            this.router.navigateByUrl('/placasdevideo');
          },
          error: (er) => {
            console.log('Erro ao incluir' + JSON.stringify(er));
          },
        });
      } else {
        this.placaService.update(placa).subscribe({
          next: (placaAlterada) => {
            this.router.navigateByUrl('/placasdevideo');
          },
          error: (er) => {
            console.log('Erro ao alterar' + JSON.stringify(er));
          },
        });
      }
    }
  }

  excluir() {
    if (this.formGroup.valid) {
      const placa = this.formGroup.value;
      if (placa.id != null) {
        this.placaService.delete(placa).subscribe({
          next: () => {
            this.router.navigateByUrl('/placasdevideo');
          },
          error: (er) => {
            console.log('Erro ao excluir' + JSON.stringify(er));
          },
        });
      }
    }
  }
}
