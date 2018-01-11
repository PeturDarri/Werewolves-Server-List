var lastLeaderQueryString = "";
var pageNumber = 0;
$(function(){
    var leaderTab = document.getElementById("leaderboards-tab");
	
	$('#leaderNav').bootpag({
		total: 5,
		maxVisible: 5,
		leaps: false,
		href: "#leaderboards",
		firstLastUse: true,
		first: 'First',
		last: 'Last'
	}).on("page", function(event, num){
		$('#playerSearch').val("");
		lastLeaderQueryString = "";
		$("#leaderTable").empty();
		pageNumber = num - 1;
	});
	
	window.addEventListener('popstate', function() {
		if (location.hash.startsWith("#leaderboards"))
		{
			if (leaderTab.parentElement.className != "active")
			{
				leaderTab.click();
			}
			
			var queryObj = parseQueryString();
			if (queryObj.player != null) {
				if ($("#playerSearch").val() != queryObj.player)
				{
					$("#playerSearch").val(queryObj.player);
					pageNumber = 0;
					$(leaderTable).empty();
				}
			}
			else
			{
				if ($("#playerSearch").val() != "")
				{
					$("#playerSearch").val("");
					$(leaderTable).empty();
					lastLeaderQueryString = "";
				}
			}
			updateData(pageNumber);
		}
	});

    var updateData = function(page)
    {
        if (document.getElementById("leaderTable").rows.length < 2)
        {
            getData(page);
        }
    };

    if (location.hash.startsWith("#leaderboards"))
    {
		document.title = "Leaderboards - Werewolves Within";
        leaderTab.click();
		var queryObj = parseQueryString();
		if (queryObj.player != null) {
			$("#playerSearch").val(queryObj.player);
		}
		updateData(0);
		var total = 5;
		$('#leaderNav').bootpag({
			page: 1,
			total: total
		});
    }

    leaderTab.onclick = function(){
		document.title = "Leaderboards - Werewolves Within";
        location.hash = "#leaderboards" + lastLeaderQueryString;
		gtagSetPage("/#leaderboards");
        if (leaderTab.parentElement.className != "active")
        {
            updateData(0);
        }
    };

    $("#playerSearch").autocomplete({
        source: function(request, response) {
          $.ajax({
            url: wwStatsUrl('api/PlayerNameAutocomplete'),
            data: {
              partialName: request.term
            },
            success: function (data) {
              response(data);
            },
            error: function(jqXhr, status, error) {
                //debugger;
            }
          });
        },
        minLength: 2,
        select: function (event, ui) {
            $("#playerSearch").val(ui.item.value);
			$('#leaderNav').bootpag({
				page: 1
			});
			lastLeaderQueryString = "?player=" + $("#playerSearch").val();
			location.hash = "#leaderboards" + lastLeaderQueryString;
            getData(0);
        }
    })
    .change(function() {
		$('#leaderNav').bootpag({
			page: 1
		});
        getData(0);
    });
	
	$("#playerSearch").on('search', function () {
		if ($("#playerSearch").val() != "")
		{
			$('#leaderNav').bootpag({
				page: 1
			});
			lastLeaderQueryString = "?player=" + $("#playerSearch").val();
			location.hash = "#leaderboards" + lastLeaderQueryString;
		}
		else
		{
			lastLeaderQueryString = "";
			location.hash = "#leaderboards";
        }
		getData(0);
	});
});

var wwStatsUrl = function (path) {
    //return 'https://wwstats.local/' + path;
    return 'https://wwstats.iis03.xibis.net/' + path;
};

var populateLeaderboard = function(data, highlightPlayerName) {
    var leaderTable = document.getElementById("leaderTable");

    $(leaderTable).empty();

    var afterPopulateFunction = null;

    var tbody = document.createElement("tbody");
    data.players.forEach(function (element) {
        var newRow = tbody.insertRow(tbody.rows.length);
        var rankCell = newRow.insertCell(0);
        var nameCell = newRow.insertCell(1);
        var langCell = newRow.insertCell(2);
        var roundsCell = newRow.insertCell(3);
        nameCell.innerHTML = element.name;
        $(rankCell).html(element.rank);
        var langString = element.language;
        if (langString == "") {
            langString = "-";
        }
        langCell.innerHTML = langString;
        roundsCell.innerHTML = element.gamesPlayed;

        if (highlightPlayerName) {
            var doHighlight = false;
            if (highlightPlayerName.call) {
                doHighlight = highlightPlayerName(element.name);
            } else {
                doHighlight = highlightPlayerName == element.name;
            }
            if (doHighlight) {
                $(newRow).addClass('highlight');
                afterPopulateFunction = function() {
                    $('html, body').animate({
                        scrollTop: $(newRow).offset().top - ($(window).height() / 2)
                    }, 1000);
                };
            }
        }
    }, this);
    leaderTable.appendChild(tbody);

    if (afterPopulateFunction) {
        afterPopulateFunction();
    }
};

var getData = function(page)
{
    var url;
    var params = {};

    var playerName = $('#playerSearch').val();

    if (0 == playerName) {
        url = wwStatsUrl('api/top?pageindex=' + page + '&pagesize=50');
        playerName = null;
    } else {
        url = wwStatsUrl('api/PlayerRanking?playersAboveAndBelowCount=25');
        $.extend(params,
        {
            playerName: playerName
        });
    }


    $(".ajax-loader").show();
	$("#leaderNav").hide();
    
    $.get(url, params,
        function(data) {
            populateLeaderboard(data, playerName);
            $(".ajax-loader").hide();
			
			$('#leaderNav').bootpag({
				total: data.pageCount
			});
			
			$("#leaderNav").show();
        });
}

var parseQueryString = function() {
	if (!location.hash.includes("?")) return "";
	var queryString = location.hash.split('?')[1];
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for (i = 0, l = queries.length; i < l; i++) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
	//lastLeaderQueryString = "?" + queryString;
    return params;
};