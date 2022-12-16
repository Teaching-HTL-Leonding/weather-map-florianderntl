import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

export const AIRTABLE_TOKEN = new InjectionToken<string>('airtableToken');
export const GEOAPIFY_TOKEN = new InjectionToken<string>('geoapifyToken');
export const OPEN_WEATHER_MAP_TOKEN = new InjectionToken<string>('openWeatherMapToken');

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    { provide: AIRTABLE_TOKEN, useValue: '<TOKEN>' },
    { provide: GEOAPIFY_TOKEN, useValue: '<TOKEN>' },
    { provide: OPEN_WEATHER_MAP_TOKEN, useValue: '<TOKEN>' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
