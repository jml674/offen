
Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/util.jsm");
Components.utils.import("resource://offen/dom.jsm");

var EXPORTED_SYMBOLS = ["OFFEN.UI"];

OFFEN.UI = {};



OFFEN.UI.panelWindow = 0;
OFFEN.UI.sidebarWindow = null;
OFFEN.UI.alreadyLaunched = false;

OFFEN.UI.instanceNumber = 0;
OFFEN.UI.ErrorPopup=0;
OFFEN.UI.urlAdvisedTab=null;
OFFEN.UI.currentTabDocument=null;
OFFEN.UI.lastOpenedSchedule=null;


OFFEN.UI.getYearString = function(year)
{
  if (year != "")
    return "("+year+")"
  else
    return "";
}

OFFEN.UI.addClass = function(element, className){
	element.className += " " + className;
}



OFFEN.UI.buildMenuBarButton= function(win){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.buildMenuBarButton: entering");
  var addonBar = win.document.getElementById("nav-bar-customization-target"); 
  
  var toolbaritem=win.document.createElement("toolbaritem");
  toolbaritem.setAttribute("id","offen-toolbaritem");
  toolbaritem.setAttribute("align","center");
  toolbaritem.setAttribute("pack","end");
  toolbaritem.setAttribute("flex","0");
  toolbaritem.setAttribute("removable","true");
  toolbaritem.setAttribute("cui-areatype","toolbar");
  addonBar.appendChild(toolbaritem);
  
  var statusbarpanel = win.document.createElement("toolbarbutton");
  statusbarpanel.setAttribute("image","chrome://offen/skin/images/dreamstime_xs_16x16oneblack.jpg");
  statusbarpanel.setAttribute("id","sb-button-offen");
  
  var panel = win.document.createElement("panel");
  panel.setAttribute("noautohide","false");
  panel.setAttribute("noautofocus","false");
  //panel.setAttribute("position","after_end");
  panel.setAttribute("type","arrow");
  panel.className="panelSearch";
  panel.setAttribute("id","search-panel"+OFFEN.UI.instanceNumber);

  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.buildMenuBarButton: in="+OFFEN.UI.instanceNumber);
  
  
   
  var criteria_hbox = win.document.createElement("hbox");
  criteria_hbox.className="criteriabox";

  // city search field
  var city_hbox = win.document.createElement("hbox");
  city_hbox.className = "searchField";
  
  var city_label = win.document.createElement("label");
  city_label.setAttribute("value",OFFEN.Util.getString("city")+":");
  
  var city_textbox = win.document.createElement("textbox");
  city_textbox.setAttribute("type","autocomplete");
  
  city_textbox.setAttribute("autocompletesearch","basic-autocomplete");
  city_textbox.setAttribute("showcommentcolumn","false");
  city_textbox.setAttribute("completedefaultindex","true");
  city_textbox.setAttribute("autocompletesearchparam",'http://www.oeffnungszeitenbuch.de/rpc/ssptr?typ=autocomplete&autocomplete=stadt&q=');
  city_textbox.addEventListener("keypress",function(evt){
    if (evt.keyCode==13) OFFEN.UI.onPopupHdlr(city_textbox,cat_textbox);},true);

  city_hbox.appendChild(city_label);
  city_hbox.appendChild(city_textbox);
  criteria_hbox.appendChild(city_hbox);

// category search field
  var category_hbox = win.document.createElement("hbox");
  category_hbox.className = "searchField";
  
  var cat_label = win.document.createElement("label");
  cat_label.setAttribute("value",OFFEN.Util.getString("category")+":");
  
  
  var cat_textbox = win.document.createElement("textbox");
  cat_textbox.setAttribute("type","autocomplete");
  
  cat_textbox.setAttribute("autocompletesearch","basic-autocomplete");
  cat_textbox.setAttribute("showcommentcolumn","false");
  cat_textbox.setAttribute("completedefaultindex","true");
  cat_textbox.setAttribute("autocompletesearchparam",'http://www.oeffnungszeitenbuch.de/rpc/ssptr?typ=autocomplete&autocomplete=tagkat&q=');
  cat_textbox.addEventListener("keypress",function(evt){
    if (evt.keyCode==13) OFFEN.UI.onPopupHdlr(city_textbox,cat_textbox);},true);


  category_hbox.appendChild(cat_label);
  category_hbox.appendChild(cat_textbox);
  criteria_hbox.appendChild(category_hbox);

  var button = win.document.createElement("button");
  button.setAttribute("label",OFFEN.Util.getString("search"));
  button.addEventListener("click",function(){OFFEN.UI.onPopupHdlr(city_textbox,cat_textbox);},true);
  
  criteria_hbox.appendChild(button);

  var vbox_container=win.document.createElement("vbox");
  vbox_container.id = "offen_container"+OFFEN.UI.instanceNumber;
  vbox_container.className = "searchresultarea";
  
  
  var vbox=win.document.createElement("vbox");
  vbox.className = "panelbox";
  
  vbox.appendChild(criteria_hbox);
  vbox.appendChild(vbox_container);

  panel.appendChild(vbox);

  panel.addEventListener("popupshown",function(event){
      if (event.target == this)
      {
        OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.buildMenuBarButton.geocallback: entering panel id="+this.id);
        OFFEN.vboxSearchContainer = vbox_container;
        OFFEN.Geoloc.CheckWithCallback(OFFEN.Util.getBrowserWindow(),
                                      function(position){
                                          OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.buildMenuBarButton.geocallback: entering"+position);
                                          if (position != null)
                                          {
                                            OFFEN.latitude=position.coords.latitude;
                                            OFFEN.longitude=position.coords.longitude;
                                            city_textbox.value="";
                                            cat_textbox.value="";
                                            OFFEN.UI.onPopupHdlr(city_textbox,cat_textbox);
                                          }
                                          else panel.hidePopup();
                                          OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.buildMenuBarButton.geocallback: exiting");
                                      });
      }},true);
      
  // create footer    
  var footer = OFFEN.UI.createFooterBox(win.document);
  vbox.appendChild(footer);
  
  toolbaritem.appendChild(panel);

  statusbarpanel.setAttribute("popup","search-panel"+OFFEN.UI.instanceNumber);
  toolbaritem.appendChild(statusbarpanel);
  
  OFFEN.UI.instanceNumber++;
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.buildMenuBarButton: exiting");
  return vbox_container;
}


