Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/io.jsm");

var EXPORTED_SYMBOLS = ["OFFEN.Geoloc"];

OFFEN.Geoloc = {};

OFFEN.Geoloc.CheckWithCallback=function(window, callback) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Geoloc.CheckWithCallback: entering "+window);

  let message = "offen "+OFFEN.Util.getString("requiresLocation");
    var allow = OFFEN.Pref.get(OFFEN.Pref.ALLOW_GEOLOC, "str", "");

    switch (allow) {
        case "always": return OFFEN.Geoloc.getCurrentPosition(callback);
        break;
        case "never": return callback(null);
        break;
        default:
    };

    var done = false;

    function remember(value, result) {
        return function () {
            done = true;
            OFFEN.Pref.set(OFFEN.Pref.ALLOW_GEOLOC, "str", value);
            if (result) {
                OFFEN.Geoloc.getCurrentPosition(callback);
            }
            else {
              callback(null);
            }
        }
    }

    var self = window.PopupNotifications.show(
        window.gBrowser.selectedBrowser,
        "geolocation",
        message,
        //"geo-notification-icon",
        null,
        {
            label: OFFEN.Util.getString("shareLocation"),
            accessKey: "S",
            callback: function(notification) {
                done = true;
                OFFEN.Geoloc.getCurrentPosition(callback);
            }
        }, [
            {
                label: OFFEN.Util.getString("alwaysShare"),
                accessKey: "A",
                callback: remember("always", true)
            },
            {
                label: OFFEN.Util.getString("neverShare"),
                accessKey: "N",
                callback: remember("never", false)
            }
        ], {
            eventCallback: function(event) {
                if (event === "dismissed") {
                    if (!done) callback(null);
                    done = true;
                    window.PopupNotifications.remove(self);
                }
            },
            persistWhileVisible: true
        });
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Geoloc.CheckWithCallback: exiting "+self);

}


OFFEN.Geoloc.getCurrentPosition=function(callback) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Geoloc.getCurrentPosition: entering ");
  var result = true;
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  var window = OFFEN.Util.getBrowserWindow();
  var geolocation = Components.classes["@mozilla.org/geolocation;1"]
                            .getService(Components.interfaces.nsISupports);
  geolocation.getCurrentPosition(callback,
                                  function(){
                                        window.alert("Issue with Geolocation retrieval");
                                      },
                                      options);
                                      
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Geoloc.getCurrentPosition: exiting "+result);

}