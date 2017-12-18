const WITH_TRANSITION = true;
const WITHOUT_TRANSITION = false;
const duration = 250;

//begin: raw data global def
var obamaSalaries = [],
    trumpSalaries = [];
var obamaStaffCount = 0,
    trumpStaffCount = 0;
var obamaTotalSalaries = 0,
    trumpTotalSalaries = 0;
var salaryExtent, obamaSalariesExtent, trumpSalariesExtent;
var obamaMeanSalary, trumpMeanSalary;
var obamaMedianSalary, trumpMedianSalary;
//end: raw data global def

//begin: data-related utils
function salaryAccessor (d){ return d.salary }
//end: data-related utils

//begin: layout conf.
var svgWidth = 960,
    svgHeight = 500,
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    halfSpaceBetween = {header: 15, circle: 15, slope: 5},
    titleY = 10,
    nameY = 50,
    staffY = nameY+30,
    totalY = staffY+15,
    tillHeader = 15,
    headerHeight = totalY + tillHeader + 5,
    footerHeight = 30,
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - headerHeight - footerHeight - margin.top - margin.bottom,
    halfWidth = width/2,
    halfHeight = height/2,
    quarterWidth = width/4,
    quarterHeight = height/4;
//end: layout conf.

//begin: beeswarm conf.
var beeRadius = 3;
var yPosScale = d3.scaleLinear();
var radiusScale = d3.scalePow().exponent(0.5);
var salariesArrangement, obamaArrangement, trumpArrangement;
//end: beeswarm conf.

//begin: reusable d3Selection
var svg, drawingArea, header, footer, axisContainer, avgContainer, medianContainer, circleContainer, tooltip;
//end: reusable d3Selection

var root = $("#data-exploration");
svg = root.append("<svg></svg>");

d3.csv("data/whiteHouseSalaries.csv", csvParser, function(error, data) {
    if (error) throw error;

    obamaSalariesExtent = d3.extent(obamaSalaries, salaryAccessor);
    trumpSalariesExtent = d3.extent(trumpSalaries, salaryAccessor);
    salariesExtent = [Math.min(obamaSalariesExtent[0], trumpSalariesExtent[0]),
        Math.max(obamaSalariesExtent[1], trumpSalariesExtent[1])];

    obamaMeanSalary = Math.round(obamaTotalSalaries/obamaSalaries.length);
    trumpMeanSalary = Math.round(trumpTotalSalaries/trumpSalaries.length);

    obamaMedianSalary = d3.median(obamaSalaries, salaryAccessor);
    trumpMedianSalary = d3.median(trumpSalaries, salaryAccessor);

    yPosScale.domain(salariesExtent).range([height,0]);
    radiusScale.domain(salariesExtent).range([0.5, beeRadius]);

    initLayout();
    drawBeeswarm();
    drawMeans();
    drawMedians();
});

function csvParser(d) {
    d.administration = d.administration;
    d.name = d.name;
    d.salary = +d.salary;
    d.positionTitle = d.positionTitle;
    if (d.administration === "Obama") {
        obamaSalaries.push(d);
        obamaTotalSalaries += d.salary;
        obamaStaffCount++;
    } else {
        trumpSalaries.push(d);
        trumpTotalSalaries += d.salary;
        trumpStaffCount++;
    }
    return d;
};

