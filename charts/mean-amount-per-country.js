charts.meanAmountPerCountry = function (inputData) {

    var plotData = {
        y: [],
        x: [],
        type: 'bar',
        orientation: 'h',
        marker: {
            color: '#61c1d6'
        }
    };

    for (var i in inputData) {
        if (!inputData.hasOwnProperty(i)) continue;
        var entry = inputData[i];
        if (entry.companyLocation !== undefined) {
            var index = $.inArray(entry.companyLocation, plotData.y);
            if (index === -1) {
                plotData.y.push(entry.companyLocation);
                plotData.x.push(1);
            } else {
                plotData.x[index]++
            }
        }
    }

    var list = [];
    for (var i = 0; i < plotData.y.length; i++)
        list.push({'y': plotData.y[i], 'x': plotData.x[i]});

    list.sort(function (a, b) {
        return ((a.x > b.x) ? -1 : ((a.x === b.x) ? 0 : 1));
    });

    for (var i = 0; i < list.length; i++) {
        plotData.y[i] = list[i].y;
        plotData.x[i] = list[i].x;
    }

    while (plotData.y.length > 25) {
        plotData.y.pop();
        plotData.x.pop();
    }

    //console.log(plotData);
    var node = d3.select('#data-ratings-per-location').node();
    Plotly.newPlot(node, [plotData], {
        autosize: true,
        height: 500,
        showlegend: false,
        margin: {l: 80, r: 50, b: 65, t: 15, pad: 4},
        xaxis: {
            title: 'Number of ratings',
            autotick: false,
            dtick: 50
        }
    }, {staticPlot: true});

    window.onresize = function() {
        Plotly.Plots.resize(node);
    };
};

