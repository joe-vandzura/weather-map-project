var accessToken = MAPBOX_API_KEY;

mapboxgl.accessToken = accessToken;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    zoom: 1,
    center: [-98.4916, 29.4252]
});

let markers = [];

function changeZoom(zoom) {
    map.setZoom(zoom);
}

function doSearch(event) {
    event.preventDefault();
    let input = $("#search-input")[0].value;
    pinThatAddress(input);
    $("#search-input")[0].value = "";
}

function pinThatAddress(address) {
    geocode(address, accessToken)
        .then(function (result) {
            const marker = new mapboxgl.Marker({"color": "red"});
            marker.setLngLat(result);
            marker.addTo(map);
            map.setCenter(result);
            map.setZoom(10);
            markers.push(marker);

            getWeatherData(marker, address, result);

        }).catch((function (error) {
        console.log("Not a place");
    }));
}

function createPopUp(marker, address, data) {
    console.log(data);
    const popUp = new mapboxgl.Popup();
    popUp.setHTML(
        '<h3 class="text-capitalize mt-0 text-center">' + address + '</h3>' +
        '<div class="card"></div>' +
        '<div class="card-body m-0 p-0">' +
        '<h5>'+ Math.round(data.list[0].main.temp) + '°F</h5>' +
        '<h6 class="card-subtitle mb-2 text-muted">' + data.list[0].weather[0].description + '</h6>' +
        '<p class="card-text m-0">H: ' + Math.round(data.list[0].main.temp_max) + '°F</p>' +
        '<p class="card-text m-0">L:  ' + Math.round(data.list[0].main.temp_min) + '°F</p>' +
        '</div></div>'
    );
    marker.setPopup(popUp);
}

function getWeatherData(marker, address, result) {
    $.get("http://api.openweathermap.org/data/2.5/forecast", {
        APPID: NEW_OPENWEATHER_API_KEY,
        lat:    result[1],
        lon:   result[0],
        units: "imperial"
    }).done(function(data) {
        createPopUp(marker, address, data);
        weeklyForecast(marker, address, data);
    });
}


$("#hide-btn").click(function() {
    markers.forEach((marker) => {
        marker.remove();
    });
    $("#hide-btn").toggleClass("disabled");
    $("#unhide-btn").toggleClass("disabled");
});

$("#unhide-btn").click(function() {
    markers.forEach((marker) => {
        marker.addTo(map);
    });
    $("#unhide-btn").toggleClass("disabled");
    $("#hide-btn").toggleClass("disabled");
});

function weeklyForecast(marker, address, data) {
    let index = 0;
    let dayIndex = 1;
    $(".weekly-forecast").html("");
    for (let i = 0; i < 5; i++) {
        $(".weekly-forecast").append(
            '<div class="card weather-cards">' +
            '<img src="http://openweathermap.org/img/w/' + data.list[index].weather[0].icon + '.png" class="card-img-top">' +
            '<div class="card-body">' +
            '<h5 class="card-title"> Day ' + dayIndex + '</h5>' +
            '<p class="card-text">' + Math.round(data.list[index].main.temp) + '°F</p></div>' +
            '<ul>' +
            '<li class="list-group-item">Humidity: ' + Math.round(data.list[index].main.humidity) + '</li>' +
            '<li class="list-group-item">Wind: ' + (data.list[index].wind.speed).toFixed(1) + '</li>' +
            '<li class="list-group-item">Pressure: ' + Math.round(data.list[index].main.pressure) + '</li>' +
            '</ul></div>'
        );
        dayIndex++;
        index += 8;
    }
}