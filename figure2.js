async function figure2() {
  d3.select("svg").remove(); 

  const data1 = await d3.csv("https://raw.githubusercontent.com/ryang21/NarrativeViz/main/COVID-19_cases_by_age_group.csv", function(d) {
          // transform data
          d['Age_group'] = d['Age_group'];
          d['Count'] = +d['Count'];
          d['Death'] = +d['Death'];
          d['Death_rate'] = +d['Death_rate'];
      return d;});

  //get two pair of data
  const data_confirmed = {} ;
  const data_death = {};
  for (const key of data1) {
    data_confirmed[key['Age_group']] = key['Count'];
    data_death[key['Age_group']] = key['Death'];
  }

  // set the color scale
  const color = d3.scaleOrdinal()
  //.domain(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"])
  .domain(["20-39", "40-59",  "60-79", "80+","19 or Under"])
  .range(d3.schemeSet3);

  //set up svg
  var margin = {top: 30, right: 20, bottom: 30, left: 50},
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;
  radius = 150;
  var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform","translate("+400+","+350+")")


  // The arc generator
  const arc = d3.arc()
    .innerRadius(radius * 0.5)         // This is the size of the donut hole
    .outerRadius(radius * 0.8)

  // Another arc that won't be drawn. Just for labels positioning
  const outerArc = d3.arc()
    .innerRadius(radius * 1.4)
    .outerRadius(radius * 0.9)

  update(data_confirmed)
  //change based on value
  d3.selectAll("input").on("change", change);
  function change() {
    var value = this.value;
    data = value == "Death" ? data_death:data_confirmed;
    update(data);
    
  }
 
  //update value
  function update(data) {
    
    // Compute the position of each group on the pie:
    const pie = d3.pie()
      .value(function(d) {return d[1]; })
      .sort(function(a, b) { return d3.ascending(a.key, b.key);} ) // This make sure that group order remains the same in the pie chart
    const data_ready = pie(Object.entries(data))

    // map to data
    const u1 = svg.selectAll("path")
      .data(data_ready)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    u1
      .join('path')
      .transition()
      .duration(2000)
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
      )
      .attr('fill', function(d){ return(color(d.data[0])) })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 1)

  
    // Add the polylines between chart and labels:
    const u2 = svg.selectAll("polyline")
      .data(data_ready)

    u2
      .join('polyline')
      .transition()
      .duration(2000)
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', function(d) {
        const posA = arc.centroid(d) // line insertion in the slice
        const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        const posC = outerArc.centroid(d); // Label position = almost the same as posB
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        //posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC]
      })

    // Add  labels:
    const u3 = svg.selectAll("text")
      .data(data_ready)

    u3
    .join('text')
    .transition()
    .duration(1000)
    .text(function(d) {
      return "Age "+ d.data[0] + " (" + d.data[1] + ", " + ((d.endAngle - d.startAngle)/(2*Math.PI)*100).toFixed(1) +"%)";
    })
    .style("font-size", "11px")
    .attr('transform', function(d) {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        //pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
    })
    .style('text-anchor', function(d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 
        return (midangle < Math.PI ? 'start' : 'end')
    })
    const annotations = [
      {
        note: {
          label: "Age 80+ takes a small percentage in the total confirmed cases, but takes almost half of the total death cases",
          title: "Age 80+",
          wrap: 120
        },
        type: d3.annotationLabel,
        color: ["#f9b2b2"],
        x: -250,
        y: -60,
        dy: -40,
        dx: -70
      },
      {
        note: {
          label: "Age 39 and Under takes a large percentage in the total confirmed cases, but only takes around 2% of the total death cases",
          title: "Age 39 and Under",
          wrap: 320
        },
        type: d3.annotationLabel,
        color: ["#f9b2b2"],
        x: 0,
        y: -180,
        dy: -20,
        dx: 0
      }
  
    ]
  
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
      .annotations(annotations)
  
    svg.append("g")
      .call(makeAnnotations)
  }

}



