

"use strict";
let map;
var infoWindow;
var markers = [];
const API_URL = 'http://localhost:3000/api/stores';

const onEnter = (e) => {
    if (e.key == "Enter") {
        getStores();
    }
}

function initMap() {
    let LosAngels = {
        lat: 34.063380,
        lng: -118.358000
    }
     map = new google.maps.Map(document.getElementById("map"), {
        center: LosAngels,
        zoom: 12,
    });
    infoWindow = new google.maps.InfoWindow();

} 

const noStoresFound = () => {
    const html = `
        <div class="no-stores-found">No stores found</div>
    `

    document.querySelector('.stores-list').innerHTML = html;
}

const getStores = () => {
    const zipCode = document.getElementById('zip-code').value;
    //console.log(zipCode);
    if (!zipCode) {
        return;
    }
    const fullUrl = `${API_URL}?zip_code=${zipCode}`;
    //console.log(fullUrl);
    fetch(fullUrl)
    .then ((response) => {
        if(response.status == 200) {
            return response.json();
        } else {
            throw new Error(response.status);
        }
    }).then((data)=> {
        if (data.length > 0) {
            clearLocation();
            searchLocationNear(data);   
            setStoreList(data)  
            setOnClickListener();
        } else {
            clearLocation();
            noStoresFound();
        }
        
    })
}

const clearLocation = () => {
    infoWindow.close();
         for (var i = 0; i < markers.length; i++) {
           markers[i].setMap(null);
         }
         markers.length = 0;
}

const setOnClickListener = () => {
    let storeElements = document.querySelectorAll('.store-container');
    storeElements.forEach((element, index) => {
        element.addEventListener('click', ()=> {
            google.maps.event.trigger(markers[index], 'click');
        })
        
    })
}

const setStoreList = (store) => {
    let storesHtml = '';
    store.forEach((store, index) => {
        storesHtml += `
            <div class="store-container">
                <div class="store-container-background">
                    <div class="store-info-container">
                    <div class="store-address">
                        <span>${store.addressLines[0]}</span>
                        <span>${store.addressLines[1]}</span>
                    </div>
                    <div class="store-phone-number">${store.phoneNumber}</div>
                    </div>
                    <div class="store-number-container">
                    <div class="store-number">
                        ${index+1}
                    </div>
                    </div>
                </div>
                
                </div> 
                `
    })
    document.querySelector('.stores-list').innerHTML = storesHtml;
}

const searchLocationNear = (stores) => {
    var bounds = new google.maps.LatLngBounds();
    console.log(stores[0]);
    stores.forEach((store, index)=> {
        var latlng = new google.maps.LatLng(
            store.location.coordinates[1],
            store.location.coordinates[0]);
        let name = store.storeName;
        let address = store.addressLines[0];
        let openStatusText = store.openStatusText;
        let phone = store.phoneNumber;
        bounds.extend(latlng);
        createMarker(latlng, name, address, openStatusText, phone, index+1);
        
    });
    map.fitBounds(bounds);
}

function addMarker(location, map) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    new google.maps.Marker({
    position: location,
    map: map
    });
}

const createMarker = (latlng, name, address, openStatus, phone, storeNumber) => {
    // let html = "<b>" + name + "</b> <br/>" + address;
    let html = `
        <div class="store-info-window">
            <div class="store-info-name">
                ${name}
            </div>
            <div class="store-info-open-status">
                ${openStatus}
            </div>
            <div class="store-info-address">
                <div class="icon">
                    <i class="fas fa-location-arrow"></i>
                </div>
                <span>
                    ${address}
                </span>
            </div>
            <div class="store-info-phone">
                <div class="icon">
                    <i class="fas fa-phone-alt"></i>
                </div>
                <span>
                    <a href="tel:${phone}"> ${phone}</a>
                </span>
            </div>
        </div>
        `;

    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        label: `${storeNumber}`
    });
    console.log(marker);
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
      });
      markers.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
      });
};
