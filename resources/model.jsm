
Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/util.jsm");
Components.utils.import("resource://offen/dom.jsm");

var EXPORTED_SYMBOLS = ["OFFEN.Filial","OFFEN.Schedule"];


OFFEN.Filial = function(id,distance_km,status,status_valid_for_x_hours)
{
  this.id = id;
  this.distance_km = distance_km;
  this.status = status;
  this.status_valid_for_x_hours = status_valid_for_x_hours;
  this.shortname = "";
  this.address="";
  this.city="";
  this.number="";
  this.phone_number="";
  this.url="";
  this.schedule="";  
  this.urlcode = "";
}


OFFEN.Filial.prototype.updateRestOfInformation= function(name,shortname,address,number,city,phone_number,url, schedule)
{
  this.name = name;
  this.shortname = shortname;
  this.address=address;
  this.number=number;
  this.city=city;
  this.phone_number=phone_number;
  this.url=url;
  this.schedule=schedule;  
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Filial.prototype.updateRestOfInformation exiting id="+this.id+" name="+this.name+" sn="+this.shortname+" address="+this.address+" city="+this.city+" phone="+this.phone_number+" url="+this.url+" schedule="+this.schedule.toString());

}

OFFEN.Filial.prototype.updateUrlCode=function(urlcode) {
  this.urlcode = urlcode;
  OFFEN.Util.log(OFFEN.Util.logA(),"OFFEN.Filial.prototype.updateUrlCode exiting id="+this.id+" sn="+this.shortname+"urlcode="+this.urlcode);
}

OFFEN.days= [OFFEN.Util.getString("Sun"),
              OFFEN.Util.getString("Mon"),
              OFFEN.Util.getString("Tue"),
              OFFEN.Util.getString("Wed"),
              OFFEN.Util.getString("Thu"),
              OFFEN.Util.getString("Fri"),
              OFFEN.Util.getString("Sat")];

OFFEN.Schedule = function(mon0in,mon0out,mon1in,mon1out,
                           tue0in,tue0out,tue1in,tue1out,
                           wed0in,wed0out,wed1in,wed1out,
                           thu0in,thu0out,thu1in,thu1out,
                           fri0in,fri0out,fri1in,fri1out,
                           sat0in,sat0out,sat1in,sat1out,
                           sun0in,sun0out,sun1in,sun1out)
{
  this.in=new Array();
  this.out=new Array();
  this.in[0]=new Array();
  this.in[1]=new Array();
    
  this.in[0][0]=sun0in;
  this.in[0][1]=mon0in;
  this.in[0][2]=tue0in;
  this.in[0][3]=wed0in;
  this.in[0][4]=thu0in;
  this.in[0][5]=fri0in;
  this.in[0][6]=sat0in;
  this.in[1][0]=sun1in;
  this.in[1][1]=mon1in;
  this.in[1][2]=tue1in;
  this.in[1][3]=wed1in;
  this.in[1][4]=thu1in;
  this.in[1][5]=fri1in;
  this.in[1][6]=sat1in;
 
  this.out[0]=new Array();
  this.out[1]=new Array();
  this.out[0][0]=sun0out;
  this.out[0][1]=mon0out;
  this.out[0][2]=tue0out;
  this.out[0][3]=wed0out;
  this.out[0][4]=thu0out;
  this.out[0][5]=fri0out;
  this.out[0][6]=sat0out;
  this.out[1][0]=sun1out;
  this.out[1][1]=mon1out;
  this.out[1][2]=tue1out;
  this.out[1][3]=wed1out;
  this.out[1][4]=thu1out;
  this.out[1][5]=fri1out;
  this.out[1][6]=sat1out;
  
}

OFFEN.Schedule.prototype.toString=function() {
  var str="";
  var days= ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  for (var i=0;i<days.length;i++)
  {
    str+=days[i]+" "+this.in[0][i]+"-"+this.out[0][i]+"/"+this.in[1][i]+"-"+this.out[1][i];
  }
  return str;
}

OFFEN.Schedule.prototype.toStringForDate=function(date) {
  var str="";
  var day= date.getDay();
  if (this.in[0][day]!="")
    str+=OFFEN.Util.getString("storehours")+":"+" "+ this.in[0][day]+"-"+this.out[0][day];
  if (this.in[1][day]!="")  
    str+=" "+this.in[1][day]+"-"+this.out[1][day];
  if (str =="") str=" "+OFFEN.Util.getString("closed");
  return str;
}

