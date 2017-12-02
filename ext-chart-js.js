/*
This program is compatible with ExtJs v2.0 but you don't need to use ExtJs in order to use this program
*/

function jsChart(div, options) {

    // We are getting the div in which we are going to put a canvas

    if (typeof div === "string") {

        div = document.querySelector(div);

    } else if (div.type != undefined && div.type == "ExtJsObject") {

        div = div.get(0);

    }

    return new newExtJsChart(div, options);

}

var newExtJsChart = function (div, options) {

    // Cleaning the div

    div.innerHTML = "";

    // Applying style on the div

    if (options.chart.theme != undefined) {
        if (options.chart.theme == "dark") {
            div.style.background = "rgba(0,0,0,0.75)";
        }else if (options.chart.theme == "light") {
            div.style.background = "rgba(0,0,0,0.12)";
        }else if(options.chart.theme == "light-sstats"){
            div.style.background = "rgba(0,0,0,0)";//"rgb(231,231,231)";
        }
    }

    if (options.chart.colors == undefined) {

        options.chart.colors = [
            "rgba(224,36,36, 0.60)",
            "rgba(224,36,36, 0.75)",
            "rgba(224,36,36, 0.90)",
            "rgba(247,187,22, 0.80)",
            "rgba(247,187,22, 0.85)",
            "rgba(247,187,22, 1)"
        ]
    }


    // Creating the drawing area

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    div.appendChild(canvas);

    // Creating drawing tools

    var draw = new extChartDrawer(ctx);

    // Setting up the canvas

    if (options.chart.width != "fit") {
        canvas.width = options.chart.width;
    } else {
        canvas.width = div.offsetWidth;
    }

    if (options.chart.height != "fit") {
        canvas.height = options.chart.height;
    } else {
        canvas.height = div.offsetHeight;
    }

    div.style.padding = "0";
    div.style.margin = "0";



    // Creating title

    ctx.beginPath();

    ctx.fillStyle = options.chart.title_color;
    ctx.font = "20px Arial";
    ctx.textAlign = "center";

    ctx.fillText(options.chart.title, canvas.width / 2, 45);

    ctx.closePath();

    // 

    var x_user_interface = document.createElement('div');
    x_user_interface.style.position = "absolute";
    x_user_interface.style.top = 0;
    x_user_interface.style.right = 0;
    x_user_interface.style.padding = "15px";
    x_user_interface.innerHTML = "Légende : <br />"

    div.appendChild(x_user_interface);

    // Making the chart

    if (options.chart.type == "linear") {

        if (options.chart.margin == undefined) {
            var from_bottom = 150;
            var from_left = 100;
        } else {
            var from_bottom = options.chart.margin.y;
            var from_left = options.chart.margin.x;
        }

        // Y axis 
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.moveTo(from_left, canvas.height - from_bottom);
        ctx.lineTo(from_left, 65);
        ctx.stroke();
        ctx.closePath();

        // X axis
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.moveTo(from_left, canvas.height - from_bottom);
        ctx.lineTo(canvas.width - from_left, canvas.height - from_bottom);
        ctx.stroke();
        ctx.closePath();

        // Comparing values

        var all_x = function () { var array = []; var a = options.datasets; for (var i = 0; i < a.length; i++) { var element = a[i].x; for (var ix = 0; ix < element.length; ix++) { var e = element[ix]; array.push(e); } } return array; }();

        var min_x = all_x[0];
        var max_x = all_x[0];

        for (var i = 0; i < all_x.length; i++) {
            var element = all_x[i];
            if (element > max_x) { max_x = element; }
            if (element < min_x) { min_x = element; }
        }

        var all_y = function () {
            var array = [];
            var a = options.datasets;
            for (var i = 0; i < a.length; i++) {

                if (options.chart.hide != undefined && options.chart.hide.indexOf(i) >= 0) {

                } else {
                    var element = a[i].y;
                    for (var ix = 0; ix < element.length; ix++) {
                        var e = element[ix];
                        array.push(e);
                    }

                }

            }
            return array;

        }();

        var min_y = all_y[0];
        var max_y = all_y[0];


        for (var i = 0; i < all_y.length; i++) {
            var element = all_y[i];
            if (element > max_y) { max_y = element; }
            if (element < min_y) { min_y = element; }
        }

        // Defining x size : 

        var available_width = canvas.width - (2 * from_left);
        var cell_size_x = available_width / Math.abs(max_x - min_x);

        // Defining y size

        var available_height = canvas.height - 65 - from_bottom;
        var cell_size_y = available_height / Math.abs(max_y - min_y);

        // Drawing 0 line

        if (min_y <= 0) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255,255,255,0.05)";
            var line_y = canvas.height - from_bottom - (0 * cell_size_y) + (min_y * cell_size_y)
            ctx.moveTo(from_left, line_y);
            ctx.lineTo(canvas.width - from_left, line_y);
            ctx.stroke();
            ctx.closePath();

            draw.text('0', from_left / 2, line_y, options.chart.axes_font);
        }



        // writing graph


        if (from_bottom >= 100) {
            var monthes = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "JuIllet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];
        } else {
            var monthes = ["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
        }

        for (var dsi = 0; dsi < options.datasets.length; dsi++) {
            var dataset = options.datasets[dsi];
            var last_x;
            var last_y;
            var color = options.chart.colors[dsi];

            if (options.chart.hide != undefined && options.chart.hide.indexOf(dsi) >= 0) {

                var line_color = "gray";
                var shown = false;

            } else {

                var line_color = color;
                var shown = true;


                for (var dsix = 0; dsix < dataset.x.length; dsix++) {

                    var x = from_left + (dataset.x[dsix] * cell_size_x) - (min_x * cell_size_x);
                    var y = getY(dataset.y[dsix], canvas, cell_size_y, min_y, from_bottom);

                    draw.dot(x, y, 2, color);

                    if (dsix == 0) {

                        last_x = x;
                        last_y = y;

                    } else {

                        ctx.beginPath();
                        ctx.strokeStyle = color;
                        ctx.moveTo(last_x, last_y);
                        ctx.lineTo(x, y);
                        //ctx.bezierCurveTo(last_x + 2,last_y - 5,x - 2,y - 5,x, y);
                        ctx.stroke();
                        ctx.closePath();

                        last_x = x;
                        last_y = y;

                    }

                    var x_data_format = function () {

                        var data = dataset.x[dsix];

                        if (options.chart.x.unit == "~month") {

                            real_data = "";
                            var i = 0;
                            var ee = 0;
                            while (i < data) {
                                i = i + 12;
                                ee++;
                            }
                            real_data = ee - 1;

                            return monthes[data - (real_data * 12)];

                        }else{
                            return dataset.x[dsix]
                        }

                    };


                    var new_point = document.createElement('div');
                    new_point.style.height = "30px";
                    new_point.style.width = "30px";
                    new_point.style.borderRadius = "50%";
                    new_point.style.position = "absolute";
                    new_point.style.transition = "0.25s";
                    new_point.style.top = y + 'px';
                    new_point.style.left = x + "px";
                    new_point.style.transform = "translateX(-50%) translateY(-50%)";
                    new_point.setAttribute('data-y', dataset.y[dsix]);
                    new_point.setAttribute('data-x', x_data_format());

                    new_point.onmouseover = function () {

                        var information_div = document.createElement('div');

                        information_div.innerHTML = this.getAttribute('data-x') + " : " + this.getAttribute('data-y');

                        information_div.style.position = "absolute";
                        information_div.style.transition = "0.25s";
                        information_div.style.background = "rgba(255,255,255,0.75)";
                        information_div.style.borderRadius = "4px";
                        information_div.style.padding = "8px";
                        information_div.style.top = this.style.top;
                        information_div.style.left = this.style.left;
                        information_div.style.transform = "translateX(10px) translateY(-10px)";

                        div.appendChild(information_div);

                        this.onmouseleave = function () {
                            information_div.parentElement.removeChild(information_div);
                        }

                    }

                    div.appendChild(new_point);

                    var toBeShown = Math.round(dataset.y[dsix] / options.chart.yround) * options.chart.yround;

                    draw.text(toBeShown, from_left / 2, getY(toBeShown, canvas, cell_size_y, min_y, from_bottom), options.chart.axes_font, options.chart.title_color);

                    draw.text(x_data_format(), canvas.height - (from_bottom / 2), -x, options.chart.axes_font, options.chart.title_color, Math.PI / 2);

                }

            }
            var xxx_chart_ref = this;
            var line = x_user_interface.appendChild(document.createElement('div'));
            line.style.color = line_color;
            line.innerHTML = dataset.display_title;
            line.setAttribute('data-id', dsi);
            line.setAttribute('data-shown', shown);
            line.onclick = function () {

                if (this.getAttribute("data-shown") == "true") {
                    xxx_chart_ref.hideDataSet(this.getAttribute('data-id'));
                    console.log('to hide')
                } else {
                    xxx_chart_ref.showDataSet(this.getAttribute('data-id'));
                    console.log('to show')

                }

            }
        }




    } else if (options.chart.type == "circular") {

        extChartDrawCircularChart(ctx, options, div, canvas, this, draw, x_user_interface);

    }

    // The div in which we will put (and in which we have already put) the canvas

    this.div = div;

    // The current options of the graph

    this.options = options;

    // Redefines the data sets

    this.setDataSets = function (datasets) {

        this.options.datasets = datasets;

        newExtJsChart(this.div, this.options);

    }

    this.fit = function () {
        var e = this;
        window.addEventListener('resize', function() {
            newExtJsChart(e.div, e.options);
        });
    }

    // Adds a new data set in options.datasets

    this.newDataSet = function (dataset) {

        this.options.datasets.push(dataset);

        this.setDataSets(this.options.datasets);

    }

    this.showDataSet = function (id) {

        id = parseInt(id);

        var after = [];

        for (var i = 0; i < this.options.chart.hide.length; i++) {
            var element = this.options.chart.hide[i];
            if (element != id) {
                after.push(element);
            }
        }

        this.options.chart.hide = after;

        newExtJsChart(this.div, this.options);

    }

    this.hideDataSet = function (id) {

        id = parseInt(id);

        this.options.chart.hide.push(id)

        newExtJsChart(this.div, this.options);

    }

    // Returns the objects so that can be used outside with a variable

    return this;

}

