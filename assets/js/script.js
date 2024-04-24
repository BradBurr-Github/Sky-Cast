// Elements in the DOM
const citiesSearchedEl = document.getElementById("cities-searched");
const todayArea = document.getElementById("today-area");
const todayCityEl = document.getElementById("today-city");
const todayIcon = document.getElementById("today-icon");
const fiveDayLabelEl = document.getElementById("label-five-day");
const fiveDayContainerEl = document.getElementById("five-day-container");
const todayDescEl = document.getElementById("today-desc");

// JQuery elements
const citiesSearchedTag = $('#cities-searched');

// OpenWeatherMap API calls
const apiGeoCoding = "http://api.openweathermap.org/geo/1.0/direct";
const apiCurrWeatherLatLon = "http://api.openweathermap.org/data/2.5/weather"
const apiFiveDayForecastWeatherLatLon = "https://api.openweathermap.org/data/2.5/forecast"

// Global variables
const myAPIKey = "b1500c788d02c8dad12cb3af11f15c99";
let cityIsExactMatch = false;
let currLat = '';
let currLon = '';
let result = '';

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
   //$("today-icon").hide();
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
function getCurrCityName() {
   let currCity = JSON.parse(localStorage.getItem("owm-curr-city"));
   return currCity;
}

// Function to save current city name to localStorage
function saveCurrCityName(city) {
   localStorage.setItem('owm-curr-city',JSON.stringify(city));
}

// Function to get current city's weather data from localStorage
function getCurrCityWeatherFromLocalStorage() {
   let currCityData = JSON.parse(localStorage.getItem("owm-curr-city-weather"));
   if (!currCityData) {
      currCityData = [];
   }
   return currCityData;
}