function initLayout() {svg = d3.select("svg#rating-comparison")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    drawingArea = svg.append("g")
        .classed("drawingArea", true)
        .attr("transform", "translate("+[margin.left+halfWidth,margin.top]+")");

    header = drawingArea.append("g").attr("id", "header");
    drawHeader();

    footer = drawingArea.append("g")
        .attr("id", "footer")
        .attr("transform", "translate("+[0,headerHeight+height+footerHeight]+")");
    drawFooter();

    var graphContainer = drawingArea.append("g")
        .attr("transform", "translate("+[0,headerHeight]+")")

    axisContainer = graphContainer.append("g").attr("id", "axis-container");
    drawAxis()

    avgContainer = graphContainer.append("g").attr("id","average-container");
    medianContainer = graphContainer.append("g").attr("id","median-container");
    circleContainer = graphContainer.append("g").attr("id","circle-container");

    tooltip = svg.append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

function drawHeader() {
    header.append("text")
        .attr("id", "title")
        .attr("transform", "translate("+[0, titleY]+")")
        .attr("text-anchor", "middle")
        .text("White House Salaries")

    drawNames();
    drawStaffCounts();
    //drawStaffCountsWithPictorialUnitChart() //not used; add confusion with regards to circles in distribution
    drawTotals();
}

function drawNames() {
    var labelMarginX = 5;

    var names = header.append("g")
        .attr("transform", "translate("+[0,nameY]+")")
    var obama = names.append("text")
        .classed("name", true)
        .attr("transform", "translate("+[-halfSpaceBetween.header, 0]+")")
        .attr("text-anchor", "end")
        .text("Obama");
    names.append("text")
        .attr("text-anchor", "middle")
        .text("vs");
    var trump = names.append("text")
        .classed("name", true)
        .attr("transform", "translate("+[halfSpaceBetween.header, 0]+")")
        .attr("text-anchor", "start")
        .text("Trump");
    names.append("text")
        .classed("date tiny", true)
        .attr("transform", "translate("+[-(halfSpaceBetween.header+obama.node().getBBox().width+labelMarginX), 0]+")")
        .attr("text-anchor", "end")
        .text("(2016)");
    names.append("text")
        .classed("date tiny", true)
        .attr("transform", "translate("+[halfSpaceBetween.header + trump.node().getBBox().width+labelMarginX, 0]+")")
        .attr("text-anchor", "start")
        .text("(2017)");
}

function drawStaffCounts() {
    var labelMarginX = 5;

    var staffCounts = header.append("g")
        .attr("transform", "translate("+[0,staffY]+")")
    var oStaffCount = staffCounts.append("text")
        .classed("staff-count", true)
        .attr("transform", "translate("+[-halfSpaceBetween.header, 0]+")")
        .attr("text-anchor", "end")
        .text(obamaStaffCount);
    staffCounts.append("text")
        .attr("text-anchor", "middle")
        .text(">");
    var tStaffCount = staffCounts.append("text")
        .classed("staff-count", true)
        .attr("transform", "translate("+[halfSpaceBetween.header, 0]+")")
        .attr("text-anchor", "start")
        .text(trumpStaffCount);
    staffCounts.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[-(halfSpaceBetween.header+oStaffCount.node().getBBox().width+labelMarginX), 0]+")")
        .attr("text-anchor", "end")
        .text("staff count ------");
    staffCounts.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[halfSpaceBetween.header + tStaffCount.node().getBBox().width+labelMarginX, 0]+")")
        .attr("text-anchor", "start")
        .text("------ staff count");
}

function drawStaffCountsWithPictorialUnitChart() {
    var labelMarginX = 5,
        countMargin = 300 + labelMarginX;

    var staffs = header.append("g")
        .attr("transform", "translate("+[0,staffY]+")")

    var oStaff = staffs.append("g")
        .attr("transform", "translate("+[-halfSpaceBetween.header, -12]+")")
    oStaff.selectAll("circle")
        .data(d3.range(0,obamaStaffCount))
        .enter()
        .append("circle")
        .classed("a", true)
        .attr("r", 0.5)
        .attr("cx", (d)=>{ return -3*(d%100);})
.attr("cy", (d)=>{ return 3*Math.floor(d/100); });
    var oStaffCount = staffs.append("text")
        .classed("staff-count", true)
        .attr("transform", "translate("+[-(halfSpaceBetween.header+countMargin), 0]+")")
        .attr("text-anchor", "end")
        .text(obamaStaffCount);
    staffs.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[-(halfSpaceBetween.header+countMargin+oStaffCount.node().getBBox().width+labelMarginX), 0]+")")
        .attr("text-anchor", "end")
        .text("staff count ------");

    staffs.append("text")
        .attr("text-anchor", "middle")
        .text(">");

    var tStaff = staffs.append("g")
        .attr("transform", "translate("+[halfSpaceBetween.header, -12]+")")
    tStaff.selectAll("circle")
        .data(d3.range(0,trumpStaffCount))
        .enter()
        .append("circle")
        .classed("Trump", true)
        .attr("r", 0.5)
        .attr("cx", (d)=>{ return 3*(d%100);})
.attr("cy", (d)=>{ return 3*Math.floor(d/100); });
    var tStaffCount = staffs.append("text")
        .classed("staff-count", true)
        .attr("transform", "translate("+[halfSpaceBetween.header+countMargin, 0]+")")
        .attr("text-anchor", "start")
        .text(trumpStaffCount);
    staffs.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[halfSpaceBetween.header+countMargin+tStaffCount.node().getBBox().width+labelMarginX, 0]+")")
        .attr("text-anchor", "start")
        .text("------ staff count");
}

