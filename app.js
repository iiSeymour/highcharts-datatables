$(document).ready(function () {
    
    "use strict";
    
    var escape = function(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    };
    
    var parsedate = function(s) {
        return new Date(s).getTime();
    };

    var bydate = function(property, i, j) {
        return new Date(i[property]).getTime() - new Date(j[property]).getTime();
    };
    
    var filter = function(data, regex) {
        return _.filter(data, function (doc) {
            return _.some(_.values(doc, regex), function (value) {
                return regex.test(value);
            });
        });
    };

    $.getJSON("/data.json", function(data) {

        var byStartDT = _.partial(bydate, "date"),
            data      = data.sort(byStartDT),
            dates     = _.map(_.pluck(data, "date"), parsedate),
            home      = _.pluck(data, "home points"),
            visitor   = _.pluck(data, "visitor points"),
            chart     = new Highcharts.Chart({ chart:   { renderTo: "chart" },
                                               credits: { enabled: false },
                                               title:   { text: "NBA 2013/2014 Results" },
                                               yAxis:   { min: 0, title: { text: "Points" } }, 
                                               xAxis:   { type: "datetime" },
                                               series: [{
                                                   name: "Home Score",
                                                   data: _.zip(dates, home)
                                               }, {
                                                   name: "Visitor Score",
                                                   data: _.zip(dates, visitor)
                                               }],
                                             });

        $("#table").dataTable({
            "data": data,
            "columns": [
                { "title": "date", "data": "date" },
                { "title": "team", "data": "home" },
                { "title": "points", "data": "home points" },
                { "title": "opponent", "data": "visitor" },
                { "title": "points", "data": "visitor points" },
            ],
            "bDestroy" : true,
        });

        $("#filter").on("keyup", function() {
 
            var table    = $("#table").DataTable(),
                regex    = new RegExp(escape(this.value), "i"),
                filtered = filter(data, regex),
                fhome    = _.pluck(filtered, "home points"),
                fvisitor = _.pluck(filtered, "visitor points"),
                fdates   = _.map(_.pluck(filtered, "date"), parsedate);
            
            chart.series[0].setData(_.zip(fdates, fhome));
            chart.series[1].setData(_.zip(fdates, fvisitor));
            table.search(this.value).draw();                

        });

    });

});
