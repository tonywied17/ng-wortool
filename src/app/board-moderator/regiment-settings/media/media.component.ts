import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { SharedDataService } from "src/app/_services/shared-data.service";
import { RegimentService } from "src/app/_services/regiment.service";
import { SteamApiService } from "../../../_services/steam-api.service";
import { MatSnackBar, MatSnackBarDismiss } from "@angular/material/snack-bar";
import { ConfirmDeleteSnackbarComponent } from "../../../confirm-delete-snackbar/confirm-delete-snackbar.component";
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { FileService } from 'src/app/_services/file.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MapImageComponent } from 'src/app/map-image/map-image.component';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {
  
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  screenshots: any;
  randomScreenshot: string = "";
  gameDetails: any;
  selectedCover?: FileList;
  currentCover?: File;
  progressCover = 0;
  messageCover = '';

  fileInfos: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  coverInfos?: Observable<any>;

  constructor(
    private steamApiService: SteamApiService,
    private snackBar: MatSnackBar,
    private uploadService: FileService,
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private dialog: MatDialog,
    public sharedDataService: SharedDataService
  ) {

  }

  async ngOnInit(): Promise<void> {

    await this.getScreenshots();
    
    this.uploadService.getFiles(this.sharedDataService.regimentId).subscribe(
      (files: any[]) => {
        this.fileInfos.next(files);
      },
      (error) => {
        console.error("Error getting files:", error);
      }
    );

  }

  /**
   * Select regular media file input
   * @param event 
   */
  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  /**
   * Select cover file input
   * @param event 
   */
  selectCover(event: any): void {
    this.selectedCover = event.target.files;
  }

  /**
   * Upload regular media files
   */
  upload(): void {
    this.progress = 0;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.uploadService.upload(this.currentFile, this.sharedDataService.regimentId).subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progress = Math.round((100 * event.loaded) / event.total);
            } else if (event instanceof HttpResponse) {
              this.snackBar.open(event.body.message, "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
              this.currentFile = undefined;
              // Update fileInfos using next method of BehaviorSubject
              this.uploadService.getFiles(this.sharedDataService.regimentId).subscribe(
                (files: any[]) => {
                  this.fileInfos.next(files);
                },
                (error: any) => {
                  console.error("Error getting files:", error);
                }
              );
            }
          },
          error: (err: any) => {
            console.log(err);
            this.progress = 0;

            if (err.error && err.error.message) {
              this.snackBar.open(err.error.message, "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
            } else {
              this.snackBar.open("Could not upload the file! Images Only, 10MB Per Limit", "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
            }

            this.currentFile = undefined;
          },
        });
      }

      this.selectedFiles = undefined;
    }
  }

  /**
   * Upload Cover Photo
   */
  uploadCover(): void {
    this.progressCover = 0;

    if (this.selectedCover) {
      const file: File | null = this.selectedCover.item(0);

      if (file) {
        this.currentCover = file;

        this.uploadService.uploadCover(this.currentCover, this.sharedDataService.regimentId).subscribe({
          next: async (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progressCover = Math.round((100 * event.loaded) / event.total);
            } else if (event instanceof HttpResponse) {
              this.coverInfos = await firstValueFrom(this.uploadService.getCover(this.sharedDataService.regimentId));
              if (Array.isArray(this.coverInfos) && this.coverInfos.length > 0) {
                const coverUrl = this.coverInfos[0].url;
                this.sharedDataService.regiment.cover_photo = coverUrl
                console.log('Cover URL:', coverUrl);
              } else {
                console.error('Invalid coverInfos array or empty array.');
              }
              this.currentCover = undefined;
              this.snackBar.open("Your cover photo has been updated.", "Close", {
                verticalPosition: "top",
                duration: 3000,
              });

            }
          },
          error: (err: any) => {
            console.log(err);
            this.progressCover = 0;
            if (err.error && err.error.message) {
              this.snackBar.open(err.error.message, "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
            } else {
              this.snackBar.open("Could not upload the file! Images Only, 10MB Per Limit", "Close", {
                verticalPosition: "top",
                duration: 3000,
              });
            }

            this.currentCover = undefined;
          },
        });
      }

      this.selectedCover = undefined;
    }
  }

  /**
   * Snackbar confirmation for regular media deletion
   * @param file 
   */
  confirmRemoveFile(file: any): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to remove this file?`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.removeFile(file);
    });
  }

  /**
   * Removes the file after confirmation
   * @param file 
   */
  removeFile(file: any) {
    this.uploadService.remove(this.sharedDataService.regimentId, file).subscribe(
      () => {
        const currentFileInfos = this.fileInfos.value;
        const updatedFileInfos = currentFileInfos.filter((f) => f.name !== file.name);
        this.fileInfos.next(updatedFileInfos);

        this.ngZone.run(() => {
          this.snackBar.open("File removed", "Close", {
            verticalPosition: "top",
            duration: 3000,
          });
        });

        this.uploadService.getFiles(this.sharedDataService.regimentId).subscribe(
          (files: any[]) => {
            this.fileInfos.next(files);
          },
          (error) => {
            console.error("Error getting files:", error);
          }
        );

        this.selectedFiles = undefined;


      },
      (error) => {
        // Handle error if needed
        console.error("Error removing file:", error);
      }
    );
  }

  /**
   * Snackbar confirmation for regular media deletion
   * @param file 
   */
  confirmRemoveCover(fileUrl: string): void {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmDeleteSnackbarComponent,
      {
        data: {
          message: `Are you sure you want to use random screenshots as your cover? This will delete your current cover photo.`,
        },
        duration: 5000,
        verticalPosition: "top",
        panelClass: "confirm-delete-snackbar",
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.removeCover(fileUrl);
    });
  }

  /**
   * Remove Cover Photo
   * @param fileUrl 
   */
  removeCover(fileUrl: string) {
    const prefixToRemove = 'https://api.tonewebdesign.com/pa/regiments/9/files/cover/';

    if (fileUrl.startsWith(prefixToRemove)) {
      const fileName = fileUrl.substring(prefixToRemove.length);


      this.uploadService.removeCover(this.sharedDataService.regimentId, fileName).subscribe(
        () => {
          this.ngZone.run(() => {
            this.snackBar.open('File removed', 'Close', {
              verticalPosition: 'top',
              duration: 3000,
            });
          });

          this.selectedCover = undefined;
          this.sharedDataService.regiment.cover_photo = undefined;

        },
        (error) => {
          console.error('Error removing file:', error);
        }
      );
    } else {
      console.error('Invalid file URL:', fileUrl);
    }
  }

  /**
   * Detect file input changes for regular media upload field
   * @param event 
   */
  fileInputChange(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        this.selectedFiles = event.target.files;
        this.message = "";
      } else {
        this.message = 'Please select an image file only.';
        this.clearFileInput();
      }
    }
  }

  coverInputChange(event: any) {
    const selectedCover = event.target.files[0];

    if (selectedCover) {
      if (selectedCover.type.startsWith('image/')) {
        this.selectedCover = event.target.files;
        this.messageCover = "";
      } else {
        this.messageCover = 'Please select an image file only.';
        this.clearCoverInput();
      }
    }
  }

  clearFileInput() {
    const fileInput = this.elementRef.nativeElement.querySelector('#fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearCoverInput() {
    const coverInput = this.elementRef.nativeElement.querySelector('#coverInput');
    if (coverInput) {
      coverInput.value = '';
    }
  }

  /**
   * Get screenshots
   * This function is used to get the screenshots for the game from steam api
   * @returns - promise
   */
  async getScreenshots(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.steamApiService.getAppDetails().subscribe(
        (data) => {
          this.gameDetails = data;
          this.screenshots = this.gameDetails.screenshots;
          this.randomScreenshot = this.getRandomScreenshot(this.screenshots);
          resolve();
        },
        (error) => {
          // handle error if needed
          reject(error);
        }
      );
    });
  }

  /**
   * Get random screenshot
   * This function is used to get a random screenshot from the screenshots array
   * @param screenshots - screenshots array
   * @returns - random screenshot url path
   */
  getRandomScreenshot(screenshots: any[]): string {
    if (screenshots && screenshots.length > 0) {
      const randomIndex = Math.floor(Math.random() * screenshots.length);
      return screenshots[randomIndex].path_full;
    }
    return "";
  }

  openImageModal(imageUrl: string): void {
    this.dialog.open(MapImageComponent, {
      data: { imageUrl },
    });
  }

}
