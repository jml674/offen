const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import("resource://gre/modules/devtools/Console.jsm");


const CLASS_ID = Components.ID('b5e1d120-4f0a-11e4-916c-0800200c9a66'); // ? Change this
const CLASS_NAME = "Basic AutoComplete";
const CONTRACT_ID = '@mozilla.org/autocomplete/search;1?name=basic-autocomplete';

/**
 * @constructor
 *
 * @implements {nsIAutoCompleteResult}
 *
 * @param {string} searchString
 * @param {number} searchResult
 * @param {number} defaultIndex
 * @param {string} errorDescription
 * @param {Array.<string>} results
 * @param {Array.<string>|null=} comments
 */
function ProviderAutoCompleteResult(searchString, searchResult,
  defaultIndex, errorDescription, results, comments) {
  this._searchString = searchString;
  this._searchResult = searchResult;
  this._defaultIndex = defaultIndex;
  this._errorDescription = errorDescription;
  this._results = results;
  this._comments = comments;
}

ProviderAutoCompleteResult.prototype = {
  _searchString: "",
  _searchResult: 0,
  _defaultIndex: 0,
  _errorDescription: "",
  _results: [],
  _comments: [],

  /**
   * @return {string} the original search string
   */
  get searchString() {
    return this._searchString;
  },

  /**
   * @return {number} the result code of this result object, either:
   *   RESULT_IGNORED   (invalid searchString)
   *   RESULT_FAILURE   (failure)
   *   RESULT_NOMATCH   (no matches found)
   *   RESULT_SUCCESS   (matches found)
   */
  get searchResult() {
    return this._searchResult;
  },

  /**
   * @return {number} the index of the default item that should be entered if
   *   none is selected
   */
  get defaultIndex() {
    return this._defaultIndex;
  },

  /**
   * @return {string} description of the cause of a search failure
   */
  get errorDescription() {
    return this._errorDescription;
  },

  /**
   * @return {number} the number of matches
   */
  get matchCount() {
    return this._results.length;
  },

  /**
   * @return {string} the value of the result at the given index
   */
  getValueAt: function(index) {
    return this._results[index];
  },

  /**
   * @return {string} the comment of the result at the given index
   */
  getCommentAt: function(index) {
    if (this._comments)
      return this._comments[index];
    else
      return '';
  },

  /**
   * @return {string} the style hint for the result at the given index
   */
  getStyleAt: function(index) {
    if (!this._comments || !this._comments[index])
      return null;  // not a category label, so no special styling

    if (index == 0)
      return 'suggestfirst';  // category label on first line of results

    return 'suggesthint';   // category label on any other line of results
  },

  /**
   * Gets the image for the result at the given index
   *
   * @return {string} the URI to the image to display
   */
  getImageAt : function (index) {
    return '';
  },

  /**
   * Get the final value that should be completed when the user confirms
   * the match at the given index.
   * @return {string} the final value of the result at the given index 
   */
  getFinalCompleteValueAt: function(index) {
    return this.getValueAt(index);
  },

  /**
   * Removes the value at the given index from the autocomplete results.
   * If removeFromDb is set to true, the value should be removed from
   * persistent storage as well.
   */
  removeValueAt: function(index, removeFromDb) {
    this._results.splice(index, 1);

    if (this._comments)
      this._comments.splice(index, 1);
  },

  getLabelAt: function(index) { return this._results[index]; },

  QueryInterface: XPCOMUtils.generateQI([ Ci.nsIAutoCompleteResult ])
};


/**
 * @constructor
 *
 * @implements {nsIAutoCompleteSearch}
 */
function ProviderAutoCompleteSearch() {
}

ProviderAutoCompleteSearch.prototype = {

  classID: CLASS_ID,
  classDescription : CLASS_NAME,
  contractID : CONTRACT_ID,

  /**
   * Searches for a given string and notifies a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param searchString the string to search for
   * @param searchParam an extra parameter
   * @param previousResult a previous result to use for faster searchinig
   * @param listener the listener to notify when the search is complete
   */
  startSearch: function(searchString, searchParam, result, listener) {
    // This autocomplete source assumes the developer attached a JSON string
    // to the the "autocompletesearchparam" attribute or "searchParam" property
    // of the <textbox> element. The JSON is converted into an array and used
    // as the source of match data. Any values that match the search string
    // are moved into temporary arrays and passed to the AutoCompleteResult
    console.log("searchstring="+searchString); 
    console.log("searchParam="+searchParam); 
    
    this.loadAutocompleteList(searchString,searchParam,listener);
    /*  var searchResults = JSON.parse(searchParam);
      

      var results = [];
      var comments = [];
      for (i=0; i<searchResults.length; i++) {
        if (searchResults[i].value.indexOf(searchString) == 0) {
          results.push(searchResults[i].value);
          if (searchResults[i].comment)
            comments.push(searchResults[i].comment);
          else
            comments.push(null);
        }
      }
      var newResult = new ProviderAutoCompleteResult(searchString, Ci.nsIAutoCompleteResult.RESULT_SUCCESS, 0, "", results, comments);
      listener.onSearchResult(this, newResult);
      */
  },

  /**
   * Stops an asynchronous search that is in progress
   */
  stopSearch: function() {
  },
  
  loadAutocompleteList: function(searchString,url,listener) {
    	var that_listener = listener;
    	var that_searchString = searchString;
    	var that = this;
    	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
      req.onreadystatechange=function()	{ 
		  if(req.readyState == 4)
		  {
			   if(req.status == 200)
		     {
            console.log("loadAutocompleteList answer from server: "+req.responseText);
            var list = req.responseText.split("\n");
            console.log("loadAutocompleteList length: "+list.length);
             
            var results = [];
            var comments = [];

            for (var i=3;i<list.length-3;i++)
            {
                var items=list[i].split(";");
                results.push(items[0]);
                comments.push(null);
            }
            var newResult = new ProviderAutoCompleteResult(that_searchString, Ci.nsIAutoCompleteResult.RESULT_SUCCESS, 0, "", results, comments);
            that_listener.onSearchResult(that, newResult);
         }
			}
			else
			{
        console.log("loadAutocompleteList: status ="+req.status+" !=200!");
			}
		}; 
	  req.open("GET", url+searchString , true);
	  req.send(null);
    
  },

  QueryInterface: XPCOMUtils.generateQI([ Ci.nsIAutoCompleteSearch ])
};

// The following line is what XPCOM uses to create components
const NSGetFactory =
  XPCOMUtils.generateNSGetFactory([ ProviderAutoCompleteSearch ]);