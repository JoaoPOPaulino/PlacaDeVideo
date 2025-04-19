import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { FooterComponent } from '../../footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-template',
  standalone: true,
  imports: [CommonModule, PublicHeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './public-template.component.html',
  styleUrl: './public-template.component.css'
})
export class PublicTemplateComponent {

}
