Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/io.jsm");
Components.utils.import("resource://offen/model.jsm");

var EXPORTED_SYMBOLS = ["OFFEN.Server"];

OFFEN.Server = {};
OFFEN.Server.sid="";
OFFEN.Server.MaxResults=OFFEN.Pref.get(OFFEN.Pref.MAX_RESULTS, "int", 10);


OFFEN.Server.getSIDevery29minutes = function(){
	OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.getSIDperiodically entering");
	OFFEN.Server.getSID();
	OFFEN.Util.getBrowserWindow().setInterval(function(){OFFEN.Server.getSID();},29000*60);
	OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.getSIDperiodically exiting");
}

OFFEN.Server.getSID = function(){
	OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.getSID entering");

  var url = "http://www.oeffnungszeitenbuch.de/rpc/ssptr?typ=init";
  OFFEN.Server.SendTo(url,OFFEN.Server.setSID,null,"text");
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.getSID exiting");
}

OFFEN.Server.setSID = function(data)
{
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.setSID entering "+data);
  var list = data.split("\n");
  var column=list[2].split(" ");
  OFFEN.Server.sid = column[1];
  var column=list[3].split(" ");
  var challenge = parseInt(column[1],10);
  challenge += 2;
  
  //challenge=1804728250;
  
  var value = "FeNFm4v9"+challenge;
  var auth = OFFEN.Util.MD5(value);
  var url = "http://www.oeffnungszeitenbuch.de/rpc/ssptr?typ=auth&sid="+OFFEN.Server.sid+"&auth="+auth;
  OFFEN.Server.SendTo(url,OFFEN.Server.OkSID,null);
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.setSID exiting value="+value+"challenge="+challenge+"auth="+auth);
}

OFFEN.Server.OkSID=function(data){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.OkSID entering "+data);

}

OFFEN.Server.getCityCoordsAndSearch=function(city,tag){
  var address="germany,"+city;
  var url="http://maps.googleapis.com/maps/api/geocode/json?address="+address+"&sensor=false";
  OFFEN.Server.SendTo(url,function(json_list){OFFEN.Server.useCityCoords(json_list,tag);},null,"json");
}

OFFEN.Server.useCityCoords=function(json_list,tag){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.useCityCoords entering lat="+json_list.results[0].geometry.location.lat);

  var latitude=json_list.results[0].geometry.location.lat;
  var longitude=json_list.results[0].geometry.location.lng;
  OFFEN.Server.startSearch(tag,latitude,longitude);
}


OFFEN.Server.startSearch=function(tag,latitude,longitude){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.startSearch entering tag="+tag+" lat="+latitude+" long="+longitude);
  // in testmode we take lat and long from prefs 
  if ( OFFEN.Pref.get(OFFEN.Pref.TEST_MODE, "bool", false))
  {
    latitude = OFFEN.Pref.get(OFFEN.Pref.TEST_LATITUDE, "str", "");
    longitude = OFFEN.Pref.get(OFFEN.Pref.TEST_LONGITUDE, "str", "");
  }
  var url = "http://www.oeffnungszeitenbuch.de/rpc/ssptr?sid="+OFFEN.Server.sid+"&typ=query&query=gps&offset=0&lat="+latitude+"&lon="+longitude+"&anz="+OFFEN.Server.MaxResults+"&offenstatus=1";
  if (tag!="")
  {
    url +="&suche="+tag;
  }
  OFFEN.Server.SendTo(url,OFFEN.Server.endSearchFilials,null,"text");
 
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.startSearch exiting");
}



OFFEN.Server.endSearchFilials=function(data){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.endSearchFilials entering ");
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Server.endSearchFilials entering "+data);
  var list = data.split("\n");
  var array_filials = new Array();
  var list_commas="";
  
  for (var i=3;i<list.length-4;i++)
  {
      var columns = list[i].split(";");
      var id = columns[0];
      if (i==3) list_commas+=id;
      else list_commas+="|"+id;
      var distance_km = columns[1];
      var status = columns[2];
      var status_valid_for_x_hours = columns[3];
      var filial = new OFFEN.Filial(id,distance_km,status,status_valid_for_x_hours);
      array_filials[id] = filial;
      OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Server.endSearchFilials id="+id+" distance="+distance_km+" status="+status+" status change in="+status_valid_for_x_hours);
      OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Server.endSearchFilials length="+array_filials.length);

  }
  if (array_filials.length != 0)
    OFFEN.Server.startSearchDetails(list_commas,array_filials);
  else
    OFFEN.UI.createSearchResultBoxes(array_filials);

  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.endSearchFilials exiting "+array_filials.length);
}

