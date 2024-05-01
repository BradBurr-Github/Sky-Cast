// Elements in the DOM
const cityNameSearchEl = document.getElementById("city-name");
const citiesSearchedEl = document.getElementById("cities-searched");
const todayArea = document.getElementById("today-area");
const todayIcon = document.getElementById("today-icon");
const fiveDayLabelEl = document.getElementById("label-five-day");
const fiveDayContainerEl = document.getElementById("five-day-container");
const todayDescEl = document.getElementById("today-desc");

// JQuery elements
const citiesSearchedTag = $('#cities-searched');

// OpenWeatherMap API calls
const apiGeoCoding = "https://api.openweathermap.org/geo/1.0/direct";
const apiCurrWeatherLatLon = "https://api.openweathermap.org/data/2.5/weather"
const apiFiveDayForecastWeatherLatLon = "https://api.openweathermap.org/data/2.5/forecast"

// Global variables
const myAPIKey = "b1500c788d02c8dad12cb3af11f15c99";
let cityWeatherDescLength = 4;

// Function to show or hide 5-day forecast cards
function showForecastData(showCards) {
   if (showCards) {
      fiveDayLabelEl.style.display = "initial";
      fiveDayContainerEl.style.display = "flex";
   }
   else {
      fiveDayLabelEl.display = "none";
      fiveDayContainerEl.style.display = "none";
   }
}

// Function to read cities from localStorage
function getCitiesArrayFromLocalStorage() {
   let cityArray = JSON.parse(localStorage.getItem("owm-cities"));
   if (!cityArray) {
      cityArray = [];
   }
   return cityArray;
};

// Function to see if a specific city exists in localStorage
function cityExistsInLocalStorage(city) {
   let cityArray = getCitiesArrayFromLocalStorage();
   cityIsExactMatch = false;
   for(let i=0; i<cityArray.length; i++) {
      if(cityArray[i].city === city) {
         cityIsExactMatch = true;
         return true;
      }
      else if(cityArray[i].city.toUpperCase() == city.toUpperCase()) {
         return true;
      }
   }
   return false;
}

// Function to update cities in localStorage
function saveCitiesToLocalStorage(cityArray) {
   localStorage.setItem('owm-cities',JSON.stringify(cityArray));
}

// Function to get current city name from localStorage
function getLastCityName() {
   let currCity = JSON.parse(localStorage.getItem("owm-last-city"));
   return currCity;
}

// Function to save current city name to localStorage
function saveLastCityName(city) {
   localStorage.setItem('owm-last-city',JSON.stringify(city));
}

// Chain promises together so they are all done before returning
const fetchLatLonForCity = async (city) => {
   let apiGeoCodingWithCity = `${apiGeoCoding}?q=${city}&limit=1&appid=${myAPIKey}`;
   const response = await fetch(apiGeoCodingWithCity);
   const data = await response.json();
   return data;
};

// Function to fetch current weather data using lat/lon coordinates
const fetchCurrWeatherData = async (lat, lon) => {
   let apiWeatherWithLanLon = `${apiCurrWeatherLatLon}?lat=${lat}&lon=${lon}&units=imperial&appid=${myAPIKey}`;
   const response = await fetch(apiWeatherWithLanLon);
   const data = await response.json();
   return data;
}

// Function to fetch 5-day weather forecast data using lat/lon coordinates
const fetchFiveDayWeatherData = async (lat, lon) => {
   let apiFiveDayForecastWithLanLon = `${apiFiveDayForecastWeatherLatLon}?lat=${lat}&lon=${lon}&units=imperial&appid=${myAPIKey}`;
   const response = await fetch(apiFiveDayForecastWithLanLon);
   const data = await response.json();
   return data;
};

// Function to update localStorage
function addNewCityToLocalStorage(city,state,country,lat,lon) {
   let foundCity = false;
   let cityArray = getCitiesArrayFromLocalStorage();
   // Check to make sure city doesn't already exist
   for(let i=0; i<cityArray.length; i++) {
      if(cityArray[i].city.toUpperCase() == city.toUpperCase()) {
         foundCity = true;
         break;
      }
   }
   // Add new city to the cityArray
   if(!foundCity) {
      const newCity = {
         city: city,
         state: state,
         country: country,
         lat: lat,
         lon: lon
      };
      cityArray.push(newCity);
      appendButtonCitySearchHistory(city);
      saveCitiesToLocalStorage(cityArray);
   }
};

