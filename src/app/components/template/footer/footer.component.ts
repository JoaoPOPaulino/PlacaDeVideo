import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatToolbarModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly profiles = {
    seu_usuario: 'https://github.com/JoaoPOPaulino',
    amigo_usuario: 'https://github.com/oluizoliveira997',
  } as const;

  openGithub(username: keyof typeof this.profiles) {
    window.open(this.profiles[username], '_blank');
  }
}
