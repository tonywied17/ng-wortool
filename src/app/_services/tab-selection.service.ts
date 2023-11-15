import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TabSelectionService {
  private selectedTabIndexSource = new BehaviorSubject<number>(0);
  selectedTabIndex$ = this.selectedTabIndexSource.asObservable();

  setSelectedTabIndex(index: number) {
    this.selectedTabIndexSource.next(index);
  }

  clearSelectedTabIndex() {
    this.selectedTabIndexSource.next(0);
  }
}
