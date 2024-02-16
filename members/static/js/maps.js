import { RESTAURANTS, TOURIST_ATTRACTIONS, HOTELS, COUNTRYCODE } from "./placeTypes.js";
let map, popup, Popup;
let marker_coordinates = [];
let country_name;

function handleSave(itenarary_item) {
  itenarary_saves.push(itenarary_item);
  const list = document.getElementById("list");
  const div = document.createElement("div");
  const p = document.createElement("p");
  for (let key in itenarary_item) {
    var modKey = key.toUpperCase();
    modKey = modKey.replace(/_/g, " ");
    p.innerHTML += `<strong><u>${modKey}</u></strong>: ${itenarary_item[key]} <br>`;
  }
  div.appendChild(p);
  div.className = "itenarary_item";
  list.appendChild(div);
}

function getLocationInfo(location) {
  let locationTypes = [];
  for (let type of location.types) {
    if (
      type === "restaurant" ||
      type === "lodging" ||
      type === "tourist_attraction"
    ) {
      locationTypes.push(type);
    }
  }
  if (locationTypes.length === 0) {
    locationTypes.push(location.types[0]);
  }

  console.log(location);
  return {
    name: location.name,
    address: location.vicinity ? location.vicinity : location.formatted_address,
    reviews: location.user_ratings_total,
    rating: location.rating,
    type: locationTypes,
  };
}

console.log(RESTAURANTS);
let itenarary_saves = [];
let places;
let markers = [];
const MARKER_PATH =
  "https://developers.google.com/maps/documentation/javascript/images/marker_green";

function displayDropDown() {
  document.getElementById("dropdown").classList.toggle("display");
}

window.addEventListener("click", function (event) {
  if (!event.target.matches("#select-button")) {
    let dropdowns = document.getElementsByClassName("dropdown-buttons");
    for (let dropdown of dropdowns) {
      let openDropDown = dropdown;
      if (openDropDown.classList.contains("display")) {
        openDropDown.classList.remove("display");
      }
    }
  }
});

document
  .getElementById("select-button")
  .addEventListener("click", displayDropDown);

