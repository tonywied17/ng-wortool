/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\regiments\regiments.component.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 18th 2023 1:10:25 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { RegimentService } from "../_services/regiment.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: "app-regiments",
  templateUrl: "./regiments.component.html",
  styleUrls: ["./regiments.component.scss"],
})
export class RegimentsComponent implements OnInit {
  @ViewChild('overlayContainer', { static: false }) overlayContainer!: ElementRef;
  showOverlay: boolean = false;
  regiments: any[] = [];
  regimentID: any;
  searchText: any;
  isDataLoaded: boolean = false;
  currentRoute!: string;
  selectedSide: string = "all";
  itemsPerPage = 6;
  currentPage = 1;
  paginatedRegiments: any[] = [];
  allRegiments: any[] = [];

  constructor(
    private regimentService: RegimentService,
    private snackBar: MatSnackBar,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.showOverlay = false;
  }

  /**
   * Initialize the component
   */
  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.getRegiments();
  }

  /**
   * Filter regiments by the search text, or side
   * @returns void
   */
  filterRegiments() {
    this.regiments = this.allRegiments.filter((regiment: any) => {
      const searchTextMatch =
        !this.searchText ||
        regiment.regiment.toLowerCase().includes(this.searchText.toLowerCase());
      const sideMatch =
        this.selectedSide === 'all' || regiment.side === this.selectedSide;
      return searchTextMatch && sideMatch;
    });
    this.currentPage = 1; 

    this.paginateRegiments();
  }
  
  /**
   * Get all regiments and their users
   * This function will get all regiments and then fetch the users for each regiment
   */
  getRegiments() {
    this.regimentService.getRegiments().subscribe((regiments) => {
      this.regiments = regiments;
      this.allRegiments = this.regiments.slice();
      this.isDataLoaded = true;
      this.paginateRegiments();
    });
  }

  /**
   * Paginate regiments based on current page and items per page
   */
  paginateRegiments() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRegiments = this.regiments.slice(startIndex, endIndex);
  }

  /**
   * Change the current page
   * @param newPage - The new page number
   */
  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage = newPage;
      this.paginateRegiments();
    }
  }

  /**
   * Go to the previous page
   */
  previousPage() {
    this.changePage(this.currentPage - 1);
  }

  /**
   * Go to the next page
   */
  nextPage() {
    this.changePage(this.currentPage + 1);
  }

  /**
   * Get the total number of pages
   */
  totalPages(): number {
    return Math.ceil(this.regiments.length / this.itemsPerPage);
  }

  /**
   * Open a url in a new tab
   * @param url - The url to open
   */
  open(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    window.open(url, "_blank");
  }

  /**
   * Truncate text to a specified length
   * @param text - The text to truncate
   * @param maxLength - The max length of the text
   * @returns - The truncated text
   */
  ellipsisText(text: string, maxLength: number = 256): string {
    if (!text || text.trim() === '') {
      return 'No description provided.';
    }
  
    if (text.length <= maxLength) {
      return text;
    }
  
    if (maxLength <= 3) {
      maxLength = 3;
    }
  
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Display a snackbar message that the feature is not yet available
   */
  notYet() {
    this.snackBar.open("This feature is not yet available", "OK", {
      duration: 5000,
      verticalPosition: "top",
    });
  }


    /**
     * @method toggleOverlay
     * @description toggle the overlay
     * @returns - the overlay
     */
    toggleOverlay() {
      this.showOverlay = !this.showOverlay;
      // Add or remove click event listener based on the overlay display status
      if (this.showOverlay) {
        document.addEventListener('click', this.closeOverlayOnClickOutside);
      } else {
        document.removeEventListener('click', this.closeOverlayOnClickOutside);
      }
    }
  
    /**
     * @method closeOverlayOnClickOutside
     * @description close the overlay on click outside
     * @returns - the overlay
     * @param event - the mouse event
     */
    closeOverlayOnClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!this.overlayContainer.nativeElement.contains(target)) {
        this.toggleOverlay();
      }
    };

    /**
     * @method handleClickInside
     * @description handle the click inside the overlay (prevent propagation on click inside add bot div's)
     * @returns - the overlay
     * @param event - the mouse event
     */
    handleClickInside(event: MouseEvent): void {
      event.stopPropagation(); 
    }

    /**
     * @method closeOverlay
     * @description close the overlay
     * @param event - the mouse event
     */
    closeOverlay(event: MouseEvent) {
      event.stopPropagation();
      this.toggleOverlay();
    }
    
    /**
   * Get an array of page numbers for pagination
   * @param totalPages - The total number of pages
   * @returns An array of page numbers
   */
    getPagesArray(totalPages: number): number[] {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
}
