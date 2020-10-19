let map;
let infoWindow;
let markers = [];

function initMap() {
  let losAngeles = {
    lat: 34.06338,
    lng: -118.35808,
  };
  map = new google.maps.Map(document.getElementById("map"), {
    center: losAngeles,
    zoom: 11,
  });
  infoWindow = new google.maps.InfoWindow();
}

const onEnter = (e) => {
  if (e.key == "Enter") {
    getStores();
  }
};

const clearLocations = () => {
  infoWindow.close();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
};

const noStoresFound = () => {
  const html = `
        <div class="no-stores-found">
            No Stores Found
        </div>
    
    `;
  document.querySelector(".stores-list").innerHTML = html;
};

const searchLocationsNear = (stores) => {
  let bounds = new google.maps.LatLngBounds();
  stores.map((store, index) => {
    let latlng = new google.maps.LatLng(
      store.location.coordinates[1],
      store.location.coordinates[0]
    );
    let location = `${store.location.coordinates[1]},${store.location.coordinates[0]}`;
    let name = store.storeName;
    let address = store.addressLines[0];
    let openStatusText = store.openStatusText;
    let phone = store.phoneNumber;
    bounds.extend(latlng);
    createMarker(
      latlng,
      name,
      address,
      index + 1,
      openStatusText,
      phone,
      location
    );
  });
  map.fitBounds(bounds);
};

const createMarker = (
  latlng,
  name,
  address,
  storeNumber,
  openStatusText,
  phone,
  location
) => {
  let html = `
        <div class="store-info-window">
        <div class="store-info-name">
        ${name}
        </div>
        <div class="store-info-open-status">
        ${openStatusText}
        </div>
        <div class="store-info-address">
        <div class="icon">
        <i class="fas fa-location-arrow"></i>
        </div>
        <span>
        <a href=https://www.google.com/maps/search/?api=1&query=${location}>${address}</a>
        </span>
        </div>
        <div class="store-info-phone">
        <div class="icon">
        <i class="fas fa-phone-alt"></i>
        </div>
        <span>
        <a href="tel:${phone}">${phone}</a>
        </span>
        </div>
        </div>
        
        `;
  let marker = new google.maps.Marker({
    position: latlng,
    map: map,
    label: `${storeNumber}`,
  });
  google.maps.event.addListener(marker, "click", () => {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });
  markers.push(marker);
};

const getStores = () => {
  const zipCode = document.getElementById("zip-code").value;
  if (!zipCode) {
    return;
  }
  const API_URL = "https://lit-gorge-01349.herokuapp.com/api/stores/";
  const fullUrl = `${API_URL}?zip_code=${zipCode}`;
  fetch(fullUrl)
    .then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .then((data) => {
      if (data.length > 0) {
        clearLocations();
        searchLocationsNear(data);
        setStoresList(data);
        setOnClickListener();
      } else {
        clearLocations();
        noStoresFound();
      }
    });
};

const setStoresList = (stores) => {
  let html = "";
  stores.map((store, index) => {
    html += `
            <div class="store-container">
            <div class="store-container-background">
            <div class="store-info-container">
                        <div class="store-address"><span>${
                          store.addressLines[0]
                        }</span><span>${store.addressLines[1]}</span></div>
                        <div class="store-phone-number">${
                          store.phoneNumber
                        }</div>
                    </div>
                    <div class="store-number-container">
                        <div class="store-number">${index + 1}</div>
                    </div>
                </div>
            </div>
        `;
  });
  document.querySelector(".stores-list").innerHTML = html;
};

const setOnClickListener = () => {
  let storeElements = document.querySelectorAll(".store-container");
  storeElements.forEach((e, index) => {
    e.addEventListener("click", () => {
      google.maps.event.trigger(markers[index], "click");
    });
  });
};
