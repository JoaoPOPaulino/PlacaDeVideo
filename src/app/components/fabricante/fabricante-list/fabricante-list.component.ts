import { Component, OnInit } from '@angular/core';
import { Fabricante } from '../../../models/placa-de-video/fabricante.model';
import { FabricanteService } from '../../../services/fabricante.service';
import { CommonModule, NgFor } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-fabricante-list',
  standalone: true,
  imports: [
    NgFor,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    CommonModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './fabricante-list.component.html',
  styleUrl: './fabricante-list.component.css',
})
export class FabricanteListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'acao'];
  fabricante: Fabricante[] = [];
  totalRecords = 0;
  pageSize = 2;
  page = 0;

  constructor(private fabricanteService: FabricanteService) {}

  ngOnInit(): void {
    this.fabricanteService
      .findAll(this.page, this.pageSize)
      .subscribe((data) => {
        this.fabricante = data;
      });
    this.fabricanteService.count().subscribe((data) => {
      this.totalRecords = data;
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    // chamando para executar novamente a consulta
    // caso tenha outras execucoes no ngOnInit .. eh interessante criar um metodo de consulta
    this.ngOnInit();
  }
}
