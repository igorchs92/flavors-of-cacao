charts = function () {
};

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

d3.select("body").append("div").attr("id", "chart-tooltip").style("display", "none");

$(document).ready(function () {
    var dataExplorationSelect = $(".data-exploration-select"),
        optionValues = ["Australia", "Belgium", "Canada", "Ecuador", "Denmark", "France", "Germany", "Italy", "the Netherlands", "Scotland", "Switzerland", "U.K.", "U.S.A."];
    dataExplorationSelect.selects = [dataExplorationSelect.find(".left-select"), dataExplorationSelect.find(".right-select")];


    for (var i in dataExplorationSelect.selects) {
        var select = dataExplorationSelect.selects[i];
        $.each(optionValues, function (key, value) {
            select.append($("<option/>").text(value));
        });
        select.children().eq(i).attr("selected", "true");
    }

    $('select:not(.ignore)').niceSelect();

    FastClick.attach(document.body);

    d3.csv("data/flavors-of-cacao.csv", function (error, data) {
        dataExplorationSelect.on('change', function () {

            var leftSelect = dataExplorationSelect.selects[0],
                rightSelect = dataExplorationSelect.selects[1];

            leftSelect.find("option").removeAttr('disabled');
            rightSelect.find("option").removeAttr('disabled');
            leftSelect.find("option:contains('" + rightSelect.val() + "')").attr("disabled", true);
            rightSelect.find("option:contains('" + leftSelect.val() + "')").attr("disabled", true);
            leftSelect.niceSelect("update");
            rightSelect.niceSelect("update");

            charts.beeswarm({
                width: 960,
                height: 540,
                data: data,
                selector: "#data-exploration",
                y_axis: {
                    title: "rating",
                    select: function (entry) {
                        return entry.rating;
                    },
                    tooltip: function (entry) {
                        return [
                            // companyName,name,ref,reviewDate,cacaoPercentage,companyLocation,rating,beanType,beanOrigin
                            {title: "Company", value: entry.companyName},
                            {title: "Specific Bean Origin or Bar Name", value: entry.name},
                            {title: "Company Location", value: entry.companyLocation},
                            {title: "Review Date", value: entry.reviewDate},
                            {title: "Cacao Percentage", value: entry.cacaoPercentage},
                            {title: "Bean Type", value: entry.beanType},
                            {title: "Broad Bean Origin", value: entry.beanOrigin}
                        ]
                    }
                },
                x_axis: {
                    title: "country",
                    select: function (entry) {
                        return entry.companyLocation;
                    },
                    left: {
                        title: leftSelect.val(),
                        filter: function (key) {
                            return key === leftSelect.val()
                        }
                    },
                    right: {
                        title: rightSelect.val(),
                        filter: function (key) {
                            return key === rightSelect.val()
                        }
                    }
                }
            }).draw()
        }).trigger("change");

    });
});