// Function to save current city's weather data to localStorage
function saveCurrCityWeatherToLocalStorage(data,dataFiveDays) {
   weatherData = [];
   let currDate = dayjs();
   weatherData.push({day: currDate.format('ddd'),
                    date: currDate.format('M/D/YY'),
                    icon: data.weather[0].icon,
                    temp: data.main.temp,
                    wind: data.wind.speed,
                    humidity: data.main.humidity,
                    desc: data.weather[0].description,
                    descLength: data.weather[0].description.length});
   for(let i=0; i<5; i++) {
      let fiveDayDate = currDate.add((i+1),'day');
      weatherData.push({day: fiveDayDate.format('ddd'),
                       date: fiveDayDate.format('M/D/YY'),
                       icon: dataFiveDays.list[i].weather[0].icon,
                       temp: dataFiveDays.list[i].main.temp,
                       wind: dataFiveDays.list[i].wind.speed,
                       humidity: dataFiveDays.list[i].main.humidity,
                       desc: dataFiveDays.list[i].weather[0].description,
                       descLength: dataFiveDays.list[i].weather[0].description.length});
   }
   localStorage.setItem('owm-curr-city-weather',JSON.stringify(weatherData));
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

// Function to get Weather Data and save it to locatStorage
function GetWeatherDataAndSaveItToLocalStorage(city,lat,lon) {
   fetchCurrWeatherData(lat,lon)
      .then(data => {
         // Get Five-Day Weather Data
         fetchFiveDayWeatherData(lat,lon)
            .then(dataFiveDays => {
               saveCurrCityName(city);
               saveCurrCityWeatherToLocalStorage(data,dataFiveDays);
               return true; })
            .catch(error => {
               window.alert('Unable to retrieve Five-Day Weather Information.')
               return false; })})
      .catch(error => {
         window.alert('Unable to retrieve Weather Information.')
         return false; })
}

// Function to update localStorage
function addNewCityToLocalStorage(city,lat,lon) {
   let cityArray = getCitiesArrayFromLocalStorage();
   // Add new city to the cityArray
   const newCity = {
      city: city,
      lat: lat,
      lon: lon
   };
   cityArray.push(newCity);
   appendButtonCitySearchHistory(city);
   saveCitiesToLocalStorage(cityArray);
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

// Function to render weather data to the Today area of the webpage
function renderWeatherForCurrCity(cityName) {
   let currWeatherData = getCurrCityWeatherFromLocalStorage();
   if(currWeatherData) {
      $("#today-city").text(`${cityName} (${currWeatherData[0].day}, ${currWeatherData[0].date})`);
      todayIcon.src = 'https://openweathermap.org/img/w/' + currWeatherData[0].icon + '.png';
      //$("#today-icon").parent().css({position: 'relative'});
      let width = todayArea.getBoundingClientRect().width;
      $("#today-icon").css({top: -40, left: (width/2)+50, position:'relative'});
      $("#today-desc").text(`(${currWeatherData[0].desc})`);

      $("#today-desc").css({top: -50, left: (width/2)+30, position:'relative'});
      todayIcon.width = "100";
      todayIcon.height = "100";

      todayDescEl.style.textTransform = "capitalize";

      $("#today-temp").text(`Temp: ${currWeatherData[0].temp} \u00B0F`);
      $("#today-wind").text(`Wind: ${currWeatherData[0].wind} MPH`);
      $("#today-humidity").text(`Humidity: ${currWeatherData[0].humidity}%`);

      showForecastData(true);
   }
}

// Function to move the Today weather icon when the width of the browser changes
function moveTodayIcon() {
   let width = todayArea.getBoundingClientRect().width;
   console.log(width);
   $("#today-icon").css({left: (width/2)+50, position:'relative'});
   $("#today-desc").css({left: (width/2)+30, position:'relative'});
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
      if(cityExistsInLocalStorage(cityEntered)) {
         let cityArray = getCitiesArrayFromLocalStorage();
         // Loop through the cityArray to get Lat/Lon coordinates (may need to update city name (paris -> Paris))
         for(let i=0; i<cityArray.length; i++) {
            if(cityArray[i].city.toUpperCase() == cityEntered.toUpperCase()) {
               lat = cityArray[i].lat;
               lon = cityArray[i].lon;
               if(!cityIsExactMatch) {
                  cityArray[i].city = cityEntered;
                  // Update Button textContent
                  for(const child of citiesSearchedEl.children) {
                     if(child.textContent.toUpperCase() == cityEntered.toUpperCase()) {
                        child.textContent = cityEntered;
                        break;
                     }
                  }
                  // Update localStorage
                  saveCitiesToLocalStorage(cityArray);
               }
               break;
            }
         }
      }
      else {
         // Get the Lat/Lon coordinates of the city
         fetchLatLonForCity(cityEntered)
            .then(data => {
               lat = data[0].lat;
               lon = data[0].lon;
               addNewCityToLocalStorage(cityEntered,lat,lon) })
            .catch(error => {
               window.alert('The city you entered is not valid.  Please try again.')
               return; })
      }
      // Get Weather Data
      $("#city-name").val('');
      debugger;
      GetWeatherDataAndSaveItToLocalStorage(cityEntered,lat,lon);
      renderWeatherForCurrCity(cityEntered);
   }
});

// Function to handle when Cities in History are clicked
function handleBtnCityHistoryClick(event) {
   const btnClicked = $(event.target);
   city = btnClicked[0].innerText;
   citiesArray = getCitiesArrayFromLocalStorage();
   for(let i=0; i<cityArray.length; i++) {
      if(cityArray[i].city.toUpperCase() == city.toUpperCase()) {
         GetWeatherDataAndSaveItToLocalStorage(city,cityArray[i].lat,cityArray[i].lon);
         renderWeatherForCurrCity(city);
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
   let currCity = getCurrCityName();
   if(currCity) {
      renderWeatherForCurrCity(currCity);
   }
});

// Capture the Resizing of the browser window
$(window).on("resize", function() {
   moveTodayIcon();
});
