

Components.utils.import("resource://offen/common.jsm");
Components.utils.import("resource://offen/io.jsm");
Components.utils.import("resource://offen/util.jsm");

var EXPORTED_SYMBOLS = ["OFFEN.Dom"];

OFFEN.Dom = {};

OFFEN.Dom.Node =
      {
        ELEMENT_NODE                :  1,
        ATTRIBUTE_NODE              :  2,
        TEXT_NODE                   :  3,
        CDATA_SECTION_NODE          :  4,
        ENTITY_REFERENCE_NODE       :  5,
        ENTITY_NODE                 :  6,
        PROCESSING_INSTRUCTION_NODE :  7,
        COMMENT_NODE                :  8,
        DOCUMENT_NODE               :  9,
        DOCUMENT_TYPE_NODE          : 10,
        DOCUMENT_FRAGMENT_NODE      : 11,
        NOTATION_NODE               : 12
      };


OFFEN.Dom.Attr=function(node,name){
  if (name =="textContent")
  {
    if (node.childNodes.length > 0)
      return node.textContent;
    else return node.parentNode.textContent;
  }
  else if (name =="tagName")
  {
        return node.tagName;
  }
  else if (name == "innerHTML")
  {
        return node.innerHTML;
  }
  else
  {
    if (node.getAttributeNode(name))
      return node.getAttributeNode(name).value;
    else return "";
  }
}

OFFEN.Dom.AttrMatches=function(node,name,pattern){
  if (OFFEN.Dom.Attr(node,name) != "")
  {
    var value = OFFEN.Dom.Attr(node,name);
    var regexp = new RegExp(pattern);
    return value.match(regexp);
  }
  else return 0;
}

OFFEN.Dom.testAttr=function(node,name,value){
  if (value.substr(0,1)=="/")
  {
    return OFFEN.Dom.AttrMatches(node,name,value.substr(1,value.length-2));
  }
  else
    return OFFEN.Dom.Attr(node,name) == value;
}

OFFEN.Dom.FindNodeStart=function(domnode,attr,value,n,nodeset)
{
  node = null;
  //OFFEN.Util.log(OFFEN.Util.logD(),"child#= "+domnode.childNodes.length);

  for(var i=0;i<domnode.childNodes.length;i++)
  {

    var child = domnode.childNodes[i];
    if (child.nodeType != OFFEN.Dom.Node.ELEMENT_NODE)
    {
      //      log_msg(tab($n)."Node ".$child->nodeName);
    }
    else
    {
      //OFFEN.Util.log(OFFEN.Util.logD(),"Node "+child.nodeName+" "+attr+"="+OFFEN.Dom.Attr(child,attr)+" class="+OFFEN.Dom.Attr(child,"class"));
      if (OFFEN.Dom.testAttr(child,attr,value))
      {
        //        log_msg("Found Node ".$child->nodeName." value attr=".$value);
        //        log_msg("Found Node ".$child->nodeName." value attr=".Attr($child,$attr));
        if (nodeset == null)
          return child;
        else
          nodeset.push(child);
      }
      if ((node = OFFEN.Dom.FindNodeStart(child,attr,value,n+1,nodeset)) != null) return node;
    }
  }
  return node;
}

OFFEN.Dom.FindNode = function(domnode,attr,value){
  OFFEN.Util.log(OFFEN.Util.logR(),"OFFEN.Dom.FindNode entering "+domnode+" "+attr+" "+value);
  var node = OFFEN.Dom.FindNodeStart(domnode,attr,value,0,null);
  OFFEN.Util.log(OFFEN.Util.logR(),"OFFEN.Dom.FindNode exiting ");

  return node;
}

OFFEN.Dom.FindAllNodes = function(domnode,attr,value){
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Dom.FindNode entering "+domnode.tagName+" "+attr+" "+value);
  var nodes = [];
  OFFEN.Dom.FindNodeStart(domnode,attr,value,0,nodes);
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Dom.FindNode exiting ");

  return nodes;
}

OFFEN.Dom.ApplyToAllNodes=function(domnode,cb)
{
  //OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Dom.findElement applying callback to "+domnode.tagname);  
  cb(domnode);
  for(var i=0;i<domnode.childNodes.length;i++)
  {

    var child = domnode.childNodes[i];
    if (child.nodeType == OFFEN.Dom.Node.ELEMENT_NODE)
    
    {
      OFFEN.Dom.ApplyToAllNodes(child,cb);
    }
  }
}

OFFEN.Dom.findElement=function(dom,path)
{
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Dom.findElement entering "+dom);
  for(var i=0;i<path.nodes.length;i++)
  {
    var node = path.nodes[i];
    if (dom != null)
      dom = OFFEN.Dom.findElementByTagAndIndex(dom,node);
    else
    {
      OFFEN.Util.log(OFFEN.Util.logC(),"OFFEN.Dom.findElement dom is null ! "+i);
      break;
    }
  }
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Dom.findElement exiting");
  return dom;
}

OFFEN.Dom.findElementByTagAndIndex=function(dom,node) 
{
  var index = 0;
  var child=null;
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Dom.findElementByTagAndIndex looking for "+node.tagName+node.index);

  for(var i=0;i<dom.childNodes.length;i++)
  {
      child = dom.childNodes[i];
      if (child.tagName == node.tagName)
      {
        if (index == node.index) break;
        index++;
      }
  }  
   if (child == null)
  {
    OFFEN.Dom.prettyPrint(dom.parentNode);
  } 
  return child;
}
OFFEN.Dom.prettyPrint=function(dom) 
{
  var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"]
                            .createInstance(Components.interfaces.nsIDOMSerializer);  
  var str = serializer.serializeToString( dom );
  OFFEN.Util.log(OFFEN.Util.logD(),"OFFEN.Dom.prettyPrint: "+str);
}

