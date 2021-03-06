import { initialListeners, weatherUpdated } from "./domEvents";
import { setTempSelection } from "./localStorage";
import { weatherAPIData } from "./weatherapi";

export default function initialSetup() {
  localStorage.clear();

  setTempSelection(`C`);

  const bgContainer = document.createElement(`div`);
  bgContainer.classList.add(`bgContainer`);
  document.body.appendChild(bgContainer);

  const searchContainer = document.createElement(`div`);
  searchContainer.classList.add(`searchContainer`);
  bgContainer.appendChild(searchContainer);

  const configurationBoxes = document.createElement(`nav`);
  configurationBoxes.classList.add(`configurationBoxes`);
  searchContainer.appendChild(configurationBoxes);

  const locationInput = document.createElement(`input`);
  locationInput.classList.add(`locationInput`);
  locationInput.required = true;
  locationInput.placeholder = `Search Location...`;
  locationInput.id = `locationInput`;
  locationInput.name = `locationInput`;
  configurationBoxes.appendChild(locationInput);

  locationInput.focus();

  const selectTempType = document.createElement(`button`);
  selectTempType.classList.add(`selectTempType`);
  selectTempType.id = `selectTempType`;
  selectTempType.setAttribute(`data-tempSelected`, `F`);
  selectTempType.textContent = `\u2109`;
  selectTempType.name = `selectTempType`;
  configurationBoxes.appendChild(selectTempType);

  const errorMessage = document.createElement(`form`);
  errorMessage.classList.add(`weatherSearchFormErrorMessage`);
  configurationBoxes.appendChild(errorMessage);

  const searchResultsForms = document.createElement(`div`);
  searchResultsForms.classList.add(`searchResultsForms`);
  searchContainer.appendChild(searchResultsForms);

  const mainContainer = document.createElement(`div`);
  mainContainer.classList.add(`mainContainer`);
  bgContainer.appendChild(mainContainer);

  const weatherDetailsSectionCurrent = document.createElement(`section`);
  weatherDetailsSectionCurrent.classList.add(`weatherDetailsSectionCurrent`);
  mainContainer.appendChild(weatherDetailsSectionCurrent);

  const weatherDetailsSectionForecast = document.createElement(`section`);
  weatherDetailsSectionForecast.classList.add(`weatherDetailsSectionForecast`);
  mainContainer.appendChild(weatherDetailsSectionForecast);

  initialListeners();
  // set the default to LA, US so that a bg image and some data is shown.
  weatherAPIData(
    `-118.242766`,
    `34.0536909`,
    `Los Angeles, California, US`
  ).then((result) => {
    weatherUpdated(result);
  });
}