// Function to add a new button to the City Search History column
function appendButtonCitySearchHistory(city) {
   let btnNew = document.createElement("button");
   btnNew.className = "btn btn-secondary btn-city";
   btnNew.textContent = city;
   citiesSearchedEl.appendChild(btnNew);
}

// Function to render buttons
function renderButtonsCitySearchHistory() {
   cityArray = getCitiesArrayFromLocalStorage();
   for(let i=0; i<cityArray.length; i++) {
      appendButtonCitySearchHistory(cityArray[i].city);
   }
}

// Function to render weather data of a city to the webpage
function renderWeatherUsingWeatherData(city,state,country,dataCurrent,dataFiveDays) {
   // Get today's date
   let currDate = dayjs();
   // Render Current Weather Data
   $("#today-city").text(`${city} (${currDate.format('ddd')}, ${currDate.format('M/D/YY')})`);
   $("#today-state-country").text(`[${state}, ${country}]`);
   todayIcon.src = 'https://openweathermap.org/img/w/' + dataCurrent.weather[0].icon + '.png';
   let width = todayArea.getBoundingClientRect().width;
   todayDescEl.style.textTransform = "capitalize";
   $("#today-icon").css({top: -40, left: (width/2)+50, position:'relative'});
   $("#today-desc").text(`(${dataCurrent.weather[0].description})`);
   cityWeatherDescLength = dataCurrent.weather[0].description.length;
   moveTodayIconAndDesc();
   todayIcon.width = "100";
   todayIcon.height = "100";
   $("#today-temp").text(`Temp: ${dataCurrent.main.temp} \u00B0F`);
   $("#today-wind").text(`Wind: ${dataCurrent.wind.speed} MPH`);
   $("#today-humidity").text(`Humidity: ${dataCurrent.main.humidity}%`);
   // Create array for Forecast weather data
   let fiveDayDataArray = [];
   for(let i=0; i<5; i++) {
      let fiveDayDate = currDate.add((i+1),'day');
      let fiveDayData = {
         date: fiveDayDate.format('M/D/YY'),
         day: fiveDayDate.format('ddd'),
         icon: 0,
         desc: '',
         temp: 0,
         wind: 0,
         humidity: 0
      }
      fiveDayDataArray.push(fiveDayData);
   }
   // Fill in Five-Day forecast weather details
   let k = 0;
   for(let j=0; j<5; j++) {
      for(; k<dataFiveDays.list.length; k++) {
         let datetime = dayjs(dataFiveDays.list[k].dt_txt);
         let dateCompare = datetime.format('M/D/YY');
         let hour = datetime.format('HH');
         //if((fiveDayDataArray[j].date === dateCompare) && (j===4 || hour >= '12')) {
         if((fiveDayDataArray[j].date === dateCompare)) {
            fiveDayDataArray[j].icon = dataFiveDays.list[k].weather[0].icon
            fiveDayDataArray[j].desc = dataFiveDays.list[k].weather[0].description;
            fiveDayDataArray[j].temp = dataFiveDays.list[k].main.temp;
            fiveDayDataArray[j].wind = dataFiveDays.list[k].wind.speed;
            fiveDayDataArray[j].humidity = dataFiveDays.list[k].main.humidity;
            k++;
            break;
         }
      }
   }
   // Render data on Forecast cards
   let forecastCardChildren = $('#five-day-container').children('.card');
   forecastCardChildren.each(function(i) {
      let h5El = $(this).find('.card-title');
      let iconEl = $(this).find('.card-icon');
      let descEl = $(this).find('.card-desc');
      let tempEl = $(this).find('.card-temp');
      let windEl = $(this).find('.card-wind');
      let humidityEl = $(this).find('.card-humidity');
      h5El.text(`${fiveDayDataArray[i].date} (${fiveDayDataArray[i].day})`);
      iconEl.attr("src",'https://openweathermap.org/img/w/' + fiveDayDataArray[i].icon + '.png');
      descEl.text(`(${fiveDayDataArray[i].desc})`);
      tempEl.text(`Temp: ${fiveDayDataArray[i].temp} \u00B0F`);
      windEl.text(`Wind: ${fiveDayDataArray[i].wind} MPH`);
      humidityEl.text(`Humidity: ${fiveDayDataArray[i].humidity}%`);
   });
   // Show forecast cards
   showForecastData(true);
}

