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

    canvas.width = options.chart.width;
    
    canvas.height = options.chart.height;
    
    //canvas.style.background = "#eee";

    // Creating title

    ctx.beginPath();

    ctx.fillStyle = options.chart.title_color;
    ctx.font = "20px Arial";
    ctx.textAlign = "center";

    ctx.fillText(options.chart.title, canvas.width / 2, 45);

    ctx.closePath();

    // Making the chart

    if(options.chart.type == "linear"){

        // Y axis 
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.moveTo(50, canvas.height - 50);
        ctx.lineTo(50, 65);
        ctx.stroke();
        ctx.closePath();

        // X axis
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.moveTo(50, canvas.height - 50);
        ctx.lineTo(canvas.width - 50,  canvas.height - 50);
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

        var available_width = canvas.width - 100;
        var cell_size_x = available_width / Math.abs(max_x - min_x);

        // Defining y size

        var available_height = canvas.height - 65 - 50;
        var cell_size_y = available_height / Math.abs(max_y - min_y);

        // Drawing 0 line

        if(min_y <= 0) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            var line_y = canvas.height - 50 - (0 * cell_size_y) + (min_y * cell_size_y)
            ctx.moveTo(50, line_y);
            ctx.lineTo(canvas.width - 50, line_y);
            ctx.stroke();
            ctx.closePath();

            draw.text('0', 25, line_y, "10px Arial");
        }

        // writing graph

        for (var dsi = 0; dsi < options.datasets.length; dsi++) {

            var dataset = options.datasets[dsi];
            var last_x;
            var last_y;
            var color = options.chart.colors[dsi];
            
            for (var dsix = 0; dsix < dataset.x.length; dsix++) {

                var x =  50 + (dataset.x[dsix] * cell_size_x) - (min_x * cell_size_x);
                var y = getY(dataset.y[dsix], canvas, cell_size_y, min_y);

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

                    draw.text(toBeShown, 25,getY(toBeShown, canvas, cell_size_y, min_y), "10px Arial", color);

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

    this.ctx = ctx;

    this.dot = function (x,y,dotRadius,dotColor){

        var ctx = this.ctx;

        ctx.beginPath();
        ctx.arc(x,y, dotRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = dotColor;
        ctx.fill();  
        ctx.closePath();            
    } 

    this.text = function (text, x, y, font, color) {
        
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

    }

    return this;

}


function getY(y, canvas, cell_size_y, min_y){
    return canvas.height - 50 - (y * cell_size_y) + (min_y * cell_size_y);
}