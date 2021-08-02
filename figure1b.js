async function figure1b() {
    d3.select("svg").remove(); 
    const data = await d3.csv("https://raw.githubusercontent.com/ryang21/NarrativeViz/main/covid_death_and_cases_by_date_2021.csv", function(d) {
            // transform data
            d['Date'] = d3.timeParse("%m/%d/%Y")(d['Date']);
            //d['Cumulative_Death'] = +d['Cumulative_Death'].replace(',', '');
            d['New_Death'] = +d['New_Death'].replace(',', '');
        return d;});


    var margin = {top: 40, right: 20, bottom: 20, left: 80},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    

    // get the minimum and maximum of dates
    var time_extent = d3.extent(data, function(d) {
        return d['Date'];
    });
    console.log(time_extent)
    // get the minimum and maximum of all new cases
    var count_extent = d3.extent(data, function(d) {
        return d['New_Death'];
    })
    console.log(count_extent)
    // create a time scale for x-axis 
    var x = d3.scaleTime().domain(time_extent).range([0, width]);

    // create a scale for the y axis
    var y = d3.scaleLinear().domain([0,count_extent[1]]).range([height, 0]);

    // define the 1st line
    var valueline = d3.line()
    .x(function(d) { return x(d['Date']); })
    .y(function(d) { return y(d[['New_Death']]); })
    


    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const annotations = [
        {
            note: {
            label: "The daily death cases starts to slow down from late Feb 2021",
            title: "March 2021",
            wrap: 230
            },
            type: d3.annotationCalloutCircle,
            subject: {
            radius: 50,         // circle radius
            radiusPadding: 3   // white space around circle befor connector
            },
            color: ["#f9b2b2"],
            x: 180,
            y: 370,
            dy: -70,
            dx: 70
        }
        ]
    
        // Add annotation to the chart
        const makeAnnotations = d3.annotation()
        .annotations(annotations)
    
        svg.append("g")
        .call(makeAnnotations)
    // Add the valueline path.
    svg.append("path")
    .data([data])
    .transition()
    .attr("class", "line")
    .style("stroke","DimGray")
    .attr("d", valueline);

    // Add the valueline2 path.
    //svg.append("path")
    //.data([data])
    //.attr("class", "line")
    //.style("stroke","FireBrick")
    // .attr("d", valueline2);

    // Add the X Axis
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeMonth)
    .tickFormat(d3.timeFormat("%B/%Y")));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
    
        // create a tooltip
    var Tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0)
    .style("width", 250);

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        Tooltip
            .style("opacity", 1)
            
        d3.select(this)
            .style("r", 6) 
            .style("fill", "#f67f7f")
    }
    var mousemove = function(event, d) {
        Tooltip
            .html("Date: " + d3.timeFormat("%m/%d/%Y")(d['Date'])  + "<br/>New_Death: " + d['New_Death'])
            .style("top", (parseInt(d3.select(this).attr("cy")) + 150 ) +"px")
            .style("left", (parseInt(d3.select(this).attr("cx")) + 100) + "px")
    }
    var mouseleave = function(d) {
        Tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("r", 3)
            .style("fill", "#a8a8a8")
    }

    svg.append("g")
    //.attr("transform", "translate("+margin.left+","+margin.top+")")
    .selectAll().data(data).enter().append("circle")
    .attr("cx", function(d){return x(d['Date']);} )
    .attr("cy", function(d){return y(d['New_Death']);})
    .attr("r", 3)
    .attr("fill", "#a8a8a8")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)  



}
