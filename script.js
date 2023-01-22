let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
let req = new XMLHttpRequest();

let width = 1300;
let height = 600;
let padding = 50;

let values = []
let baseTemp
let xScale, yScale

let minYear, maxYear
let numberOfYears = maxYear - minYear



let svg = d3.select('svg');
let tooltip = d3.select('#tooltip');

let drawCanvas = () => {
    svg.attr('width', width)
    svg.attr('height', height)
}

let generateScales = () => {

    minYear = d3.min(values, (item) => {
        return item['year']
    })

    maxYear = d3.max(values, (item) => {
        return item['year']
    })
    
   xScale = d3.scaleLinear()
            .range([padding, width-padding])
            .domain([minYear, maxYear + 1])
            

   yScale = d3.scaleTime()
            .range([padding, height-padding]) 
            .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
                      
}

let generateAxis = () => {
    let xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'))  // Sets comma year to decimal/integer year
                svg.append('g')
                    .call(xAxis)
                    .attr('id', 'x-axis')
                    .attr('transform', 'translate(0, ' + (height - padding) + ')')

    let yAxis = d3.axisLeft(yScale)      
                .tickFormat(d3.timeFormat('%B'))             
                svg.append('g')
                    .call(yAxis)
                    .attr('id', 'y-axis')
                    .attr('transform', 'translate(' + padding + ', 0)')
                    
}

let drawCells = () => {
        svg.selectAll('rect')
            .data(values)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('fill', (item) => {
                variance = item['variance']
                if (variance  <= -1){
                    return 'SteelBlue'
                } else if (variance <= 0) {
                    return 'LightSteelBlue'
                } else if (variance < 1){
                    return 'Orange'
                } else {
                    return 'Crimson'
                }
            })
            .attr('data-year', (item) => {
                return item['year']
            })
            .attr('data-month', (item) => {
                return item['month']-1
            })
            .attr('data-temp', (item) => {
                return baseTemp + item['variance']
            })
            .attr('height', (height - (2*padding)) / 12)
            .attr('y', (item) => {
                return yScale(new Date(0, item['month']-1, 0, 0, 0, 0, 0))
            })
            .attr('width', (item) => {
                let numberOfYears = maxYear - minYear
                return (width - (2*padding)) / numberOfYears
            })
            .attr('x', (item) => {
                return xScale(item['year'])
            })
            .on('mouseover', (item) => {
                tooltip.transition()
                       .style('visibility', 'visible')
                
                let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                    'August', 'September', 'October', 'November', 'December']

                    tooltip.text(item['year'] + ' - ' +  monthNames[item['month'] -1] 
                        + ' - ' + (baseTemp + item['variance']) +  ' - ' + '(' + item['variance'] + ')')
                    tooltip.attr('data-year', item['year'])
            })
            .on('mouseout', (item) => {
                tooltip.transition()
                       .style('visibility', 'hidden')
            })
}


req.open('GET', url, true)
req.onload = () => {
    let object = JSON.parse(req.responseText)
    console.log(object);
    drawCanvas();

    baseTemp = object['baseTemperature']
    values = object['monthlyVariance']
    console.log(baseTemp)
    console.log(values)
    
    generateScales();
    drawCells();
    generateAxis();
}

req.send();