OFFEN.UI.onPopupHdlr=function(city_tb,tag_tb) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.onPopupHdlr: entering lat="+OFFEN.latitude+"long="+OFFEN.longitude);
  OFFEN.UI.empty(OFFEN.vboxSearchContainer);
  if (city_tb.value == "")
    OFFEN.Server.startSearch(tag_tb.value,OFFEN.latitude,OFFEN.longitude);
  else
  {
    OFFEN.Server.getCityCoordsAndSearch(city_tb.value,tag_tb.value);
  }
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.onPopupHdlr: exiting");
}


OFFEN.UI.loadCaseHandler= function(menuItem) {
  var caseId = menuItem.getAttribute("value");
  OFFEN.Util.loadPage("https://genband.my.salesforce.com/_ui/search/ui/UnifiedSearchResults?asPhrase=1&searchType=2&sen=a1T&sen=a0d&sen=00O&sen=005&sen=001&sen=500&sen=003&str="+caseId,"document",OFFEN.UI.extractCaseAndLoadPage,null,caseId);
}


OFFEN.UI.displayError  = function (title,detail) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.displayError - entering :"+title+" ["+detail+"]");

  if (OFFEN.UI.ErrorPopup == 0)
  {
    OFFEN.UI.ErrorPopup = OFFEN.Util.getBrowserWindow().openDialog("chrome://offen/content/error/error.xul", "", "chrome,titlebar,toolbar,centerscreen",title,detail);
  }
  else
  {
    OFFEN.UI.fillError(OFFEN.UI.ErrorPopup,title,detail,true);
    OFFEN.UI.ErrorPopup.focus();
  }  
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.displayError - exiting");

}
OFFEN.UI.empty = function(container){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.empty: entering container="+container.getAttribute("id"));    
  if (!container) return;
	while(container.hasChildNodes()){
		container.removeChild(container.firstChild);
	}
	OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.empty exiting");    
}
OFFEN.UI.fillError= function(win,errtitle,errdetail,append) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.fillError - entering ["+errtitle+"]");
	
	var vboxerrordetail=null;
	if (win.document)
	{
    vboxerrordetail = win.document.getElementById("error-details");
	}
	else
    OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.UI.fillError - pb with fields to set");
	if (vboxerrordetail!= null)
	{
    // change 0.93
    if (!append)
      OFFEN.UI.empty(vboxerrordetail);

    var label = win.document.createElement("label");
    label.setAttribute("value", errtitle);
    vboxerrordetail.appendChild(label);

    var details = errdetail.split("\n");
    for (var i=0;i<details.length;i++)
    {
      label = win.document.createElement("label");
      label.setAttribute("value", details[i]);
      vboxerrordetail.appendChild(label);
    }
    var xpcomInterface = vboxerrordetail.boxObject.QueryInterface(
       Components.interfaces.nsIScrollBoxObject);
    xpcomInterface.ensureElementIsVisible(label);
  }
  else OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.UI.fillError - vboxerrordetail is NULL !!");
	//win.sizeToContent();

  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.fillError - exiting");

}

