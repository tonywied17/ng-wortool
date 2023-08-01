/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\_helpers\safe.pipe.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon July 31st 2023 11:10:41 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Pipe({
  name: "safe",
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
