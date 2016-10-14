
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign,xMin,xMax, xAxisHighlight, numTicksx, size){
    //console.log(data)
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]);
    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this chart
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.linecolours;
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    var plotData=d3.nest()
        .key(function(d) { return d.group; })
        .entries(data);


    xMin=Math.min(xMin,d3.min(plotData, function(d) { return d3.min(d.values, function(d) { return d.value; })})); 
    xMax=Math.max(xMax,d3.max(plotData, function(d) { return d3.max(d.values, function(d) { return d.value; })})); 

    var xScale = d3.scale.linear()
        .range([0, plotWidth])
        .domain([xMin,xMax]);

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(numTicksx)
    .tickSize(plotHeight)
    .orient("bottom");

    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
      .call(xAxis);

    var originValue = 0;
    var origin = plot.selectAll(".tick").filter(function(d, i) {
            return d==originValue || d==xAxisHighlight;
        }).classed(media+"origin",true);

    var yScale = d3.scale.ordinal()
        .rangeBands([plotHeight+margin.top, margin.top])
        .domain(plotData.map(function(d) { return d.key; }));;
    
    var category = plot.selectAll("."+media+"category")
        .data(plotData)
        .enter()
        .append("g")
        .attr("transform", function (d) {return "translate(0," + yScale(d.key) + ")"; })
        .attr("class", media+"category")

        .call(function(parent){
            console.log(parent)
            parent.append('text')
                .attr("class", media+"Subtitle")
                .attr("x",margin.left)
                .attr("y",0)
                .text(function(d){return d.key})

            addText(parent)
            //addCircles(parent);

        })

    function addText(parent) {
        parent.selectAll("text")
            .data(function(d) {
                // console.log("d.values",d.values)
                let textFiltered=d.values.filter(function(d){
                    return d.highlight=="yes"
                })
                console.log("textFiltered",textFiltered)
                return textFiltered
            })
            .enter()
            .append("text")
            .attr('id',function(d){
                        return (media+d.name).replace(/\s/g, '');
                    })
            .attr("x",function(d){
                return xScale(d.value);
            })
            .attr("y",function(d){
                return yScale.rangeBand()*.4;
            })
            .attr("class",media+"subtitle")
            .text(function(d){
                return d.name+' '+d.size

            })
            .on("mouseover",pointer)


    };

    function addCircles(parent){
        console.log(parent)
        parent.selectAll('circles')
        .data(function(d) {
                // console.log("d.values",d.values)
                let filtered=d.values.filter(function(d){
                    return d.highlight=="yes"
                })
                console.log("filtered",filtered)
                return filtered
            })
        .enter()
        .append('circle')
        .attr("class",function(d,i){
            if(d.highlight=="yes"){
                return media+"highlight"
            }
            else {return media+"fill"}
        })
        .attr("id",function(d){
            console.log(d.name);
            return d.name +" "+d.value+ " "+d.size})
        .attr("cx",function(d){return xScale(d.value)})
        .attr("cy",yScale.rangeBand()*.4)
        .attr("r", function(d) {
            if (size) {return d.size*(yScale.rangeBand()*.003   )}
            else {return yOffset/2}
        })
        .attr("transform", function (d) {return "translate("+(margin.left)+","+(0)+")"})
        .style("fill",colours[0])
        .on("mouseover",pointer)
    }

    //Add labels so that the preflight script in illustrator will work
    d3.selectAll(".printxAxis text")
    .attr("id","xAxisLabel")
    d3.selectAll(".printyAxis text")
    .attr("id","yAxisLabel")
    d3.selectAll(".printyAxis line")
    .attr("id","yAxisTick")
    d3.selectAll(".printxAxis line")
    .attr("id","xAxisTick")
    d3.selectAll(".printminorAxis line")
    .attr("id","minorTick")

    d3.selectAll(".domain").remove()

    d3.selection.prototype.moveToFront = function() { 
                return this.each(function() { 
                this.parentNode.appendChild(this); 
                }); 
    };


    function pointer() {
        this.style.cursor='pointer'
    }







}