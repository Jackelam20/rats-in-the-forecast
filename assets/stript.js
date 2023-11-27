document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded event fired!");
    const weatherForm = document.getElementById("weatherForm");
    const cityInput = document.getElementById("cityInput");
    const weatherForecastDiv = document.getElementById("weatherForecast");
    const fiveDayForecastDiv = document.getElementById("fiveDayForecast");
    const searchHistoryList = document.getElementById("searchHistory");
    const clearHistoryButton = document.getElementById("clearHistoryButton");
    const ratForecastAppKey = 'c7f0df48919e4a75f91e9cfc665f3105'; 


  
  function fetchWeatherData(cityName) {
    console.log("Fetching weather data for:", cityName);

    if (!cityName.trim()) {
        
        console.error("Empty city name. Please enter a valid city name.");
        weatherForecastDiv.textContent = "Please enter a valid city name.";
        return;
      }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${ratForecastAppKey}&units=imperial`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("City not found. Please check your spelling and try again.");
        }
        return response.json();
      })
      .then(data => {
        console.log("Weather data fetched successfully:", data);
        
        const city = data.name;
        const weatherDescription = data.weather[0].description;
        const temperature = data.main.temp;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;

        
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);

        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

       
        weatherForecastDiv.innerHTML = `
          <h3>Today in ${city} <img src="${iconUrl}" alt="Weather Icon"></h3>
          <p>Date: ${formattedDate}</p>
          <p>Description: ${weatherDescription}</p>
          <p>Temperature: ${temperature} °F</p>
          <p>Humidity: ${humidity}%</p>
          <p>Wind Speed: ${windSpeed} mph</p>
          
        `;

       
        fetchFiveDayForecast(cityName);

        
        if (!isCityInSearchHistory(cityName)) {
          addToSearchHistory(cityName);
        }
      })
      .catch(error => {
        console.error("Error fetching weather data:", error);
        weatherForecastDiv.textContent = "City not found. Please check your spelling and try again.";
      });
  }

  
 
  async function fetchFiveDayForecast(cityName) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${ratForecastAppKey}&units=imperial`;
  
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("City not found. Please check your spelling and try again.");
    }
    const data = await response.json();
  
    
    const forecastList = data.list.filter(forecast => {
      const date = new Date(forecast.dt * 1000);
      const today = new Date();
      return date.getDate() !== today.getDate(); 
    });
  
    displayFiveDayForecast(forecastList); 
  }


function displayFiveDayForecast(forecastList) { 
    fiveDayForecastDiv.innerHTML = "";
  
    if (!Array.isArray(forecastList)) {
      console.error("Invalid forecast data. Expected an array.");
      return;
    }
  
    if (forecastList.length === 0) {
     
      fiveDayForecastDiv.textContent = "No 5-day forecast data available.";
      return;
    }

    
    const fiveDayWeather = [];

    
    for (const forecast of forecastList) {
      const date = new Date(forecast.dt * 1000); 
      const existingDay = fiveDayWeather.find(item => item.date === formatDate(date));

      if (!existingDay) {
        fiveDayWeather.push({
          date: formatDate(date),
          minTemp: forecast.main.temp_min,
          maxTemp: forecast.main.temp_max,
          humidity: forecast.main.humidity,
          weatherDescription: forecast.weather[0].description,
          iconCode: forecast.weather[0].icon,
          windSpeed: forecast.wind.speed,
        });
      } else {
        if (forecast.main.temp_min < existingDay.minTemp) {
          existingDay.minTemp = forecast.main.temp_min;
        }
        if (forecast.main.temp_max > existingDay.maxTemp) {
          existingDay.maxTemp = forecast.main.temp_max;
        }
      }
    }

   
    for (const day of fiveDayWeather) {
      const iconUrl = `https://openweathermap.org/img/w/${day.iconCode}.png`;

      const dayDiv = document.createElement("div");
      dayDiv.classList.add("day-forecast");

      dayDiv.innerHTML = `
        <p>${day.date}</p>
        <p>Wind Speed: ${day.windSpeed} mph</p>
        <p>Description: ${day.weatherDescription}</p>
        <p>Max Temperature: ${day.maxTemp.toFixed(2)} °F</p>
        <p>Humidity: ${day.humidity}%</p>
        <img src="${iconUrl}" alt="Weather Icon">
      `;

      fiveDayForecastDiv.appendChild(dayDiv);
    }
  }
 
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  }
  
   
    function addToSearchHistory(cityName) {
      const listItem = document.createElement("li");
      listItem.textContent = cityName;
      listItem.classList.add("search-history-item");
  
     
      listItem.addEventListener("click", function () {
        cityInput.value = cityName;
        fetchWeatherData(cityName);
      });
  
      searchHistoryList.appendChild(listItem);
  
      
      const searchHistory = getSearchHistory();
      if (searchHistory.indexOf(cityName) === -1){
        searchHistory.push(cityName);
      }
      
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
  

    function getSearchHistory() {
      const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
      return searchHistory;
    }
  

    function isCityInSearchHistory(cityName) {
      const searchHistory = getSearchHistory();
      return searchHistory.includes(cityName);
    }
  

    function displaySearchHistory() {
      const searchHistory = getSearchHistory();
  
    
      if (searchHistory.length > 0) {
        searchHistoryList.innerHTML = ""; 
  
       
        for (const city of searchHistory) {
          addToSearchHistory(city);
        }
      }
    }


  function clearSearchHistory() {
    localStorage.removeItem("searchHistory");
    searchHistoryList.innerHTML = "";
  }

weatherForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const cityName = cityInput.value;
    console.log("Form submitted with city:", cityName);
    fetchWeatherData(cityName);
  });

 
  clearHistoryButton.addEventListener("click", function () {
    clearSearchHistory();
  });

  displaySearchHistory();
})