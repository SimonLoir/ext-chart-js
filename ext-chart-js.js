/*
This program is compatible with ExtJs v2.0 but you don't need to use ExtJs in order to use this program
*/

function jsChart(div, options) {

    // We are getting the div in which we are going to put a canvas

    if(typeof div === "string"){

        div = document.querySelector(div);

    }else if(div.type != undefined && div.type == "ExtJsObject"){

        div = div.get(0);

    }

    return new newExtJsChart(div, options);

}

var newExtJsChart = function (div, options){

    // Cleaning the div

    div.innerHTML = "";

    // Applying style on the div

    if(options.chart.theme != undefined){
        if(options.chart.theme == "dark"){
            div.style.background = "rgba(0,0,0,0.75)";
        }
    }
    
    // Creating the drawing area

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    div.appendChild(canvas);

    // Creating drawing tools

    var draw = new extChartDrawer(ctx);
    
    // Setting up the canvas

    if(options.chart.width != "fit"){
        canvas.width = options.chart.width;
    }else{
        canvas.width = div.offsetWidth;
    }
    
    if(options.chart.height != "fit"){
        canvas.height = options.chart.height;
    }else{
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

    // Making the chart

    if(options.chart.type == "linear"){

        if(options.chart.margin == undefined) {
            var from_bottom = 150;
            var from_left = 100;
        }else{
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
        ctx.lineTo(canvas.width - from_left,  canvas.height - from_bottom);
        ctx.stroke();
        ctx.closePath();

        // Comparing values

        var all_x = function () {var array = [];var a = options.datasets; for (var i = 0; i < a.length; i++) {var element = a[i].x; for (var ix = 0; ix < element.length; ix++) { var e = element[ix];array.push(e);}}return array;}();
        
        var min_x = all_x[0];
        var max_x = all_x[0];
        
        for (var i = 0; i < all_x.length; i++) {var element = all_x[i];
            if(element > max_x){max_x = element;}
            if(element < min_x){min_x = element;}
        }

        var all_y = function () {var array = [];var a = options.datasets; for (var i = 0; i < a.length; i++) {var element = a[i].y; for (var ix = 0; ix < element.length; ix++) { var e = element[ix];array.push(e);}}return array;}();
        var min_y = all_y[0];
        var max_y = all_y[0];       


        for (var i = 0; i < all_y.length; i++) {var element = all_y[i];
            if(element > max_y){max_y = element;}
            if(element < min_y){min_y = element;}
        }
        
        // Defining x size : 

        var available_width = canvas.width - (2 * from_left);
        var cell_size_x = available_width / Math.abs(max_x - min_x);

        // Defining y size

        var available_height = canvas.height - 65 - from_bottom;
        var cell_size_y = available_height / Math.abs(max_y - min_y);

        // Drawing 0 line

        if(min_y <= 0) {
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


        if(from_bottom >= 100){
            var monthes = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "JuIllet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];
        }else{
            var monthes = ["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];             
        }

        for (var dsi = 0; dsi < options.datasets.length; dsi++) {

            var dataset = options.datasets[dsi];
            var last_x;
            var last_y;
            var color = options.chart.colors[dsi];
            
            for (var dsix = 0; dsix < dataset.x.length; dsix++) {

                var x =  from_left + (dataset.x[dsix] * cell_size_x) - (min_x * cell_size_x);
                var y = getY(dataset.y[dsix], canvas, cell_size_y, min_y, from_bottom);

                draw.dot(x, y, 2, color);

                if(dsix == 0){

                    last_x = x;
                    last_y = y;

                }else{

                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.moveTo(last_x, last_y);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.closePath();
                    
                    last_x = x;
                    last_y = y;                  

                }

                var toBeShown = Math.round(dataset.y[dsix] / options.chart.yround) * options.chart.yround;

                draw.text(toBeShown, from_left / 2,getY(toBeShown, canvas, cell_size_y, min_y, from_bottom), options.chart.axes_font, options.chart.title_color);

                draw.text(function () {
                    
                    var data = dataset.x[dsix];

                    if(options.chart.x.unit == "~month"){

                        real_data = "";
                        var i = 0;
                        var ee = 0;
                        while (i < data) {
                            i = i + 12; 
                            ee++;
                        }
                        real_data = ee - 1;

                        return monthes[data - (real_data * 12)];

                    }

                }(), canvas.height - (from_bottom / 2), -x, options.chart.axes_font, options.chart.title_color, Math.PI / 2);

            }

        }

               
        

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

    // Adds a new data set in options.datasets

    this.newDataSet = function (dataset) {

        this.options.datasets.push(dataset);

        this.setDataSets(this.options.datasets);

    }

    // Returns the objects so that can be used outside with a variable

    return this;

}

var extChartDrawer = function (ctx){

    this.dot = function (x,y,dotRadius,dotColor){

        ctx.beginPath();
        ctx.arc(x,y, dotRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = dotColor;
        ctx.fill();  
        ctx.closePath();            
    } 

    this.text = function (text, x, y, font, color, rotate) {
        
        if(rotate != undefined) {

            ctx.save();

            ctx.translate(0,0);

            ctx.rotate(rotate);

        }

        ctx.beginPath();

        if(color){
            ctx.fillStyle = color;
        }else{
            ctx.fillStyle = "darkgray";
        }


        ctx.font = font;
        ctx.textAlign = "center";

        ctx.fillText(text, x, y);

        ctx.closePath();

        if(rotate != undefined) {

            ctx.restore();

        }

    }

    return this;

}


function getY(y, canvas, cell_size_y, min_y, from_bottom){
    return canvas.height - from_bottom - (y * cell_size_y) + (min_y * cell_size_y);
}