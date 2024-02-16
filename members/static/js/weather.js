const APIKEY = "d0b6c9ade1db30fe160940ff847a63cb"
const weatherButton = document.getElementById("clear-button")
import { marker_coordinates } from "./maps";

console.log("testHelo");

function getWeatherForLocation(coordinates) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${APIKEY}`)
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
  })
  .then(data => {

    const week = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
        7: "Sunday"
    }

    let dailyWeather = data.daily
    let weekWeather = [];

    for (let index = 0; index < dailyWeather.length; index++) {
        
        let temp = dailyWeather[index].temp["day"];
        let weatherIcon = dailyWeather[index].weather[0]["icon"]; 
        let day = {
            "weekday": week[index],
            "data": [`${(temp - 273.15).toFixed(2)}°C`, dailyWeather[index].weather[0]["main"], weatherIcon]
        }
        weekWeather.push(day);  
        console.log(day);
    }
})
  .catch(error => {
    console.error(error);
  });
  };
weatherButton.addEventListener("click", getWeatherForLocation(marker_coordinates.slice(-2)))