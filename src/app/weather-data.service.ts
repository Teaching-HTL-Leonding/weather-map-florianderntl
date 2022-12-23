import { Inject, Injectable, INJECTOR, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AIRTABLE_TOKEN, GEOAPIFY_TOKEN, OPEN_WEATHER_MAP_TOKEN } from './app.module';
import { Observable } from 'rxjs';

export interface GeoapifyRoot {
  results: Location[],
}

export interface Location {
  lon: number,
  lat: number,
}

export interface OpenWeatherMapRoot {
  weather: {
    description: string,
    icon: string,
  }[],
  main: OpenWeatherMapMain,
}

export interface OpenWeatherMapWeather {
  description: string,
  icon: string,
}

export interface OpenWeatherMapMain {
  temp: number,
}

export interface Weather {
  City: string,
  Temperature: number,
  Description: string,
  Icon: string,
  Date: number,
  Show: boolean,
  Longitude: number,
  Latitude: number,
}

export interface AirtableRoot {
  records: AirtableRecord[]
}

export interface AirtableRecord {
  id?: string
  //createdTime?: string
  fields: Weather
}

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  constructor(private http: HttpClient, 
    @Inject(AIRTABLE_TOKEN) private airtableToken: string, 
    @Inject(GEOAPIFY_TOKEN) private geoapifyToken: string,  
    @Inject(OPEN_WEATHER_MAP_TOKEN) private openWeatherMapToken: string) { }

  public getWeatherLocation(city: string): Observable<GeoapifyRoot> {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${city}&format=json&apiKey=${this.geoapifyToken}`;
    return this.http.get<GeoapifyRoot>(url);
  }

  public getWeather(location: Location): Observable<OpenWeatherMapRoot> {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&lang=de&units=metric&appid=${this.openWeatherMapToken}`;
    return this.http.get<OpenWeatherMapRoot>(url);
  }

  public getWeathers(): Observable<AirtableRoot> {
    const url = `https://api.airtable.com/v0/appq7b4G8Y0y7g7O3/CityWeather`;
    return this.http.get<AirtableRoot>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.airtableToken}`,
      })
    });
  }

  public createWeather(weather: Weather): Observable<AirtableRoot> {
    // For details see https://airtable.com/developers/web/api/create-records
    const newItem: AirtableRoot = { records: [ { fields: weather }] };
    return this.http.post<AirtableRoot>(`https://api.airtable.com/v0/appq7b4G8Y0y7g7O3/CityWeather`, newItem, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.airtableToken}`,
      })
    });
  }

  public patchWeather(record: AirtableRecord): Observable<AirtableRecord> {
    const body: AirtableRecord = { fields: record.fields };
    return this.http.patch<AirtableRecord>(`https://api.airtable.com/v0/appq7b4G8Y0y7g7O3/CityWeather/${record.id}`, body, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.airtableToken}`,
      })
    });
  }
}
