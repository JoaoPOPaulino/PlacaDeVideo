import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PlacaDeVideoService } from '../../../services/placa-de-video.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-placa-de-video-form',
  standalone: true,
  imports: [],
  templateUrl: './placa-de-video-form.component.html',
  styleUrl: './placa-de-video-form.component.css',
})
export class PlacaDeVideoFormComponent {
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private placaService: PlacaDeVideoService,
    private router: Router
  ) {
    this.formGroup = this.formBuilder.group({});
  }
}
