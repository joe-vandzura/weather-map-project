var accessToken = MAPBOX_API_KEY;

mapboxgl.accessToken = accessToken;

var map = new mapboxgl.Map({
    container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', zoom: 1, center: [-98.4916, 29.4252]
});

let markers = [];
let listOfPlaces = [];
const defaultThing = $("#default-card").clone();
let searchToast = new bootstrap.Toast($("#search-toast")[0]);
let nextToast = new bootstrap.Toast($("#next-toast")[0]);
let prevToast = new bootstrap.Toast($("#previous-toast")[0]);


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
    console.log(input);

    if (verifyAddress(input)) {
        searchToast.show();
        return;
    }
    listOfPlaces.unshift(input.trim().toLowerCase());
    pinThatAddress(input);
    $("#search-input")[0].value = "";
}

function verifyAddress(input) {
    console.log(listOfPlaces);
    return listOfPlaces.includes(input.toLowerCase());
}

function pinThatAddress(address) {
    removePreviousMakers();

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

function removePreviousMakers() {
    markers.forEach(marker => {
        marker.remove();
    });
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
        '<p class="card-text fs-2 text-center p-3">You are here.</p>'
    );
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

    addClearSearchButton(address);
}

function resetDataCard() {
    $("#restore-div").html("");
    $(".weather-cards").remove();
    $("#weekly-forecast").html("");
}

function addClearSearchButton(address) {
    $("#restore-div").append(
        '<div id="restore-btn-div" class="d-flex justify-content-between w-50">' +
        '<button id="previous-btn" class="btn btn-primary mt-3 border border-warning border-3">Previous</button>' +
        '<button id="restore-default-btn" class="btn btn-primary mt-3 border border-warning border-3">Clear Search</button>' +
        '<button id="next-btn" class="btn btn-primary mt-3 border border-warning border-3">Next</button>' +
        '</div>');

    if (listOfPlaces.length === 1) {
        $("#previous-btn").addClass("disabled");
        $("#next-btn").addClass("disabled");
    }

    $("#previous-btn").click(function() {
        previousSearch(address);
    });

    $("#restore-default-btn").click(restoreDefault);

    $("#next-btn").click(function() {
        nextSearch(address);
    });

}

function previousSearch(address) {
    let prevIndex = listOfPlaces.indexOf(address) + 1;
    if (prevIndex === listOfPlaces.length) {
        prevToast.show();
    } else {
        address = listOfPlaces[prevIndex];
        pinThatAddress(address);
    }
}

function restoreDefault() {
    map = new mapboxgl.Map({
        container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', zoom: 1, center: [-98.4916, 29.4252]
    });
    $(".weather-cards").remove();
    $("#weekly-forecast").append(defaultThing);
    $("#restore-btn-div").remove();
    listOfPlaces = [];
}

function nextSearch(address) {
    let nextIndex = listOfPlaces.indexOf(address) - 1;
    if (nextIndex < 0) {
        nextToast.show();
    } else {
        address = listOfPlaces[nextIndex];
        pinThatAddress(address);
    }
}

$(document).ready(function(){
    $("#page-load-modal").modal('show');
});