function initMap() {
  const startLatLng = { lat: 49.2827, lng: -123.1207 };
  const options = {
    zoom: 14,
    center: startLatLng,
  };
  //credit: https://developers.google.com/maps/documentation/javascript/examples/overlay-popup
  /**
   * A customized popup on the map.
   */
  class Popup extends google.maps.OverlayView {
    position;
    containerDiv;
    constructor(position, content) {
      super();
      this.position = position;
      content.classList.add("popup-bubble");

      // This zero-height div is positioned at the bottom of the bubble.
      const bubbleAnchor = document.createElement("div");

      bubbleAnchor.classList.add("popup-bubble-anchor");
      bubbleAnchor.appendChild(content);

      // This zero-height div is positioned at the bottom of the tip.
      this.containerDiv = document.createElement("div");
      this.containerDiv.classList.add("popup-container");
      this.containerDiv.appendChild(bubbleAnchor);

      // Optionally stop clicks, etc., from bubbling up to the map.
      Popup.preventMapHitsAndGesturesFrom(this.containerDiv);
    }
    /** Called when the popup is added to the map. */
    onAdd() {
      this.getPanes().floatPane.appendChild(this.containerDiv);
    }
    /** Called when the popup is removed from the map. */
    onRemove() {
      if (this.containerDiv.parentElement) {
        this.containerDiv.parentElement.removeChild(this.containerDiv);
      }
    }
    /** Called each frame when the popup needs to draw itself. */
    draw() {
      const divPosition = this.getProjection().fromLatLngToDivPixel(
        this.position
      );
      // Hide the popup when it is far out of view.
      const display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
          ? "block"
          : "none";

      if (display === "block") {
        this.containerDiv.style.left = divPosition.x + "px";
        this.containerDiv.style.top = divPosition.y + "px";
      }

      if (this.containerDiv.style.display !== display) {
        this.containerDiv.style.display = display;
      }
    }
  }
  //end credit

  const map = new google.maps.Map(document.getElementById("map"), options);
  places = new google.maps.places.PlacesService(map);
  let location_info = [];

  //search bar
  let input = document.getElementById("search");
  let clear = document.getElementById("clear-button");
  let searchBox = new google.maps.places.SearchBox(input);
  clear.addEventListener("click", () => {
    input.value = "";
  });
  clear.addEventListener("click", () => {
    input.value = "";
  });
  //makes sure that the search is only limited to the bounds of the map box
  map.addListener("bounds_changed", function () {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];
  searchBox.addListener("places_changed", function () {
    let places = searchBox.getPlaces();
    //if array is empty dont want to do any other work with places
    if (places.length === 0) {
      return;
    }
    //takes callback function taking the curernt marker for that iteration and using null to get rid of the map reference
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    //re-init to an empty array
    markers = [];
    let bounds = new google.maps.LatLngBounds();
    places.forEach(function (place) {
      if (!place.geometry) {
        return;
      }
      console.log(">>> jy place", place);
      let marker = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location,
        placeResult: place,
      });
      marker.content = createPopupContent(marker, marker.placeResult);

      markers.push(marker);

      console.log("coordinates", place.geometry.location.lat());
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    markers.forEach((marker) => {
      google.maps.event.addListener(marker, "click", function (event) {
        marker_coordinates.push(event.latLng.lat());
        marker_coordinates.push(event.latLng.lng());
        console.log(marker_coordinates);
      });
      marker.addListener("click", function () {
        displayPopup(marker, marker.placeResult);
      });
      location_info.push({
        index: [{ lat: marker.lat }, { lng: marker.lng }],
      });
      index += 1;
      console.log(location_info);
    });
    map.fitBounds(bounds);
  });
  function dropMarker(i) {
    return function () {
      markers[i].setMap(map);
    };
  }

  function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
      if (markers[i]) {
        markers[i].setMap(null);
      }
    }

    markers = [];
  }

  //credit: https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-hotelsearch
  function filter(type) {
    const search = {
      bounds: map.getBounds(),
      types: [type],
    };
    places.nearbySearch(search, (results, status, pagniation) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // console.log(results);
        clearResults();
        clearMarkers();
        for (let i = 0; i < results.length; i++) {
          const markerLetter = String.fromCharCode(
            "A".charCodeAt(0) + (i % 26)
          );
          const markerIcon = MARKER_PATH + markerLetter + ".png";
          markers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon,
          });
          // If the user clicks a hotel marker, show the details of that hotel
          // in an info window.
          markers[i].placeResult = results[i];
          //end credit
          google.maps.event.addListener(markers[i], "click", function (event) {
            marker_coordinates.push(event.latLng.lat());
            marker_coordinates.push(event.latLng.lng());
            console.log("filter marker coordinates: ", marker_coordinates);
          });
          google.maps.event.addListener(markers[i], "click", () =>
            displayPopup(markers[i], results[i])
          );

          setTimeout(dropMarker(i), i * 100);
          addResult(results[i], i);
        }
      }
    });
  }

  function createPopupContent(marker, place) {
    country_name = place.plus_code["compound_code"].split(", ").pop();
    console.log(
      "place test",
      country_name
      // place.plus_code["compound_code"].split(", ").pop()
    );
    let container = document.createElement("div");
    let button = document.createElement("button");
    let weatherButton = document.createElement("button");
    weatherButton.innerText = "Weather";
    button.innerText = "Save";
    button.className = "filterSaveButton";

    weatherButton.addEventListener("click", () => {
      getWeatherForLocation(marker_coordinates.splice(-2))
    });

    button.addEventListener("click", () => {
      let info = getLocationInfo(place);
      handleSave(info);
    });

    let { name, rating, user_ratings_total, vicinity, formatted_address } =
      marker.placeResult;

    container.className = "popup-content";
    container.innerHTML = `${name} <br> Average Rating: ${rating} <br> Total Number of User Ratings:  ${user_ratings_total} <br> ${
      vicinity ? vicinity : formatted_address
    } <br> `;
    container.appendChild(button);
    container.appendChild(weatherButton);
    return container;
  }

  function displayPopup(marker, place) {
    let content = createPopupContent(marker, place);
    console.log("marker position", marker.position.lat);
    let popup = new Popup(marker.position, content);
    map.addListener("click", function () {
      popup.setMap(null);
    });
    popup.setMap(map);
  }

  let restaurantButton = document.getElementById("restaurants");
  let hotelsButton = document.getElementById("hotels");
  let touristAttractionsButton = document.getElementById("tourist_attractions");
  restaurantButton.addEventListener("click", () => filter(RESTAURANTS));
  hotelsButton.addEventListener("click", () => filter(HOTELS)); //
  touristAttractionsButton.addEventListener("click", () =>
    filter(TOURIST_ATTRACTIONS)
  );
  //>>>
}