OFFEN.UI.openDialogOnlyOnce = function (window,xul,title,features){
  var dialog=null;
  if (typeof(window.hashdialogs) != "undefined")
  {
    dialog =  window.hashdialogs[xul];
  }
  else
    window.hashdialogs = new Object();
  if (dialog == null || dialog.closed)
  {
    window.hashdialogs[xul] = window.openDialog(xul,title,features);
  }
  else dialog.focus();
}

OFFEN.UI.simulateKeyEvent=function(doc,target,value) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.simulateKeyEvent - entering doc="+doc+" "+value);
  target.focus();
  var evt = doc.createEvent("KeyboardEvent");
  for (var i=0;i<value.length;i++)
  {
    evt.initKeyEvent("keypress", true, true, OFFEN.Util.getBrowserWindow(),
                    0, 0, 0, 0,
                    0, value.charCodeAt(i)) 
    var canceled = !target.dispatchEvent(evt);
    if(canceled) {
    // A handler called preventDefault
        OFFEN.Util.log(OFFEN.Util.logR(),"OFFEN.UI.simulateKeyEvent - canceled "+i+" char="+value.charAt(i));

    }
    else // None of the handlers called preventDefault
        OFFEN.Util.log(OFFEN.Util.logR(),"OFFEN.UI.simulateKeyEvent - not canceled "+i);
  }
  
  
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.simulateKeyEvent - exiting");
}

OFFEN.UI.createSearchResultBoxes=function(array_searches) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.createSearchResultBoxes - entering "+array_searches.length);
  var doc = OFFEN.Util.getBrowserWindow().document;
  OFFEN.UI.empty(OFFEN.vboxSearchContainer);

  if (array_searches.length == 0)
  {
    var box = OFFEN.UI.createNoResultBox(doc);
    
    OFFEN.vboxSearchContainer.appendChild(box);
  }
  else
  {
    for (var i in array_searches)
    {
      // change version 1.1 
      //var box = OFFEN.UI.createResultBox(doc,array_searches[i]);
      var box = OFFEN.UI.createResultBox(doc,array_searches[i]);
    
      OFFEN.vboxSearchContainer.appendChild(box);
    }
  }
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.createSearchResultBoxes - exiting");
}
OFFEN.UI.createNoResultBox=function(doc) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.createNoResultBox - entering ");
  var box = doc.createElement("box");
  
  var cell1 = doc.createElement('label');
  cell1.setAttribute("value",OFFEN.Util.getString("noresultfound"));
  cell1.className="noresultfound";
  box.appendChild(cell1);
  
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.createNoResultBox - exiting ");
  return box;

}

