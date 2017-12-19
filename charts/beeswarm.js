// Beeswarm d3 chart implementation
// Inspired by: https://bl.ocks.org/Kcnarf/4608704a70fc24e2c06ca0116830de47
charts.beeswarm = function (chart) {

    // layout configuration
    var radius = 3, // bee radius
        scaleLinear = d3.scaleLinear(), // y axis scaling
        values = { // values variable holder
            left: [], // left side values
            right: [], // right side values
            extent: [] // [min / max]
        };

    values.left.cname = "left";
    values.right.cname = "right";

    // values extent [min, max]
    values.left.extent = [];
    values.right.extent = [];

    // sum of y axis values
    values.left.total = 0;
    values.right.total = 0;

    // mean of y axis values
    values.left.mean = 0;
    values.right.mean = 0;

    // median of y axis values
    values.left.median = 0;
    values.right.median = 0;

    // for each side function
    values.forEach = function (call) {
        var sides = [values.left, values.right];
        for (var i in sides) {
            call(sides[i]);
        }
    };

    // push x and y axis values function
    values.push = function (side, key, entry) {
        var value = Number(chart.y_axis.select(entry));
        side.push({
            cname: side.cname,
            key: key,
            value: value,
            original: entry
        });
        side.total += value;
    };

    // loop through chart data, map the x and y axis values
    for (var i in chart.data) {

        // skip loop if the property is from prototype
        if (!chart.data.hasOwnProperty(i)) continue;
        var entry = chart.data[i];
        var key = chart.x_axis.select(entry);

        // filter x axis values
        if (chart.x_axis.left.filter(key)) {
            values.push(values.left, key, entry);
        } else if (chart.x_axis.right.filter(key)) {
            values.push(values.right, key, entry);
        }
    }

    // set the extent value for each side
    values.forEach(function (side) {
        side.extent = d3.extent(side, function (entry) {
            return entry.value;
        });
        if (values.extent.length === 0) {
            values.extent = side.extent;
        } else {
            if (values.extent[0] > side.extent[0]) {
                values.extent[0] = side.extent[0];
            }
            if (values.extent[1] < side.extent[1]) {
                values.extent[1] = side.extent[1];
            }
        }
    });

    // set the mean value for each side
    values.forEach(function (side) {
        side.mean = side.total / side.length;
    });

    // set the median value for each side
    values.forEach(function (side) {
        side.median = d3.median(side, function (entry) {
            return entry.value;
        });
    });

    // publicly accessible functions and variables
    return {
        clear: function () {
            d3.selectAll(chart.selector + " > *").remove();
        },
        draw: function () {

            this.clear();

            var svgWidth = chart.width,
                svgHeight = chart.height,
                margin = {top: 10, right: 10, bottom: 10, left: 10},
                space = {header: 15, circle: 15, slope: 5},
                header = {height: 50, width: 10},
                footer = {height: 25, width: 10},
                drawing = {
                    width: svgWidth - margin.left - margin.right,
                    height: svgHeight - header.height - footer.height - margin.top - margin.bottom
                },
                padding = {header: 15, circle: 15, slope: 5},
                chartElement = d3.select(chart.selector),
                svgElement = chartElement.append("svg")
                    .attr("viewBox", [0, 0, svgWidth, svgHeight])
                    .attr("preserveAspectRatio", "xMidYMid meet"),
                tooltipElement = d3.select("#chart-tooltip"),
                drawingGroup = svgElement.append("g")
                    .classed("drawingArea", true)
                    .attr("transform", "translate(" + [margin.left + drawing.width / 2, margin.top] + ")"),
                graphGroup = drawingGroup.append("g")
                    .attr("transform", "translate(" + [0, header.height] + ")"),
                axisGroup = graphGroup.append("g")
                    .attr("id", "axis-container"),
                avgGroup = graphGroup.append("g")
                    .attr("id", "average-container"),
                medianGroup = graphGroup.append("g")
                    .attr("id", "median-container"),
                circleGroup = graphGroup.append("g")
                    .attr("id", "circle-container"),
                footerGroup = drawingGroup.append("g")
                    .attr("id", "footer");

            // set linear scale
            scaleLinear.domain(values.extent).range([drawing.height, 0]);

            function drawAxis(container) {
                var lineWidth = drawing.width / 2 - 25,
                    labelMargin = 5,
                    ticks = axisGroup.selectAll(".tick")
                        .data(d3.range(values.extent[0], values.extent[1] + .00000001, .25))
                        .enter()
                        .append("g")
                        .classed("tick", true)
                        .attr("transform", function (d) {
                            return "translate(" + [0, scaleLinear(+d)] + ")";
                        });

                ticks.append("line")
                    .attr("x1", -lineWidth)
                    .attr("y1", 0)
                    .attr("x2", lineWidth)
                    .attr("y2", 0);

                ticks.append("text")
                    .classed("tiny light", true)
                    .attr("transform", "translate(" + [lineWidth + labelMargin, 3] + ")")
                    .attr("text-anchor", "start")
                    .text(function (d) {
                        return d;
                    });

                ticks.append("text")
                    .classed("tiny light", true)
                    .attr("transform", "translate(" + [-(lineWidth + labelMargin), 3] + ")")
                    .attr("text-anchor", "end")
                    .text(function (d) {
                        return d;
                    });

                container.append("text")
                    .classed("unit light", true)
                    .attr("transform", "translate(" + [-(lineWidth) + 10, -25] + ")")
                    .attr("text-anchor", "end")
                    .style("font-weight", "bold")
                    .text("Rating");
                container.append("text")
                    .classed("unit light", true)
                    .attr("transform", "translate(" + [(lineWidth) - 10, -25] + ")")
                    .attr("text-anchor", "start")
                    .style("font-weight", "bold")
                    .text("Rating");
            }

            function drawCircles() {
                var beeswarm = d3.beeswarm()
                    .radius(radius)
                    .orientation("vertical")
                    .distributeOn(function (d) {
                        return scaleLinear(d.value);
                    }),

                    left = beeswarm.data(d3.shuffle(values.left)).side("negative").arrange(),
                    right = beeswarm.data(d3.shuffle(values.right)).side("positive").arrange(),
                    bothSides = left.concat(right),

                    circles = circleGroup.selectAll("circle")
                    .data(bothSides)
                    .enter()
                    .append("g")
                    .attr("transform", function (d) {
                        if (d.x > 350 || d.x < -350) {
                            return "translate(9999999, 9999999)";
                        }
                        if (d.datum.cname === values.left.cname) {
                            return "translate(" + [d.x - space.circle, d.y] + ")";
                        } else {
                            return "translate(" + [d.x + space.circle, d.y] + ")";
                        }
                    });

                //colored, sized, circle
                circles.append("circle").attr("r", function (d) {
                    return radius;
                }).attr("class", function (d) {
                    return d.datum.cname;
                }).on("mouseover", function (d) {
                    var event = d3.event,
                        target = event.target,
                        targetNode = $(target),
                        parent = target.parentNode,
                        tooltipNode = $(tooltipElement.node());
                    target.setAttribute("r",  radius + 1);
                    targetNode.addClass("selected");
                    d3.select(parent).moveToFront();
                    tooltipElement.transition()
                        .duration(0)
                        .style("display", "");
                    tooltipElement.html(drawTooltip(d.datum.original))
                        .style("left", (event.pageX - (tooltipNode.outerWidth()) / 2) + "px")
                        .style("top", (event.pageY - tooltipNode.outerHeight() - 20) + "px");
                })
                    .on("mouseout", function (d) {
                        var event = d3.event,
                            target = event.target,
                            targetNode = $(target);
                        targetNode.removeClass("selected");
                        target.setAttribute("r",  radius);
                        tooltipElement.transition()
                            .duration(250)
                            .style("display", "none");
                    });
            }

            function drawTooltip(entry) {
                var tooltipInnerHTML = [],
                    tooltip = chart.y_axis.tooltip(entry);
                for (var i in tooltip) {
                    if (!tooltip.hasOwnProperty(i)) continue;
                    var tooltipInfo = tooltip[i];
                    if (tooltipInfo.value.replace(/\s+/, "") !== "") {
                        tooltipInnerHTML.push("<b>" + tooltipInfo.title + ":</b> " + tooltipInfo.value );
                    }
                }
                return tooltipInnerHTML.join("<br/>");
            }

            function drawMeans() {
                var tickWidth = 0,
                    lineHalfWidth = drawing.width / 2 - 25 + tickWidth,
                    labelMargin = 15;

                var oMean = avgGroup.append("g")
                    .attr("id", "left-average")
                    .classed("average", true)
                    .attr("transform", "translate(" + [0, scaleLinear(values.left.mean)] + ")");
                oMean.append("line")
                    .classed("left", true)
                    .attr("x1", -lineHalfWidth)
                    .attr("y1", 0)
                    .attr("x2", -space.slope)
                    .attr("y2", 0);
                oMean.append("text")
                    .classed("tiny", true)
                    .attr("transform", "translate(" + [-(lineHalfWidth + labelMargin), 3] + ")")
                    .attr("text-anchor", "end");
                //.text(values.left.mean);
                oMean.append("text")
                    .classed("tiny text-background", true)
                    .attr("transform", "translate(" + [-lineHalfWidth + tickWidth + labelMargin, 3] + ")")
                    .attr("text-anchor", "start")
                    .text("mean");
                oMean.append("text")
                    .classed("tiny", true)
                    .attr("transform", "translate(" + [-lineHalfWidth + tickWidth + labelMargin, 3] + ")")
                    .attr("text-anchor", "start")
                    .text("mean");

                avgGroup.append("line")
                    .classed("slope", true)
                    .attr("id", "mean-slope")
                    .attr("x1", -space.slope)
                    .attr("y1", scaleLinear(values.left.mean))
                    .attr("x2", space.slope)
                    .attr("y2", scaleLinear(values.right.mean));

                var tMean = avgGroup.append("g")
                    .attr("id", "right-average")
                    .classed("average", true)
                    .attr("transform", "translate(" + [0, scaleLinear(values.right.mean)] + ")");
                tMean.append("line")
                    .classed("right", true)
                    .attr("x1", space.slope)
                    .attr("y1", 0)
                    .attr("x2", lineHalfWidth)
                    .attr("y2", 0);
                tMean.append("text")
                    .classed("tiny", true)
                    .attr("transform", "translate(" + [lineHalfWidth + labelMargin, 3] + ")")
                    .attr("text-anchor", "start");
                //.text(values.right.mean);
                tMean.append("text")
                    .classed("tiny text-background", true)
                    .attr("transform", "translate(" + [lineHalfWidth - tickWidth - labelMargin, 3] + ")")
                    .attr("text-anchor", "end")
                    .text("mean");
                tMean.append("text")
                    .classed("tiny", true)
                    .attr("transform", "translate(" + [lineHalfWidth - tickWidth - labelMargin, 3] + ")")
                    .attr("text-anchor", "end")
                    .text("mean");
            }

            function drawMedians() {
                var tickWidth = 0,
                    lineHalfWidth = drawing.width / 2 - 25 + tickWidth,
                    labelMargin = 15;

                var oMedian = medianGroup.append("g")
                    .attr("id", "left-median")
                    .classed("median", true)
                    .attr("transform", "translate(" + [0, scaleLinear(values.left.median)] + ")");
                oMedian.append("line")
                    .classed("left", true)
                    .attr("x1", -lineHalfWidth)
                    .attr("y1", 0)
                    .attr("x2", -space.slope)
                    .attr("y2", 0);
                oMedian.append("text")
                    .classed("tiny", true)
                    .attr("transform", "translate(" + [-(lineHalfWidth + labelMargin), 3] + ")")
                    .attr("text-anchor", "end");
                //.text(d3.format("$,")(values.left.median));
                oMedian.append("text")
                    .classed("tiny text-background", true)
                    .attr("transform", "translate(" + [-lineHalfWidth + tickWidth + labelMargin, 3] + ")")
                    .attr("text-anchor", "start")
                    .text("median");
                oMedian.append("text")
                    .classed("tiny", true)
                    .attr("transform", "translate(" + [-lineHalfWidth + tickWidth + labelMargin, 3] + ")")
                    .attr("text-anchor", "start")
                    .text("median");

                avgGroup.append("line")
                    .classed("slope", true)
                    .attr("id", "mean-slope")
                    .attr("x1", -space.slope)
                    .attr("y1", scaleLinear(values.left.median))
                    .attr("x2", space.slope)
                    .attr("y2", scaleLinear(values.right.median));

                var tMedian = medianGroup.append("g")
                    .attr("id", "right-median")
                    .classed("median", true)
                    .attr("transform", "translate(" + [0, scaleLinear(values.right.median)] + ")");
                tMedian.append("line")
                    .classed("right", true)
                    .attr("x1", space.slope)
                    .attr("y1", 0)
                    .attr("x2", lineHalfWidth)
                    .attr("y2", 0);
                tMedian.append("text")
                    .classed("tiny", true)
                    .attr("transform", "translate(" + [lineHalfWidth + labelMargin, 3] + ")")
                    .attr("text-anchor", "start");
                //.text(d3.format("$,")(values.right.median));
                tMedian.append("text")
                    .classed("tiny text-background", true)
                    .attr("transform", "translate(" + [lineHalfWidth - tickWidth - labelMargin, 3] + ")")
                    .attr("text-anchor", "end")
                    .text("median");
                tMedian.append("text")
                    .classed("tiny", true)
                    .attr("transform", "translate(" + [lineHalfWidth - tickWidth - labelMargin, 3] + ")")
                    .attr("text-anchor", "end")
                    .text("median");
            }

            function drawFooter() {
                footerGroup.append("circle")
                    .attr("r", radius).attr("x", 0).attr("y", 15);
                footerGroup.append("text")
                    .attr("text-anchor", "start")
                    .text("#MakeoverMonday (2017, week 29) by @_Kcnarf");
                footerGroup.append("text")
                    .attr("text-anchor", "end")
                    .text("bl.ocks.org/Kcnarf/4608704a70fc24e2c06ca0116830de47");
            }

            drawAxis(axisGroup);
            drawCircles();
            drawMeans();
            drawMedians();
            //drawFooter();


            // console.debug(values);
        }
    };
}
;