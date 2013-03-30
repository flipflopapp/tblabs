(function(){

    // Config for the App
    var AppCfg = { 
        zoom: 13,
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
            me.radius.bind('change', this.changeRadius);
        },

        doSearch: function() {
            tblabcollection.fetch();
        },

        changeRadius: function(event) {
            var value = parseInt ( event.srcElement.value );
            SearchCfg.radius = value;
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

            // INITIALIZE GOOGLE MAP
            me.$el.gmap3({
              map:{
                options:{
                  center:SearchCfg.center,
                  zoom: AppCfg.zoom
                }
              }
            });

            me.doGeoLocation();

            this.collection.bind("change", function() { console.log ( 'change is not implemented' ) } ); 
            this.collection.bind("reset", function() { console.log ( 'reset is not implemented' ) } );   
            this.collection.bind("add", this.addTBCenters, this); 
            this.collection.bind("remove", this.removeTBCenters, this); 
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
        
        removeTBCenters: function() {
            console.log('remove');
            console.log(arguments[0].attributes);
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
              navigator.geolocation.getCurrentPosition(
                function( position ) {
                  AppCfg.current.latLng = new google.maps.LatLng(position.coords.latitude, 
                                                         position.coords.longitude);
                  me.$el.gmap3("get").setCenter(AppCfg.current.latLng);
                  me.$el.gmap3({
                    marker:{
                      latLng:AppCfg.current.latLng,
                      options:{
                        icon:new google.maps.MarkerImage("http://maps.gstatic.com/mapfiles/icon_greenA.png")
                      }
                    }
                  });
                  var geocoder = new google.maps.Geocoder();
                  geocoder.geocode(AppCfg.current, function(results, status) {
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

    var tblabcollection = new NearbyTBLabsList();
    var app = new AppView();
    app.render();

}).call(this);
