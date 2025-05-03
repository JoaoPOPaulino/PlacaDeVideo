import { Component, OnInit } from '@angular/core';
import { Avaliacao } from '../../../../models/avaliacao/avaliacao.model';
import { AvaliacaoService } from '../../../../services/avaliacao.service';

@Component({
  selector: 'app-avaliacao-list',
  standalone: true,
  imports: [],
  templateUrl: './avaliacao-list.component.html',
  styleUrl: './avaliacao-list.component.css',
})
export class AvaliacaoListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'fabricante', 'acao'];
  avaliacao: Avaliacao[] = [];

  constructor(private avaliacaoService: AvaliacaoService) {}

  ngOnInit(): void {
    this.avaliacaoService.findAll().subscribe((data) => {
      this.avaliacao = data;
    });
  }
}