// Function to get Weather Data for a city
function getWeatherForCity(city,state,country,lat,lon) {
   // Get Current Weather Data
   fetchCurrWeatherData(lat,lon)
      .then(data => {
         // Get Five-Day Weather Data
         fetchFiveDayWeatherData(lat,lon)
            .then(dataFiveDays => {
               saveLastCityName(city);
               renderWeatherUsingWeatherData(city,state,country,data,dataFiveDays); })
            .catch(error => {
               window.alert('Unable to retrieve Five-Day Weather Information.') })})
      .catch(error => {
         window.alert('Unable to retrieve Weather Information.') })
}

// Function to move the Today weather icon when the width of the browser changes
function moveTodayIconAndDesc() {
   let spacing = 50;
   let width = todayArea.getBoundingClientRect().width;
   // Adjust Spacing depending on length of Weather Description
   if(cityWeatherDescLength < 4) {
      spacing += 28;
   }
   else if(cityWeatherDescLength < 5) {
      spacing += 24;
   }
   else if(cityWeatherDescLength < 6) {
      spacing += 15;
   }
   else if(cityWeatherDescLength < 8) {
      spacing += 10;
   }
   else if(cityWeatherDescLength < 10) {
      spacing += 4;
   }
   else if(cityWeatherDescLength < 12) {
      spacing -= 8;
   }
   else if(cityWeatherDescLength < 14) {
      spacing -= 22;
   }
   else if(cityWeatherDescLength < 16) {
      spacing -= 35;
   }
   else if(cityWeatherDescLength < 18) {
      spacing -= 42;
   }
   else {
      spacing -= 57;
   }
   $("#today-icon").css({left: (width/2)+50, position:'relative'});
   $("#today-desc").css({left: (width/2)+spacing, position:'relative'});
}

// On Click event for the SEARCH button
$("#btn-search").on("click", function(event) {
   let cityEntered = $("#city-name").val().trim();
   if (!cityEntered) {
      window.alert("Please enter a valid city to continue.");
   }
   else {
      let lat = 0;
      let lon = 0;
      cityNameSearchEl.style.textTransform = "capitalize";
      if(cityExistsInLocalStorage(cityEntered)) {
         let cityArray = getCitiesArrayFromLocalStorage();
         // Loop through the cityArray to get Lat/Lon coordinates
         for(let i=0; i<cityArray.length; i++) {
            if(cityArray[i].city.toUpperCase() == cityEntered.toUpperCase()) {
               lat = cityArray[i].lat;
               lon = cityArray[i].lon;
               $("#city-name").val('');
               getWeatherForCity(cityArray[i].city,cityArray[i].state,cityArray[i].country,cityArray[i].lat,cityArray[i].lon);
               break;
            }
         }
      }
      else {
         // Get the Lat/Lon coordinates of the city
         fetchLatLonForCity(cityEntered)
            .then(data => {
               addNewCityToLocalStorage(data[0].name,data[0].state,data[0].country,data[0].lat,data[0].lon)
               $("#city-name").val('');
               getWeatherForCity(data[0].name,data[0].state,data[0].country,data[0].lat,data[0].lon);
             })
            .catch(error => {
               window.alert('The city you entered is not valid.  Please try again.')
               return; })
      }
   }
});

// Function to handle when Cities in History are clicked
function handleBtnCityHistoryClick(event) {
   const btnClicked = $(event.target);
   city = btnClicked[0].innerText;
   cityArray = getCitiesArrayFromLocalStorage();
   for(let i=0; i<cityArray.length; i++) {
      if(cityArray[i].city.toUpperCase() == city.toUpperCase()) {
         getWeatherForCity(cityArray[i].city,cityArray[i].state,cityArray[i].country,cityArray[i].lat,cityArray[i].lon);
         break;
      }
   }
}

// Delegate click event from citiesSearchedEl to btn-city class buttons
citiesSearchedTag.on('click', '.btn-city', handleBtnCityHistoryClick);

// Runs when the page loads
$(document).ready(function () {
   // Hide Five Day forecast cards at first
   showForecastData(false);
   // Render buttons to the screen
   renderButtonsCitySearchHistory();
   // Render weather for last city Searched
   let lastCity = getLastCityName();
   if(lastCity) {
      citiesArray = getCitiesArrayFromLocalStorage();
      for(let i=0; i<cityArray.length; i++) {
         if(cityArray[i].city.toUpperCase() == lastCity.toUpperCase()) {
            getWeatherForCity(cityArray[i].city,cityArray[i].state,cityArray[i].country,cityArray[i].lat,cityArray[i].lon);
            break;
         }
      }
   }
});

// Capture the Resizing of the browser window
$(window).on("resize", function() {
   moveTodayIconAndDesc();
});
