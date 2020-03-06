'use strict'




const docChart = new dc.LineChart('#monthly-doc-chart')
const totalDocChart = new dc.BarChart('#total-doc-chart');


const docCount = new dc.DataCount('.dc-data-count');
const docTable = new dc.DataTable('.dc-data-table');

const affCount = new dc.RowChart('#affiliation-row-chart')
const pubCount = new dc.RowChart('#journal-row-chart')
const fundCount = new dc.RowChart('#fund-row-chart')
const citeBar = new dc.BarChart('#cite-row-chart')

async function wrapper(){
		var parseTime = d3.timeParse("%Y-%m-%d");
		var data = await d3.csv('AuthorDocuments.csv')
		$('#loading-div').addClass("hidden")
		$('#dashboard-div').removeClass("hidden")
		
		let primaryAffs = {}
let cmax = 0
		data.forEach(function(d){
			d.CoverDate = parseTime(d.CoverDate.split(" ")[0])
			console.log()
			var cn = parseInt(d.CitedByCount)
			if (isNaN(cn)){
				d.CitedByCount = 'Nan'
			}
			else{
				d.CitedByCount = parseInt(d.CitedByCount)
				if(d.CitedByCount > cmax){
					cmax = d.CitedByCount
				}
			}
			
			primaryAffs[d.ScopusAffiliationID] = d.AffiliationName	
		})
		let affIdList = Object.keys(primaryAffs)

		console.log(cmax)
		console.log(data)
		console.log(primaryAffs)
		const color = d3.schemeTableau10
		const authcf = crossfilter(data);
    	const all = authcf.groupAll();
    	const timeExtent = d3.extent(data, function(d){
    		return d.CoverDate;
    	})
    	const monthDimension = authcf.dimension(function(d) {
    		//console.log(d3.timeMonth(d.CoverDate))
    		return d3.timeMonth(d.CoverDate)
    	})

    	const citedDimension = authcf.dimension(function(d){
    		if (isNaN(d.CitedByCount)){
    			return 0
    		}
    		return +d.CitedByCount 

    		//return d.CitedByCount.toString()
    	})

    	const affDimension = authcf.dimension(function(d){
    		return d.AffiliationName;
    	})

    	const pubDimension = authcf.dimension(function(d){
    		return d.PublicationName;
    	})
    	const fundDimension = authcf.dimension(function(d){
    		return d.FundSponsor;
    	})

    	const affGroup = affDimension.group()

    	const monthlyDocGroup = monthDimension.group()

    	const pubGroup = pubDimension.group()

    	const fundGroup = fundDimension.group()

    	const citedGroup = citedDimension.group()
		
	    let primaryAffsGroups = []
	    affIdList.forEach(function(d){
	    	let tempGroup = monthDimension.group().reduce(
	    		function(p, v) {
	    			if(v.ScopusAffiliationID == d){
	    				p++
	    			}
	    			return p
	    		},
	    		function(p,v) {
	    			if(v.ScopusAffiliationID == d){
	    				p--
	    			}
	    			return p

	    		},
	    		function(){
	    			return 0
	    		})
	    	primaryAffsGroups.push(tempGroup)
	    })
	    
	    console.log(affIdList)
	    //console.log(affiliationGroup)

		var colorlist = ["#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1"]

	    affCount
		    .width(300)
		    .height(200)
		    .dimension(affDimension)
		    .group(affGroup)
		    //.x(d3.scaleLinear().domain([0, 6000]).range([10, 300]))
		    .controlsUseVisibility(true)
		    .colors(colorlist)
	        .colorAccessor(function(d,i){
	        	return i % 6
	        })
		    .transitionDuration(0)
		    .elasticX(true)
		    .xAxis().ticks(4)

		pubCount
		    .width(300)
		    .height(200)
		    .dimension(pubDimension)
		    .group(pubGroup)
		    .cap(10)
		    //.x(d3.scaleLinear().domain([0, 6000]).range([10, 300]))
		    .controlsUseVisibility(true)
		    .colors(color)
		    .transitionDuration(0)
		    .elasticX(true)
		    .xAxis().ticks(4)

		fundCount
		    .width(300)
		    .height(200)
		    .dimension(fundDimension)
		    .group(fundGroup)
		    .cap(10)
		    //.x(d3.scaleLinear().domain([0, 6000]).range([10, 300]))
		    .controlsUseVisibility(true)
		    		    .colors(color)
		    .transitionDuration(0)
		    .elasticX(true)
		    .xAxis().ticks(4)

		    
		citeBar
			.margins({top: 10, right: 10, bottom: 30, left: 60})
			.width(300)
			.height(200)
			.dimension(citedDimension)
			.group(citedGroup)
			.x(d3.scaleLinear().domain([0, 2794]))
    		.elasticY(true)
    		//.elasticX(true)
    		.controlsUseVisibility(true)
    		.transitionDuration(0)
    		.yAxis().ticks(5)
    		
    	citeBar.xAxis().ticks(4);
    	citeBar.on('preRender', function(e){
    		$('#loading-div').removeClass("hidden")
    	})
    	citeBar.on('postRender', function(e){
    		$('#loading-div').addClass("hidden")
    		d3.select('#affiliation-row-chart').selectAll('text').style('font-size', '8px')
        d3.select('#journal-row-chart').selectAll('text').style('font-size', '8px')
        d3.select('#fund-row-chart').selectAll('text').style('font-size', '8px')
    	})
    	//2794
    	//3393

		let colorfunc = function(d){
			return color[d]
		}

		/*function sel_stack(i) {
              return function(d) {
                  return d.value[i];
              };
          }*/


		docChart
        .renderArea(true)
        .width(990)
        .height(200)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(monthDimension)
        .mouseZoomable(true)
        .rangeChart(totalDocChart)
        .x(d3.scaleTime().domain(timeExtent))
        .round(d3.timeMonth.round)
        .xUnits(d3.timeMonths)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .brushOn(false)
        .transitionDuration(0)
        .group(primaryAffsGroups[0], affIdList[0])
        .valueAccessor(function(d){
        	return d.value
        })
        .colors(colorlist)
        .colorAccessor(function(d,i){
        	return i  % 6
        })
        primaryAffsGroups.shift()
        affIdList.shift()
        primaryAffsGroups.forEach(function(d,i){
        	docChart.stack(d, affIdList[i], function(d){return d.value});
        })

      	totalDocChart.width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
        .height(60)
        .margins({top: 10, right: 50, bottom: 20, left: 40})
        .dimension(monthDimension)
        .group(monthlyDocGroup)
        .centerBar(true)
        .gap(1)
        .x(d3.scaleTime().domain(timeExtent))
        .round(d3.timeMonth.round)
        .alwaysUseRounding(true)
        .xUnits(d3.timeMonths)
        .transitionDuration(0)
        .yAxis().ticks(2);


        docCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
        .crossfilter(authcf)
        .groupAll(all)
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        }).on("renderlet", function(d){
         d3.select('#monthly-doc-chart').selectAll('.line').style("fill", "none").style("stroke", 'black').style('stroke-width', '.5px')
          	d3.select('#affiliation-row-chart').selectAll('text').style('font-size', '8px');
        	d3.select('#journal-row-chart').selectAll('text').style('font-size', '8px');
        	d3.select('#fund-row-chart').selectAll('text').style('font-size', '8px');
        });;

        docTable /* dc.dataTable('.dc-data-table', 'chartGroup') */
        .dimension(citedDimension)
        .size(25)
        .columns([
            'CoverDisplayDate',
            'GivenName',
            'Surname',
            'Title',
            'AffiliationName',
            'PublicationName',
            'CitedByCount'
        ])
        .sortBy(d => d.CitedByCount)
        .order(d3.descending)
        .on('renderlet', table => {
            table.selectAll('.dc-table-group').classed('info', true);
        });



        dc.renderAll()


        d3.select('#affiliation-row-chart').selectAll('text').style('font-size', '8px')
        d3.select('#journal-row-chart').selectAll('text').style('font-size', '8px')
        d3.select('#fund-row-chart').selectAll('text').style('font-size', '8px')

        
	}
	wrapper()
