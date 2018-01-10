var startTimeOffset = Math.floor(Date.now() / 1000) - 604800;
var endTimeOffset = Math.floor(Date.now() / 1000);
	$(function()
	{
		$('#startDatePicker').datetimepicker({
        	format: "ddd MMM Do YYYY",
        	maxDate: moment().endOf('day'),
        	useCurrent: false
        });
        $('#endDatePicker').datetimepicker({
        	format: "ddd MMM Do YYYY",
        	maxDate: moment().endOf('day'),
        	useCurrent: false
        });
        $("#startDatePicker").on("dp.change", function (e) {
            $('#endDatePicker').data("DateTimePicker").minDate(e.date);
        });
        $("#endDatePicker").on("dp.change", function (e) {
            $('#startDatePicker').data("DateTimePicker").maxDate(e.date);
        });

        $("#startDatePicker").on("dp.show", function() {
            var otherDate = $('#endDatePicker').data("DateTimePicker").date().format("MM/DD/YYYY");
            $("[data-day=\"" + otherDate + "\"]").addClass("highlight-day");
        });
        $("#endDatePicker").on("dp.show", function() {
        	var otherDate = $('#startDatePicker').data("DateTimePicker").date().format("MM/DD/YYYY");
            $("[data-day=\"" + otherDate + "\"]").addClass("highlight-day");
        });

		var params = parseQueryString();
		if (params.start != null && params.end != null)
		{
			$("#timeOffset").val("custom");
			$("#datepicker-container").show();
			startTimeOffset = parseInt(params.start);
			endTimeOffset = parseInt(params.end);
			$("#startDatePicker").data("DateTimePicker").date(moment.unix(startTimeOffset).format("ddd MMM Do YYYY"));
			$("#endDatePicker").data("DateTimePicker").date(moment.unix(endTimeOffset).subtract(1, 'd').format("ddd MMM Do YYYY"));
		}

		$("#custom-button").click(function(){
			var startDate = $("#startDatePicker").data("DateTimePicker").date();
			var endDate = $("#endDatePicker").data("DateTimePicker").date();
			if (startDate != null && endDate != null)
			{
				startTimeOffset = startDate.startOf('day').unix();
				endTimeOffset = endDate.startOf('day').add(1, 'days').unix();
				updateData();

				location.hash = "#start=" + startTimeOffset + "&end=" + endTimeOffset;
			}
		});

		var chartsTab = document.getElementById("charts-tab");

		var getChart = function()
		{
			if (document.getElementById("chartContainer").childNodes.length == 1)
			{
				updateData();
			}
		};
		if (location.hash == "#charts")
		{
			chartsTab.click();
			getChart();
		}

		chartsTab.onclick = function(){
			location.hash = "#charts"
			gtag('config', 'UA-107777847-1', {'page_path': "/" + location.hash});
			if (chartsTab.parentElement.className != "active")
			{
				getChart();
			}
		};
	});

var updateData = function()
{
	$(".ajax-loader").show();
	var container = document.getElementById("chartContainer");
	container.innerHTML = "";

	var usData = [];
	var euData = [];

	var filter = '?orderBy="$key"&startAt="' + startTimeOffset + '"&endAt="' + endTimeOffset + '"';
		$.getJSON("https://werewolflobbies.firebaseio.com/us.json" + filter, function(data)
		{
			$.each(data, function(key, val)
			{
			usData.push({
				t: moment.unix(key),
				y: val
			});
		});

		$.getJSON("https://werewolflobbies.firebaseio.com/eu.json" + filter, function(data)
			{
				$.each(data, function(key, val)
				{
				euData.push({
					t: moment.unix(key),
					y: val
				});
			});

			createContainer();
			$(".ajax-loader").hide();
		});
	});

	
		var createContainer = function()
		{
		var container = document.getElementById("chartContainer");
		container.innerHTML = "";
		container.innerHTML = '<canvas id="playersChart" width="1280" height="720"></canvas>';
		var ctx = document.getElementById("playersChart").getContext("2d");
		var chart = new Chart(ctx, {
		    type: 'line',
		    data: {
		        datasets: [
			        {
			            label: 'US',
			            borderColor: "rgb(76, 175, 80)",
			            lineTension: 0,
			            fill: false,
			            backgroundColor: "rgba(76, 175, 80, 0.5)",
			            data: usData,
			            radius: 0
			        },
			        {
			        	label: 'EU',
			            borderColor: "rgb(211, 75, 65)",
			            lineTension: 0,
			            fill: false,
			            backgroundColor: "rgba(211, 75, 65, 0.5)",
			            data: euData,
			            radius: 0
			        }
		        ]
		    },
		    options: {
		    	responsive: true,
		    	maintainAspectRatio: false,
		        scales: {
		        	xAxes: [{
		        		type: "time",
		        		display: true,
		        		scaleLabel: {
		        			display: true,
		        			labelString: "Time"
		        		}
		        	}],
		            yAxes: [{
		            	display: true,
		            	scaleLabel: {
		            		display: true,
		            		labelString: "Players"
		            	},
		                ticks: {
		                    beginAtZero: true,
		                    min: 0,
		                    suggestedMax: 60
		                }
		            }]
		        },
		        tooltips: {
		        	intersect: false
		        }
		    }
		});
	}
}

var timeOffsetChanged = function()
{
	var select = document.getElementById("timeOffset");
	var value = select.options[select.selectedIndex].value;
	if (value != "custom")
	{
		$("#datepicker-container").hide();
		startTimeOffset = Math.floor(Date.now() / 1000) - parseInt(value);
		endTimeOffset = Math.floor(Date.now() / 1000);
		updateData();
		location.hash = "";
	}
	else
	{
		$("#datepicker-container").show();
		$("#custom-button").click();
	}
}

var parseQueryString = function() {
	var queryString = location.hash.substring(1);
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for (i = 0, l = queries.length; i < l; i++) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
};