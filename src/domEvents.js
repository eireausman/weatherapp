import { format, isDate } from "date-fns";
import { geoLocatingAPIData, weatherAPIData } from "./weatherapi";
import { setTempSelection } from "./localStorage";

import loadingImg from "./z_img/loading.gif";

function deleteChildItems(parentElement) {
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.firstChild);
  }
}

async function updateWeatherBackground(weatherCode) {
  // remove the previous classes which will remove any previous background
  const bgContainer = document.querySelector(`.bgContainer`);
  bgContainer.removeAttribute(`class`);
  bgContainer.classList.add(`bgContainer`);
  const firstNumber = weatherCode.toString().charAt(0);
  switch (firstNumber) {
    case `2`:
      bgContainer.classList.add(`bgThunder`);
      break;
    case `3`:
      bgContainer.classList.add(`bgRain`);
      break;
    case `5`:
      bgContainer.classList.add(`bgRain`);
      break;
    case `7`:
      bgContainer.classList.add(`bgVisbility`);
      break;
    case `8`:
      if (weatherCode == `800`) {
        bgContainer.classList.add(`bgSunny`);
      } else if (weatherCode == `801` || weatherCode == `802`) {
        bgContainer.classList.add(`bgCloudSome`);
      } else if (weatherCode == `803` || weatherCode == `804`) {
        bgContainer.classList.add(`bgCloudDense`);
      }
      break;
    default:
      break;
  }
}
function weatherUpdated(result) {
  // if the result is a built search result object, display it, otherwise show the returned error message.
  if (typeof result === `object`) {
    localStorage.removeItem(`weatherData`);
    const resultJSON = JSON.stringify(result);
    localStorage.setItem(`weatherData`, resultJSON);
    displayWeatherData(result);
    const mainContainer = document.querySelector(`.mainContainer`);
    mainContainer.classList.add(`mainContainerAfterSearch`);
    const configurationBoxes = document.querySelector(`.configurationBoxes`);
    configurationBoxes.classList.add(`configurationBoxesAfterSearch`);
  } else {
    updateWeatherSearchFormError(result);
  }
}

function listeners(element, trigger, action) {
  switch (action) {
    case `locationSearchResultClick`:
      element.addEventListener(trigger, (e) => {
        const clickedForm = e.target.closest(`form`);
        e.preventDefault();
        const locationLon =
          clickedForm.querySelector(`.locationLon`).textContent;
        const locationLat =
          clickedForm.querySelector(`.locationLat`).textContent;
        const locationNameString =
          clickedForm.querySelector(`.locationNameString`).textContent;

        // clear down the results for after a result is clicked:
        const resultsFormParent = document.querySelector(`.searchResultsForms`);
        deleteChildItems(resultsFormParent);
        weatherAPIData(locationLon, locationLat, locationNameString).then(
          (result) => {
            weatherUpdated(result);
          }
        );
      });

      break;
    case `locationInputChangeAction`:
      element.addEventListener(trigger, (e) => {
        const searchString = e.target.value;
        if (searchString.length > 5) {
          updatesearchResultsForms(searchString);
        }
      });
      break;
    case `selectTempTypeInputChangeAction`:
      // *** domEvents.js -> temperature selection change actions
      element.addEventListener(trigger, (e) => {
        const desiredTempType = e.target.dataset.tempselected;
        if (desiredTempType == `F`) {
          e.target.dataset.tempselected = `C`;
          e.target.textContent = `\u2103`;
          setTempSelection(desiredTempType);
        } else {
          e.target.dataset.tempselected = `F`;
          e.target.textContent = `\u2109`;
          setTempSelection(desiredTempType);
        }

        displayWeatherData();
      });
      break;
    default:
      break;
  }
}

function updateWeatherSearchFormError(errorMessage) {
  const weatherSearchFormErrorMessage = document.querySelector(
    `.weatherSearchFormErrorMessage`
  );
  weatherSearchFormErrorMessage.textContent = errorMessage;
}

