import { NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "./material-module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HomeComponent } from "./home/home.component";
import { RegimentsComponent } from "./regiments/regiments.component";
import { RouterModule, Routes } from "@angular/router";
import { MapsComponent } from "./maps/maps.component";
import { HttpClientModule } from "@angular/common/http";
import { WeaponsComponent } from "./weapons/weapons.component";
import { MapDetailsComponent } from "./map-details/map-details.component";
import { MusterComponent } from "./muster/muster.component";
import { FormsModule } from "@angular/forms";
import { BoardUserComponent } from "./board-user/board-user.component";
import { BoardAdminComponent } from "./board-admin/board-admin.component";
import { BoardModeratorComponent } from "./board-moderator/board-moderator.component";
import { authInterceptorProviders } from "./_helpers/auth.interceptor";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { ReactiveFormsModule } from "@angular/forms";
import { PasswordMatchValidatorDirective } from "./password-match-validator.directive";
import { ConfirmDeleteSnackbarComponent } from "./confirm-delete-snackbar/confirm-delete-snackbar.component";
import { ManageWeaponsComponent } from "./board-admin/manage-weapons/manage-weapons.component";
import { ServerInfoComponent } from "./board-moderator/server-info/server-info.component";
import { GameInfoComponent } from "./game-info/game-info.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { VersionChecker } from "./version-checker";
import { environment } from "src/environments/environment.prod";
import { RegimentSettingsComponent } from './board-moderator/regiment-settings/regiment-settings.component';
import { AddBotComponent } from './regiments/add-bot/add-bot.component';

const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "maps", component: MapsComponent },
  { path: "regiments", component: RegimentsComponent },
  { path: "game-info", component: GameInfoComponent },
  { path: "maps/:id", component: MapDetailsComponent },
  { path: "weapons", component: WeaponsComponent },
  { path: "weapons/:weapon", component: WeaponsComponent },
  { path: "muster", component: MusterComponent },
  { path: "user", component: BoardUserComponent },
  { path: "user/:page", component: BoardUserComponent },
  { path: "mod", component: BoardModeratorComponent },
  { path: "mod/:page", component: BoardModeratorComponent },
  { path: "admin", component: BoardAdminComponent },
  { path: "admin/:page", component: BoardAdminComponent },
  { path: "admin/:page/:weapon", component: BoardAdminComponent },
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
    BoardUserComponent,
    BoardModeratorComponent,
    BoardAdminComponent,
    MusterComponent,
    PasswordMatchValidatorDirective,
    ConfirmDeleteSnackbarComponent,
    ManageWeaponsComponent,
    ServerInfoComponent,
    GameInfoComponent,
    RegimentSettingsComponent,
    AddBotComponent,
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
  providers: [authInterceptorProviders, VersionChecker],
  bootstrap: [AppComponent],
})
export class AppModule {}
