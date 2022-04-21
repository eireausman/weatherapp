import { initialListeners, weatherUpdated } from "./domEvents";
import { setTempSelection } from "./localStorage";
import { weatherAPIData } from "./weatherapi";

export default function initialSetup() {
  localStorage.clear();

  setTempSelection(`C`);

  const searchContainer = document.createElement(`div`);
  searchContainer.classList.add(`searchContainer`);
  document.body.appendChild(searchContainer);

  const configurationBoxes = document.createElement(`nav`);
  configurationBoxes.classList.add(`configurationBoxes`);
  searchContainer.appendChild(configurationBoxes);

  // const locationInputLabel = document.createElement(`label`);
  // locationInputLabel.setAttribute(`for`, `locationInput`);
  // locationInputLabel.textContent = `Location`;
  // locationInputLabel.classList.add(`locationInputLabel`);
  // configurationBoxes.appendChild(locationInputLabel);

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

  const errorMessage = document.createElement(`p`);
  errorMessage.classList.add(`weatherSearchFormErrorMessage`);
  configurationBoxes.appendChild(errorMessage);

  const searchResultsForms = document.createElement(`div`);
  searchResultsForms.classList.add(`searchResultsForms`);
  searchContainer.appendChild(searchResultsForms);

  const mainContainer = document.createElement(`div`);
  mainContainer.classList.add(`mainContainer`);
  document.body.appendChild(mainContainer);

  const weatherDetailsSection = document.createElement(`section`);
  weatherDetailsSection.classList.add(`weatherDetailsSection`);
  mainContainer.appendChild(weatherDetailsSection);

  initialListeners();
  // set the default to LA, US so that a bg image and some data is shown.
  weatherAPIData(`-118.242766`, `34.0536909`).then((result) => {
    weatherUpdated(result);
  });
}
