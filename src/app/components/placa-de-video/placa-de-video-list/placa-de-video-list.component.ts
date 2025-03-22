import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PlacaDeVideo } from '../../../models/placa-de-video/placa-de-video.model';
import { PlacaDeVideoService } from '../../../services/placa-de-video.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-placa-de-video-list',
  standalone: true,
  imports: [NgFor, MatToolbarModule, MatIconModule, RouterLink],
  templateUrl: './placa-de-video-list.component.html',
  styleUrl: './placa-de-video-list.component.css',
})
export class PlacaDeVideoListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'fabricante', 'acao'];
  placas: PlacaDeVideo[] = [];

  constructor(private placaService: PlacaDeVideoService) {}

  ngOnInit(): void {
    this.placaService.findAll().subscribe((data) => {
      this.placas = data;
    });
  }
}
