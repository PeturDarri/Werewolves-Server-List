/// <reference path="Photon/Photon-Javascript_SDK.d.ts"/> 
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var Languages = [
	"Unsupported",
	"Arabic",
	"Brazilian Portuguese",
	"Chinese Simplified",
	"Chinese Traditional",
	"Czech",
	"Danish",
	"Dutch",
	"English",
	"Finnish",
	"French",
	"German",
	"Hungarian",
	"Italian",
	"Japanese",
	"Korean",
	"LATAM Spanish",
	"Norwegian",
	"Polish",
	"Portuguese",
	"Russian",
	"Spanish",
	"Swedish",
	"Turkish",
	"Count"
];

var cachedRooms = [];
var startRegion = "us";
var lobbyCount = 0;
var allLobbyCount = 0;
var lobbiesGotten = false;

var DemoWss = this["AppInfo"] && this["AppInfo"]["Wss"];
var DemoAppId = this["AppInfo"] && this["AppInfo"]["AppId"] ? this["AppInfo"]["AppId"] : "<no-app-id>";
var DemoAppVersion = this["AppInfo"] && this["AppInfo"]["AppVersion"] ? this["AppInfo"]["AppVersion"] : "1.0";
var DemoMasterServer = this["AppInfo"] && this["AppInfo"]["MasterServer"];
var DemoFbAppId = this["AppInfo"] && this["AppInfo"]["FbAppId"];
var ConnectOnStart = false;
var DemoLoadBalancing = (function (_super) {
    __extends(DemoLoadBalancing, _super);
    function DemoLoadBalancing() {
        _super.call(this, DemoWss ? Photon.ConnectionProtocol.Wss : Photon.ConnectionProtocol.Ws, DemoAppId, DemoAppVersion);
        this.logger = new Exitgames.Common.Logger("Demo:");
        this.logger.info("Init", this.getNameServerAddress(), DemoAppId, DemoAppVersion);
        this.setLogLevel(Exitgames.Common.Logger.Level.DEBUG);
    }
    DemoLoadBalancing.prototype.start = function () {
		this.connectOptions.lobbyName = "Lobo Lobby";
		this.connectOptions.lobbyType = 2;
		this.connectOptions.sqlLobbyFilter = "";
		this.connectToRegionMaster(startRegion);
    };
    DemoLoadBalancing.prototype.onError = function (errorCode, errorMsg) {
        this.output("Error " + errorCode + ": " + errorMsg);
    };

    DemoLoadBalancing.prototype.onRoomListUpdate = function (rooms, roomsUpdated, roomsAdded, roomsRemoved) {
        this.onRoomList(this.availableRooms());
    };
	
	DemoLoadBalancing.prototype.onStateChange = function (state) {
		var statusElem = document.getElementById("connectStatus");
		if (state == 5)
		{
			statusElem.innerHTML = "Connected";
			statusElem.style.color = "green";
		}
		else if (state > 0 && state < 10)
		{
			statusElem.innerHTML = "Connecting...";
			statusElem.style.color = "#757575";
		}
		else
		{
			statusElem.innerHTML = "Disconnected (Try refreshing)";
			statusElem.style.color = "red";
		}
	};
	
    DemoLoadBalancing.prototype.onRoomList = function (rooms)
    {
    	onRoomsList(rooms);
    };
	
	DemoLoadBalancing.prototype.onAppStats = function (errorCode, errorMsg, stats) {
		document.getElementById("fullPlayerCount").innerHTML = (stats.peerCount + stats.masterPeerCount) - 1;
		document.getElementById("playerCount").innerHTML = stats.masterPeerCount - 1;
		allLobbyCount = stats.gameCount;
		if (lobbiesGotten)
		{
			document.getElementById("privateLobbyCount").innerHTML = allLobbyCount - lobbyCount;
		}
	};
    
    return DemoLoadBalancing;
}(Photon.LoadBalancing.LoadBalancingClient));
var demo;
window.onload = function () {
	var region = document.getElementById("region");
	var hash = location.hash.substring(1).toLowerCase();
	for (i = 0; i < region.options.length; ++i){
		if (region.options[i].value == hash){
			startRegion = hash;
			region.value = hash;
		}
	}
	checkShowNotice(startRegion);
    demo = new DemoLoadBalancing();
    demo.start();
};