OFFEN.Server.startSearchDetails=function(list,array_filials){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.startSearchDetails entering list="+list);
  var url = "http://www.oeffnungszeitenbuch.de/rpc/ssptr?sid="+OFFEN.Server.sid+"&typ=list&ids="+list;
  OFFEN.Server.SendTo(url,function(data){var that_array=array_filials;OFFEN.Server.endSearchDetails(data,that_array);},null,"text");

  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.startSearchDetails exiting "+array_filials.length);
}

OFFEN.Server.endSearchDetails=function(data,array_filials){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.endSearchDetails entering "+array_filials.length);
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Server.endSearchDetails entering data="+data+" length="+array_filials.length);
  var list_ids="";
  
  var list = data.split("\n");
  var array_filials_filtered = new Array();
  
  for (var i=3;i<list.length;i++)
  {
      OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Server.endSearchDetails entering line="+list[i]);
      var columns = list[i].split(";");
      if (columns[0].charAt(0) == '#') break;
      var id = columns[0];
      var name = columns[1];
      var shortname = columns[2];
      var address = columns[3];
      var number = columns[4];
      // modif v1.1
      var city=columns[6];
      var phone_number = columns[7];
      var url = columns[9];
      var schedule = new OFFEN.Schedule(columns[11],columns[12],columns[13],columns[14],
                                         columns[15],columns[16],columns[17],columns[18],
                                         columns[19],columns[20],columns[21],columns[22],
                                         columns[23],columns[24],columns[25],columns[26],
                                         columns[27],columns[28],columns[29],columns[30],
                                         columns[31],columns[32],columns[33],columns[34],
                                         columns[35],columns[36],columns[37],columns[38]);
                                               
      OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.endSearchDetails id="+id);
      
      array_filials[id].updateRestOfInformation(name,shortname,address,number,city,phone_number,url, schedule);
      // change version 1.1
      //array_filials_filtered.push(array_filials[id]);
      array_filials_filtered[id]=array_filials[id];
      if (i==3) list_ids = id;
      else list_ids += ","+id;
  }
  OFFEN.Server.startSearchDeeplinks(list_ids,array_filials_filtered);
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.endSearchDetails exiting "+array_filials_filtered.length);
}

OFFEN.Server.startSearchDeeplinks=function(list,array_filials){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.startSearchDeeplinks entering list="+list);
  var url = "http://www.oeffnungszeitenbuch.de/rpc/ssptr?sid="+OFFEN.Server.sid+"&typ=urlcode_query&filids="+list;
  OFFEN.Server.SendTo(url,function(data){var that_array=array_filials;OFFEN.Server.endSearchDeeplinks(data,that_array);},null,"text");
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.startSearchDeeplinks exiting "+array_filials.length);
}

OFFEN.Server.endSearchDeeplinks=function(data,array_filials){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.endSearchDeeplinks entering "+array_filials.length);
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.endSearchDeeplinks entering data="+data+" length="+array_filials.length);

  var list = data.split("\n");
  for (var i=3;i<list.length;i++)
  {
      var columns = list[i].split(";");
      if (columns[0].charAt(0) == '#') break;
      var id = columns[0];
      var urlcode = columns[1];
      array_filials[id].updateUrlCode(urlcode);
      OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.endSearchDeeplinks id="+id+" sn="+array_filials[id].shortname);

  }
  OFFEN.UI.createSearchResultBoxes(array_filials);
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Server.endSearchDeeplinks entering data="+data+" length="+array_filials.length);
}

OFFEN.Server.SendTo=function(url,callback_ok,callback_nok,type) {

  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.SendTo entering "+url);
  var that_callback_ok = callback_ok;
  var that_callback_nok = callback_nok;
  var that = this;
  var that_type=type;
  var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
  req.onreadystatechange=function(){ 
		  if(req.readyState == 4)
		  {
			   if(req.status == 200)
		     {
            if (that_type=="text")
              that_callback_ok(req.responseText);
            else if (that_type=="json")
            {
              OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.SendTo josn data "+req.responseText);
              that_callback_ok(JSON.parse(req.responseText));
            }
         }
         else if (that_callback_nok != null)
            that_callback_nok(req.status);
			}
			else
			{
        console.log("loadAutocompleteList: status ="+req.status+" !=200!");
			}
	}; 
  req.open("GET", url , true);
	req.send(null);
	OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Server.SendTo exiting ");

}

