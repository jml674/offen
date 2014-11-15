Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/io.jsm");

var EXPORTED_SYMBOLS = ["OFFEN.Util"];

OFFEN.Util = {};
OFFEN.Util.credentials="";

OFFEN.Util.mod = function(x,n) {
return ((x%n)+n)%n;
}

OFFEN.Util.tab = function(n){
  var text="["+n+"]";
  for (i=0;i<n;i++)
    text+=' ';
  return text;
}


OFFEN.Util.tabs=[OFFEN.Util.tab(0),
                    OFFEN.Util.tab(1), 
                    OFFEN.Util.tab(2),
                    OFFEN.Util.tab(3),
                    OFFEN.Util.tab(4),
                    OFFEN.Util.tab(5),
                    OFFEN.Util.tab(6),
                    OFFEN.Util.tab(7),
                    OFFEN.Util.tab(8),
                    OFFEN.Util.tab(9),
                    OFFEN.Util.tab(10),
                    OFFEN.Util.tab(11),
                    OFFEN.Util.tab(12)
                    ];
                    
OFFEN.Util.strings = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://OFFEN/locale/strings.properties");

OFFEN.Util.getString = function(name) {
  var str="Unexpected problem";
  try {
    str = OFFEN.Util.strings.GetStringFromName(name);
  }
  catch(e)
  {
    OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.Util.getString ["+name+"] string not found!!");
  }
	return str;
}



OFFEN.Util.getCallStackSize = function() {
    var count = 0, fn = arguments.callee;
    while ( (fn = fn.caller) && count <12 ) {
        count++;
    }
    return OFFEN.Util.tabs[count];
}


OFFEN.Util.log = function(level,text){
  var debugLevel=0;
  var log;
  var header = "";
  if (level == OFFEN.Util.logC()) header ="CRITICAL";
  if (level !=-1)
  {
    debugLevel = OFFEN.Pref.get(OFFEN.Pref.LOG_LEVEL, "int", 0);

    log = OFFEN.Pref.get(OFFEN.Pref.LOG, "bool", false);
    if(!log || level>debugLevel) return;
    //text = OFFEN.Util.getCallStackSize()+text;
    console.log(text); //output messages to the console

	}
	
  var fileOut = OFFEN.FileIO.open(this._getFilePath());
	OFFEN.FileIO.create(fileOut);
	OFFEN.FileIO.write(fileOut, OFFEN.Util.getDateAndTime()+" "+header+" "+text+'\n','a');
	
		//
	
}

OFFEN.Util.logUnconditional = function(text){
  
  var fileOut = OFFEN.FileIO.open(this._getFilePath());
	OFFEN.FileIO.create(fileOut);
	OFFEN.FileIO.write(fileOut, OFFEN.Util.getDateAndTime()+" "+text+'\n','a');
	
}




OFFEN.Util.clearLogFile = function(){
  var fileOut = OFFEN.FileIO.open(OFFEN.Util._getFilePath());
	OFFEN.FileIO.create(fileOut);
	OFFEN.FileIO.write(fileOut, ' ','w');
}


OFFEN.Util.CheckAndClearLog = function(size) {
  var fileOut = OFFEN.FileIO.open(OFFEN.Util._getFilePath());
  if (fileOut.fileSize > size)
  {
    OFFEN.Util.clearLogFile();
    OFFEN.Util.log(OFFEN.Util.logC(),"CheckAndClearLog - clearing logfile limit=["+size+"]+size="+fileOut.fileSize);
  }
}


OFFEN.Util.getDateAndTime = function() {
  var dtime = new Date();
  var day = dtime.getDate();if (day<10) day="0"+day;
  var month = dtime.getMonth()+1; if (month<10) month="0"+month;
  var h=dtime.getHours(); if (h<10) h="0"+h;
  var m=dtime.getMinutes(); if (m<10) m="0"+m;
  var s=dtime.getSeconds();if (s<10) s="0"+s;
  
  return dtime.getFullYear()+"/"+month+"/"+day+"-"+h+":"+m+":"+s;
}


OFFEN.Util.getBrowserWindow = function(){
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	return wm.getMostRecentWindow("navigator:browser");
}

OFFEN.Util.getBrowser = function(){
	var browserWindow = OFFEN.Util.getBrowserWindow();
	if(browserWindow){
		return browserWindow.gBrowser;
	}
}




