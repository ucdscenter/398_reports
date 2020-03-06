'use strict'


async function handleData(){
	let baseloc = '398_REPORT_ALL%20CITIES/'

	let fnames = await d3.csv("file_strings.csv")
	fnames.forEach(function(d){
		d.name = d.name.replace(/ /g, '%20');
	})
	console.log(fnames)

	var allData = []

	for(var i = 0; i < fnames.length; i++){
		let cityname = fnames[i].name.split('%20')[0]
		let oneData = await d3.csv(baseloc + fnames[i].name)
		oneData.forEach(function(d){
			d.city = cityname;
		})
		allData = allData.concat(oneData)
	}
	return allData
}//handleData


const cityChart = new dc.BarChart('#cities-graph')
const yearChart = new dc.BarChart('#years-graph')
const fromAgeChart = new dc.BarChart('#fromage-graph')
const toAgeChart = new dc.BarChart('#toage-graph')
const preemptionsChart = new dc.BarChart('#preemptions-graph')
const programTitleChart = new dc.RowChart('#programtitle-graph')
const networkChart = new dc.BarChart('#network-graph')
const docCount = new dc.DataCount('.dc-data-count');

async function wrapper(){

	let width = window.innerWidth;
	
	let data = await handleData()
	console.log(data)
	let cf = crossfilter(data);

	let cityDimension = cf.dimension(function(d){
		return d.city
	})
	let yearDimension = cf.dimension(function(d){
		return d.Year.trim().split(" ")[0]
	})
	let fromAgeDimension = cf.dimension(function(d){
		return d["Age of Target Audience From"].trim().split(" ")[0]
	})
	let toAgeDimension = cf.dimension(function(d){
		return d["Age of Target Audience To"].trim().split(" ")[0]
	})
	let preemptionsDimension = cf.dimension(function(d){
		return d["Number of pre-emptions rescheduled"]
	})
	let programTitleDimension = cf.dimension(function(d){
		
		if (d["Title of Program"] != undefined){
			return d["Title of Program"].trim().toLowerCase()
		}
		if(d["Title of EI programs"] != undefined){
			return d["Title of EI programs"].trim().toLowerCase()
		}
		return "undefined"
	})

	let networkDimension = cf.dimension(function(d){
		return d["Network Affiliation"].trim().toLowerCase().replace("*", "");
	})

	let leftwidth = (width * .25) - 50 ;
	let rightwidth = (width * .75) - 50;

	let cityGroup = cityDimension.group()
	let yearGroup = yearDimension.group()
	let fromAgeGroup = fromAgeDimension.group()
	let toAgeGroup = toAgeDimension.group()
	let preemptionsGroup = preemptionsDimension.group()
	let programTitleGroup = programTitleDimension.group()
	let networkGroup = networkDimension.group()
	let allGroup = cf.groupAll()

	cityChart
    .width(rightwidth)
    .height(200)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .brushOn(false)
    .dimension(cityDimension)
    .group(cityGroup)
    .centerBar(false)
    .barPadding(.2)
    .margins({top: 10, right: 10, bottom: 18, left: 60})
    //.controlsUseVisibility(true)

    yearChart
    .width(rightwidth)
    .height(200)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .brushOn(false)
    .dimension(yearDimension)
    .group(yearGroup)
    .centerBar(false)
    .barPadding(.2)
    .margins({top: 10, right: 10, bottom: 18, left: 60})
   // .controlsUseVisibility(true)

    fromAgeChart
    .width(rightwidth / 2)
    .height(200)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .brushOn(false)
    .dimension(fromAgeDimension)
    .group(fromAgeGroup)
    .centerBar(false)
    .barPadding(.2)
    .margins({top: 10, right: 10, bottom: 18, left: 60})
    //.controlsUseVisibility(true)


	toAgeChart
    .width(rightwidth / 2)
    .height(200)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .brushOn(false)
    .dimension(toAgeDimension)
    .group(toAgeGroup)
    .centerBar(false)
    .barPadding(.2)
    .margins({top: 10, right: 10, bottom: 18, left: 60})
    //.controlsUseVisibility(true)

    preemptionsChart
    .width(rightwidth)
    .height(200)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .elasticY(true)
    .dimension(preemptionsDimension)
    .group(preemptionsGroup)
    .centerBar(false)
    .barPadding(.2)
    .margins({top: 10, right: 10, bottom: 18, left: 60})
    .controlsUseVisibility(true)


    networkChart
    .width(rightwidth)
    .height(300)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .elasticY(true)
    .dimension(networkDimension)
    .group(networkGroup)
    .centerBar(false)
    .barPadding(.2)
    .margins({top: 10, right: 10, bottom: 150, left: 60})
    .controlsUseVisibility(true)


    docCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
        .crossfilter(cf)
        .groupAll(allGroup)
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        }).on("renderlet", function(d){
        	console.log("rendered")
        });






function remove_bins(source_group) { // (source_group, bins...}
    var bins = Array.prototype.slice.call(arguments, 1);
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return bins.indexOf(d.key) === -1;
            });
        }
    };
}

let removedGroup = remove_bins(programTitleGroup, "undefined");

programTitleChart
 			.width(leftwidth)
		    .height(15000)
		    .dimension(programTitleDimension)
		    .group(programTitleGroup)
		    //.cap(10)
		    //.x(d3.scaleLinear().domain([0, 6000]).range([10, 300]))
		    .controlsUseVisibility(true)
		    //.colors(color)
		    //.transitionDuration(0)
		    .elasticX(true)
		    .margins({top: 20, right : 10, bottom: 30, left: 20})


		    programTitleChart.xAxis(d3.axisTop()).on("renderlet", function(d){
		    	d3.select("#programtitle-graph").select(".axis").attr("transform", "translate(0, 0)")
		    	d3.select("#network-graph").select(".axis.x").selectAll(".tick").selectAll("text").style("text-anchor", "start").attr("transform", "rotate(75), translate(8, -10)")
		    })//.ticks(4)


    dc.renderAll()

d3.select("#programtitle-graph").select(".axis").selectAll(".tick").select('.grid-line').attr("y2", 14950)

d3.selectAll("hr").style("margin-top", 0).style("margin-top", 15)


$( window ).resize(function() { 
	console.log("resized")
		//screenHeight = window.innerHeight;
	})
	$(window).resize()



}

wrapper()