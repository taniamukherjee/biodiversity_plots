//populate select element with datasets
namesUrl = "/names";
Plotly.d3.json(namesUrl, function (error, response) {
    if (error) console.log(error);
    namesList = response;
    console.log(namesList);
    $datasetSelectList = document.getElementById("datasetSelect");
    for (var i = 0; i < namesList.length; i++) {
        var $option = document.createElement("option");
        $option.value = namesList[i];
        $option.text = namesList[i];
        $datasetSelectList.appendChild($option);
    }
    optionChanged(namesList[0]);
});

function optionChanged(datasetToPlot) {
    var metadataUrl = `/metadata/${datasetToPlot}`
    var pieChartUrl = `/piechart/${datasetToPlot}`
    var wfreqUrl = `/wfreq/${datasetToPlot}`;
    var bubbleChartUrl = `/bubblechart/${datasetToPlot}`

    //add metadata to page
    Plotly.d3.json(metadataUrl, function (error, response) {
        addMetadata(response);
    });

    //retrieve chart data
    Plotly.d3.json(pieChartUrl, function (error, response) {
        //render pie chart
        renderPieChart(response);
    });

    Plotly.d3.json(metadataUrl, function (error, response) {
        if(error) throw(error);
        //render frequency gauge
        renderGauge(response.WFREQ);
    });

    //retrieve bubble chart data
    Plotly.d3.json(bubbleChartUrl, function (error, response) {
        //render bubble chart
        console.log(response);
        renderBubbleChart(response);
    });
}

function addMetadata(metadataDict) {
    $metadataCard = document.getElementById("metadataCard");
    $metadataCard.innerHTML = `<p>Age: ${metadataDict.AGE}<br>
    BBType: ${metadataDict.BBTYPE}<br>
    Ethnicity: ${metadataDict.ETHNICITY}<br>
    Gender: ${metadataDict.GENDER}<br>
    Location: ${metadataDict.LOCATION}<br>
    Sample ID: ${metadataDict.SAMPLEID} </p>`;
}

function renderPieChart(responseDict) {
    var data = [{
        values: responseDict.sample_values,
        labels: responseDict.otu_ids,
        hovertext: responseDict.otu_descriptions,
        type: 'pie'
    }];

    var layout = {
        title: '% of Samples Observed',
    };

    Plotly.newPlot('pieChart', data, layout);
}

function renderGauge(wfreq) {
    // Enter a speed between 0 and 180
    var level = parseFloat(wfreq);

    // Trig to calc meter point
    var degrees = 180 - level * 180 / 9.,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    var data = [{
        type: 'scatter',
        x: [0], y: [0],
        marker: { size: 28, color: '850000' },
        showlegend: false,
        name: 'Bellybutton Washes/Week',
    },
    {
        values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
        textinfo: 'text',
        textposition: 'inside',
        marker: {
            colors: ['rgba(34,139,34,1)','rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)', 
                'rgba(140,183,32,0.5', 'rgba(170, 202, 42, .5)', 'rgba(186,205.5,68.5,0.5)', 
                'rgba(202, 209, 95, .5)', 'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                'rgb(255,255,255,0)']
        },
        hole: .5,
        type: 'pie',
        showlegend: false
    }];

    var layout = {
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        title: 'Belly Button Washing Frequency',
        xaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        },
        yaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        },
        hovermode:false
    };

    Plotly.newPlot('gauge',data,layout);
}


function renderBubbleChart(responseDict) {
    var trace = {
        x: responseDict.otu_ids,
        y: responseDict.sample_values,
        text: responseDict.otu_descriptions,
        mode: 'markers',
        marker: {
            size: responseDict.sample_values,
            color: responseDict.otu_ids
        }
    };

    var data = [trace];

    var layout = {
        title: "Number of Samples Observed For Given Species",
        xaxis: {
            title: "OTU ID of Species Observed"
        },
        yaxis: {
            title: "Number of Of Observations of Each Species"
        },
        autosize: true
    };

    Plotly.newPlot('bubbleChart', data, layout)
}