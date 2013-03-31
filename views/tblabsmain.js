(function(){

    // Config for the App
    var AppCfg = { 
        zoom: 15,
        current: {
            address: "",
            latLng: new google.maps.LatLng(28.6667, 77.2169)
        },
        searchtxt: "New Delhi",
        localGMapTypes: ['route', 'neighborhood', 'sublocality', 'locality'],
        cityGMapType: ['administrative_area_level_2'],
        stateGMapType: ['administrative_area_level_1'],
        countryGMapType: ['country'],
        pinGMapType: ['postal_code']
    };

    //These are sent to the server
    var SearchCfg = {
        radius: 5,
        latlng: [0, 0],
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
                ChestClinic: "",
                TestCenterName: "",
                CenterType: "",
                Description: "",
                Address: "",
                City: "",
                State: "",
                Country: "",
                PinCode: "",
                Phone: "",
                Email: "",
                Fax: "",
                URL: "",
                Tags: "",
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
        model: NearbyTBLabs,
        fetch: function() {
            var me = this;
            SearchCfg.latlng = [ AppCfg.current.latLng.jb, 
                                 AppCfg.current.latLng.kb ];
            $.ajax({
                type: 'POST',
                url: me.url,
                data: SearchCfg, 
                success: function(data) {
                    me.set(data);
                }
            });
        }
    });

    // View

    var AppView = Backbone.View.extend({
        el: $("#container"),

        events: {
            "click #locator_submit": "doSearch"
        },

        render: function() {
          this.gMap.render();
          return this;
        },

        initialize: function() {
            var me = this;
            if (!me.gMap) {
                me.gMap = new MapView({collection: tblabcollection});
            } else {
                me.gMap.delegateEvents();
            }
            me.radius = $("#container").find("#radius");
            me.radius.bind('change', me.doRadiusChange);
        },

        doRadiusChange: function() {
            var value = parseInt ( event.srcElement.value );
            SearchCfg.radius = value;
        },

        doSearch: function() {
            var me = this;
            var address = { address: $(".search-query")[0].value };
            if ( address !== AppCfg.searchtxt ) {
                me.gMap.setMapCenter(address); 
            }
        }
    });

    var MapView = Backbone.View.extend({
        el: $("#googleMap"),

        render: function() {
            var me = this;
            //this.collection.each( function(tbcenter) {
            //    console.log ( tbcenter );
            //});
            return this;
        },

        initialize: function() {
            var me = this;
            me.geocoder = new google.maps.Geocoder();
            me.doGeoLocation();
            this.collection.bind("reset", this.resetTBCenters, this); 
            this.collection.bind("add", this.addTBCenters, this); 
            this.collection.bind("change", function() { console.log ( 'changeTBCenters is not implemented' ) } ); 
            this.collection.bind("remove", function() { console.log ( 'removeTBCenters is not implemented' ) } ); 
        },

        addTBCenters: function() {
            var me = this;
            var tbcenter = arguments[0].attributes
              , latlng = new google.maps.LatLng(tbcenter.loc.lat, tbcenter.loc.lon)
              ;
            me.$el.gmap3({
              marker:{
                latLng: latlng, 
                options:{
                  icon:new google.maps.MarkerImage("http://maps.google.com/mapfiles/marker_yellow.png")
                },
                tag: 'tbcenter'
              }
            });
        },
        
        resetTBCenters: function() {
            var me = this;
            var clear = {name:"marker"};
            clear.tag = "tbcenters";
            me.$el.gmap3({clear:clear});
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

        setMapCenter: function(addr_or_coord) {
            var me = this;
            me.geocoder.geocode(addr_or_coord, function(results, status) {
               if (status == google.maps.GeocoderStatus.OK && results.length) {
                   var ac = results[0].address_components;
                   SearchCfg.local = me.doBreakupAddress(ac, AppCfg.localGMapTypes);
                   SearchCfg.city = me.doBreakupAddress(ac, AppCfg.cityGMapType);
                   SearchCfg.state = me.doBreakupAddress(ac, AppCfg.stateGMapType);
                   SearchCfg.country = me.doBreakupAddress(ac, AppCfg.countryGMapType);
                   SearchCfg.pincode = me.doBreakupAddress(ac, AppCfg.pinGMapType);
                   AppCfg.searchtxt = SearchCfg.local;
                   AppCfg.current.latLng = results[0].geometry.location;

                   me.collection.reset();
                   me.collection.fetch();
                   $(".search-query")[0].setAttribute("value", AppCfg.searchtxt);

                   // clear previous marker if set
                   var clear = {name:"marker"};
                   clear.tag = "mypog";

                   me.$el.gmap3({
                     map:{
                       options:{
                         center:AppCfg.current.latLng,
                         zoom: me.getZoomFromRadius(),
                         zoomControl: true,
                         panControl: true,
                         scaleControl: true
                       }
                     },
                     clear:clear,
                     marker:{
                       latLng:AppCfg.current.latLng,
                       options:{
                         icon:new google.maps.MarkerImage("http://maps.gstatic.com/mapfiles/icon_greenA.png")
                       },
                       tag: "mypog"
                     }
                   });
               }
            });
        },
 
        doGeoLocation: function() {
            var me = this;
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                function( position ) {
                  var current = { latLng: new google.maps.LatLng(position.coords.latitude, 
                                                         position.coords.longitude) };
                  me.setMapCenter (current);
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
        },

        getZoomFromRadius: function() {
            var radius = SearchCfg.radius
              , zoom;
            if ( radius == 3 ) {
                zoom = 14; 
            } else if ( radius <=5 ) {
                zoom = 13;
            } else if ( radius < 10 ) {
                zoom = 12;
            } else if ( radius <= 20 ) {
                zoom = 11;
            } else if ( radius <= 40 ) {
                zoom = 10;
            } else {
                zoom = 9;
            }
            return zoom;
        }
    });

    var tblabcollection = new NearbyTBLabsList();
    var app = new AppView();
    app.render();

}).call(this);
