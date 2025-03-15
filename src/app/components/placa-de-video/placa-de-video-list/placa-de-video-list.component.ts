import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PlacaDeVideo } from '../../../models/placa-de-video/placa-de-video.model';
import { PlacaDeVideoService } from '../../../services/placa-de-video.service';

@Component({
  selector: 'app-placa-de-video-list',
  standalone: true,
  imports: [NgFor],
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
