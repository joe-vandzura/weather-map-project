var accessToken = MAPBOX_API_KEY;

mapboxgl.accessToken = accessToken;

var map = new mapboxgl.Map({
    container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', zoom: 1, center: [-98.4916, 29.4252]
});

let markers = [];
let listOfPlaces = [];
const defaultThing = $("#default-card").clone();


function increaseZoom() {
    let currentzoom = map.getZoom();
    currentzoom += 1;
    map.setZoom(currentzoom);
}

function changeZoom(zoom) {
    map.setZoom(zoom);
}

function decreaseZoom() {
    let currentzoom = map.getZoom();
    currentzoom -= 1;
    map.setZoom(currentzoom);
}

$("#modal-close-btn").click(() => {
    $("#page-load-modal").modal('hide');
});

function doSearch(event) {
    event.preventDefault();
    let input = $("#search-input")[0].value;
    listOfPlaces.unshift(input);
    pinThatAddress(input);
    $("#search-input")[0].value = "";
}

function pinThatAddress(address) {
    geocode(address, accessToken)
        .then(function (result) {
            const marker = new mapboxgl.Marker({"color": "blue"});
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

function getWeatherData(marker, address, result) {
    $.get("http://api.openweathermap.org/data/2.5/forecast", {
        APPID: NEW_OPENWEATHER_API_KEY,
        lat: result[1],
        lon: result[0], units: "imperial"
    }).done(function (data) {
        createPopUp(marker, address, data);
        weeklyForecast(marker, address, data);
    });
}

function createPopUp(marker, address, data) {
    const popUp = new mapboxgl.Popup({className: "pops"});
    popUp.setHTML(
        '<h1 class="text-capitalize text-center">' + address + '</h1>' +
        '<div class="card w-100">' +
        '<div class="d-flex flex-column justify-content-center card-body">' +
        '<p class="card-text fs-2 text-center">' + Math.round(data.list[0].main.temp) + '°F</p>' +
        '</div>' +
        '</div>');
    marker.setPopup(popUp);
    marker.togglePopup();
}


$("#remove-pins--btn").click(function () {
    map = new mapboxgl.Map({
        container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', zoom: 1, center: [-98.4916, 29.4252]
    });
    resetDataCard();
    $("#weekly-forecast").append(defaultThing);
});

function weeklyForecast(marker, address, data) {
    resetDataCard();
    let index = 0;
    let html = "";
    for (let i = 0; i < 5; i++) {
        var date = new Date(data.list[index].dt_txt);
        if (i === 0) {
            date = "Today";
        } else {
            date = date.toDateString().substring(0, 3);
        }
        html = $("#weekly-forecast").append('<div class="card w-100 weather-cards">' + '<div class="d-flex flex-column justify-content-center card-body">' + '<div class="d-flex ">' + '<h5 class="card-title">' + date + '</h5>' + '<div>' + '<img src="http://openweathermap.org/img/wn/' + data.list[index].weather[0].icon + '@2x.png" class="card-img-top">' + '</div>' + '<p class="card-text text-center">' + Math.round(data.list[index].main.temp) + '°F</p>' + '</div>' + '</div>' + '<ul id="weather-lists" class="m-0 px-5 pt-2 pb-4">' + '<li class="list-group-item">Humidity: ' + Math.round(data.list[index].main.humidity) + '</li>' + '<li class="list-group-item">Wind: ' + (data.list[index].wind.speed).toFixed(1) + '</li>' + '<li class="list-group-item">Pressure: ' + Math.round(data.list[index].main.pressure) + '</li>' + '</ul>' + '</div>'
        );
        index += 8;
    }
    $("#weekly-forecast").replaceWith(html);

    addClearSearchButton();
}

function resetDataCard() {
    $("#restore-div").html("");
    $(".weather-cards").remove();
    $("#weekly-forecast").html("");
}

function addClearSearchButton() {
    $("#restore-div").append(
        '<div id="restore-btn-div" class="d-flex justify-content-between w-50">' +
        '<button id="previous-btn" class="btn btn-primary mt-3 border border-warning border-3">Previous</button>' +
        '<button id="restore-default-btn" class="btn btn-primary mt-3 border border-warning border-3">Clear Search</button>' +
        '<button id="next-btn" class="btn btn-primary mt-3 border border-warning border-3">Next</button>' +
        '</div>');

    $("#restore-default-btn").click(restoreDefault);
}

function restoreDefault() {
    map = new mapboxgl.Map({
        container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', zoom: 1, center: [-98.4916, 29.4252]
    });
    $(".weather-cards").remove();
    $("#weekly-forecast").append(defaultThing);
    $("#restore-btn-div").remove();
}

$(document).ready(function(){
    $("#page-load-modal").modal('show');
});