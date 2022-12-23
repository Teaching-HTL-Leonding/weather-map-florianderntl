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
    this.weatherService.getWeathers().subscribe(data => {
      this.records = data.records;

      for (let record of this.records) {
        this.updateWeather(record);
      }
    });
  }

  private updateWeather(record: AirtableRecord): boolean {
    let now = Date.now();
    if (now - record.fields.Date > 1800000) {
      this.weatherService.getWeather({ lat: record.fields.Latitude, lon: record.fields.Longitude }).subscribe(data => {
        if (data.weather.length > 0) {
          record.fields.Temperature = data.main.temp;
          record.fields.Description = data.weather[0].description;
          record.fields.Icon = data.weather[0].icon;
          record.fields.Date = now;
          this.weatherService.patchWeather(record).subscribe();
        }
      });
      return true;
    }
    return false;
  }

  public addLocation(): void {
    let city = this.city;

    for (let i of this.records) {
      if (i.fields.City === this.city) {
        if (!this.updateWeather(i)) {
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
