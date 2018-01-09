charts.boxPlotRatingPerYear = function (inputData) {

    var plotData = {
        x: [], // reviewDate
        y: [] // array of ratings
    };

    for (var i in inputData) {
        if (!inputData.hasOwnProperty(i)) continue;
        var entry = inputData[i];
        if (entry.reviewDate !== undefined) {
            var index = $.inArray(entry.reviewDate, plotData.x);
            if (index === -1) {
                plotData.x.push(entry.reviewDate);
                plotData.y.push([entry.rating]);
            } else {
                plotData.y[index].push(entry.rating)
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

    console.log(plotData);

    var data = [];

    for (var i = 0; i < plotData.x.length; i++) {
        data.push({
            y: plotData.y[i],
            type: 'box',
            name: plotData.x[i],
            line: {
                color: "#d69e44"
            },
            boxpoints: false
        });
    }

    var mean = [];

    for (var i = 0; i < data.length; i++) {
        mean.push([data[i].name, d3.median(data[i].y)])
    }

    console.log(mean);


    var reg = regression.logarithmic(mean, {order: 5, precision: 10});
    console.log(reg);
    mean = {
        y : [reg.points[0][1], reg.points[reg.points.length - 1][1]],
        x : [reg.points[0][0], reg.points[reg.points.length - 1][0]],
        mode: 'lines',
        type: 'scatter',
        line: {
            color: '#000',
            width: 1,
            dash: 'dash'
        }
    };

    console.log(mean);


    data.push(mean);


    var layout = {staticPlot: true};
    var node = d3.select('#data-box-plot-rating-per-year').node();
    Plotly.newPlot(node, data, {
        autosize: true,
        height: 400,
        showlegend: false,
        margin: {l: 50, r: 50, b: 65, t: 15, pad: 4},
        xaxis: {
            title: 'Year of review',
            begin: 0,
            autotick: false,
            dtick: 1
        }
    }, layout);
    window.onresize = function() {
        Plotly.Plots.resize(node);
    };
};