onRoomsList = function(rooms)
{
	lobbiesGotten = true;
	lobbyCount = rooms.length;
	var roomsToNotRemove = [];
	for (var i = 0; i < rooms.length; i++)
	{
		var name = rooms[i].name.split("-")[0];
		roomsToNotRemove.push(name);
		if (cachedRooms.includes(name))
		{
			onRoomChanged(rooms[i]);
		}
		else
		{
			onRoomAdded(rooms[i]);
		}
	}

	for (var i = 0; i < cachedRooms.length; i++)
	{
		if (!roomsToNotRemove.includes(cachedRooms[i]))
		{
			onRoomRemoved(cachedRooms[i]);
		}
	}

	if (lobbyCount == 0)
	{
		var table = document.getElementById("serverTable");
		table.tBodies[0].innerHTML = "";
		tr = table.tBodies[0].insertRow(-1);
		tr.id = "noServers";
		var cell = tr.insertCell(0);
		cell.colSpan = 3;
		cell.innerHTML = "No servers...";
	}
	else if (document.getElementById("noServers") != null)
	{
		document.getElementById("noServers").remove();
	}
}

onRoomAdded = function(room)
{
	var name = room.name.split("-")[0];
	var table = document.getElementById("serverTable");
	tr = table.tBodies[0].insertRow(-1);

	tr.id = name;
	tr.className = "clickable-row";
	tr.setAttribute("data-toggle", "collapse");
	tr.setAttribute("data-target", "#" + name + "Info");

	tr.insertCell(0).innerHTML = name;

	var spectatorString = "";
	var spectatorCount = room.getCustomProperty("C6");
	if (spectatorCount > 0)
	{
		spectatorString = " (+" + spectatorCount + ")";
	}

	tr.insertCell(1).innerHTML = room.getCustomProperty("C1") + "/8" + spectatorString;
	tr.insertCell(2).innerHTML = Languages[room.getCustomProperty("C0")];

	//Extra info rows
	var extraRow = table.tBodies[0].insertRow(-1);
	var cell = extraRow.insertCell(0);
	cell.colSpan = "3";
	cell.className = "extraServerCell";
	var div = document.createElement("div");
	div.className = "collapse";
	div.id = name + "Info";
	var players = room.getCustomProperty("P");
	var playersString = ["Player info missing..."];
	if (players != null)
	{
		playersString = players.split(";");
	}
	addExtraInfo(div, playersString);
	cell.appendChild(div);
	cachedRooms.push(name);
}

onRoomChanged = function(room)
{
	var name = room.name.split("-")[0];
	tr = document.getElementById(name);

	var spectatorString = "";
	var spectatorCount = room.getCustomProperty("C6");
	if (spectatorCount > 0)
	{
		spectatorString = " (+" + spectatorCount + ")";
	}
	tr.cells[1].innerHTML = room.getCustomProperty("C1") + "/8" + spectatorString;
	tr.cells[2].innerHTML = Languages[room.getCustomProperty("C0")];
	//Extra info rows
	var div = document.getElementById(name + "Info");
	var players = room.getCustomProperty("P");
	var playersString = ["Player info missing..."];
	if (players != null)
	{
		playersString = players.split(";");
	}

	addExtraInfo(div, playersString);
}

onRoomRemoved = function(roomName)
{
	tr = document.getElementById(roomName);
	tr.remove();
	extraRow = document.getElementById(roomName + "Info").parentNode.parentNode;
	extraRow.remove();
	var index = cachedRooms.indexOf(roomName);
	cachedRooms.splice(index, 1);
}

regionChanged = function() {
	var regionElem = document.getElementById("region");
	var region = regionElem.options[regionElem.selectedIndex].value;
	location.hash = "#" + region;
	checkShowNotice(region);
	demo.disconnect();
	demo.connectToRegionMaster(region);
	
	lobbyCount = 0;
	lobbiesGotten = false;
	document.getElementById("privateLobbyCount").innerHTML = "...";
	document.getElementById("serverTable").tBodies[0].innerHTML = "";
	cachedRooms = [];
}

checkShowNotice = function(region) {
	if (region == "eu")
	{
		document.getElementById("langNotice").style.display = "block";
	}
	else
	{
		document.getElementById("langNotice").style.display = "none";
	}

	gtag('config', 'UA-107777847-1', {'page_path': "/" + location.hash});
}

addExtraInfo = function(parent, players)
{
	if (Object.prototype.toString.call(players) !== '[object Array]')
	{
	    players = [].concat(players);
	}
	parent.innerHTML = "";
	var div = document.createElement("div");
	div.className = "extraServerInside";
	var ol = document.createElement("ol");
	ol.className = "playerList";
	if (players[0] == "Player info missing...")
	{
		ol.innerHTML = "Player info missing...";
	}
	else
	{
		for (var i = 0; i < players.length; i++)
		{
			var li = document.createElement("li");
			var num = players[i].split(":")[1];
			var name = players[i].split(":")[0];
			li.innerHTML = "<b>" + name + "</b>" + "<span class=\"numPlayerPlayed\"> (played " + num + " rounds)</span>";
			ol.appendChild(li);
		}
	}
	div.appendChild(ol);
	parent.appendChild(div);
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}