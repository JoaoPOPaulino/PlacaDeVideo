import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './sobre.component.html',
  styleUrl: './sobre.component.css',
})
export class SobreComponent {
  openGitHub() {
    window.open('https://github.com/JoaoPOPaulino/PlacaDeVideo', '_blank');
  }
}
