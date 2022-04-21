import { geoLocatingAPIData, weatherAPIData } from "./weatherapi";
import { setTempSelection } from "./localStorage";

import loadingImg from "./z_img/loading.gif";
import bg200ThunderImg from "./z_img/200thunder.jpg";
import bg700VisibilityImg from "./z_img/700visibility.jpg";
import bg800SunnyImg from "./z_img/800sunny.jpg";
import bg801802CloudSomeImg from "./z_img/801802cloud.jpg";
import bg803804CloudDenseImg from "./z_img/803804cloud.jpg";

function deleteChildItems(parentElement) {
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.firstChild);
  }
}

async function updateWeatherBackground(weatherCode) {
  const firstNumber = weatherCode.toString().charAt(0);
  switch (firstNumber) {
    case `2`:
      document.body.background = bg200ThunderImg;
      break;
    case `7`:
      document.body.background = bg700VisibilityImg;
      break;
    case `8`:
      if (weatherCode == `800`) {
        document.body.background = bg800SunnyImg;
      } else if (weatherCode == `801` || weatherCode == `802`) {
        document.body.background = bg801802CloudSomeImg;
      } else if (weatherCode == `803` || weatherCode == `804`) {
        document.body.background = bg803804CloudDenseImg;
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
        // clear down the results for after a result is clicked:
        const resultsFormParent = document.querySelector(`.searchResultsForms`);
        deleteChildItems(resultsFormParent);
        weatherAPIData(locationLon, locationLat).then((result) => {
          weatherUpdated(result);
        });
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

        // console.log(e.target.dataset.tempselected);
        // setTempSelection(e.target.value);
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
  const searchResults = await geoLocatingAPIData(searchString);
  const searchResultsForms = document.querySelector(`.searchResultsForms`);
  deleteChildItems(searchResultsForms);

  const loadingImgEle = new Image();
  loadingImgEle.classList.add(`loadingImgEle`);
  loadingImgEle.alt = `loading search results`;
  loadingImgEle.src = loadingImg;
  searchResultsForms.appendChild(loadingImgEle);

  if (searchResults != false) {
    for (let i = 0; i < searchResults.length; i += 1) {
      console.log(searchResults[i]);
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

  const weatherDetailsSection = document.querySelector(
    `.weatherDetailsSection`
  );
  deleteChildItems(weatherDetailsSection);

  const weatherCode = weatherData.summary[0].id;
  updateWeatherBackground(weatherCode);

  const location = document.createElement(`p`);
  location.classList.add(`displayedLocation`);
  location.textContent = `${weatherData.location}, ${weatherData.country}`;
  weatherDetailsSection.appendChild(location);

  const weatherDescription = document.createElement(`p`);
  weatherDescription.classList.add(`weatherDescription`);
  weatherDescription.textContent = `${weatherData.summary[0].description}`;
  weatherDetailsSection.appendChild(weatherDescription);

  const { symbol } = weatherData[`temperature${tempType}`];
  const tempCurrent = document.createElement(`p`);
  tempCurrent.classList.add(`displayedCurrentTemp`);
  tempCurrent.textContent =
    weatherData[`temperature${tempType}`].current + symbol;
  weatherDetailsSection.appendChild(tempCurrent);

  const tempDetailContainer = document.createElement(`div`);
  tempDetailContainer.classList.add(`tempDetailContainer`);
  weatherDetailsSection.appendChild(tempDetailContainer);

  const tempDetailItem1 = document.createElement(`div`);
  tempDetailItem1.classList.add(`tempDetailItem`);
  tempDetailContainer.appendChild(tempDetailItem1);

  const tempHighTitle = document.createElement(`p`);
  tempHighTitle.classList.add(`tempHighTitle`);
  tempHighTitle.textContent = `High`;
  tempDetailItem1.appendChild(tempHighTitle);

  const tempHigh = document.createElement(`p`);
  tempHigh.classList.add(`displayedTempHigh`);
  tempHigh.textContent = weatherData[`temperature${tempType}`].high + symbol;
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
  tempLow.textContent = weatherData[`temperature${tempType}`].low + symbol;
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
    weatherData[`temperature${tempType}`].feelsLike + symbol;
  tempDetailItem3.appendChild(tempFeelsLike);
}

function initialListeners() {
  const locationInput = document.querySelector(`.locationInput`);
  listeners(locationInput, `input`, `locationInputChangeAction`);

  const selectTempType = document.querySelector(`.selectTempType`);
  listeners(selectTempType, `click`, `selectTempTypeInputChangeAction`);
}

export { updateWeatherSearchFormError, initialListeners, weatherUpdated };
