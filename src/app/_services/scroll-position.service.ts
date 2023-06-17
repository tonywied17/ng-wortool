import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollPositionService {

  constructor() { }

  previousScrollPosition!: number;

}