OFFEN.UI.createResultBox=function(doc,filial) {
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.UI.createResultBox - entering "+filial.shortname);
  var businesscard_vbox = doc.createElement("vbox");
  businesscard_vbox.className = "businesscard";
  
  var details_hbox = doc.createElement("hbox");
  
  var left_cell_vbox = doc.createElement("vbox");
  var spacer = button_more_schedules = doc.createElement("spacer");
  spacer.setAttribute("flex","1");

  var right_status_vbox = doc.createElement("vbox");

  // debug 
  var cell1 = doc.createElement('label');
  cell1.setAttribute("value","           ");
  right_status_vbox.appendChild(cell1);
  // end debug

 
  details_hbox.appendChild(left_cell_vbox);
  details_hbox.appendChild(spacer);
  details_hbox.appendChild(right_status_vbox);
  businesscard_vbox.appendChild(details_hbox);

  right_status_vbox.style = "min-width: 25px;";
  
  var cell = doc.createElement('label');
  cell.setAttribute("value",filial.shortname);
  var filial_url="";
  if (filial.urlcode=="")
    cell.className = "storename";
  else
  {
    filial_url = "http://www.oeffnungszeitenbuch.de/filiale/"+
              filial.city+"-"+encodeURIComponent(encodeURIComponent(filial.shortname))+"-"+filial.id+filial.urlcode+".html";
    cell.className = "storenamewithurl";
    cell.addEventListener("click", 
        OFFEN.UI.openNewUrlEventHandler(filial_url), false);
  }
  var hbox_details = doc.createElement("hbox");
  hbox_details.setAttribute("align","center");
  
  var phone = doc.createElement('label');
  phone.setAttribute("value",filial.phone_number);
  var address = doc.createElement('label');
  address.setAttribute("value",filial.address);
  var today_schedule = null;
  var date = new Date();

  // if formatted_schedule_list is empty means we don't know the schedules
  var formatted_schedule_list= filial.schedule.summarize();

  
  
  hbox_details.appendChild(address);
  hbox_details.appendChild(phone);

  var button_more_schedules = null;
  var hbox_schedules=null;

  if (formatted_schedule_list != "")
  {
    today_schedule = doc.createElement('label');
    today_schedule.setAttribute("value",filial.schedule.toStringForDate(date));

    hbox_details.appendChild(today_schedule);

    
    
    button_more_schedules = doc.createElement("button");
    button_more_schedules.setAttribute("label",OFFEN.Util.getString("moreSchedules"));
    hbox_details.appendChild(button_more_schedules);

    hbox_schedules=doc.createElement("hbox");
    var label_schedules = doc.createElement('label');
    label_schedules.setAttribute("value",formatted_schedule_list);
    label_schedules.className = "schedules";

    label_schedules.style.display="none";
    hbox_schedules.appendChild(label_schedules);

    button_more_schedules.addEventListener("click",
                  function(){
                    if (OFFEN.UI.lastOpenedSchedule!= null)
                      OFFEN.UI.lastOpenedSchedule.style.display="none";
                    OFFEN.UI.lastOpenedSchedule = label_schedules;
                    label_schedules.style.display="";
                  }
                  ,true);
    if (filial.schedule.isOpenNow(date))
    {
      right_status_vbox.className = "statusFlagOpen";
    }   
    else
    {
      right_status_vbox.className = "statusFlagClosed";
    }

  }
  else
  {
    // create a button to add schedule pointing to page detail
    var label_store_hours_unknown = doc.createElement('label');
    label_store_hours_unknown.setAttribute("value",OFFEN.Util.getString("storehours")+": "+OFFEN.Util.getString("unknown"));
    hbox_details.appendChild(label_store_hours_unknown);
    
    button_add_schedule = doc.createElement("button");
    button_add_schedule.setAttribute("label",OFFEN.Util.getString("addSchedules"));
    button_add_schedule.addEventListener("click",
                    OFFEN.UI.openNewUrlEventHandler(filial_url)
                  ,true);
    hbox_details.appendChild(button_add_schedule);
    right_status_vbox.className = "statusFlagUnknown";

    // change gradient to grey
  }
  left_cell_vbox.appendChild(cell);
  left_cell_vbox.appendChild(hbox_details);
  
  if (hbox_schedules!=null) businesscard_vbox.appendChild(hbox_schedules);
  
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.UI.createResultBox - exiting "+businesscard_vbox);
  return businesscard_vbox;
}

OFFEN.UI.openNewUrlEventHandler=function(url) {
  return function (event) {
    OFFEN.Util.openNewTab(url);
  }
}

OFFEN.UI.createFooterBox=function(doc) {
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.UI.createFooterBox - entering ");
  var footer_hbox = doc.createElement("hbox");
  footer_hbox.className = "footer";
  footer_hbox.setAttribute("pack","center");
  footer_hbox.setAttribute("align","center");
  
  // Create icon 
  var image = doc.createElement('image');
  image.className = "icoSfdccrutchSmall";
  footer_hbox.appendChild(image);
  
  // create name label
  var label = doc.createElement('label');
  label.setAttribute("value","ÖffnungszeitenBuch | ");
  footer_hbox.appendChild(label);
  
  // create terms of use link
  var link1 = doc.createElement('label');
  link1.setAttribute("value",OFFEN.Util.getString("termsofuse"));
  link1.className = "footerlink";
  link1.addEventListener("click", OFFEN.UI.openNewUrlEventHandler("http://www.oeffnungszeitenbuch.de/nutzungsbedingungen.html"), false);
  footer_hbox.appendChild(link1);
  
  // create | separation
  var separation = doc.createElement('label');
  separation.setAttribute("value","|");
  footer_hbox.appendChild(separation);
  
  // create Imprint link
  var link2 = doc.createElement('label');
  link2.setAttribute("value",OFFEN.Util.getString("imprint"));
  link2.className = "footerlink";
  link2.addEventListener("click", OFFEN.UI.openNewUrlEventHandler("http://www.oeffnungszeitenbuch.de/impressum.html"), false);
  footer_hbox.appendChild(link2);
  
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.UI.createFooterBox - exiting "+footer_hbox);
  return footer_hbox;
}
