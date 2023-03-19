import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MaterialModule} from './material-module'
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { RegimentsComponent } from './regiments/regiments.component';
import { RouterModule, Routes } from '@angular/router';
import { MapsComponent } from './maps/maps.component';
import { HttpClientModule } from '@angular/common/http';
import { WeaponsComponent } from './weapons/weapons.component';
import { MapDetailsComponent } from './map-details/map-details.component';
import { MusterComponent } from './muster/muster.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'maps', component: MapsComponent },
  { path: 'regiments', component: RegimentsComponent },
  { path: 'maps/:id', component: MapDetailsComponent },
  { path: 'weapons', component: WeaponsComponent },
  { path: 'muster', component: MusterComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegimentsComponent,
    MapsComponent,
    WeaponsComponent,
    MapDetailsComponent,
    MusterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