OFFEN.Util.openNewTab = function(url){
	
  var useOneTab = OFFEN.Pref.get(OFFEN.Pref.USE_ONLY_ONE_TAB, "bool", true);
  if (useOneTab && OFFEN.UI.urlAdvisedTab)
    OFFEN.Util.loadTab(OFFEN.UI.urlAdvisedTab,url); 
	else
	{
    var browser = OFFEN.Util.getBrowser();
    var window = OFFEN.Util.getBrowserWindow();
	
    if(browser){
      var newTab = browser.addTab(url);
      var container = browser.tabContainer;  
      container.addEventListener("TabClose", OFFEN.Util.tabClose, false); 
      var newTabBrowser = browser.getBrowserForTab(newTab);
      // modif JML to make new tab the active one
      browser.selectedTab = newTab;
      OFFEN.UI.urlAdvisedTab = newTab;
      return newTab;
    }
  }
}


OFFEN.Util.makeURI = function(myURLString){
// the IO service
  var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);

// create an nsIURI
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.makeURI entering ["+myURLString+"]");

  var uri = ioService.newURI(myURLString, null, null);
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.makeURI exiting");

  return uri;
}

OFFEN.Util.loadTab = function(tab,url){
  var browser = OFFEN.Util.getBrowser();
	var window = OFFEN.Util.getBrowserWindow();
	
	if(browser){
	 var newTabBrowser = browser.getBrowserForTab(tab);
	 newTabBrowser.loadURI( url )
   browser.selectedTab = tab;
 	}
}

OFFEN.Util.tabClose = function(event){
  if (event.target == OFFEN.UI.urlAdvisedTab)
    OFFEN.UI.urlAdvisedTab = 0;
}

OFFEN.Util.closeTab = function(){
  var useOneTab = OFFEN.Pref.get(OFFEN.Pref.USE_ONLY_ONE_TAB, "bool", true);
  if (useOneTab && OFFEN.UI.urlAdvisedTab)
  {
    var browser = OFFEN.Util.getBrowser();
    browser.selectedTab = OFFEN.UI.urlAdvisedTab;
    browser.removeCurrentTab();
  }
}




OFFEN.Util.isFirstLaunch = function(){
	return OFFEN.Pref.get(OFFEN.Pref.FIRSTLAUNCH, "bool", true);
}

OFFEN.Util.isFirstLaunchToday = function(){
	var lastLaunchDate = OFFEN.Pref.get(OFFEN.Pref.LASTLAUNCHDATE, "str", "");
	var todayDate = OFFEN.Util.formatDate(new Date());
	return todayDate != lastLaunchDate;
}

OFFEN.Util.checkNewVersion = function(callback){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.checkNewVersion: entering ");
  Components.utils.import("resource://gre/modules/AddonManager.jsm");
    
  AddonManager.getAddonByID("addon@offen.com", function(addon) {
    //OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.checkNewVersion: version="+addon.version);
    var lastVersion = OFFEN.Pref.get(OFFEN.Pref.VERSION, "str", "");

    callback(lastVersion,addon.version);
  });
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.checkNewVersion: exiting");

}


OFFEN.Util.sendInstallationMessage = function(install){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.sendInstallationMessage: entering "+install);
  var epgurl = "http://www.tvsurftv.fr";
  var credentials = OFFEN.Util.getUsernameAndPassword();
  
	var query = epgurl+"/OFFEN/install_moves.php?user="+encodeURIComponent(credentials.user)+"&install="+encodeURIComponent(install);

  var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();   
  //OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.sendInstallationMessage before try: ");
  
  try {  
    // need synchronous request to work, if not request is cancelled by application exit.
    req.open('GET', query, true); 
    req.onreadystatechange = function (aEvt) {
          OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.sendInstallationMessage: req state= "+req.readyState);

    };
    req.send(null);
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.sendInstallationMessage: sending "+query+" "+req.status);
  }
  catch (ex) {
    OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.Util.sendInstallationMessage: EXCEPTION"); 
  }
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.sendInstallationMessage: exiting");

}


OFFEN.Util.formatDate = function(date){
	return ""+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
}



// JML

