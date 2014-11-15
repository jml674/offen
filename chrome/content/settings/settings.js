
Components.utils.import("resource://offen/common.jsm");

// change 0.97 logfile can't be sent if user is not registered


OFFEN.settingsDoOK= function(){
 
    return true;
}

OFFEN.enableSendLogfileButton = function (){
  var button = document.getElementById("sendLogfileButton");
  button.setAttribute("disabled",OFFEN.user =="");
}

OFFEN.showuploadinglogfile = function(show){
	var button = document.getElementById("uploadinglogfile");
	if (button) button.style.display = show?"":"none";
	// Correction 0.97, disable ACCEPT button while loading
	document.documentElement.getButton("accept").setAttribute("disabled",show);
}

OFFEN.SendLogFile = function() {

  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.SendLogFile - entering");
  var details = document.getElementById("logdetails").value;
  
  if (details =="")
  {
    //OFFEN.UI.displayError("Please provide details prior sending logs","");  
    var details = document.getElementById("logdetailstitle");
    details.style.color="red";
      
  }
  else
  {
    OFFEN.Util.log(0,"OFFEN.SendLogFile - details:"+details);  
    OFFEN.showuploadinglogfile(true);
    OFFEN.Util.MailToFunc(OFFEN.endloadinglogfileHandler);
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.SendLogFile - exiting");
  }
}

OFFEN.endloadinglogfileHandler = function(){
	OFFEN.showuploadinglogfile(false);
}

/////////
// Alarms
/////////
OFFEN.readSound = function(){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.readSound - entering ");

	var sound = document.getElementById("sound").value;
	if(sound=="nosound" || sound=="default") return sound;
	document.getElementById("soundfile").value = sound;
	document.getElementById("select-sound").disabled = false;
	document.getElementById("test-sound").disabled = false;
	return "custom";
}

OFFEN.writeSound = function (){
	var sound = document.getElementById("group-sound").selectedItem.value;
	if(sound=="nosound" || sound=="default") return sound;
	sound = document.getElementById("soundfile").value;
	return sound;
}

OFFEN.updateSound = function(){
	var sound = document.getElementById("group-sound").value;
	document.getElementById("select-sound").disabled = (sound!="custom");
	document.getElementById("test-sound").disabled = (sound!="custom");
}

OFFEN.selectSound = function(){
	var NFP = Components.interfaces.nsIFilePicker;
	var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(NFP);
	filePicker.init(window, null, NFP.modeOpen);
	filePicker.appendFilters(NFP.filterAll);
	
	if(filePicker.show() == NFP.returnOK) {
	  document.getElementById("soundfile").value = filePicker.file.path;
	}
}

OFFEN.testSound = function(){
	var filepath = document.getElementById("soundfile").value;
	if (filepath) {
		OFFEN.Util.playSound(filepath);
	}
}

OFFEN.ClearLogFile = function(){
  OFFEN.Util.clearLogFile();
}

OFFEN.restrictValues=function(textbox) {
  return;
  alert(textbox.value);
  textbox.setAttribute("autocompletesearchparam","[{\"value\":\"mark\",\"comment\":\"cool dude\"}]");
} 