OFFEN.Schedule.prototype.format=function() {
  var str="";

  for (var i=1;i<OFFEN.days.length+1;i++)
  {
    var str_day="";
    var day = i%7;
    
    if (this.in[0][day]!="")
      str_day+=" "+ this.in[0][day]+"-"+this.out[0][day];
    if (this.in[1][day]!="")  
      str_day+=" "+this.in[1][day]+"-"+this.out[1][day];
    if (str_day != "")
    {
      str+=" "+OFFEN.days[day]+":"+str_day;
    }
  }
  
  return str;
}

OFFEN.Schedule.prototype.summarize=function() {
  var str="";
  var starting_day=OFFEN.days[1];
  var current_schedule=this.toStringForDay(1);
  var nb=0;
  var schedule= new Array();
  for (var i=0;i<OFFEN.days.length;i++)
  {
    schedule[i]=this.toStringForDay(i);
  }
  for (var i=2;i<OFFEN.days.length+1;i++)
  {
    var day = i%7;
    var before = OFFEN.Util.mod((day-1),7);
    var str_day = this.toStringForDay(day);

    var debug = OFFEN.Pref.get(OFFEN.Pref.TEST_MODE, "bool", false);
    var str_debug="";
    
    // schedule has changed
    if(schedule[before] != str_day)
    {
      if (nb==0)
      {
          if (debug) str_debug="A"+before;
          if (schedule[before]!="") str+=" "+OFFEN.days[before]+str_debug+":"+schedule[before];
      }
      else
      {
          if (debug) str_debug="B";
          if (schedule[day]!="") str+=" "+starting_day+"-"+OFFEN.days[before]+str_debug+":"+schedule[before];
      } 
      if (i==OFFEN.days.length && str_day!="")
      {
          if (debug) str_debug="D";
          str+=" "+OFFEN.days[day]+str_debug+str_day;
      }
      starting_day=OFFEN.days[day];
      nb=0;
    }
    else // same schedule
    {
      
      if (i==OFFEN.days.length) // last day
      {
        if (schedule[day]!="" && schedule[day]!=schedule[before])
        {
          if (debug) str_debug="E";
            str+=" "+OFFEN.days[day]+str_debug+schedule[day];
        }
        else if (schedule[day]!="" && schedule[day]==schedule[before])
        {
          if (debug) str_debug="F";
          if (schedule[day]!="") str+=" "+starting_day+"-"+OFFEN.days[day]+str_debug+":"+schedule[before];
        }
      }
      nb+=1;    
    }
  }
  
  return str;
}
OFFEN.Schedule.prototype.toStringForDay=function(day) {
  var str="";
  if (this.in[0][day]!="")
      str+=" "+ this.in[0][day]+"-"+this.out[0][day];
  if (this.in[1][day]!="")  
      str+=" "+this.in[1][day]+"-"+this.out[1][day];  
  return str;  
}

OFFEN.Schedule.prototype.isOpenNow=function(date) {
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Schedule.prototype.isOpenNow schedule="+this.format() );

   var result = false;
   var cause ="";
   var begin_date;
   var end_date;
   if (this.in[0][date.getDay()]!="")
   {
    begin_date= new Date(parseInt(date.getFullYear()), parseInt(date.getMonth()), parseInt(date.getDate()), 0, 0, 0, 0);

    this.setHoursAndMinutes(begin_date,this.in[0][date.getDay()]);
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Schedule.prototype.isOpenNow bd1="+begin_date.toString() );
   
    end_date= new Date(parseInt(date.getFullYear()), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    this.setHoursAndMinutes(end_date,this.out[0][date.getDay()]);
    OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Schedule.prototype.isOpenNow  ed1="+end_date.toString() );

    cause="DATE1";

    if (date >= begin_date && date <= end_date)
    {
      result = true;
      cause ="IN DATES1";
    }
    else if (this.in[1][date.getDay()]!="")
    {
      this.setHoursAndMinutes(begin_date,this.in[1][date.getDay()]);
      this.setHoursAndMinutes(end_date,this.out[1][date.getDay()]);

      cause="DATE2";

      if (date >= begin_date && date <= end_date)
      {
        result = true;
        cause ="IN DATES2";
      }
      else cause="OUT_DATE2";
    }
    else cause ="DATE2 EMPTY";

   }
   else cause ="DATE1 EMPTY";
   OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Schedule.prototype.isOpenNow exiting "+result+" cause="+cause);  
   OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Schedule.prototype.isOpenNow exiting date="+date.toString());
   
   return result;
}

OFFEN.Schedule.prototype.setHoursAndMinutes=function(date,period_string) {
  var regexp = new RegExp("([0-9]{2})\:([0-9]{2})");
  matches = regexp.exec(period_string);
  if (matches != null)
  {
    date.setHours(parseInt(matches[1],10));
    date.setMinutes(parseInt(matches[2],10));
  }
  else OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.Schedule.prototype.setHoursAndMinutes wrong timing "+period_string);  
}

