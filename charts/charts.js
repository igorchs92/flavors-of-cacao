charts = function () {
};

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

d3.select("body").append("div").attr("id", "chart-tooltip").style("display", "none");