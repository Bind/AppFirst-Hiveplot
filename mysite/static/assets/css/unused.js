


function searchBar_Processes(){

var search = [$('.search_bar').val()];
d3.selectAll('.data-row')
	.transition()
	.style('background-color',
		function(){if ($(this).get(0)
			.text.indexOf(search) !== -1){return 'black';}
			return 'white';
})


}




function DrawDrillDownMenu(temp){
console.log('drill down menu');

d3.select('.main_content')
	.append('div')
	.attr('class','process_menu')
	.attr('data-serverid',temp.nickname);
	
d3.select('.process_menu')
	.append('div')
	.on('click',searchBar_Processes)
	.attr('class', "process_menu_title")
	.text(temp.nickname);
d3.select('.process_menu').append('div').attr('class','process_menu_data_header')
d3.select('.process_menu_data_header').append('div').attr('class', 'column_1').text('Processes')
d3.select('.process_menu_data_header').append('div').attr('class', 'column_2').text('PID')
d3.select('.process_menu_data_header').append('div').attr('class', 'column_3').text('Target Server')
d3.select('.process_menu_data_header').append('div').attr('class', 'column_4').text('Target Socket')
d3.select('.process_menu_data_header').append('div').attr('class', 'column_5').text('Data In')
d3.select('.process_menu_data_header').append('div').attr('class', 'column_6').text('Data Out')
	
d3.select('.process_menu')
	.append('div')
	.attr('class','process_menu_delete')
	.on('click',function(){
		 
		d3.select('.process_menu').remove();})
	.text("X");
d3.select('.process_menu')
	.append('div')
	.attr('class',"process_menu_data_wrapper")


}



function appendDataToDrillDownMenu(){	  

d3.select('.process_menu_data_wrapper').selectAll('.process_data')
		.data(HiveplotVars.serverproc)
		.enter()
		.append('div')
		.attr('class','process_data')
	           .attr('font-size', '15px')
		   .attr('fill', 'black')
		   .attr('data-process', function(d){return d.pid})
		   .attr('data-start', function(d){return d.start})
		   .on('click',function(){  
		var dict = [];
		console.log(d3.select('.process_menu').attr('data-serverid'))
		console.log(d3.select(this).attr('data-process'))		
		console.log(d3.select(this).attr('data-start'))

		dict.push(d3.select('.process_menu').attr('data-serverid'));
		dict.push(d3.select(this).attr('data-process'));
		dict.push(d3.select(this).attr('data-start'));
		getServerIdprocessDetail(dict);
		
		
})
		 
		.text(function(d){return d.name});

}

