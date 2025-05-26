import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartUIService {
  private sidenavOpenSubject = new BehaviorSubject<boolean>(false);
  sidenavOpen$ = this.sidenavOpenSubject.asObservable();

  openCart() {
    this.sidenavOpenSubject.next(true);
  }

  closeCart() {
    this.sidenavOpenSubject.next(false);
  }
}
