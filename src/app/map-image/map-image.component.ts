
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-map-image-modal',
  template: `
    <div (click)="closeModal()" class="modal-overlay cursor-pointer">
      <img [src]="data.imageUrl" alt="Map Image" class="modal-image" />
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-image {
      max-width: 90%;
      max-height: 90%;
      transition: all ease .2s;
    }

    .modal-image:active {
      transform: scale(0.95);
    }
  `],
})
export class MapImageComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string },
    private dialogRef: MatDialogRef<MapImageComponent>
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
