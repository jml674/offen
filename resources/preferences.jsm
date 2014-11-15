
Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/util.jsm");

var EXPORTED_SYMBOLS = ["offen.Pref"];

/////////
// Pref
/////////
OFFEN.Pref = {
  DEBUG_CONSOLE:"extensions.offen.debugconsole",
  VERSION: "extensions.offen.version",
	LOG: "extensions.offen.log",
	LOG_LEVEL:"extensions.offen.loglevel",
	INSTALL_DIR:"extensions.offen.installdir",
  CLEAR_LOG_AT_START:"extensions.offen.clearlogfileatstarttime",
  USE_ONLY_ONE_TAB:"extensions.offen.useOneTab",
  SOUND: "extensions.offen.sound",
  ACTIVATED: "extensions.offen.activated",
  ALLOW_GEOLOC: "extensions.offen.allowGeolocation",
	TEST_MODE: "extensions.offen.test.mode",
	TEST_LATITUDE: "extensions.offen.test.latitude",
	TEST_LONGITUDE: "extensions.offen.test.longitude",
	MAX_RESULTS:"extensions.offen.search.maxResults",

	xp: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch)
	
}

OFFEN.Pref.Listener = function(branchName, func){
	var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var branch = prefService.getBranch(branchName);
	branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
	
	this.register = function(){
		branch.addObserver("", this, false);
		branch.getChildList("", { })
			.forEach(function (name) { func(branch, name); });
	};
	
	this.unregister = function unregister(){
		if (branch)
			branch.removeObserver("", this);
	};
	
	this.observe = function(subject, topic, data){
		if (topic == "nsPref:changed")
			func(branch, data);
	};
}

OFFEN.Pref.set = function(pref, type, value){
  //OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Pref.set - entering pref="+pref+" type of value="+typeof(value)+" value="+value);
	try {
		switch(type) {
			case "str":
				return OFFEN.Pref.xp.setCharPref(pref, value);
				break;
			case "int":
				value = parseInt(value, 10);
				return OFFEN.Pref.xp.setIntPref(pref, value);
				break;
			case "bool":
			default:
				if(typeof(value) == "string") {
					value = (value == "true");
				}
				return OFFEN.Pref.xp.setBoolPref(pref, value);
				break;
		}
	} catch(e) {
      OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Pref.set EXCEPTION"+pref+" - type="+type+" value="+value);
	
    }
	return null;
}
	
OFFEN.Pref.get = function(pref, type, defaultValue){  
	 //OFFEN.Util.logUnconditional("OFFEN.Pref.get "+pref+" returning default="+defaultValue);

	if(OFFEN.Pref.xp.getPrefType(pref) == OFFEN.Pref.xp.PREF_INVALID) {
	  OFFEN.Util.logUnconditional("OFFEN.Pref.get "+pref+" - INVALID returning default="+defaultValue);

		return defaultValue;
	}
	try {
		switch (type) {
			case "str":
				return OFFEN.Pref.xp.getCharPref(pref).toString();
				break;
			case "int":
				return OFFEN.Pref.xp.getIntPref(pref);
				break;
			case "bool":
			default:
				return OFFEN.Pref.xp.getBoolPref(pref);
				break;
		}
	} catch(e)
    {
      OFFEN.Util.logUnconditional("OFFEN.Pref.get EXCEPTION"+pref+" - type="+type+" no switch returning default="+defaultValue);
    } 
  OFFEN.Util.logUnconditional("OFFEN.Pref.get "+pref+" - type="+type+" no switch returning default="+defaultValue);

	return defaultValue;
}

OFFEN.Pref.resetToDefault = function(pref,id) {
  OFFEN.Util.logUnconditional("OFFEN.Pref.resetToDefault entering"+pref);
  OFFEN.Pref.xp.clearUserPref(pref);
  var  type="";
  switch(OFFEN.Pref.xp.getPrefType(pref))
  {
    case 64: type = "int";
    break;
    case 128: type = "bool";
    break;
    case 32: type = "str";
    break;
  }
  id.value = OFFEN.Pref.get(pref, type, "");

  OFFEN.Util.logUnconditional("OFFEN.Pref.resetToDefault exiting");
}