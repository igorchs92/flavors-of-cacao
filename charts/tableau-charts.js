tableauCharts = {};
tableauCharts.pdf = {};
tableauCharts.pdf.fault = false;

tableauCharts.pdf = $("<object class='full-screen-only'/>")
    .attr("data", "data/flavors-of-cacao.pdf")
    .attr("type", "application/pdf")
    .on('error', function(event) {
        console.log(event);
        tableauCharts.pdf.fault = true;
    });

$("body").append(tableauCharts.pdf);

tableauCharts.pdf.view = function () {
    if (!tableauCharts.pdf.fault && fullscreen.fullscreenEnabled()) {
        fullscreen.requestFullscreen(tableauCharts.pdf[0]);
        return false;
    } else {
        return true;
    }
};