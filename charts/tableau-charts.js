tableauCharts = {};

tableauCharts.pdf = $("<object class='full-screen-only'/>")
    .attr("data", "data/flavors-of-cacao.pdf")
    .attr("type", "application/pdf");

$("body").append(tableauCharts.pdf);

tableauCharts.pdf.view = function () {
    console.log(tableauCharts.pdf);
    fullscreen.requestFullscreen(tableauCharts.pdf[0]);
};