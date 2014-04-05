var rendererOptions = {
    draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
var directionsService = new google.maps.DirectionsService();
var map;

var xiamen = new google.maps.LatLng(24.53, 118.54);

function initialize() {

    var mapOptions = {
        zoom: 7,
        center: xiamen
    };
    map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
    directionsDisplay.setMap(map);
    //directionsDisplay.setPanel(document.getElementById('searchPanel'));

    google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
        //computeTotalDistance(directionsDisplay.getDirections());
    });

    calcRoute();

    /*var gUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    var gData = {
        input: "厦门",
        types:"(cities)",
        language:"zh_CN",
        key:"AIzaSyBJeZAeODWfLv4XWUmLINM35pL8ADwZ_gY",
        sensor: false
    };

    TraceRoute.Util.getData(gUrl, gData, function(msg){
        console.log(msg);
    },function(){
        console.log("errpr");
    });*/
//    TraceRoute.Util.directGetData();
    $.ajax({
        type: 'POST',
        dataType: 'jsonp',
        url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        data: {
            input: '厦门',
            types:'(cities)',
            language:'zh_CN',
            key:'AIzaSyBJeZAeODWfLv4XWUmLINM35pL8ADwZ_gY',
            sensor: false
        },
        success: function(msg, textStatus){
            console.log("suceess");
        },
        error: function(json){
            console.log("err");
            console.log(json.success());
        },
        complete: function(msg, textStatus){
            console.log(msg);
            console.log(textStatus);
        }
    });
};

function calcRoute() {

    var request = {
        origin: '厦门',
        destination: '泉州',
        waypoints:[{location: '厦门'}, {location: '泉州'}, {location: '福州'}],
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
};

function computeTotalDistance(result) {
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }
    total = total / 1000.0;
    //document.getElementById('total').innerHTML = total + ' km';
};

google.maps.event.addDomListener(window, 'load', initialize);