OFFEN.Util._getFilePath = function(){
	var profileDir = OFFEN.DirIO.get('ProfD');
	var filepath = profileDir.path + OFFEN.DirIO.sep;
	filepath += 'OFFEN' + OFFEN.DirIO.sep;
	filepath += 'OFFEN.log';
	return filepath;
}

OFFEN.Util.getLogFileContent= function(){
  var content="EMPTY LOG FILE";
  var fileIn = OFFEN.FileIO.open(OFFEN.Util._getFilePath());
	if (fileIn.exists()) {
		 content = OFFEN.FileIO.read(fileIn, "UTF-8");
	}
  return content;
}


OFFEN.Util.logC = function()
{
  return 0;
}

OFFEN.Util.logI = function()
{
  return 1;
}

OFFEN.Util.logD = function()
{
  return 2;
}
OFFEN.Util.logA = function()
{
  return 3;
}

OFFEN.Util.logR = function()
{
  return 4;
}



OFFEN.Util.settimeout = function()
{
  var timer = Components.classes["@mozilla.org/timer;1"]
            .createInstance(Components.interfaces.nsITimer);
            return timer;
}



OFFEN.Util.ascii=function(name)
{
  var str="";
  for (var i=0;i<name.length;i++)
    str += name.charCodeAt(i)+",";

  return name+" "+str;
   
}


OFFEN.Util.Utf8Decode = function(s){
    if (s)
    {
      for(var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
        ((a = s[i][c](0)) & 0x80) &&
        (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
        o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
      );
      return s.join("");
    }
    else return "";
	}

OFFEN.Util.Utf8Encode=function(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
};
 
OFFEN.Util.preg_match_all = function (rglob, risolate, haystack) {
  //OFFEN.UI.sidebarWindow.alert(rglob);

  var globalRegex = new RegExp(rglob, 'g');
  var globalMatch = haystack.match(globalRegex);
  //OFFEN.UI.sidebarWindow.alert(globalMatch);

  matchArray = new Array();

  var globalIsolate = new RegExp(risolate);

  for (var i in globalMatch) {
    nonGlobalMatch = globalIsolate.exec(globalMatch[i]);
    //OFFEN.UI.sidebarWindow.alert(nonGlobalMatch);
    matchArray.push(nonGlobalMatch);
  }
  return matchArray;
}

OFFEN.Util.split = function (data,splitter) {
  var array = new Array();
  var start = 0;
  var count_quote = 0;
  for (var i=0; i < data.length ; i++)
  {
    if (data[i] == "\"")
    {
      if (count_quote == 0)
        count_quote =1;
      else count_quote = 0;
      //OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.split encounter quote ["+i+"] "+count_quote);  

    }
    else if (data[i] ==splitter && count_quote==0)
    {
      array.push(data.substring(start,i));
      //OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.split pushing +["+i+"] "+data.substring(start,i));  

      start = i+1;
    }
  }
  array.push(data.substring(start));
 
  return array;
}
OFFEN.Util.setJavascriptEnabled = function (value) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.setJavascriptEnabled entering "+value);  

  Components.utils.import("resource://gre/modules/Services.jsm");
  Services.prefs.setBoolPref("javascript.enabled", value);
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.setJavascriptEnabled exiting");  
}
OFFEN.Util.setBlockMixedContentEnabled = function (value) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.setBlockMixedContentEnabled entering "+value);  

  Components.utils.import("resource://gre/modules/Services.jsm");
  Services.prefs.setBoolPref("security.mixed_content.block_active_content", value);
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.setBlockMixedContentEnabled exiting");  
}

OFFEN.Util.extractDomain = function(path)
{
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.extractDomain entering ["+path+"]");  
  var str = "http[s]?://([\\w]+)(\\.[\\w]+)*";
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.extractDomain regexp= ["+str+"]");  

  var regexp = new RegExp(str);
  var matches = regexp.exec(path);
  var result="";
  if (matches != null)
  {
    result = matches[0];
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.extractDomain exiting "+matches[0]);  
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.extractDomain exiting 1="+matches[1]);
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.extractDomain exiting 2="+matches[2]);
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.extractDomain exiting 3="+matches[3]);
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.extractDomain exiting 4="+matches[4]);
   }
   OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.extractDomain exiting "+result);  

   return result;
   
}

OFFEN.Util.shortSeverity = function(severity)
{
  switch (severity)
  {
    case "Major": return "MJ";
    case "Minor": return "MN";
    case "Business Critical": return "BC";
    default: return severity;
  }
}


