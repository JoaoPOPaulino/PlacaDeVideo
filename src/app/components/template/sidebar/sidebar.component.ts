import { Component, OnInit, ViewChild } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  MatSidenavModule,
  MatDrawer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatDrawer,
    MatSidenavModule,
    MatToolbarModule,
    MatDrawerContent,
    MatNavList,
    MatListItem,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @ViewChild('drawer') public drawer!: MatDrawer;

  constructor(private sideBarService: SidebarService) {}

  ngOnInit(): void {}

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
