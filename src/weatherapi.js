async function geoLocatingAPIData(searchString) {
  try {
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

async function weatherAPIData(lon, lat) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lon=${lon}&lat=${lat}&APPID=d7c1970fae4365879557d5d8829bfb29`;
    const response = await fetch(url, { mode: `cors` });
    const openWeatherData = await response.json();

    if (openWeatherData.cod == 200) {
      const weatherDataObject = {};
      weatherDataObject.location = openWeatherData.name;
      weatherDataObject.summary = openWeatherData.weather;
      weatherDataObject.temperatureC = {
        symbol: `\u2103`,
        current: kelvinToCelsius(openWeatherData.main.temp),
        low: kelvinToCelsius(openWeatherData.main.temp_min),
        high: kelvinToCelsius(openWeatherData.main.temp_max),
        feelsLike: kelvinToCelsius(openWeatherData.main.feels_like),
      };
      weatherDataObject.temperatureF = {
        symbol: `\u2109`,
        current: kelvinToFahrenheit(openWeatherData.main.temp),
        low: kelvinToFahrenheit(openWeatherData.main.temp_min),
        high: kelvinToFahrenheit(openWeatherData.main.temp_max),
        feelsLike: kelvinToFahrenheit(openWeatherData.main.feels_like),
      };
      weatherDataObject.country = openWeatherData.sys.country;
      weatherDataObject.wind = openWeatherData.wind;
      return weatherDataObject;
    }
    const errorMessage = `${openWeatherData.message} - Please try again.`;
    return errorMessage;
  } catch (error) {
    console.error(error);
  }
}

export { weatherAPIData, geoLocatingAPIData };
