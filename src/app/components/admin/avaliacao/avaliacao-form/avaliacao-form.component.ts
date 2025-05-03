import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AvaliacaoService } from '../../../../services/avaliacao.service';

@Component({
  selector: 'app-avaliacao-form',
  standalone: true,
  imports: [],
  templateUrl: './avaliacao-form.component.html',
  styleUrl: './avaliacao-form.component.css',
})
export class AvaliacaoFormComponent {
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private avaliacaoService: AvaliacaoService,
    private router: Router
  ) {
    this.formGroup = this.formBuilder.group({});
  }
}
