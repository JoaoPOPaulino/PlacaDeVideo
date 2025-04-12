import { Component, ViewChild } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  MatSidenavModule,
  MatDrawer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, RouterModule, RouterLinkActive } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatDrawer,
    MatSidenavModule,
    MatToolbarModule,
    MatDrawerContent,
    MatNavList,
    MatListItem,
    RouterOutlet,
    RouterModule,
    RouterLinkActive,
    NgClass,
    MatIcon,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @ViewChild('drawer') public drawer!: MatDrawer;

  constructor(private sideBarService: SidebarService) {}

  ngAfterViewInit(): void {
    this.sideBarService.sideNavToggleSubject.subscribe(() => {
      if (this.drawer) {
        setTimeout(() => {
          this.drawer.toggle();
        });
      }
    });
  }
}
