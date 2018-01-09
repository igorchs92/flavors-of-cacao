tableauCharts = {};
tableauCharts.pdf = {};
tableauCharts.pdf.object = undefined;
tableauCharts.pdf.appended = false;
tableauCharts.pdf.fault = false;

tableauCharts.pdf.view = function () {
    if (fullscreen.fullscreenEnabled()) {
        if (!tableauCharts.pdf.appended) {
            tableauCharts.pdf.object = $("<object class=\"full screen only\"/>")
                .attr("data", "data/flavors-of-cacao.pdf")
                .attr("type", "application/pdf")
                .on('error', function (event) {
                    console.log(event);
                    tableauCharts.pdf.fault = true;
                });
            if (!tableauCharts.pdf.fault) {
                $("body").append(tableauCharts.pdf.object);
            }
            tableauCharts.pdf.appended = true;
        }
        if (!tableauCharts.pdf.fault) {
            fullscreen.requestFullscreen(tableauCharts.pdf.object[0]);
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
};