OFFEN.Util.getNoticeBeforeAlarm = function(severity)
{
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Util.getNoticeBeforeAlarm entering ["+severity+"]");  
  var inc=0;
  if (severity=="Major") inc= OFFEN.Pref.get(OFFEN.Pref.ALARM_DAYS_BEFORE_MAJOR, "int", 1);
  else if (severity=="Business Critical") inc= OFFEN.Pref.get(OFFEN.Pref.ALARM_DAYS_BEFORE_BC, "int", 1);
  else if (severity=="Minor") inc= OFFEN.Pref.get(OFFEN.Pref.ALARM_DAYS_BEFORE_MINOR, "int", 1);
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Util.getNoticeBeforeAlarm exiting ["+inc+"]");  

  return inc;
}



OFFEN.Util.MailToFunc = function (callback) {
  
  epgurl = "http://www.tvsurftv.fr";
  
  var loglevel = OFFEN.Pref.get(OFFEN.Pref.LOG_LEVEL, "int", 0);

  var url=epgurl+"/support/putlogfile.php?user="+OFFEN.user+"&level="+loglevel;
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Util.MailToFunc: url="+url);

  var file = OFFEN.FileIO.open(this._getFilePath());
  
  var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
	                       .createInstance(Components.interfaces.nsIFileInputStream);
  stream.init(file, 0x04 | 0x08, 0644, 0x04); // file is an nsIFile instance  
	 
	// Try to determine the MIME type of the file
	var mimeType = "text/plain";
	try {
	  var mimeService = Components.classes["@mozilla.org/mime;1"]
	          .getService(Components.interfaces.nsIMIMEService);
	  mimeType = mimeService.getTypeFromFile(file); // file is an nsIFile instance
	}
	catch(e) { /* eat it; just use text/plain */ }
	 
	// Send   
	
	var onterminateloading = function (aEvt) {
    callback();
  };
	
	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
	                    .createInstance(Components.interfaces.nsIXMLHttpRequest);
	req.addEventListener("load", onterminateloading, false);
	req.addEventListener("error", onterminateloading, false);
	// Compliance 0.96, call made asynchronous
  req.open('PUT', url, true); 
  req.setRequestHeader('Content-Type', mimeType);
  req.send(stream);

}

OFFEN.Util.FormatZerosDate = function (date_text) {
   OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.FormatZerosDate entering ["+date_text+"]");  
   var value="";
   try
   {
    var regexp = new RegExp("([0-9]*)\/([0-9]*)\/([0-9]*)");
    var matches = regexp.exec(date_text);
    var m=matches[1];
    if (m.length==1) m = "0"+m;
    var d=matches[2];
    if (d.length==1) d = "0"+d;
    var y=matches[3];
    if (y.length==1) y = "20"+y;
   
    value= m+"/"+d+"/"+y;
   }
   catch(e) {
   }
   OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.FormatZerosDate exiting "+value);  
   return value;
}
OFFEN.Util.RemoveLeadingZerosFromDate = function (date_text) {
   OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.RemoveLeadingZerosFromDate entering "+date_text);  

   var regexp = new RegExp("([0-9]*)\/([0-9]*)\/([0-9]*)");
   var matches = regexp.exec(date_text);
   var m=matches[1];
   if (m[0]=="0") m = m[1];
   var d=matches[2];
   if (d[0]=="0") d = d[1];
   var y=matches[3];
   
   var value= m+"/"+d+"/"+y;
   OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.RemoveLeadingZerosFromDate exiting "+value);  
   return value;
}
OFFEN.Util.checkCaseId = function (caseId) {
  var regexp = new RegExp("[0-9]{6}\-[0-9]{6}");
  var matches = regexp.exec(caseId);
  if (matches == null)
  { 
    OFFEN.Util.getBrowserWindow().setTimeout(
      function(){
      OFFEN.Util.log(OFFEN.Util.logC(),"Please send your logs, Unexpected value for CaseId :["+caseId+"] "+caseId.length);  
          //OFFEN.Util.getBrowserWindow().alert("Please send your logs, Unexpected value for CaseId :["+caseId+"] "+caseId.length);

      },5000);
  }
}

