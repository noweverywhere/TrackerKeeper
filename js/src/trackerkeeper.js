
var //Modernizr = Modernizr, 
  NowEverywhere = NowEverywhere || {},
	indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

//Name spacing for my app	
NowEverywhere.TrackerKeeper = NowEverywhere.TrackerKeeper || {};
// originally I wanted to use WebSQl for this app, then abandoned 
// that idea since indexedDB is supplanting it. so I have a bunch of
// indexedDB stuff in here. Most of it will go unused since this app
// is targeted for mobile devices 
NowEverywhere.TrackerKeeper.indexedDB = NowEverywhere.TrackerKeeper.indexedDB || {};
// I want to have the logic of this app seperated as much as possible using an MVC-ish
// design pattern
NowEverywhere.TrackerKeeper.Models = NowEverywhere.TrackerKeeper.Models || {};
NowEverywhere.TrackerKeeper.Views = NowEverywhere.TrackerKeeper.Views || {};
NowEverywhere.TrackerKeeper.Controllers = NowEverywhere.TrackerKeeper.Controllers || {};

NowEverywhere.TrackerKeeper.Utils = NowEverywhere.TrackerKeeper.Utils || {};

NowEverywhere.TrackerKeeper.Views.AddOpponent = function () {
  // this function adds a adds a field to the page for the  user
  // to enter a name
  var app = NowEverywhere.TrackerKeeper,
    form = $(document.createElement('form')),
    inputText = $(document.createElement('input')),
    inputSubmit = $(document.createElement('input'));
  form.attr({
    id: 'addOpponent'
  });
  inputText.attr({
    'class': 'name',
    'type': 'text',
    'value': 'Opponent Name'
  });
  inputSubmit.attr({
    'class': 'submit',
    'type': 'submit',
    'value': 'Enter'
  });

  inputSubmit.bind('click', function(event){ event.preventDefault();});

  form.append(inputText, inputSubmit);

  $('body').prepend(form);

};

NowEverywhere.TrackerKeeper.Utils.PlayerId = function () {
  // This function should supply each contact with a unique id
  // I know this is not unique enough. Will find a way to keep track of ID's later;
  // this is good enough for the client side. will worry more about this on the server
  this.uniqueId = new Date().getTime();
  return this.uniqueId;
};

NowEverywhere.TrackerKeeper.Models.Player = function (args) {
  var app = NowEverywhere.TrackerKeeper;
  this.name = args.name;
  this.id = args.id || new app.Utils.PlayerId();
  return this;
};

NowEverywhere.TrackerKeeper.Models.PlayerList = NowEverywhere.TrackerKeeper.Models.PlayerList || {};
NowEverywhere.TrackerKeeper.Models.PlayerList.construct = function MakePlayerList (oldList) {
  // this function converts a json encoded string of friends into a collection of friend objects
  var app = NowEverywhere.TrackerKeeper,
    friends = JSON.parse(oldList),
    friend;
    this.add = this.addPlayer;

  if(oldList){
    for(friend in friends){
      if (friends.hasOwnProperty(friend)){
        console.log(friend);
        this.add(new app.Models.Player(friend));
      }
    }
  }
  return this;
  
};

NowEverywhere.TrackerKeeper.Models.PlayerList.addPlayer = function (arg){
  console.log('is "this" the window or the PlayerList?',this, arg);

};

NowEverywhere.TrackerKeeper.Models.User =  function (){
  var app = NowEverywhere.TrackerKeeper,
    friends;
  //check what we have any info on the user in the database
  //http://diveintohtml5.info/storage.html
  if ('localStorage' in window && window['localStorage'] !== null) {

    // dont need this. just trying out name-spacing idea in case 
    // other libraries on the same page use localstorage. very unlikely
    localStorage['NE']= localStorage['NE'] || 'NowEverywhere';
    localStorage['NE.TrackerKeeper'] = localStorage['NE.TrackerKeeper'] || 'TrackerKeeper';
    friends = localStorage.getItem('NE.PlayerList');
    
  }

  this.friends = new app.Models.MakePlayerList(friends);
  return this;
};


NowEverywhere.TrackerKeeper.setupPlayers =  function (){
  //this is where the user's saved friend will be loaded from a database/server
  //and then have representations of those friends presented in the dom
};

NowEverywhere.TrackerKeeper.InitFunction = function () {
	console.log('Modernizr',Modernizr);
	var app = NowEverywhere.TrackerKeeper;
  app.user = new app.Models.User();

  $('#addPlayer').bind('click', app.Views.AddOpponent);

  //NowEverywhere.TrackerKeeper.indexedDB.open();
};


// below are some indexedDB functions probably wont use those and
// instead use localstorage and sessionstorage instead
NowEverywhere.TrackerKeeper.setupDB = function (event) {
  var app = NowEverywhere.TrackerKeeper;
 console.log('changing the version successfull?', event);
    if (!app.indexedDB.db.objectStoreNames.contains('friends')) {
      app.indexedDB.friendsStore = app.indexedDB.db.createObjectStore(
      'friends', 
      {
        keyPath: "NowEverywhere.friends"
      });
      //add the fields/tables here
      app.indexedDB.friendsStore.createIndex("name", "name", { unique: false });
    }
};

NowEverywhere.TrackerKeeper.indexedDB.onerror = function (event) {
	console.log('db failed to be created', event);
};

NowEverywhere.TrackerKeeper.indexedDB.open = function() {
  
  var request = indexedDB.open(
      "NowEverywhere.TrackerKeeper"
    ),
    app = NowEverywhere.TrackerKeeper;

  request.onsuccess = function(event) {
    //stores the reference to the database
    console.log('DB created', event);
    app.indexedDB.db = event.target.result;
    var v = 2.2,
      versionChange;
    if (app.indexedDB.db.setVersion) {
      versionChange = app.indexedDB.db.setVersion(v);
      versionChange.onsuccess = app.setupDB;
    }
    //app.Models.PlayerList();
    // Do some more stuff in a minute
  };

  request.onupgradeneeded = app.setupDB;

  request.onfailure = NowEverywhere.TrackerKeeper.indexedDB.onerror;
};


// when the documet is ready start up our app
$(document).bind("ready", NowEverywhere.TrackerKeeper.InitFunction);