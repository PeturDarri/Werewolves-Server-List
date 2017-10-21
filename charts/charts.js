var startTimeOffset = Math.trunc(Date.now() / 1000) - 604800;
var endTimeOffset = Math.trunc(Date.now() / 1000);
	$(function()
	{
		updateData();

		$("#custom-button").click(function(){
			var startDate = $("#startDatePicker").data("DateTimePicker").date();
			var endDate = $("#endDatePicker").data("DateTimePicker").date();
			if (startDate != null && endDate != null)
			{
				startTimeOffset = startDate.startOf('day').unix();
				endTimeOffset = endDate.startOf('day').add(1, 'days').unix();
				updateData();
			}
		});
	});

updateData = function()
{
	var usData = [];
	var euData = [];

	console.log("using: " + startTimeOffset + " + " + endTimeOffset);
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
		});
	});

	
		createContainer = function()
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

timeOffsetChanged = function()
{
	var select = document.getElementById("timeOffset");
	var value = select.options[select.selectedIndex].value;
	if (value != "custom")
	{
		$("#datepicker-container").hide();
		startTimeOffset = Math.trunc(Date.now() / 1000) - parseInt(value);
		endTimeOffset = Math.trunc(Date.now() / 1000);
		updateData();
	}
	else
	{
		$("#datepicker-container").show();
		$("#custom-button").click();
	}
}