import {
  Component,
  OnInit,
  Input,
  NgModule,
  ChangeDetectorRef,
} from "@angular/core";
import { Map } from "../_models/map.model";
import { MapService } from "../_services/map.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SafePipe } from "../_helpers/safe.pipe";
import { NgModel } from "@angular/forms";

@Component({
  selector: "app-map-details",
  templateUrl: "./map-details.component.html",
  styleUrls: ["./map-details.component.scss"],
  providers: [SafePipe], // Include the SafePipe in the providers array
})
export class MapDetailsComponent implements OnInit {
  data: any;
  CamMapBool: boolean = false;
  CamMap: string = "Disabled";
  ytSrc: string = "https://www.youtube.com/embed/";

  @Input() viewMode = false;
  @Input() currentMap: any;

  constructor(
    private mapService: MapService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getMap(this.route.snapshot.params["id"]);
  }

  getMap(id: string): void {
    this.mapService.get(id).subscribe({
      next: (data) => {
        this.currentMap = data;
        // console.log(data);
      },
      error: (e) => console.error(e),
    });
  }

  toggle(event: MatSlideToggleChange) {
    if (event.checked) {
      this.CamMap = "Enabled";
      this.CamMapBool = true;

      this.cdr.detectChanges(); // Trigger change detection

      const videoContainer = document.getElementById("videoContainer");
      if (videoContainer) {
        const youtubeUrl = `https://www.youtube.com/embed/${this.currentMap.youtube}`;
        const iframeHtml = `<iframe class="h-[100%]" width="100%" src="${youtubeUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 0.375rem;"></iframe>`;
        videoContainer.innerHTML = iframeHtml;
      }
    } else {
      this.CamMap = "Disabled";
      this.CamMapBool = false;
    }
  }

  /**
   *
   * @param url
   * @param title
   * @param w
   * @param h
   * @returns
   */
  open(url: any, title: any, w: any, h: any) {
    var left = screen.width / 2 - w / 2;
    var top = screen.height / 2 - h / 2;
    return window.open(
      url,
      title,
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );
  }
}
