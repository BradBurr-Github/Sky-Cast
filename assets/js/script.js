// Elements in the DOM
const citiesSearchedEl = document.getElementById("cities-searched");
const fiveDayContainerEl = document.getElementById("five-day-container");

// OpenWeatherMap API calls
const apiGeoCoding = "http://api.openweathermap.org/geo/1.0/direct";
const apiWeatherLatLon = "http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=b1500c788d02c8dad12cb3af11f15c99"

// Global variables
const myAPIKey = "b1500c788d02c8dad12cb3af11f15c99";
let currLat = '';
let currLon = '';

function setLatLonFromCity(city) {

   let apiGeoCodingWithCity = `${apiGeoCoding}?q=${city}&limit=1&appid=${myAPIKey}`;
   fetch (apiGeoCodingWithCity)
     .then (function(response) {
      console.log(response);
       return response.json();       
     })
     .then (function(data) {
      console.log(data);
      currLat = data[0].lat;
      currLon = data[0].lon;
      console.log(currLat);
      console.log(currLon);
   });
}

$("#btn-search").on("click", function(event) {
   let cityEntered = $("#city-name").val().trim();
   if (!cityEntered) {
      window.alert("Please enter a valid city to continue.");
   }
   else {
      setLatLonFromCity(cityEntered);      
      console.log(currLat);
      console.log(currLon);
   }   
});

function fetchWeatherData() {
   
   fetch (apiURL)
     .then (function(response) {
      console.log(response);
       return response.json();       
     })
     .then (function(data) {
      console.log(data);
     });
}