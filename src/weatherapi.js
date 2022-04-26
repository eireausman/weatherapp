/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { format, isEqual, parseISO, isDate } from "date-fns";

async function geoLocatingAPIData(searchString) {
  try {
    // key deliberately public
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${searchString}&limit=6&appid=d7c1970fae4365879557d5d8829bfb29`;
    const response = await fetch(url, { mode: `cors` });
    const geoCodingData = await response.json();
    if (!geoCodingData.length == 0) {
      // return the array of city names
      return geoCodingData;
    }
    return false;
  } catch (error) {
    console.error(error);
  }
}

function kelvinToCelsius(kelvinValue) {
  let result = kelvinValue - 273.15;
  result = result.toFixed(1);
  return result;
}

function kelvinToFahrenheit(kelvinValue) {
  let result = kelvinValue - 273.15;
  result *= 1.8;
  result += 32;
  result = result.toFixed(1);
  return result;
}

async function weatherAPIData(lon, lat, locationNameString) {
  try {
    // key deliberately public
    const url = `https://api.openweathermap.org/data/2.5/onecall?lon=${lon}&lat=${lat}&exclude=minutely,hourly&appid=d7c1970fae4365879557d5d8829bfb29`;

    const response = await fetch(url, { mode: `cors` });
    const openWeatherData = await response.json();

    const today = format(new Date(), `yyyy-MM-dd`);

    const weatherDataObject = {};
    weatherDataObject.location = locationNameString;
    weatherDataObject.timezone = openWeatherData.timezone;
    weatherDataObject.today = {};
    weatherDataObject.forecast = {};
    for (const item in openWeatherData.daily) {
      const apiDate = format(
        new Date(openWeatherData.daily[item].dt * 1000),
        `yyyy-MM-dd`
      );
      const apiDateDay = format(
        new Date(openWeatherData.daily[item].dt * 1000),
        `eee`
      );

      if (item === `0`) {
        weatherDataObject.today.summary = openWeatherData.current.weather[0];
        weatherDataObject.today.date = apiDate;
        weatherDataObject.today.dateDay = apiDateDay;
        weatherDataObject.today.tempC = {
          symbol: `\u2103`,
          current: kelvinToCelsius(openWeatherData.current.temp),
          low: kelvinToCelsius(openWeatherData.daily[item].temp.min),
          high: kelvinToCelsius(openWeatherData.daily[item].temp.max),
          feelsLike: kelvinToCelsius(openWeatherData.current.feels_like),
        };
        weatherDataObject.today.tempF = {
          symbol: `\u2109`,
          current: kelvinToFahrenheit(openWeatherData.current.temp),
          low: kelvinToFahrenheit(openWeatherData.daily[item].temp.min),
          high: kelvinToFahrenheit(openWeatherData.daily[item].temp.max),
          feelsLike: kelvinToFahrenheit(openWeatherData.current.feels_like),
        };
        weatherDataObject.today.wind = openWeatherData.daily[item].wind_speed;
      } else {
        weatherDataObject.forecast[item] = {
          date: apiDate,
          dateDay: apiDateDay,
          summary: openWeatherData.daily[item].weather[0],
          tempC: {
            symbol: `\u2103`,
            low: kelvinToCelsius(openWeatherData.daily[item].temp.min),
            high: kelvinToCelsius(openWeatherData.daily[item].temp.max),
          },
          tempF: {
            symbol: `\u2109`,
            low: kelvinToFahrenheit(openWeatherData.daily[item].temp.min),
            high: kelvinToFahrenheit(openWeatherData.daily[item].temp.max),
          },
        };
      }
    }
    return weatherDataObject;

    // const errorMessage = `${openWeatherData.message} - Please try again.`;
    // return errorMessage;
  } catch (error) {
    console.error(error);
  }
}

export { weatherAPIData, geoLocatingAPIData };
