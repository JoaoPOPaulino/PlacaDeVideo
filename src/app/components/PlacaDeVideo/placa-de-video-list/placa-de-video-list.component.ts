import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-placa-de-video-list',
  standalone: true,
  imports: [NgFor],
  templateUrl: './placa-de-video-list.component.html',
  styleUrl: './placa-de-video-list.component.css',
})
export class PlacaDeVideoListComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