var extChartDrawer = function (ctx) {

    this.dot = function (x, y, dotRadius, dotColor) {

        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = dotColor;
        ctx.fill();
        ctx.closePath();
    }

    this.text = function (text, x, y, font, color, rotate) {

        if (rotate != undefined) {

            ctx.save();

            ctx.translate(0, 0);

            ctx.rotate(rotate);

        }

        ctx.beginPath();

        if (color) {
            ctx.fillStyle = color;
        } else {
            ctx.fillStyle = "darkgray";
        }


        ctx.font = font;
        ctx.textAlign = "center";

        ctx.fillText(text, x, y);

        ctx.closePath();

        if (rotate != undefined) {

            ctx.restore();

        }

    }

    return this;

}


function getY(y, canvas, cell_size_y, min_y, from_bottom) {

    return canvas.height - from_bottom - (y * cell_size_y) + (min_y * cell_size_y);

}

function extChartDrawCircularChart(ctx, options, div, canvas, that, drawer, x_user_interface) {

    var color = options.chart.title_color;
    var circle = {
        x: canvas.width / 2,
        y: canvas.height / 2 + 10,
        radius: (canvas.height / 2) - 70
    }

    var total = 0;

    for (var i = 0; i < options.datasets.length; i++) {
        if (options.chart.hide != undefined && options.chart.hide.indexOf(i) >= 0) {

        } else {

            var dataset = options.datasets[i];
            total += dataset.value;

        }
    }


    ctx.beginPath();

    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = "1px";
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.closePath();

    drawer.dot(circle.x, circle.y, 1, color);

    ctx.beginPath();
    ctx.moveTo(circle.x, circle.y);
    ctx.lineTo(circle.x, circle.y - circle.radius);
    ctx.stroke();


    var arc = Math.radians(-90);

    for (var i = 0; i < options.datasets.length; i++) {

        if (options.chart.hide != undefined && options.chart.hide.indexOf(i) >= 0) {
            var shown = false;
            var line_color = "gray";
        } else {

            var shown = true;

            var line_color = options.chart.colors[i];


            var dataset = options.datasets[i];

            ctx.beginPath();

            ctx.moveTo(circle.x, circle.y);

            var arcSector = Math.radians(100 * (dataset.value / total) * 3.6);

            ctx.arc(circle.x, circle.y, circle.radius, arc, arc + arcSector, false);

            arc = arc + arcSector;

            ctx.lineTo(circle.x, circle.y);

            ctx.fillStyle = options.chart.colors[i];

            ctx.fill();

            ctx.closePath();

        }

        try {
            var line = x_user_interface.appendChild(document.createElement('div'));
            line.style.color = line_color;
            line.innerHTML = dataset.label;
            line.setAttribute('data-id', i);
            line.setAttribute('data-shown', shown);
            line.onclick = function () {

                if (this.getAttribute("data-shown") == "true") {
                    that.hideDataSet(this.getAttribute('data-id'));
                } else {
                    that.showDataSet(this.getAttribute('data-id'));
                }

            }
        } catch (error) {
            that.showDataSet(0);
        }

    }



}

Math.radians = function (degrees) {

    return degrees * Math.PI / 180;

}