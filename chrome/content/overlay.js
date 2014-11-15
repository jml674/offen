Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/util.jsm");
Components.utils.import("resource://offen/preferences.jsm");
Components.utils.import("resource://offen/server.jsm");
Components.utils.import("resource://offen/ui.jsm");
Components.utils.import("resource://offen/geoloc.jsm");

OFFEN.vboxSearchContainer=null;

OFFEN.onOverlayUnload = function(){
  OFFEN.Util.log(OFFEN.Util.logD(),"onOverlayUnload: entering");
  
  OFFEN.Util.log(OFFEN.Util.logD(),"onOverlayUnload: exiting");

}


// 0.95 Compliance change to Mozilla add-ons policy
OFFEN.mytoggleSidebarHandler = function (i){
    return function (event) {
      if(event.button==0){ mytoggleSidebar('viewoffenSidebar');
      }
    }
}

OFFEN.onOverlayLoad = function(){

  if (OFFEN.Pref.get(OFFEN.Pref.CLEAR_LOG_AT_START, "bool", true))
  {

    OFFEN.Util.clearLogFile();
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.onOverlayLoad: - clearing log file");

  }
  OFFEN.Util.log(OFFEN.Util.logC(),"onOverlayLoad: entering "+OFFEN.UI.alreadyLaunched);
  
 
  OFFEN.Util.setInstallationDir();

  if (!OFFEN.UI.alreadyLaunched)
  {
    OFFEN.Server.getSIDevery29minutes();
   }
   if (OFFEN.vboxSearchContainer !=null)
      OFFEN.Util.log(OFFEN.Util.logC(),"onOverlayLoad: vbsc.id "+OFFEN.vboxSearchContainer.id);
        
   OFFEN.vboxSearchContainer = OFFEN.UI.buildMenuBarButton(window);

  if (OFFEN.Pref.get(OFFEN.Pref.ACTIVATED, "bool",true))
  {
        
        var browser = OFFEN.Util.getBrowser();
       
        OFFEN.UI.alreadyLaunched = true;
  }
  else OFFEN.Util.log(OFFEN.Util.logD(),"onOverlayLoad: extension is not activated");
  
  OFFEN.Util.log(OFFEN.Util.logD(),"onOverlayLoad: exiting");
}


OFFEN.setPosition = function(latitude, longitude) {
  OFFEN.Util.log(OFFEN.Util.logD(),"setPosition: entering "+latitude+" "+longitude);

  OFFEN.latitude = latitude;
  OFFEN.longitude= longitude

  OFFEN.Util.log(OFFEN.Util.logD(),"setPosition: exiting ");
  
}


