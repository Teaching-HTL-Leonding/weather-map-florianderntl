import { Component, OnInit } from '@angular/core';
import { Weather, WeatherDataService, AirtableRecord } from './weather-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public city: string;
  public records: AirtableRecord[];

  constructor(public weatherService: WeatherDataService) {
    this.city = '';
    this.records = [];
  }

  public ngOnInit(): void {
    this.weatherService.getWeathers().subscribe(data => this.records = data.records);
  }

  public addLocation(): void {
    let city = this.city;

    for (let i of this.records) {
      if (i.fields.City === this.city) {
        let now = Date.now();
        if (now - i.fields.Date > 1800000) {
          this.weatherService.getWeather({ lat: i.fields.Latitude, lon: i.fields.Longitude }).subscribe(data => {
            if (data.weather.length > 0) {
              i.fields.Temperature = data.main.temp;
              i.fields.Description = data.weather[0].description;
              i.fields.Icon = data.weather[0].icon;
              i.fields.Date = now;
              this.weatherService.patchWeather(i).subscribe();
            }
          });
        } else {
          i.fields.Show = true;
          this.weatherService.patchWeather(i).subscribe();
        }
        return;
      }
    }

    this.weatherService.getWeatherLocation(city).subscribe(cords => {
      if (cords.results.length > 0) {
        this.weatherService.getWeather(cords.results[0]).subscribe(data => {
          if (data.weather.length > 0) {
            let weather: Weather = { City: city, Temperature: data.main.temp, Description: data.weather[0].description, Icon: data.weather[0].icon, Date: Date.now(), Show: true, Longitude: cords.results[0].lon, Latitude: cords.results[0].lat };
            this.weatherService.createWeather(weather).subscribe(data => {
              this.records.push(data.records[0]);
            });
          }
        });
      }
    });

    this.city = '';
  }

  public removeFromView(index: number): void {
    this.records[index].fields.Show = false;
    this.weatherService.patchWeather(this.records[index]).subscribe();
  }
}
