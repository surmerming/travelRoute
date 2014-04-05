TraceRoute.Util = {

    getData: function(url, data, succCb, errCb){
        $.ajax({
            type: "POST",
            dataType: "jsonp",
            url: url,
            data: data,
            success: function(msg, textStatus){
                succCb(msg);
            },
            error: function(){
                errCb();
            }
        });
    },

    directGetData: function(){
        var gData = {
            input: "厦门",
            types:"(cities)",
            language:"zh_CN",
            key:"AIzaSyBJeZAeODWfLv4XWUmLINM35pL8ADwZ_gY",
            sensor: false
        };
        $.ajax({
            type: "POST",
            dataType: "jsonp",
            url: "https://maps.googleapis.com/maps/api/place/autocomplete/json",
            data: gData,
            success: function(msg, textStatus){
               console.log("suceess");
            },
            error: function(){
               console.log("err");
            }
        });
    }

};