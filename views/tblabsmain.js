(function(){

    // Config for the App
    var AppCfg = { 
        zoom: 15,
        searchtxt: "New Delhi",
        localGMapTypes: ['route', 'neighborhood', 'sublocality', 'locality'],
        cityGMapType: ['administrative_area_level_2'],
        stateGMapType: ['administrative_area_level_1'],
        countryGMapType: ['country'],
        pinGMapType: ['postal_code']
    };

    //These are sent to the server
    var SearchCfg = {
        current: {
            address: "",
            latLng: new google.maps.LatLng(28.6667, 77.2167)
        },
        radius: 5,
        local: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
    };

    // Models

    var NearbyTBLabs = Backbone.Model.extend({
        defaults: function() {
            return {
                chestclinic: "",
                centername: "",
                centertype: "",
                description: "",
                address: "",
                state: "",
                pincode: "",
                phone: "",
                email: "",
                fax: "",
                url: "",
                tags: "",
                loc: {
                    lat: 0,
                    lon: 0
                }
            };
        }
    });
    
    // Collections
    
    var NearbyTBLabsList = Backbone.Collection.extend({
        url: '/api/search',
        model: NearbyTBLabs
    });

    // View

    var AppView = Backbone.View.extend({
        el: $("#container"),

        events: {
            "submit": "doSearch"
        },

        render: function() {
          this.gMap.render();
          return this;
        },

        initialize: function() {
            if (!this.gMap) {
                this.gMap = new MapView({collection: NearbyTBLabsList});
            } else {
                this.gMap.delegateEvents();
            }
        },

        doSearch: function() {
        }
    });

    var MapView = Backbone.View.extend({
        el: $("#googleMap"),

        menu: {},
        m1: 0,
        m2: 0,
        
        events: {
        },

        render: function() {
          var me = this;

          // INITIALIZE GOOGLE MAP
          me.$el.gmap3({
            map:{
              options:{
                center:SearchCfg.center,
                zoom: AppCfg.zoom
              },
              events:{
                rightclick:function(map, event){
                  SearchCfg.current = event;
                  me.menu.open(SearchCfg.current);
                },
                click: function(){
                  me.menu.close();
                },
                dragstart: function(){
                  me.menu.close();
                },
                zoom_changed: function(){
                  me.menu.close();
              }
            }
          }

          // add direction renderer to configure options (else, automatically created with default options)
        //, directionsrenderer:{
          //  divId:"directions",
          //  options:{
          //    preserveViewport: true,
          //    markerOptions:{
          //      visible: false
          //    }
          //  }
          //}
          });

          //this.collection.each( function(tbcenter) {
          //    console.log ( tbcenter );
          //});
          return this;
        },

        initialize: function() {
          var me = this;
          me.menu = new Gmap3Menu(me.$el);

          // MENU : ITEM 1
          me.menu.add("Direction to here", "itemB", 
            function(){
              me.menu.close();
              me.addMarker(false);
            });
          
          // MENU : ITEM 2
          me.menu.add("Direction from here", "itemA separator", 
            function(){
              me.menu.close();
              me.addMarker(true);
            })
          
          // MENU : ITEM 3
          me.menu.add("Zoom in", "zoomIn", 
            function(){
              var map = me.$el.gmap3("get");
              map.setZoom(map.getZoom() + 1);
              me.menu.close();
            });
          
          // MENU : ITEM 4
          me.menu.add("Zoom out", "zoomOut",
            function(){
              var map = me.$el.gmap3("get");
              map.setZoom(map.getZoom() - 1);
              me.menu.close();
            });
          
          // MENU : ITEM 5
          me.menu.add("Center here", "centerHere", 
            function(){
                me.$el.gmap3("get").setCenter(SearchCfg.current.latLng);
                me.menu.close();
            });

          me.doGeoLocation();
        },
  
        updateMarker: function(marker, isM1) {
          if (isM1) {
            this.m1 = marker;
          } else {
            this.m2 = marker;
          }
          this.updateDirections();
        },
      
        // add marker and manage which one it is (A, B)
        addMarker: function(isM1){
          var me = this;
          // clear previous marker if set
          var clear = {name:"marker"};
          if (isM1 && me.m1) {
            clear.tag = "from";
            me.$el.gmap3({clear:clear});
          } else if (!isM1 && me.m2){
            clear.tag = "to";
            me.$el.gmap3({clear:clear});
          }
          // add marker and store it
          me.$el.gmap3({
            marker:{
              latLng:SearchCfg.current.latLng,
              options:{
                draggable:true,
                icon:new google.maps.MarkerImage("http://maps.gstatic.com/mapfiles/icon_green" + (isM1 ? "A" : "B") + ".png")
              },
              tag: (isM1 ? "from" : "to"),
              events: {
                dragend: function(marker){
                  me.updateMarker(marker, isM1);
                }
              },
              callback: function(marker){
                me.updateMarker(marker, isM1);
              }
            }
          });
        },
        
        // function called to update direction is me.m1 and me.m2 are set
        updateDirections: function() {
          var me = this;
          if (!(me.m1 && me.m2)){
            return;
          }
          me.$el.gmap3({
            getroute:{
              options:{
                origin:me.m1.getPosition(),
                destination:me.m2.getPosition(),
                travelMode: google.maps.DirectionsTravelMode.DRIVING
              },
              callback: function(results){
                if (!results) return;
                me.$el.gmap3({get:"directionrenderer"}).setDirections(results);
              }
            }
          });
        },

        doBreakupAddress: function(ac, types) {
          var me = this;
          var str = "";
          types.forEach ( function(type) {
              ac.forEach( function(comp) {
                  comp.types.forEach ( function ( ctype ) {
                      if ( type === ctype ) {
                          if ( str === "" ) {
                              str = comp.long_name;
                          } else {
                              str += ", " + comp.long_name;
                          }
                      }
                  } )
              } )
          } )
          return (str);
        },
 
        doGeoLocation: function() {
          var me = this;
          if (navigator.geolocation) {
            me.locationMarker = null;
            navigator.geolocation.getCurrentPosition(
              function( position ) {
                SearchCfg.current.latLng = new google.maps.LatLng(position.coords.latitude, 
                                                 position.coords.longitude);
                me.$el.gmap3("get").setCenter(SearchCfg.current.latLng);
                if (me.locationMarker) {
                    return;
                }
                me.locationMarker = me.addMarker(
                  position.coords.latitude,
                  position.coords.longitude,
                  "My position"
                );
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode(SearchCfg.current, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK && results.length) {
                        var ac = results[0].address_components;
                        SearchCfg.local = me.doBreakupAddress(ac, AppCfg.localGMapTypes);
                        SearchCfg.city = me.doBreakupAddress(ac, AppCfg.cityGMapType);
                        SearchCfg.state = me.doBreakupAddress(ac, AppCfg.stateGMapType);
                        SearchCfg.country = me.doBreakupAddress(ac, AppCfg.countryGMapType);
                        SearchCfg.pincode = me.doBreakupAddress(ac, AppCfg.pinGMapType);
                        AppCfg.searchtxt = SearchCfg.local;
                        $(".search-query")[0].setAttribute("value", AppCfg.searchtxt);
                    }
                });
              },
              function ( error ) {
                console.log ("Something went wrong: ", error);
              },
              {
                timeout: (5*1000),
                maximumAge: (1000*60*15),
                enableHighAccuracy: true
              }
            );
          }
        }
    });

    var app = new AppView();
    app.render();

}).call(this);