function drawTotals() {
    var labelMarginX = 5;

    var totals = header.append("g")
        .attr("transform", "translate("+[0,totalY]+")")
    var oTotal = totals.append("text")
        .classed("total", true)
        .attr("transform", "translate("+[-halfSpaceBetween.header, 0]+")")
        .attr("text-anchor", "end")
        .text(d3.format("$,")(obamaTotalSalaries));
    totals.append("text")
        .attr("text-anchor", "middle")
        .text(">");
    var tTotal = totals.append("text")
        .classed("total", true)
        .attr("transform", "translate("+[halfSpaceBetween.header, 0]+")")
        .attr("text-anchor", "start")
        .text(d3.format("$,")(trumpTotalSalaries));
    totals.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[-(halfSpaceBetween.header+oTotal.node().getBBox().width+labelMarginX), 0]+")")
        .attr("text-anchor", "end")
        .text("total in 2016 ------");
    totals.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[halfSpaceBetween.header + tTotal.node().getBBox().width+labelMarginX, 0]+")")
        .attr("text-anchor", "start")
        .text("------ total in 2017");
}

function drawFooter() {
    footer.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[-halfWidth, 0]+")")
        .attr("text-anchor", "start")
        .text("#MakeoverMonday (2017, week 29) by @_Kcnarf")
    footer.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[halfWidth, 0]+")")
        .attr("text-anchor", "end")
        .text("bl.ocks.org/Kcnarf/4608704a70fc24e2c06ca0116830de47")
}

function drawAxis() {
    var lineHalfWidth = halfWidth-halfWidth/4,
        labelMargin = 5;

    var ticks = axisContainer.selectAll(".tick")
        .data(d3.range(salariesExtent[0], salariesExtent[1], 20000))
        .enter()
        .append("g")
        .classed("tick", true)
        .attr("transform", (d)=>{ return "translate("+[0, yPosScale(+d)]+")"; })
    ticks.append("line")
        .attr("x1", -lineHalfWidth)
        .attr("y1", 0)
        .attr("x2", lineHalfWidth)
        .attr("y2", 0);
    ticks.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[lineHalfWidth+labelMargin,3]+")")
        .attr("text-anchor", "start")
        .text((d)=>{ return (d===0)? 0 : d/1000+"k"; });
    ticks.append("text")
        .classed("tiny light", true)
        .attr("transform", "translate("+[-(lineHalfWidth+labelMargin),3]+")")
        .attr("text-anchor", "end")
        .text((d)=>{ return (d===0)? 0 : d/1000+"k"; });

    axisContainer.append("text")
        .classed("unit light", true)
        .attr("transform", "translate("+[-(lineHalfWidth+labelMargin), 0]+")")
        .attr("text-anchor", "end")
        .text("($ per year)")
    axisContainer.append("text")
        .classed("unit light", true)
        .attr("transform", "translate("+[(lineHalfWidth+labelMargin), 0]+")")
        .attr("text-anchor", "start")
        .text("($ per year)")
}

function drawBeeswarm() {
    var beeswarm = d3.beeswarm()
        .radius(beeRadius)
        .orientation("vertical")
        .distributeOn((d)=>{ return yPosScale(d.salary); });

    obamaArrangement = beeswarm.data(d3.shuffle(obamaSalaries)).side("negative").arrange();
    trumpArrangement = beeswarm.data(d3.shuffle(trumpSalaries)).side("positive").arrange();
    salariesArrangement = obamaArrangement.concat(trumpArrangement);

    drawCircles();
};

function drawCircles() {
    var circles = circleContainer.selectAll("circle")
        .data(salariesArrangement)
        .enter()
        .append("g")
        .attr("transform", (d)=>{
        if (d.datum.administration==="Obama") {
        return "translate("+[d.x-halfSpaceBetween.circle,d.y]+")";
    } else {
        return "translate("+[d.x+halfSpaceBetween.circle,d.y]+")";
    }
});
    //transparent circle, for hover purpose
    circles.append("circle")
        .attr("r", beeRadius)
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(0)
                .style("opacity", .9);
            tooltip.html(""+d3.format("$,")(d.datum.salary))
                .style("left", (d3.event.pageX - 30) + "px")
                .style("top", (d3.event.pageY - 24) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(duration)
                .style("opacity", 0);
        });
    //colored, sized, circle
    circles.append("circle").attr("r", (d)=>{ return radiusScale(d.datum.salary); })
.attr("class", (d)=>{ return d.datum.administration; })
}

