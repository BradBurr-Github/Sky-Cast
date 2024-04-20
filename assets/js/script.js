// Elements in the DOM
const citiesSearchedEl = document.getElementById("cities-searched");
const todayArea = document.getElementById("today-area");
const todayCityEl = document.getElementById("today-city");
const todayIcon = document.getElementById("today-icon");
const fiveDayContainerEl = document.getElementById("five-day-container");

// OpenWeatherMap API calls
const apiGeoCoding = "http://api.openweathermap.org/geo/1.0/direct";
const apiCurrWeatherLatLon = "http://api.openweathermap.org/data/2.5/weather"
const apiFiveDayForecastWeatherLatLon = "https://api.openweathermap.org/data/2.5/forecast"

// Global variables
const myAPIKey = "b1500c788d02c8dad12cb3af11f15c99";
let currLat = '';
let currLon = '';
let result = '';

// Function to show or hide 5-day forecast cards
function showFiveDayCards(showCards) {
   if (showCards) {
      fiveDayContainerEl.style.display = "inline";
   }
   else {
      fiveDayContainerEl.style.display = "none";
   }
}

// Function to read cities from localStorage
function getCitiesFromLocalStorage() {
   let cityArray = JSON.parse(localStorage.getItem("owm-cities"));
   if (!cityArray) {
      cityArray = [];
    }
    return cityArray;
};

// Function to update cities in localStorage
function saveCitiesToLocalStorage(cityArray) {
   localStorage.setItem('owm-cities',JSON.stringify(cityArray));
}

function getCurrCityWeatherFromLocalStorage() {
   let currCityData = JSON.parse(localStorage.getItem("owm-curr-city"));
   if (!currCityData) {
      currCityData = [];
    }
    return currCityData;
}

// Function to save current city's weather data to localStorage
function saveCurrCityWeatherToLocalStorage(city,data) {
   let day = dayjs().format('ddd');
   const currCity = {
      city: city,
      day: dayjs().format('ddd'),
      date: dayjs().format('M/D/YY'),
      icon: data.weather[0].icon,
      temp: data.main.temp,
      wind: data.wind.speed,
      humidity: data.main.humidity,
      desc: data.weather[0].description
    };
    localStorage.setItem('owm-curr-city',JSON.stringify(currCity));
}

// Chain promises together so they are all done before returning
const getLatLonForCity = async (city) => {
   let apiGeoCodingWithCity = `${apiGeoCoding}?q=${city}&limit=1&appid=${myAPIKey}`;
   const response = await fetch(apiGeoCodingWithCity);
   const data = await response.json();
   return data;
};

// Function to update localStorage
function addNewCityToLocalStorage(city,lat,lon) {
   let updated = false;
   let foundCity = false;
   let cityArray = getCitiesFromLocalStorage();
   // Loop through the cityArray - may need to update city name (paris -> Paris)
   for(let i=0; i<cityArray.length; i++) {
      if(cityArray[i].city.toUpperCase() == city.toUpperCase()) {
         foundCity = true;
         cityArray[i].city = city;
         updated = true;
         // Update Button textContent
         for(const child of citiesSearchedEl.children) {
            if(child.textContent.toUpperCase() == city.toUpperCase()) {
               child.textContent = city;
               break;
            }}
         break;
      }
   }
   // Add new city to the cityArray
   if(!foundCity) {
      const newCity = {
         city: city,
         lat: lat,
         lon: lon
       };
       cityArray.push(newCity);
       updated = true;
       appendButtonCitySearchHistory(city);
   }
   if(updated) {
      saveCitiesToLocalStorage(cityArray);
      console.log(`SAVED: ${city}`);
   }
};

// Function to fetch weather data
const fetchCurrWeatherData = async (lat, lon) => {
   let apiWeatherWithLanLon = `${apiCurrWeatherLatLon}?lat=${lat}&lon=${lon}&units=imperial&appid=${myAPIKey}`;
   const response = await fetch(apiWeatherWithLanLon);
   const data = await response.json();
   return data;
}

// Function to fetch weather data
const fetchFiveDayWeatherData = async (lat, lon) => {
   let apiFiveDayForecastWithLanLon = `${apiFiveDayForecastWeatherLatLon}?lat=${lat}&lon=${lon}&units=imperial&appid=${myAPIKey}`;
   const response = await fetch(apiFiveDayForecastWithLanLon);
   const data = await response.json();
   return data;
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
   cityArray = getCitiesFromLocalStorage();
   for(let i=0; i<cityArray.length; i++) {
      appendButtonCitySearchHistory(cityArray[i].city);
   }
}

// Function to render weather data to the page
function renderWeatherForCurrCity() {
   let currWeather = getCurrCityWeatherFromLocalStorage();
   if(currWeather) {
      debugger;
      todayCityEl.textContent = `${currWeather.city} (${currWeather.day}, ${currWeather.date})`;
      todayIcon.src = 'https://openweathermap.org/img/w/' + currWeather.icon + '.png'
   }
}

// On Click event for the SEARCH button
$("#btn-search").on("click", function(event) {
   let cityEntered = $("#city-name").val().trim();
   if (!cityEntered) {
      window.alert("Please enter a valid city to continue.");
   }
   else {
      getLatLonForCity(cityEntered)
         .then(data => {
            fetchCurrWeatherData(data[0].lat,data[0].lon)
               .then(data => {
                  console.log(data);
                  addNewCityToLocalStorage(cityEntered,data.coord.lat,data.coord.lon)
                  saveCurrCityWeatherToLocalStorage(cityEntered,data);
                  renderWeatherForCurrCity();
                  $("#city-name").val('');
               })
               .catch(error => window.alert('Unable to retrieve Weather Information.'));
         })
         .catch(error => window.alert('The city you entered is not valid.  Please try again.'));
   }   
});

// Runs when the page loads
$(document).ready(function () {
   // Hide Five Day forecast cards at first
   showFiveDayCards(false);
   // Render buttons to the screen
   renderButtonsCitySearchHistory();
 });