function clearResults() {
  const results = document.getElementById("results");

  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}
//credit: https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-hotelsearch

function addResult(result, i) {
  const results = document.getElementById("results");
  const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
  const markerIcon = MARKER_PATH + markerLetter + ".png";
  const tr = document.createElement("tr");

  tr.style.backgroundColor = i % 2 === 0 ? "#F6E0B3" : "#FFFFE0";
  tr.onclick = function () {
    google.maps.event.trigger(markers[i], "click");
  };

  const iconTd = document.createElement("td");
  const nameTd = document.createElement("td");
  const icon = document.createElement("img");
  const button = document.createElement("button");
  button.innerText = "Save";
  icon.src = markerIcon;
  icon.setAttribute("class", "placeIcon");
  icon.setAttribute("className", "placeIcon");

  const name = document.createTextNode(result.name);
  let itenarary_item = getLocationInfo(result);
  nameTd.appendChild(name);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
  tr.appendChild(button);
  button.addEventListener("click", () => handleSave(itenarary_item));
}
//end credit

window.initMap = initMap;

function saveBusinesses() {
  console.log("Save button has been clicked");
  let businessData = itenarary_saves;
  fetch("/business/new/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(businessData),
  })
    .then((response) => response.json())
    .then((result) => {
      alert("Itinerary saved successfully!")
      // Handle the response from the Django backend
      console.log(result);
      itenarary_saves = []; // Clear the array
      businessData = [];
      var businesses = document.getElementsByClassName("itenarary_item");
      while (businesses.length > 0) {
        businesses[0].remove();
      }
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
}

const businessSaveButton = document.getElementById("save-button");
businessSaveButton.addEventListener("click", saveBusinesses);
window.addEventListener("click", function (event) {
  if (!event.target.matches("#select-button")) {
    let dropdowns = document.getElementsByClassName("dropdown-buttons");
    for (let i = 0; i < dropdowns.length; i++) {
      let openDropDown = dropdowns[i];
      if (openDropDown.classList.contains("display")) {
        openDropDown.classList.remove("display");
      }
    }
  }
});
const currencyDisplay = document.getElementById("currencydisplay");
const currencyConvertButton = document.getElementById("converterbutton");

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

currencyConvertButton.addEventListener("click", function (event){
  let sourceCountryCur = document.getElementById("source_country").value;
  let targetCountryCur = document.getElementById("target_country").value;
  let currencyAmount = document.getElementById("amount").value;
  if (!sourceCountryCur || !targetCountryCur || !currencyAmount ){
    alert("Must have values to convert currency. Please try again.")
  } else {
    console.log(sourceCountryCur, targetCountryCur, currencyAmount)
    fetch("https://api.freecurrencyapi.com/v1/latest?apikey=CgEOWBd1EiC5ux0RqxXDRml6xpKh31hCYJliaZzD&currencies=EUR%2CUSD%2CJPY%2CBGN%2CCZK%2CDKK%2CGBP%2CHUF%2CPLN%2CRON%2CSEK%2CCHF%2CISK%2CNOK%2CHRK%2CRUB%2CTRY%2CAUD%2CBRL%2CCAD%2CCNY%2CHKD%2CIDR%2CILS%2CINR%2CKRW%2CMXN%2CMYR%2CNZD%2CPHP%2CSGD%2CTHB%2CZAR&base_currency=CAD")
    .then(function(response){
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch currency data.");
      }
    })
    .then(function(data){
      console.log(data)
      const exchangeRates = data.data;
      let sourceCountry = getKeyByValue(COUNTRYCODE, sourceCountryCur);
      let targetCountry = getKeyByValue(COUNTRYCODE, targetCountryCur);
      console.log(sourceCountry, targetCountry)
      console.log(exchangeRates)
      const sourceRate = exchangeRates[sourceCountry];
      const targetRate = exchangeRates[targetCountry];
        if (sourceRate && targetRate) {
          const convertedAmount = ((currencyAmount / sourceRate) * targetRate).toFixed(2);
          console.log(convertedAmount);
          var pConvertedAmount = document.getElementById("TotalOfConversion")
          if (!pConvertedAmount) {
            const pOfAmount = document.createElement("p");
            pOfAmount.setAttribute("id", "TotalOfConversion")
            const node = document.createTextNode(`Converted amount: ${convertedAmount}`);
            pOfAmount.appendChild(node);
            currencyDisplay.appendChild(pOfAmount);
          } else {
            pConvertedAmount.innerHTML = `Converted amount: ${convertedAmount}`
          };
        } else {
          throw new Error("Invalid source or target currency.");
        }
    })
  }
});

