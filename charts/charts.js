var selectedTimeOffset = 604800;
	$(function()
	{
		updateData();
	});

	updateData = function()
{
	var usData = [];
	var euData = [];

	var filter = '?orderBy="$key"&startAt="' + (Math.trunc(Date.now() / 1000) - selectedTimeOffset) + '"'
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
			            data: usData
			        },
			        {
			        	label: 'EU',
			            borderColor: "rgb(211, 75, 65)",
			            lineTension: 0,
			            fill: false,
			            backgroundColor: "rgba(211, 75, 65, 0.5)",
			            data: euData
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
		        }
		    }
		});
	}
}

timeOffsetChanged = function()
{
	var select = document.getElementById("timeOffset");
	var value = select.options[select.selectedIndex].value;
	selectedTimeOffset = parseInt(value);
	updateData();
}