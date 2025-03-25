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
    console.log('Componente inicializado! Carregando fabricantes...');
    this.fabricanteService.findAll(this.page, this.pageSize).subscribe(
      (data) => {
        console.log('Fabricantes recebidos:', data);
        this.fabricantes = data;
      },
      (error) => {
        console.error('Erro ao buscar fabricantes:', error);
      }
    );

    this.fabricanteService.count().subscribe(
      (data) => {
        console.log('Total de fabricantes:', data);
        this.totalRecords = data;
      },
      (error) => {
        console.error('Erro ao buscar total de fabricantes:', error);
      }
    );
  }

  paginar(event: PageEvent): void {
    console.log(
      'Mudando página:',
      event.pageIndex,
      'Tamanho da página:',
      event.pageSize
    );
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFabricantes(); // Chama apenas a função necessária
  }

  loadFabricantes(): void {
    console.log(
      'Carregando fabricantes na página',
      this.page,
      'com tamanho',
      this.pageSize
    );
    this.fabricanteService.findAll(this.page, this.pageSize).subscribe(
      (data) => {
        console.log('Fabricantes atualizados:', data);
        this.fabricantes = data;
      },
      (error) => {
        console.error('Erro ao carregar fabricantes:', error);
      }
    );
  }
}