const googleMapsScript = document.createElement("script");
googleMapsScript.src =
  "https://maps.googleapis.com/maps/api/js?language=en&key=AIzaSyCEE6-JSPCe6zNZuAoIPog0ELD2-UyO3CM&libraries=places&callback=initMap&libraries=places&v=weekly";
document.body.appendChild(googleMapsScript);

const APIKEY = "d0b6c9ade1db30fe160940ff847a63cb"
const weatherButton = document.getElementById("clear-button");
// import { marker_coordinates } from "./maps";

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
      };

      let dailyWeather = data.daily;
      let weekWeather = [];

      for (let index = 0; index < dailyWeather.length; index++) {
        let temp = dailyWeather[index].temp["day"];
        let weatherIcon = dailyWeather[index].weather[0]["icon"];
        let day = {
          "weekday": week[index],
          "data": [`${(temp - 273.15).toFixed(2)}°C`, dailyWeather[index].weather[0]["main"], weatherIcon]
        };
        weekWeather.push(day);
        console.log(day);
      }

      const weather = document.getElementById("weatherdiv");


      while (weather.lastChild) {
        weather.removeChild(weather.lastChild);
      } 

      for (let day of weekWeather) {
        console.log(day);
        let dailyDiv = document.createElement("div");
        let dayWeatherIcon = day.data[2];
        dailyDiv.id = "weather-daily";
        const dayImage = document.createElement("img");
        dayImage.src = `https://openweathermap.org/img/wn/${dayWeatherIcon}.png`;
        dayImage.classList.add("weather-icon");
        let contentWrapper = document.createElement("span");
        let content = document.createTextNode(day.weekday + "\n" + day.data[0] + "\n" + day.data[1]);
        contentWrapper.style = "padding: 10px;"
        contentWrapper.appendChild(content);
        dailyDiv.appendChild(contentWrapper);
        dailyDiv.append(dayImage);
        weather.appendChild(dailyDiv);
      }
    })
    .catch(error => {
      console.error(error);
    });
}