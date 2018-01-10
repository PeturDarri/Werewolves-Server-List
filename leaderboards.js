$(function(){
    var leaderTab = document.getElementById("leaderboards-tab");

    var updateData = function()
    {
        if (document.getElementById("leaderTable").rows.length == 1)
        {
            getData();
        }
    };

    if (location.hash == "#leaderboards")
    {
        leaderTab.click();
        updateData();
    }

    leaderTab.onclick = function(){
        location.hash = "#leaderboards"
        gtag('config', 'UA-107777847-1', {'page_path': "/" + location.hash});
        if (leaderTab.parentElement.className != "active")
        {
            updateData();
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
            getData();
        }
    })
    .change(function() {
        getData();
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
                    }, 2000);
                };
            }
        }
    }, this);
    leaderTable.appendChild(tbody);

    if (afterPopulateFunction) {
        afterPopulateFunction();
    }
};

var getData = function()
{
    var url;
    var params = {};

    var playerName = $('#playerSearch').val();

    if (0 == playerName) {
        url = wwStatsUrl('api/top?pageindex=0&pagesize=50');
        playerName = null;
    } else {
        url = wwStatsUrl('api/PlayerRanking?playersAboveAndBelowCount=25');
        $.extend(params,
        {
            playerName: playerName
        });
    }


    $(".ajax-loader").show();
    
    $.get(url, params,
        function(data) {
            //var response = '[{"name":"lithosaurus","gamesPlayed":8968,"normallySeenInRegion":"us","language":"English"},{"name":"blaze2000","gamesPlayed":7470,"normallySeenInRegion":"us","language":""},{"name":"matto23","gamesPlayed":7266,"normallySeenInRegion":"eu","language":"English"},{"name":"Dramonicous","gamesPlayed":6892,"normallySeenInRegion":"us","language":"English"},{"name":"MadpowerUK","gamesPlayed":4793,"normallySeenInRegion":"eu","language":""},{"name":"Steve_Newell","gamesPlayed":4791,"normallySeenInRegion":"us","language":""},{"name":"captrob","gamesPlayed":4735,"normallySeenInRegion":"us","language":"English"},{"name":"dazkelly","gamesPlayed":4643,"normallySeenInRegion":"eu","language":"English"},{"name":"tyronebo0ne510","gamesPlayed":4610,"normallySeenInRegion":"us","language":""},{"name":"ramsplayz","gamesPlayed":4523,"normallySeenInRegion":"us","language":"English"},{"name":"mattieb73","gamesPlayed":4406,"normallySeenInRegion":"eu","language":""},{"name":"Annare_","gamesPlayed":4360,"normallySeenInRegion":"us","language":""},{"name":"danni-much","gamesPlayed":4310,"normallySeenInRegion":"eu","language":""},{"name":"Xaenith74","gamesPlayed":4179,"normallySeenInRegion":"us","language":""},{"name":"dsansgsxr4","gamesPlayed":4169,"normallySeenInRegion":"us","language":"English"},{"name":"kaisersoza_66","gamesPlayed":4050,"normallySeenInRegion":"us","language":""},{"name":"TheWonderSwan","gamesPlayed":4049,"normallySeenInRegion":"us","language":"English"},{"name":"expertsmilee","gamesPlayed":4024,"normallySeenInRegion":"us","language":""},{"name":"KING-OF-GAMES013","gamesPlayed":3960,"normallySeenInRegion":"us","language":""},{"name":"huedon68","gamesPlayed":3755,"normallySeenInRegion":"us","language":""},{"name":"LabhaoiseSeoighe","gamesPlayed":3752,"normallySeenInRegion":"eu","language":"English"},{"name":"Sir__Vival","gamesPlayed":3735,"normallySeenInRegion":"eu","language":"German"},{"name":"EyeConic","gamesPlayed":3608,"normallySeenInRegion":"us","language":"English"},{"name":"penguinhunter","gamesPlayed":3600,"normallySeenInRegion":"us","language":""},{"name":"BladeRunnerThx","gamesPlayed":3582,"normallySeenInRegion":"us","language":"English"},{"name":"Sorfurn","gamesPlayed":3501,"normallySeenInRegion":"eu","language":"German"},{"name":"Mafrodon","gamesPlayed":3465,"normallySeenInRegion":"eu","language":""},{"name":"Jotstejot","gamesPlayed":3399,"normallySeenInRegion":"eu","language":""},{"name":"sissylyne","gamesPlayed":3354,"normallySeenInRegion":"us","language":""},{"name":"Halloweenie06","gamesPlayed":3340,"normallySeenInRegion":"us","language":"English"},{"name":"Ed2099999939","gamesPlayed":3297,"normallySeenInRegion":"us","language":""},{"name":"rseeley1990","gamesPlayed":3199,"normallySeenInRegion":"eu","language":""},{"name":"edouard59450","gamesPlayed":3183,"normallySeenInRegion":"eu","language":"French"},{"name":"ripperxx","gamesPlayed":3171,"normallySeenInRegion":"eu","language":""},{"name":"Princess_Cathee","gamesPlayed":3158,"normallySeenInRegion":"eu","language":"German"},{"name":"jaygee248","gamesPlayed":3156,"normallySeenInRegion":"us","language":""},{"name":"Telly003","gamesPlayed":3092,"normallySeenInRegion":"us","language":""},{"name":"Truent","gamesPlayed":3072,"normallySeenInRegion":"us","language":""},{"name":"JAKRJ","gamesPlayed":3020,"normallySeenInRegion":"us","language":"English"},{"name":"PHISHinMA","gamesPlayed":2978,"normallySeenInRegion":"eu","language":""},{"name":"ELGINIMO","gamesPlayed":2978,"normallySeenInRegion":"eu","language":""},{"name":"R4p1d_k1LL3r_","gamesPlayed":2939,"normallySeenInRegion":"us","language":""},{"name":"EVOLVED2010","gamesPlayed":2933,"normallySeenInRegion":"us","language":""},{"name":"Trey333III","gamesPlayed":2920,"normallySeenInRegion":"us","language":""},{"name":"domef","gamesPlayed":2874,"normallySeenInRegion":"eu","language":"German"},{"name":"rudolf70K","gamesPlayed":2847,"normallySeenInRegion":"eu","language":"English"},{"name":"JeneralG","gamesPlayed":2817,"normallySeenInRegion":"us","language":"English"},{"name":"Rooys","gamesPlayed":2813,"normallySeenInRegion":"eu","language":"German"},{"name":"MikegAK-47","gamesPlayed":2747,"normallySeenInRegion":"eu","language":"German"},{"name":"Greg47960","gamesPlayed":2655,"normallySeenInRegion":"us","language":""}]';
            //var data = JSON.parse(response);
            populateLeaderboard(data, playerName);

            $(".ajax-loader").hide();
        });
}