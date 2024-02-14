/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\app.module.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue February 13th 2024 8:52:48 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "./material-module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HomeComponent } from "./_components/home/home.component";
import { RegimentsComponent } from "./_components/_community/regiments/regiments.component";
import { RouterModule, Routes } from "@angular/router";
import { MapsComponent } from "./_components/_resources/maps/maps.component";
import { HttpClientModule } from "@angular/common/http";
import { WeaponsComponent } from "./_components/_resources/weapons/weapons.component";
import { MapDetailsComponent } from "./_components/_resources/maps/map-details/map-details.component";
import { FormsModule } from "@angular/forms";
import { UserDashboardComponent } from "./_components/_dashboards/user-dashboard/user-dashboard.component";
import { AdminDashboardComponent } from "./_components/_dashboards/admin-dashboard/admin-dashboard.component";
import { RegimentDashboardComponent } from "./_components/_dashboards/regiment-dashboard/regiment-dashboard.component";
import { authInterceptorProviders } from "./_helpers/auth.interceptor";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { ReactiveFormsModule } from "@angular/forms";
import { PasswordMatchValidatorDirective } from "./password-match-validator.directive";
import { ConfirmCancelSnackbarComponent } from "./_components/confirm-cancel-snackbar/confirm-cancel-snackbar.component";
import { ManageWeaponsComponent } from "./_components/_dashboards/admin-dashboard/manage-weapons/manage-weapons.component";
import { GameInfoComponent } from "./_components/_resources/game-info/game-info.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { VersionChecker } from "./version-checker";
import { environment } from "src/environments/environment.prod";
import { RegimentSettingsComponent } from "./_components/_dashboards/regiment-dashboard/regiment-settings/regiment-settings.component";
import { AddBotComponent } from "./_components/_community/regiments/add-bot/add-bot.component";
import { RegimentInfoComponent } from "./_components/_community/regiments/regiment-info/regiment-info.component";
import { EventRecapsComponent } from "./_components/_community/event-recaps/event-recaps.component";
import { SteamStatsComponent } from "./_components/_dashboards/regiment-dashboard/steam-stats/steam-stats.component";
import { ImageModalComponent } from "./_components/_community/regiments/image-modal/image-modal.component";
import { MapImageModalComponent } from "./_components/_resources/maps/map-image-modal/map-image-modal.component";
import { ResetPasswordComponent } from "./_components/home/reset-password/reset-password.component";
import { MusterRosterComponent } from "./_components/_dashboards/regiment-dashboard/muster-roster/muster-roster.component";
import { EnlisterComponent } from "./_components/_dashboards/regiment-dashboard/muster-roster/enlister/enlister.component";
import { SharedDataService } from "./_services/shared-data.service";
import { ScheduleComponent } from "./_components/_dashboards/regiment-dashboard/regiment-settings/schedule/schedule.component";
import { MembersComponent } from "./_components/_dashboards/regiment-dashboard/regiment-settings/members/members.component";
import { MediaComponent } from "./_components/_dashboards/regiment-dashboard/regiment-settings/media/media.component";
import { EventBuilderComponent } from "./_components/_dashboards/regiment-dashboard/event-builder/event-builder.component";
import { ManageMapsComponent } from "./_components/_dashboards/admin-dashboard/manage-maps/manage-maps.component";

/**
 * Routes for the application
 * @type Routes
 */
const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "maps", component: MapsComponent },
  { path: "regiments", component: RegimentsComponent },
  { path: "game-info", component: GameInfoComponent },
  { path: "maps/:id", component: MapDetailsComponent },
  { path: "weapons", component: WeaponsComponent },
  { path: "weapons/:weapon", component: WeaponsComponent },
  { path: "user", component: UserDashboardComponent },
  { path: "user/:page", component: UserDashboardComponent },
  { path: "mod", component: RegimentDashboardComponent },
  { path: "mod/:page", component: RegimentDashboardComponent },
  { path: "admin", component: AdminDashboardComponent },
  { path: "admin/:page", component: AdminDashboardComponent },
  { path: "admin/:page/:weapon", component: AdminDashboardComponent },
  { path: "regiments/:id", component: RegimentInfoComponent },
  { path: "add-bot", component: AddBotComponent},
  { path: "recaps", component: EventRecapsComponent},
  { path: "reset", component: ResetPasswordComponent },
  { path: "reset/:token", component: ResetPasswordComponent },
  { path: "event-build", component: EventBuilderComponent },
  { path: "", redirectTo: "/home", pathMatch: "full" },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegimentsComponent,
    MapsComponent,
    WeaponsComponent,
    MapDetailsComponent,
    UserDashboardComponent,
    RegimentDashboardComponent,
    AdminDashboardComponent,
    PasswordMatchValidatorDirective,
    ConfirmCancelSnackbarComponent,
    ManageWeaponsComponent,
    GameInfoComponent,
    RegimentSettingsComponent,
    AddBotComponent,
    RegimentInfoComponent,
    EventRecapsComponent,
    SteamStatsComponent,
    ImageModalComponent,
    MapImageModalComponent,
    ResetPasswordComponent,
    MusterRosterComponent,
    EnlisterComponent,
    ScheduleComponent,
    MembersComponent,
    MediaComponent,
    EventBuilderComponent,
    ManageMapsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ClipboardModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    ServiceWorkerModule.register("ngsw-worker.js", {
      // enabled: !isDevMode(),
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
  providers: [authInterceptorProviders, VersionChecker, SharedDataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
