import { Component, OnInit } from "@angular/core";
import { SteamApiService } from "../_services/steam-api.service";

@Component({
  selector: "app-game-info",
  templateUrl: "./game-info.component.html",
  styleUrls: ["./game-info.component.scss"],
})
export class GameInfoComponent implements OnInit {
  gameNews: any;
  gameDetails: any;
  headerImage: any;
  gameBackground: any;
  articleLength: any;
  latestAuthor: any;
  latestDate: any;
  screenshots: any;
  isDataLoaded: boolean = false;

  constructor(private steamApiService: SteamApiService) {}

  ngOnInit(): void {
    this.getAppDetails();
    this.getAppNews();
  }

  getAppDetails(): void {
    this.steamApiService.getAppDetails().subscribe(
      (data) => {
        this.gameDetails = data;
        this.headerImage = this.gameDetails.header_image;
        this.gameBackground = this.gameDetails.background;
        this.screenshots = this.gameDetails.screenshots;
        this.isDataLoaded = true;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getAppNews(): void {
    this.steamApiService.getAppNews().subscribe(
      (data) => {
        this.gameNews = data;
        this.articleLength = this.gameNews.length;
        this.latestAuthor = this.gameNews[0].author;
        this.latestDate = this.formatUnixTimestamp(this.gameNews[0].date);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  formatUnixTimestamp(unixTimestamp: any): string {
    const date = new Date(unixTimestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: undefined,
      minute: undefined,
      second: undefined,
      timeZone: "UTC",
    };

    return date.toLocaleString(undefined, options);
  }

  navigateToExternalPage(url: string): void {
    window.open(url, "_blank");
  }

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