async function updatesearchResultsForms(searchString) {
  const searchResultsForms = document.querySelector(`.searchResultsForms`);
  deleteChildItems(searchResultsForms);

  const loadingImgEle = new Image();
  loadingImgEle.classList.add(`loadingImgEle`);
  loadingImgEle.alt = `loading search results`;
  loadingImgEle.src = loadingImg;
  searchResultsForms.appendChild(loadingImgEle);

  const searchResults = await geoLocatingAPIData(searchString);

  if (searchResults != false) {
    for (let i = 0; i < searchResults.length; i += 1) {
      // form, label (city, state, country), hidden lon, hidden lat, submit
      const searchResultItem = document.createElement(`form`);
      searchResultItem.classList.add(`searchResultItem`);
      searchResultsForms.appendChild(searchResultItem);

      const locationLon = document.createElement(`input`);
      locationLon.setAttribute(`type`, `hidden`);
      locationLon.name = `locationLon`;
      locationLon.classList.add(`locationLon`);
      locationLon.textContent = searchResults[i].lon;
      searchResultItem.appendChild(locationLon);

      const locationNameString = document.createElement(`input`);
      locationNameString.setAttribute(`type`, `hidden`);
      locationNameString.name = `locationNameString`;
      locationNameString.classList.add(`locationNameString`);
      let locationString = ``;
      if (searchResults[i].name != undefined) {
        locationString = searchResults[i].name;
      }
      if (searchResults[i].state != undefined) {
        locationString += `, ${searchResults[i].state}`;
      }
      if (searchResults[i].country != undefined) {
        locationString += `, ${searchResults[i].country}`;
      }
      locationNameString.textContent = locationString;
      searchResultItem.appendChild(locationNameString);

      const locationLat = document.createElement(`input`);
      locationLat.setAttribute(`type`, `hidden`);
      locationLat.name = `locationLat`;
      locationLat.classList.add(`locationLat`);
      locationLat.textContent = searchResults[i].lat;
      searchResultItem.appendChild(locationLat);

      const resultStringButton = document.createElement(`button`);
      resultStringButton.textContent = `${searchResults[i].name}, ${searchResults[i].state}, ${searchResults[i].country}`;
      listeners(resultStringButton, `click`, `locationSearchResultClick`);

      searchResultItem.appendChild(resultStringButton);
    }
  } else {
    const errorMessage = document.createElement(`p`);
    errorMessage.textContent = `Location not found.  Please try again.`;
    searchResultsForms.appendChild(errorMessage);
  }
  loadingImgEle.remove();
}

