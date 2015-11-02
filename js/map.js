var app = angular.module('AngularGoogleMap', ['google-maps']);

var alertBox = document.getElementById('alertbox');

app.factory('MarkerCreatorService', function () {

    var markerId = 0;

    function create(latitude, longitude) {
        var marker = {
            options: {
                animation: 1,
                labelAnchor: "28 -5",
                labelClass: 'markerlabel'
            },
            latitude: latitude,
            longitude: longitude,
            id: ++markerId
        };
        return marker;
    }

    function invokeSuccessCallback(successCallback, marker) {
        if (typeof successCallback === 'function') {
            successCallback(marker);
        }
    }

    function createByCoords(latitude, longitude, successCallback) {
        var marker = create(latitude, longitude);
        invokeSuccessCallback(successCallback, marker);
    }

    function createByAddress(address, successCallback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address' : address}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var firstAddress = results[0];
                var latitude = firstAddress.geometry.location.lat();
                var longitude = firstAddress.geometry.location.lng();
                var marker = create(latitude, longitude);
                invokeSuccessCallback(successCallback, marker);
            } else {
                alertBox.textContent = 'Unknown address: ' + address;
            }
        });
    }

    function createByCurrentLocation(successCallback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var marker = create(position.coords.latitude, position.coords.longitude);
                invokeSuccessCallback(successCallback, marker);
            });
        } else {
            alertBox.textContent = 'Unable to locate current position';
        }
    }

    return {
        createByCoords: createByCoords,
        createByAddress: createByAddress,
        createByCurrentLocation: createByCurrentLocation
    };

});

app.controller('MapCtrl', ['MarkerCreatorService', '$scope', function (MarkerCreatorService, $scope) {

    MarkerCreatorService.createByCoords(0, 0, function (marker) {
        marker.options.labelContent = 'The Ocean';
        $scope.myMarker = marker;
    });

    $scope.address = '';

    $scope.map = {
        center: {
            latitude: $scope.myMarker.latitude,
            longitude: $scope.myMarker.longitude
        },
        zoom: 6,
        markers: [],
        control: {},
        options: {
            scrollwheel: true
        }
    };

    $scope.map.markers.push($scope.myMarker);

    $scope.addCurrentLocation = function () {
        alertBox.innerHTML = 'Searching for location<span>.</span><span>.</span><span>.</span>';
        MarkerCreatorService.createByCurrentLocation(function (marker) {
            marker.options.labelContent = 'You are here';
            $scope.map.markers.push(marker);
            refresh(marker);
            alertBox.textContent = 'Location Found!';
            alertBox.className = "found";
        });
    };

    $scope.addAddress = function() {
        var address = $scope.address;
        if (address !== '') {
            MarkerCreatorService.createByAddress(address, function(marker) {
                $scope.map.markers.push(marker);
                refresh(marker);
            });
        }
    };

    function refresh(marker) {
        $scope.map.control.refresh({latitude: marker.latitude,
            longitude: marker.longitude});
        }
    }]);