OFFEN.Util.checkDateMMDDYYYY = function (date_text) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.checkDate entering "+date_text);  
  var result = true;
  var days= new Array(31,30,31,30,31,30,31,31,30,31,30,31);
  var regexp = new RegExp("(^[0-9][0-9]?)\/([0-9][0-9]?)\/([0-9]{4})");
  var matches = regexp.exec(date_text);
  if (matches == null) result = false;
  else
  {
    var m=parseInt(matches[1]);
    if (m<1 || m>12) result = false;
    else
    {
      var d=parseInt(matches[2]);
      if (d<1 || d>days[m-1]) result = false;
      else
      {
        var y=parseInt(matches[3]);
        if (y<2014 || y>2015) result = false;
      }
    }
  }
   
   OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.checkDate exiting "+result+(matches==null?" ":" "+matches[1]+" "+matches[2]+" "+matches[3]));  
   return result;
}

OFFEN.Util.loadPage = function(url,responseType,cb_if_ok,cb_all,data){
	OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.loadPage entering url="+url+" type="+responseType);
	
	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	
  var that_url = url;
  var that_data = data;
  var that_responsetype = responseType;
  
	req.onreadystatechange=function()	{ 
		if(req.readyState == 4)
		{
			if(req.status == 200)
			{
        if (that_responsetype=="document" && cb_if_ok)
          cb_if_ok(req.responseXML.documentElement,that_data);
        else if(that_responsetype=="json" && cb_if_ok)
          cb_if_ok(JSON.parse(req.responseText,that_data));
        else if (cb_if_ok)
          cb_if_ok(req.responseText,that_data);
			}
			else
			{
			 OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.Util.loadPage.loadHTML status ="+req.status+" !=200!");
			 OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.Util.loadPage.sendRequest faulty url "+that_url);
			 if (cb_all !=null) cb_all(null);
			}
		} 
	}; 
	req.open("GET", url , true);
	if (responseType =="document")
    //req.responseType = "document";
    req.responseType = responseType;
	req.send(null); 
	OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.loadPage exiting");
}

OFFEN.Util.getUsernameAndPassword = function()
{
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.getUsernameAndPassword entering:");

  var hostname = 'https://login.salesforce.com';
  var credentials={user:"",password:""};

  var formSubmitURL = ""; 
  var httprealm = "";
	 
	try {
	   // Get Login Manager
	   var myLoginManager = Components.classes["@mozilla.org/login-manager;1"].
                            getService(Components.interfaces.nsILoginManager);
	       
	// Find users for the given parameters
	OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.getUsernameAndPassword: count ="+myLoginManager.countLogins(hostname, formSubmitURL, httprealm));
	
	
	   var logins = myLoginManager.findLogins({}, hostname, formSubmitURL, httprealm);
	   // Find user from returned array of nsILoginInfo objects
	   for (var i = 0; i < logins.length; i++) {
        //OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.getUsernameAndPassword: user="+logins[i].username+" "+logins[i].password+" "+logins[i].hostname+" "+logins[i].httpRealm);
	   	  credentials.user = logins[i].username;
	   	  credentials.password = logins[i].password;
	      //break;
	    }
	}
  
  catch(ex) {
    OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.Util.getUsernameAndPassword: problem getting credentials.users");
  }	       

  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.getUsernameAndPassword: exiting "+credentials.user);
	return credentials;
	
}

OFFEN.Util.MD5 = function (string) {

 
	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}
 
	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}
 
 	function F(x,y,z) { return (x & y) | ((~x) & z); }
 	function G(x,y,z) { return (x & z) | (y & (~z)); }
 	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }
 
	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};
 
	function WordToHex(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};
 
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	};
 
	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;
 
	string = Utf8Encode(string);
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.MD5: string="+string);

	x = ConvertToWordArray(string);
 OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Util.MD5: x="+x);
 
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}
 
	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
	return temp.toLowerCase();
}

OFFEN.Util.setInstallationDir=function() {
  var dir = OFFEN.DirIO.get('ProfD');
  var str1 = OFFEN.DirIO.path(dir);
  var str2 = str1.replace(/%20/,' ');
  var str3 = str2.replace(/file:\/\/\//,'');
  var str = str3.replace(/\//g,OFFEN.DirIO.sep)+OFFEN.DirIO.sep+'offen';
      
  OFFEN.Pref.set(OFFEN.Pref.INSTALL_DIR, "str", str);
}