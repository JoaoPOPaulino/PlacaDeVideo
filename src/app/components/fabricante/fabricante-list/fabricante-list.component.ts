import { Component, OnInit } from '@angular/core';
import { Fabricante } from '../../../models/placa-de-video/fabricante.model';
import { FabricanteService } from '../../../services/fabricante.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-fabricante-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './fabricante-list.component.html',
  styleUrl: './fabricante-list.component.css',
})
export class FabricanteListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'acao'];
  fabricantes: Fabricante[] = [];
  totalRecords = 0;
  pageSize = 2;
  page = 0;

  constructor(private fabricanteService: FabricanteService) {}

  ngOnInit(): void {
    this.loadFabricantes();
    this.loadTotalRecords();
  }

  loadFabricantes(): void {
    this.fabricanteService
      .findAll(this.page, this.pageSize)
      .subscribe((data) => {
        this.fabricantes = data;
        console.log('Fabricantes carregados:', data);
      });
  }

  loadTotalRecords(): void {
    this.fabricanteService.count().subscribe((data) => {
      console.log('Fabricantes carregados:', data);
      this.totalRecords = data;
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFabricantes();
  }
}