function drawMeans() {
    var tickWidth = 30,
        lineHalfWidth = halfWidth-halfWidth/4+tickWidth,
        labelMargin = 5;

    var oMean = avgContainer.append("g")
        .attr("id", "obama-average")
        .classed("average", true)
        .attr("transform", "translate("+[0, yPosScale(obamaMeanSalary)]+")")
    oMean.append("line")
        .classed("a", true)
        .attr("x1", -lineHalfWidth)
        .attr("y1", 0)
        .attr("x2", -halfSpaceBetween.slope)
        .attr("y2", 0);
    oMean.append("text")
        .classed("tiny", true)
        .attr("transform", "translate("+[-(lineHalfWidth+labelMargin),3]+")")
        .attr("text-anchor", "end")
        .text(d3.format("$,")(obamaMeanSalary));
    oMean.append("text")
        .classed("tiny text-background", true)
        .attr("transform", "translate("+[-lineHalfWidth+tickWidth,3]+")")
        .attr("text-anchor", "start")
        .text("mean");
    oMean.append("text")
        .classed("tiny", true)
        .attr("transform", "translate("+[-lineHalfWidth+tickWidth,3]+")")
        .attr("text-anchor", "start")
        .text("mean");

    avgContainer.append("line")
        .classed("slope", true)
        .attr("id", "mean-slope")
        .attr("x1", -halfSpaceBetween.slope)
        .attr("y1", yPosScale(obamaMeanSalary))
        .attr("x2", halfSpaceBetween.slope)
        .attr("y2", yPosScale(trumpMeanSalary));

    var tMean = avgContainer.append("g")
        .attr("id", "trump-average")
        .classed("average", true)
        .attr("transform", "translate("+[0, yPosScale(trumpMeanSalary)]+")")
    tMean.append("line")
        .classed("Trump", true)
        .attr("x1", halfSpaceBetween.slope)
        .attr("y1", 0)
        .attr("x2", lineHalfWidth)
        .attr("y2", 0);
    tMean.append("text")
        .classed("tiny", true)
        .attr("transform", "translate("+[lineHalfWidth+labelMargin,3]+")")
        .attr("text-anchor", "start")
        .text(d3.format("$,")(trumpMeanSalary));
    tMean.append("text")
        .classed("tiny text-background", true)
        .attr("transform", "translate("+[lineHalfWidth-tickWidth,3]+")")
        .attr("text-anchor", "end")
        .text("mean");
    tMean.append("text")
        .classed("tiny", true)
        .attr("transform", "translate("+[lineHalfWidth-tickWidth,3]+")")
        .attr("text-anchor", "end")
        .text("mean");
}

function drawMedians() {
    var tickWidth = 30,
        lineHalfWidth = halfWidth-halfWidth/4+tickWidth,
        labelMargin = 5;

    var oMedian = medianContainer.append("g")
        .attr("id", "obama-median")
        .classed("median", true)
        .attr("transform", "translate("+[0, yPosScale(obamaMedianSalary)]+")")
    oMedian.append("line")
        .classed("a", true)
        .attr("x1", -lineHalfWidth)
        .attr("y1", 0)
        .attr("x2", -halfSpaceBetween.slope)
        .attr("y2", 0);
    oMedian.append("text")
        .classed("tiny", true)
        .attr("transform", "translate("+[-(lineHalfWidth+labelMargin),3]+")")
        .attr("text-anchor", "end")
        .text(d3.format("$,")(obamaMedianSalary));
    oMedian.append("text")
        .classed("tiny text-background", true)
        .attr("transform", "translate("+[-lineHalfWidth+tickWidth,3]+")")
        .attr("text-anchor", "start")
        .text("median");
    oMedian.append("text")
        .classed("tiny", true)
        .attr("transform", "translate("+[-lineHalfWidth+tickWidth,3]+")")
        .attr("text-anchor", "start")
        .text("median");

    avgContainer.append("line")
        .classed("slope", true)
        .attr("id", "mean-slope")
        .attr("x1", -halfSpaceBetween.slope)
        .attr("y1", yPosScale(obamaMedianSalary))
        .attr("x2", halfSpaceBetween.slope)
        .attr("y2", yPosScale(trumpMedianSalary));

    var tMedian = medianContainer.append("g")
        .attr("id", "trump-median")
        .classed("median", true)
        .attr("transform", "translate("+[0, yPosScale(trumpMedianSalary)]+")")
    tMedian.append("line")
        .classed("Trump", true)
        .attr("x1", halfSpaceBetween.slope)
        .attr("y1", 0)
        .attr("x2", lineHalfWidth)
        .attr("y2", 0);
    tMedian.append("text")
        .classed("tiny", true)
        .attr("transform", "translate("+[lineHalfWidth+labelMargin,3]+")")
        .attr("text-anchor", "start")
        .text(d3.format("$,")(trumpMedianSalary));
    tMedian.append("text")
        .classed("tiny text-background", true)
        .attr("transform", "translate("+[lineHalfWidth-tickWidth,3]+")")
        .attr("text-anchor", "end")
        .text("median");
    tMedian.append("text")
        .classed("tiny", true)
        .attr("transform", "translate("+[lineHalfWidth-tickWidth,3]+")")
        .attr("text-anchor", "end")
        .text("median");
}