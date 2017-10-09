/// <reference path="Photon/Photon-Javascript_SDK.d.ts"/> 
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var Languages = [
	"Unsupported",
	"Arabic",
	"Brazilian_Portuguese",
	"ChineseSimplified",
	"ChineseTraditional",
	"Czech",
	"Danish",
	"Dutch",
	"EnglishUS",
	"Finnish",
	"French",
	"German",
	"Hungarian",
	"Italian",
	"Japanese",
	"Korean",
	"LATAM_Spanish",
	"Norwegian",
	"Polish",
	"Portuguese",
	"Russian",
	"Spanish",
	"Swedish",
	"Turkish",
	"Count"
];

var TimeSinceUpdated = new Date();

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
		this.connectToRegionMaster("US");
    };
    DemoLoadBalancing.prototype.onError = function (errorCode, errorMsg) {
        this.output("Error " + errorCode + ": " + errorMsg);
    };

    DemoLoadBalancing.prototype.onRoomListUpdate = function (rooms, roomsUpdated, roomsAdded, roomsRemoved) {
        this.onRoomList(rooms);
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
	
    DemoLoadBalancing.prototype.onRoomList = function (roomInfos) {
		var rooms = [];
		
		if (roomInfos.length > 0)
		{
			for (var i = 0; i < roomInfos.length; i++) {
				var spectatorString = "";
				if (roomInfos[i].playerCount > 8)
				{
					spectatorString = " (+" + (roomInfos[i].playerCount - 8) + ")";
					roomInfos[i].playerCount = 8;
				}
				
				var room = {
					"Name": roomInfos[i].name.split("-")[0],
					"Players": roomInfos[i].playerCount + "/8" + spectatorString,
					"Language": Languages[roomInfos[i].getCustomProperty("C0")]
				};
				rooms.push(room);
			}
		}
		else
		{
			var room = {
				"Name": "No servers...",
				"Players": "",
				"Language": ""
			};
			rooms.push(room);
		}
		
		var col = [];
		for (var i = 0; i < rooms.length; i++) {
			for (var key in rooms[i]) {
				if (col.indexOf(key) === -1) {
					col.push(key);
				}
			}
		}

		var table = document.createElement("table");

		var tr = table.insertRow(-1);

		for (var i = 0; i < col.length; i++) {
			var th = document.createElement("th");
			th.innerHTML = col[i];
			tr.appendChild(th);
		}

		for (var i = 0; i < rooms.length; i++) {

			tr = table.insertRow(-1);

			for (var j = 0; j < col.length; j++) {
				var tabCell = tr.insertCell(-1);
				tabCell.innerHTML = rooms[i][col[j]];
			}
		}

		var divContainer = document.getElementById("showData");
		divContainer.innerHTML = "";
		divContainer.appendChild(table);
    };
    
    return DemoLoadBalancing;
}(Photon.LoadBalancing.LoadBalancingClient));
var demo;
window.onload = function () {
    demo = new DemoLoadBalancing();
    demo.start();
};

regionChanged = function() {
	var regionElem = document.getElementById("region");
	var region = regionElem.options[regionElem.selectedIndex].value;
	demo.disconnect();
	demo.connectToRegionMaster(region);
	if (region == "eu")
	{
		document.getElementById("langNotice").style.display = "block";
	}
	else
	{
		document.getElementById("langNotice").style.display = "none";
	}
}