import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidebarService } from '../../../../services/sidebar.service';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(
    private sidebarService: SidebarService,
    public authService: AuthService,
    private router: Router
  ) {}

  clickMenu() {
    this.sidebarService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
