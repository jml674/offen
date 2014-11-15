Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/util.jsm");

OFFEN.fillVersion =function(){
  var version = OFFEN.Pref.get(OFFEN.Pref.VERSION, "str", "");
	document.getElementById("version").setAttribute("value", version);	
}