function displayWeatherData() {
  const locationInput = document.getElementById(`locationInput`);
  locationInput.value = ``;

  const weatherData = JSON.parse(localStorage.getItem(`weatherData`));
  const tempType = localStorage.getItem(`tempSelection`);

  const weatherDetailsSectionCurrent = document.querySelector(
    `.weatherDetailsSectionCurrent`
  );
  deleteChildItems(weatherDetailsSectionCurrent);

  const weatherCode = weatherData.today.summary.id;
  updateWeatherBackground(weatherCode);

  const location = document.createElement(`p`);
  location.classList.add(`displayedLocation`);
  location.textContent = `${weatherData.location}`;
  weatherDetailsSectionCurrent.appendChild(location);

  const weatherDescription = document.createElement(`p`);
  weatherDescription.classList.add(`weatherDescription`);
  weatherDescription.textContent = `${weatherData.today.summary.description}`;
  weatherDetailsSectionCurrent.appendChild(weatherDescription);

  const { symbol } = weatherData.today[`temp${tempType}`];
  const tempCurrent = document.createElement(`p`);
  tempCurrent.classList.add(`displayedCurrentTemp`);
  tempCurrent.textContent =
    weatherData.today[`temp${tempType}`].current + symbol;
  weatherDetailsSectionCurrent.appendChild(tempCurrent);

  const tempDetailContainer = document.createElement(`div`);
  tempDetailContainer.classList.add(`tempDetailContainer`);
  weatherDetailsSectionCurrent.appendChild(tempDetailContainer);

  const tempDetailItem1 = document.createElement(`div`);
  tempDetailItem1.classList.add(`tempDetailItem`);
  tempDetailContainer.appendChild(tempDetailItem1);

  const tempHighTitle = document.createElement(`p`);
  tempHighTitle.classList.add(`tempHighTitle`);
  tempHighTitle.textContent = `High`;
  tempDetailItem1.appendChild(tempHighTitle);

  const tempHigh = document.createElement(`p`);
  tempHigh.classList.add(`displayedTempHigh`);
  tempHigh.textContent = weatherData.today[`temp${tempType}`].high + symbol;
  tempDetailItem1.appendChild(tempHigh);

  const tempDetailItem2 = document.createElement(`div`);
  tempDetailItem2.classList.add(`tempDetailItem`);
  tempDetailContainer.appendChild(tempDetailItem2);

  const tempLowTitle = document.createElement(`p`);
  tempLowTitle.classList.add(`tempHighTitle`);
  tempLowTitle.textContent = `Low`;
  tempDetailItem2.appendChild(tempLowTitle);

  const tempLow = document.createElement(`p`);
  tempLow.classList.add(`displayedTempLow`);
  tempLow.textContent = weatherData.today[`temp${tempType}`].low + symbol;
  tempDetailItem2.appendChild(tempLow);

  const tempDetailItem3 = document.createElement(`div`);
  tempDetailItem3.classList.add(`tempDetailItem`);
  tempDetailContainer.appendChild(tempDetailItem3);

  const tempFeelsLikeTitle = document.createElement(`p`);
  tempFeelsLikeTitle.classList.add(`tempFeelsLikeTitle`);
  tempFeelsLikeTitle.textContent = `Feels Like`;
  tempDetailItem3.appendChild(tempFeelsLikeTitle);

  const tempFeelsLike = document.createElement(`p`);
  tempFeelsLike.classList.add(`displayedTempFeelsLike`);
  tempFeelsLike.textContent =
    weatherData.today[`temp${tempType}`].feelsLike + symbol;
  tempDetailItem3.appendChild(tempFeelsLike);

  const weatherDetailsSectionForecast = document.querySelector(
    `.weatherDetailsSectionForecast`
  );
  deleteChildItems(weatherDetailsSectionForecast);

  const forecastEntries = Object.values(weatherData.forecast);
  for (let i = 0; i < forecastEntries.length; i += 1) {
    const forecastDetailRow = document.createElement(`div`);
    forecastDetailRow.classList.add(`forecastDetailRow`);
    if (i != forecastEntries.length - 1) {
      forecastDetailRow.classList.add(`forecastDetailRowMidLine`);
    }
    weatherDetailsSectionForecast.appendChild(forecastDetailRow);

    const forecastDate = document.createElement(`p`);
    forecastDate.classList.add(`forecastDate`);
    forecastDate.textContent = forecastEntries[i].dateDay;
    forecastDetailRow.appendChild(forecastDate);

    const forecastImage = new Image();
    forecastImage.src = `https://openweathermap.org/img/wn/${forecastEntries[i].summary.icon}.png`;
    forecastDetailRow.appendChild(forecastImage);

    const forecastDescription = document.createElement(`p`);
    forecastDescription.classList.add(`forecastDescription`);
    forecastDescription.textContent = forecastEntries[i].summary.description;
    forecastDetailRow.appendChild(forecastDescription);

    const forecastLow = document.createElement(`p`);
    forecastLow.classList.add(`forecastLow`);
    forecastLow.textContent = `${forecastEntries[i][`temp${tempType}`].low} - `;
    forecastDetailRow.appendChild(forecastLow);

    const forecastHigh = document.createElement(`p`);
    forecastHigh.classList.add(`forecastHigh`);
    forecastHigh.textContent =
      forecastEntries[i][`temp${tempType}`].high + symbol;
    forecastDetailRow.appendChild(forecastHigh);
  }
}

function initialListeners() {
  const locationInput = document.querySelector(`.locationInput`);
  listeners(locationInput, `input`, `locationInputChangeAction`);

  const selectTempType = document.querySelector(`.selectTempType`);
  listeners(selectTempType, `click`, `selectTempTypeInputChangeAction`);
}

export { updateWeatherSearchFormError, initialListeners, weatherUpdated };
