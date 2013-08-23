var HiveplotVars = {};
var MousePos = {};


/*big and messy global variables, 
It gets particularly bad during the drawing of process topology.

topology directly stores data from topolgy api call

nodes contains a list of nodes, that are tied to data inside topology. nodes[0].uid equals the position in the list of topology.Node of its data

links corresponds to topology.Edge - links[0].uid

serverproc will store the data of a process list api call for a single server, currently the list will be another array inside of serverproc.
but it will be over written with each call to draw process topology

ajaxcounter is used to check if all process/detail ajax calls have returned before plottig, just a global counter

processnodes is similar to nodes, uid is equal to serverproc[0]position
*/
function initializeHiveplotVars() {
     console.log("vars Initializing");    
     HiveplotVars = {
	topology:[],
	nodes:[],
	links:[],
	serverproc:[],
	ajaxcounter:0,
	serverID:0,
	processes:[],
	processnodes:[],
	servertags:[],
	AxesFunctions:[],
	FunctionPointer: 0,
	RespAvgThreshold:100000,
	Radius:5,
	innerRadius:40,
   	outerRadius:290,
    }
    
    getHiveplotTopology();
    
    
}

//used for updating data instead of the intial setup
function ReinitializeHiveplotVars(){
	console.log('HiveplotVars cleared');
	HiveplotVars.topology=[];
	HiveplotVars.nodes =[];
	HiveplotVars.links=[];
	HiveplotVars.serverproc=[];
	HiveplotVars.serverID=0;
	HiveplotVars.processes=[];
	HiveplotVars.processnodes=[];
	HiveplotVars.servertags=[];
	
	ajaxTopology();

}


function getHiveplotServers(){
    $.ajax({
	type: "GET",
	url: "/hiveplot/api/server/data",
	data: {},
	dataType: "json",
	success: function(data)  {
	    var json_data = eval(data);
	    HiveplotVars.servers = json_data;
	    getHiveplotServerTags();
	    console.log("server success");

	},
	error:function(jqXHR, textStatus, errorThrown){
	    getHiveplotServerTags();
	}
    });
}





function getHiveplotTopology(){
    $.ajax({
	type: "GET",
	url: "/hiveplot/api/server/topology/data",
	data: {},
	dataType: "json",
	success: function(data) {
	    var json_data = eval(data);    
	    getHiveplotServers();
	    HiveplotVars.topology = json_data;
	    console.log("topology success")
            CreateNodesList();
	    CreateLinkList();
	    SetLinks();
	    AppendCoordinatesToNodes();
	    Main();
		
	    
	
	},
	error:function(jqXHR, textStatus, errorThrown){
	    getHiveplotServers();
	}
    });
}

//used for updating data, getHiveplotTopology does some housekeeping that that does not need to be redone
function ajaxTopology(){
console.log('reintializing topology');
 $.ajax({
	type: "GET",
	url: "/hiveplot/api/server/topology/data",
	data: {},
	dataType: "json",
	success: function(data) {
	    var json_data = eval(data);
	 	ajaxServers();
		 CreateNodesList();
	    	 CreateLinkList();
	   	 SetLinks();
	   	 AppendCoordinatesToNodes();
	
},
	error:function(jqXHR, textStatus, errorThrown){
	    ajaxServers();
	}
    });
}
//getHiveplotservers is used for updating instead of intializing 
function ajaxServers(){
console.log('reintializing servers');
 $.ajax({
	type: "GET",
	url: "/hiveplot/api/server/data",
	data: {},
	dataType: "json",
	success: function(data)  {
	    var json_data = eval(data);
	    HiveplotVars.servers = json_data;
},
	error:function(jqXHR, textStatus, errorThrown){
	  
	}
    });
}






function getHiveplotServerTags(){
    $.ajax({
	type: "GET",
	url: "/hiveplot/api/server/tags/data",
	data: {},
	dataType: "json",
	success: function(data){
	    var json_data = eval(data);
	    HiveplotVars.servertags = json_data;
		console.log("server tags success")
	 
	}
    });
}

function getServerIdprocess(server){
d3.select('.xTitle').transition().delay(500).duration(1000).text(server.nickname);
d3.select('.yTitle').transition().delay(500).duration(1000).text('Servers');
d3.select('.zTitle').transition().delay(500).duration(1000).text('');

 $.ajax({
	type: "GET",
	url: "/hiveplot/api/server/process/data",
	data: {'id': server.id},
	dataType: "json",
	success: function(data)  {
	    var json_data = eval(data);
HiveplotVars.ajaxcounter = 0;
	    HiveplotVars.serverproc[0] = (json_data);
	    console.log("server process Data success");
	   // appendDataToDrillDownMenu();
	    getProcessDetail();
		
	},
	error:function(jqXHR, textStatus, errorThrown){
	    
	}
    });
}



function getServerIdprocessDetail(dict){
	$('.Process_popup').fadeIn();
	groundsKeepProcess();
	
    $.ajax({
	type: "GET",
	url: "/hiveplot/api/server/process/data/detail",
	data: {'uid': dict[0],	
},
	dataType: "json",
	success: function(data)  {
	    var json_data = eval(data);
	    HiveplotVars.processes.push(json_data);
	    HiveplotVars.processes[HiveplotVars.processes.length - 1].uid = dict[0];
	  //  console.log("server process " + dict[1] +" success");
	    checkProcessMap(HiveplotVars.processes.length - 1);

		console.log("SERVER ID PROCESS DETAIL");
		console.log(json_data);
		console.log( HiveplotVars.serverproc[0][dict[1]]);
	 	
	    HiveplotVars.serverproc[0][dict[1]]['detail']=[];
	    HiveplotVars.serverproc[0][dict[1]]['detail'].push(json_data);
	    HandleAjaxProcessCalls(dict[1]);		
	},
	error:function(jqXHR, textStatus, errorThrown){
	    
	}
    });
}



//_______________________________________HELPER FUNCS





function DocReady(){

 initializeAxesFunctions();

MousePos = {X:0,Y:0}


    $(document).mousemove(function(event) {
        MousePos.X = event.pageX;
        MousePos.Y = event.pageY;
    })

d3.selectAll('.checkBox').on('click',function(){
     if($(this).val() == 'true'){
          $(this).val('false');
     }else{
          $(this).val('true');
     }
});


				

$('.Add_button').on('click', function(){
AxisFunctionPusher();})

    $("#slider").slider({
	min:0,
	max:100000,
	value:100000,
	slide: function(event, ui){
		$('#SliderValue').text(ui.value);

HiveplotVars.RespAvgThreshold = ui.value;

	d3.selectAll('.link')
		.transition()
		.duration(500)
		.style('stroke',
		function(){return ColorLink(d3.select(this).attr('data-from'))})
			},
	
});

/*
d3.select('.main_content').append('div').attr('class','Ajax_Call_Button').text('get data').on('click',function(){
UpdateDataAjax();
});
*/

d3.select('.Menu_button').on('click',function(){Draw_config_menu()});
$('.New_Config_Menu');


$('#config-button-y').on('click',function(){

$('.X_Axis_config').slideUp();
$('.Z_Axis_config').slideUp();
$('.Y_Axis_config').slideDown();


})

$('#config-button-x').on('click',function(){

$('.Z_Axis_config').slideUp();
$('.Y_Axis_config').slideUp()
$('.X_Axis_config').slideDown();


})


$('#config-button-z').on('click',function(){


$('.X_Axis_config').slideUp();
$('.Y_Axis_config').slideUp()
$('.Z_Axis_config').slideDown();

})

$('.New_Config_Menu').draggable();
$('.delete_button').on('click',function(){

$('.X_Axis_config').slideUp();
$('.Y_Axis_config').slideUp();
$('.Z_Axis_config').slideUp();
$('.New_Config_Menu').fadeOut()})

}



function printServerToSideBar(obj){
	//this function is used print a tooltip after mousing over a node.
	//this function is used in Main(), Transition(), and the split axes methods
	//and can receive both Node and cloned Node objects
	
	d3.selectAll('.process_tooltip').remove();
	var position = $(obj).offset();
	//get mouse coords 
	var coordX =  position.left + 30;
	var coordY =  position.top -100;

	console.log("DISPLAYING EVENT")
	console.log(position);


	console.log("printserver");
			

		var temp;
	
		for (server in HiveplotVars.servers){
			if (HiveplotVars.servers[server].nickname == HiveplotVars.topology.Node[$(obj).data("uid")].id){
				temp = HiveplotVars.servers[server];
			}
		}

		   
		    d3.select('.main_content')
		   .append('div')
		   .attr('class',function(){
			$(this).css('top', coordY)
			$(this).css('left',coordX)




			return 'tooltip';
			}).style('background-color',function(){

d3.select(this).append('div').text(HiveplotVars.topology.Node[$(obj).data('uid')].id);
			d3.select(this).append('div').style('margin-left','3px').text('avg_resp: '+ HiveplotVars.topology.Node[$(obj).data('uid')].resp_avg);
			d3.select(this).append('div').style('margin-left','3px').text('# of connections: ' + $('path.link[data-from="' + $(obj).data('uid') + '"]' ).length);
			d3.select(this).append('div')
						.style('background-color','teal')
						.style('height','24px')
						.style('padding-top','2px')
						.style('padding-left','65px')
						.style('border-radius','5px')
						.style('color','white')
						.text('View Processes')
						.style('margin','5px')
						.on('click', function(){
							$('.tooltip').remove();			
							getServerIdprocess(temp)
					
						});	

return 'white';
})

$('.tooltip').draggable();





	/*	 

			
			

		
*/

			
			
	

}
   

function NodesRedrawRadius(){
//this function redraws the radius of all nodes or cloned nodes based upon their html5 data element 'data-clicked'
//it all links that have a clicked node as its source

d3.selectAll('.node').transition().attr('r',function(){
var point = d3.select(this).attr('data-uid');
if (d3.select(this).attr('data-clicked') == "true"){

d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )//this selects all links that stem from this node
			.style("stroke", 'black').style('stroke-width','5px').style("stroke-opacity", 1);

return 12;}
else {

d3.selectAll('path.link[data-from="' + point + '"]' )
			.style("stroke", ColorLink(point)).style('stroke-width','1px').style("stroke-opacity", .5);



return HiveplotVars.Radius};
})

d3.selectAll('.cloned_node').transition().attr('r',function(){
	var point = d3.select(this).attr('data-uid');
if (d3.select(this).attr('data-clicked') == "true"){
d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid')+ '"]' )
			.style("stroke", 'black').style('stroke-width','5px').style("stroke-opacity", 1);


return 12;}
else if (d3.select(this).attr('data-clicked') == "false"){
d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", ColorLink(point)).style('stroke-width','1px').style("stroke-opacity", .5);
return HiveplotVars.Radius};

})







}
//quick and dirty way to reset all data-clicked attr to false, and then redraws all Nodes to proper radius by calling NodesRedrawRadius()
function SetNodesFalse(){
d3.selectAll('.node').attr('data-clicked', 'false');
d3.selectAll('.cloned_node').attr('data-clicked','false');
NodesRedrawRadius();


}

function MouseOverNode(obj){
	console.log(obj);
		if (HiveplotVars.LeftMouseClick == false) {
			d3.select(obj).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(obj).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			printServerToSideBar(obj);
};


function parseRotation(string){
// I use this function to determine the degree a svg element is rotated, it accepts a transformation and returns what is inside the ()
var start = string.indexOf('(') + 1;
var end = string.indexOf(')');
var ret = string.slice(start, end);
return ret;
}


function degrees(radians) {
//this function is declared in multiple places, used to convert 
  return radians / Math.PI * 180 - 90;
}

function Radius(){
//unfinished function to dynamically size a node depending on how many other nodes are displayed
console.log("radius")
var temp = 0;
for (Node in HiveplotVars.nodes)
{if (HiveplotVars.nodes[Node].displayed==true){temp++;}}
if (temp > 50){return 2;}
else if(temp>40){return 3;}
else if(temp>30){return 4;}

}



function DeleteParent(){
$(this).closest('div').remove();


}



function Color (){ return '#00ccff'}
function ColorLink(point){ 

	console.log('COLORING LINK')
	console.log(point)
	if(typeof(HiveplotVars.topology.Node[point].resp_avg) === 'undefined'){return '#00ccff'};
	if (HiveplotVars.topology.Node[point].resp_avg < HiveplotVars.RespAvgThreshold){
		//if (d3.select('.node[data-uid="' + point + '"]').attr('data-clicked') == 'true'){return 'black'}			
												 return '#00ccff'};
	if (HiveplotVars.topology.Node[point].resp_avg > HiveplotVars.RespAvgThreshold){return 'red'}
		
}









			


//_____________________________________ INIT FUNCS
function initializeAxesFunctions(){
//load in functiones to be used to plot the first Hiveplot
//this is the data necesarry to generate another hiveplot
	HiveplotVars.AxesFunctions.push({
		Title:"By Id",//title isnt used...
		x:function(obj){return (obj.id.indexOf("hbase") !== -1);}, 
		y:function(obj){return (obj.id.indexOf("pod0") !== -1);}, 
		z:function(obj){return true;},
		yTitle:"pod0",
		xTitle:"hbase",
		zTitle:"uncategorized"})

	HiveplotVars.AxesFunctions.push({
		Title:"By FromEdge",
		x: function(obj){
		var temp = 0;
		for (edge in HiveplotVars.topology.Edge){
			if (HiveplotVars.topology.Edge[edge].fromID == obj.id){
				temp++;}}
				return (temp > 7)?true:false;
		}, 		
		y:function(obj){
			var temp = 0;
			for (edge in HiveplotVars.topology.Edge){
			
			if (HiveplotVars.topology.Edge[edge].fromID == obj.id){
				temp++;}}
				return (temp > 2)?true:false;
 		}, 		
		
		z:function(obj){return true;},
		xTitle:"From Edge > 7",
		yTitle:"From Edge > 2",
		zTitle:"From Edge < 2"})

   
}


function CreateNodesList(){
	//initialized an array of nodes for each Node in topology
	for (x in HiveplotVars.topology.Node){
		HiveplotVars.nodes.push({x: 1, y: 0, uid: 0, displayed: true, Axis: 'x'})}
}	

function CreateLinkList(){	
	for(x in HiveplotVars.topology.Edge){
		HiveplotVars.links.push({source: HiveplotVars.nodes[0], target: HiveplotVars.nodes[0], uid: 0, displayed: false})}
}			
						
function SetLinks(){
	for (x in HiveplotVars.topology.Edge){
		for (y in HiveplotVars.topology.Node){
			if (HiveplotVars.topology.Edge[x].fromID == HiveplotVars.topology.Node[y].id)
				{ HiveplotVars.links[x].source = HiveplotVars.nodes[y]}
				}
		for (z in HiveplotVars.topology.Node){
			if (HiveplotVars.topology.Edge[x].toID == HiveplotVars.topology.Node[z].id)
				{ HiveplotVars.links[x].target = HiveplotVars.nodes[z]}
				}
			HiveplotVars.links[x].uid = x;}
}


function ResetLinks(){

for (x in HiveplotVars.topology.Edge){
		for (y in HiveplotVars.topology.Node){
			if (HiveplotVars.topology.Edge[x].fromID == HiveplotVars.topology.Node[y].id)
				{HiveplotVars.links[x].source = HiveplotVars.nodes[y];
				HiveplotVars.links[x].displayed = true;}
		}
		for (z in HiveplotVars.topology.Node){
			if (HiveplotVars.topology.Edge[x].toID == HiveplotVars.topology.Node[z].id)
				{HiveplotVars.links[x].target = HiveplotVars.nodes[z];
				HiveplotVars.links[x].displayed = true;}
		}
		if (HiveplotVars.links[x].source.displayed == false){
		HiveplotVars.links[x].displayed = false;		
		HiveplotVars.links[x].target = HiveplotVars.links[x].source;
		}
		if (HiveplotVars.links[x].target.displayed == false){
		HiveplotVars.links[x].displayed = false;		
		HiveplotVars.links[x].source = HiveplotVars.links[x].target;
		}
			HiveplotVars.links[x].uid = x;}
}











function AxisFunctionX(int, obj){
temp = HiveplotVars.AxesFunctions[int].x(obj);
//int represents which function and var is the variable being checked
return temp;
}



function AxisFunctionY(int, obj){
temp = HiveplotVars.AxesFunctions[int].y(obj);
//int represents which function and var is the variable being checked
return temp;
}


function AxisFunctionZ(int, obj){
temp = HiveplotVars.AxesFunctions[int].z(obj);
//int represents which function and var is the variable being checked
return temp;
}
        

function AppendCoordinatesToNodes(){
console.log('Appending coordinates to Nodes')
var xcounter = 0, 
ycounter = 0,
zcounter = 0;

console.log(HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].x);
console.log(HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].y);
console.log(HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].z);

var x = (4*3.14/3), y = (3.14*2), z = (2 * 3.14/3) ;
	
		for (node in HiveplotVars.nodes){
			if (AxisFunctionX(HiveplotVars.FunctionPointer, HiveplotVars.topology.Node[node])){
					   HiveplotVars.nodes[node].x = x;
					   HiveplotVars.nodes[node].y = (1 - (xcounter * .03));
					   HiveplotVars.nodes[node].uid = node;
					   HiveplotVars.nodes[node].Axis = 'x';
					HiveplotVars.nodes[node].displayed = true;
					   xcounter++;
				}
			else if (AxisFunctionY(HiveplotVars.FunctionPointer, HiveplotVars.topology.Node[node])){
					   HiveplotVars.nodes[node].x = y;
					   HiveplotVars.nodes[node].y = (1 - (zcounter * .03));
					   HiveplotVars.nodes[node].uid = node;
					   HiveplotVars.nodes[node].Axis = 'y';
					   HiveplotVars.nodes[node].displayed = true;
					   zcounter++;
				}
					
			else if(AxisFunctionZ(HiveplotVars.FunctionPointer, HiveplotVars.topology.Node[node])){
					   HiveplotVars.nodes[node].x = z;
					   HiveplotVars.nodes[node].y = (1 - (ycounter * .03));
					   HiveplotVars.nodes[node].uid = node;
					   HiveplotVars.nodes[node].Axis = 'z';
					   HiveplotVars.nodes[node].displayed = true;
					   ycounter++;
				}
			else {HiveplotVars.nodes[node].x = 3;
				HiveplotVars.nodes[node].y = -.15;
					HiveplotVars.nodes[node].uid = node;
					HiveplotVars.nodes[node].displayed = false;}
		}
	console.log(xcounter)
	console.log(ycounter)
	console.log(zcounter)
}





function initThumbnails(){
$('.thumbnail_menu').empty();
var TEMP = HiveplotVars.FunctionPointer;
console.log("FUNCTIONPOINTER");
console.log(TEMP);
d3.select('.thumbnail_menu').append('div').attr('class','thumbnail_menu_label').text('Views')
for (FunctionSet in HiveplotVars.AxesFunctions){
	$('.thumbnail_menu').append("<div class='thumbnail_button' data-pointer="+ FunctionSet +"> </div>");
	var thumbnail = $('.thumbnail_button[data-pointer*='+ FunctionSet + ']');
	size = thumbnail.css('width');

	console.log('thumbnail');
	
	console.log(thumbnail);
	drawThumbnail(thumbnail);
	

}

HiveplotVars.FunctionPointer = TEMP;
AppendCoordinatesToNodes();
ResetLinks();

}






function initProcessSocketData(){

var temp = HiveplotVars.ProcessSocketData.length;




}



//__________________________________________ MAIN and Transition
			
	
function Main(){

console.log("Running Main()");
console.log(HiveplotVars.FunctionPointer);

var innerRadius = 40,
    outerRadius = 310;

var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));

svg = d3.select(".hiveplot").select("g")

svg.selectAll(".axis")
   	.data(d3.range(3))
  	.enter()
	.append("line")
   	.attr("transform", function(d) { return "rotate(" + degrees(angle(d-1)) + ")"; })
	
	.transition()
	.duration(1500)
    	.attr("class", "axis")
	.attr('id',function(d,i){ return "Axis_" + i;})
   	.attr("transform", function(d) { return "rotate(" + degrees(angle(d)) + ")"; })
    	.attr("x1", radius.range()[0])
    	.attr("x2", radius.range()[1])
	.style('stroke', 'black');

svg.selectAll(".link")
   	.data(HiveplotVars.links)
  	.enter()
	.append("path")
	.style('stroke', 'white')
	
	.transition()
	.delay(800)
	.duration(1500)
   	.attr("class", "link")
	
    	.attr('data-from', function(d){return d.source.uid})
    	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; })	
   	.radius(function(d) { return radius(d.y); }))
	.style("stroke", function(d){ return ColorLink(d.source.uid)})
	.style("stroke-opacity", .5);

svg.selectAll(".node")
    	.data(HiveplotVars.nodes)
  	.enter()
	.append("circle")
		.attr("transform", function(d) { return "rotate(" + degrees(d.x-1) + ")"; })
    	.attr("cx", function(d) { return 0; })
	.style('fill', 'white')
	.attr("data-uid",function(d){return d.uid ;})
	.attr("data-clicked", false)
	.attr("id", function (d){return d.Axis ;})
.attr("class", "node")
		
	.on("mouseover", function(e){
	console.log(this);
		if (d3.select(this).attr('data-clicked') == 'false') {
			d3.select(this).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			 d3.selectAll('.tooltip').remove();
			printServerToSideBar(this);})
    	.on("mouseout", function(){
		if (d3.select(this).attr('data-clicked') == 'false'){
			var point = d3.select(this).attr('data-uid');
			d3.select(this).transition().style("fill", function(d) { return Color();});
	 		$('.side_bar').html("");
			d3.selectAll('path.link[data-from="' + d3.select(this)[0][0].__data__.uid + '"]' )
			.style("stroke", function(d){return ColorLink(point);}).style("stroke-opacity", .5).style('stroke-width','1px'); 
				NodesRedrawRadius();
				 }	
				}
	)    	
	.on("click", function(){ if (d3.select(this).attr('data-clicked') == 'true'){d3.select(this).attr('data-clicked', 'false')}
					else (d3.select(this).attr('data-clicked', 'true'));
		NodesRedrawRadius();
		})
	.transition()
	
	.duration(1500)
	
    	.attr("transform", function(d) { return "rotate(" + degrees(d.x) + ")"; })
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r",HiveplotVars.Radius)
   	

	.style("fill", function(d) { 
		var point = d3.select(this).attr('data-uid');
		d3.selectAll('path.link[data-from="' + point + '"]' ).style('stroke',function(){return ColorLink(point)})
		return Color();});

	d3.select("svg").select('g')
	.append("text")
	.style('fill', 'white')
	.transition()
	.duration(1500)
	.attr("class","xTitle")
	.attr("x", -300)
	.attr("y",250)
	.attr("font-size", "18px")
	.attr("height", "20px")
	.text(HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].xTitle)
	.style("fill", 'black')


	d3.select("svg").select('g')
	.append("text")
	.style('fill', 'black')
	.transition()
	.duration(1500)
	.attr("class","yTitle")
	.attr("x", 120)
	.attr("y",-290)
	.attr("font-size", "18px")
	.attr("height", "20px")
	.text(HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].yTitle)
	.style("fill", 'black')


	d3.select("svg").select('g')
	.append("text")
	.style('fill', 'white')
	.transition()
	.duration(1500)
	.attr("class","zTitle")
	.attr("x", 250)
	.attr("y",250)
	.attr("font-size", "18px")
	.attr("height", "20px")
	.text(HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].zTitle)
	.style("fill", 'black')

	
	
svg.append('circle').attr('class','close_button_X').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+150+")" }).on('click', TransitionClonedXAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");


svg.append('circle').attr('class','close_button_Y').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+270+")" }).on('click', TransitionClonedYAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");


svg.append('circle').attr('class','close_button_Z').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+30+")" }).on('click', TransitionClonedZAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");



 initThumbnails();
initNodeListSidebar()
 //TransitionClonedXAxis()




function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}
}







function Transition(){
console.log("transition")

$('.Process_popup').fadeOut();
d3.selectAll('.process_tooltip').remove();
d3.selectAll('.list_option').transition().duration(1500).style('background-color','white');



groundsKeepServers();
initNodeListSidebar();
AppendCoordinatesToNodes();
ResetLinks();



svg = d3.select(".hiveplot").select("g");
d3.selectAll('.tooltip').transition().delay(15).remove()
svg.selectAll('circle').remove();
d3.selectAll('.process_link').remove();
d3.selectAll('.link').remove();

svg.selectAll('.cloned_axis').remove();
svg.selectAll('.axis').remove();


var innerRadius = 40,
    outerRadius = 310;


var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));


svg.selectAll(".link")
    .data(HiveplotVars.links)
	.enter()
	.append('path')
	.style('stroke','white')
	.style('fill','none')
	.attr('class','link')
	.transition()
	.duration(1500)
	.attr("data-from", function(d){return d.source.uid;})
	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; }) 
	.radius(function(d) { return radius(d.y); }))
	.style("stroke", function(d) {if (d.displayed){return ColorLink(d.source.uid)} 
					else {return 'white'}
}).style('stroke-width','1px')


svg.selectAll(".axis")
   	.data(d3.range(3))
  	.enter()
	.append("line")
	
.attr("transform", function(d) { return "rotate(" + degrees(angle(d)-1) + ")"; })
	.style('stroke', 'white')
	.transition()
	.duration(1500)
    	.attr("class", "axis")
	.attr('id',function(d,i){ return "Axis_" + i;})
   	.attr("transform", function(d) { return "rotate(" + degrees(angle(d)) + ")"; })
    	.attr("x1", radius.range()[0])
    	.attr("x2", radius.range()[1])
	.style('stroke', 'black');



svg.selectAll(".node")
    	.data(HiveplotVars.nodes)
  	.enter()
	.append("circle")
		.attr("transform", function(d) { return "rotate(" + degrees(d.x -1)+ ")"; })
    	.attr("cx", function(d) { return -.15; })
	.style('fill', 'white')
	.on("mouseover", function(e){
	console.log(this);
		if (d3.select(this).attr('data-clicked') == 'false') {
			d3.select(this).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			 d3.selectAll('.tooltip').remove();
			printServerToSideBar(this);})
    	.on("mouseout", function(){
		if (d3.select(this).attr('data-clicked') == 'false'){
			d3.select(this).transition().style("fill", function(d) { return Color();});
	 		$('.side_bar').html("");
			d3.selectAll('path.link[data-from="' + d3.select(this)[0][0].__data__.uid + '"]' )
			.style("stroke", function(d){return Color();}).style("stroke-opacity", .5).style('stroke-width','1px'); 
				NodesRedrawRadius();
				 }
			
				}
	)   	
	.on("click", function(){ if (d3.select(this).attr('data-clicked') == 'true'){d3.select(this).attr('data-clicked', 'false')}
					else (d3.select(this).attr('data-clicked', 'true'));
		NodesRedrawRadius();
		})
	.transition()
	
	.duration(1500)
	.attr("class", "node")
    	.attr("transform", function(d) { return "rotate(" + degrees(d.x) + ")"; })
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r",HiveplotVars.Radius)
   	 .attr("data-uid",function(d){return d.uid ;})
	.attr('data-clicked',false)
	.attr("id", function (d){return d.Axis ;})

	.style("fill", function(d) { return Color();});



//
// ____________________________________you where messing around here
//







	d3.select("svg").select('g')
	.select(".xTitle")
	.data([HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].xTitle])
	.transition()
	.duration(1500)
	.text(function(d){return d;})
	

	
	d3.select("svg").select('g')
	.select(".yTitle")
	.data([HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].yTitle])
	.transition()
	.duration(1500)
	.text(function(d){return d;})
	


	
	d3.select("svg").select('g')
	.select(".zTitle")
	.data([HiveplotVars.AxesFunctions[HiveplotVars.FunctionPointer].zTitle])
	.transition()
	.duration(1500)
	.text(function(d){return d;})
	

svg.append('circle').attr('class','close_button_X').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+150+")" }).on('click', TransitionClonedXAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");


svg.append('circle').attr('class','close_button_Y').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+270+")" }).on('click', TransitionClonedYAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");


svg.append('circle').attr('class','close_button_Z').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+30+")" }).on('click', TransitionClonedZAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");

SetNodesFalse();








function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}

}

function CloseSplitAxisX(){


var innerRadius = 40,
    outerRadius = 310;

var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));

svg.selectAll("#cloned_axis_X")
	.transition()
	.duration(1500)
	.attr("transform", function(d,i) { return "rotate(" + 150  + ")" })
	.style('stroke', 'black');

d3.selectAll('#cloned_node_X').transition().duration(1500).attr("transform", function(d) { return "rotate("+150+")" });

ResetLinks();

svg.selectAll(".link")
    .data(HiveplotVars.links)
	.transition()
	.duration(1500)
	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; }) 
	.radius(function(d) { return radius(d.y); }))
svg.select('.close_button_X').remove();

Transition();

svg.append('circle').attr('class','close_button_X').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+150+")" }).on('click', TransitionClonedXAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");


}


function TransitionClonedXAxis(){
console.log('transition cloned x axis')
svg = d3.select(".hiveplot").select("g");



var innerRadius = 40,
    outerRadius = 310;

var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));

var NodedataX0 = [];
var NodedataX1 = [];
for (node in HiveplotVars.nodes){
	if (HiveplotVars.nodes[node].Axis == 'x'){
	NodedataX0.push(CopyConstructor(HiveplotVars.nodes[node]))

}};
for (node in HiveplotVars.nodes){
	if (HiveplotVars.nodes[node].Axis == 'x'){
	NodedataX1.push(CopyConstructor(HiveplotVars.nodes[node]))
	
}};
	
console.log(NodedataX0);
	
for (node in NodedataX0){
NodedataX0[node].x = 4.44846606;};


console.log('appending axis')
svg.selectAll("#cloned_axis_X")
	.data(d3.range(2))
	.enter()
	.append("line")
	.attr("transform", function(d,i) { return "rotate(" + 150  + ")" })
	.style('stroke', 'black')
	.transition()
	.duration(1500)
    	.attr("class", "cloned_axis")
	.attr('id','cloned_axis_X')
   	.attr("transform", function(d,i) { return "rotate(" + (135+(30 * i))  + ")" })
    	.attr("x1", radius.range()[0])
    	.attr("x2", radius.range()[1])
	.style('stroke', 'black');

svg.selectAll('#x').remove();
svg.select('#Axis_2').remove();

var Nodes_0 = svg.selectAll(".cloned_node_X0")
    	.data(NodedataX0)
  	.enter()
	.append("circle")
	.attr("transform", function(d) { return "rotate("+150+")" })
	.style('fill', function(d){ return Color();})
	.attr("data-uid",function(d){
	console.log(d.uid);	
	return d.uid;})
	.on("mouseover", function(){
	console.log(this);
		if (d3.select(this).attr('data-clicked') == 'false') {
			d3.select(this).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			 d3.selectAll('.tooltip').remove();
			printServerToSideBar(this);})
    	.on("mouseout", function(){
		if (d3.select(this).attr('data-clicked') == 'false'){
			var point = d3.select(this).attr('data-uid');
			console.log(point)
			d3.select(this).transition().style("fill", function(d) { return Color();});
	 		$('.side_bar').html("");
			console.log('SPLIT X AXIS Point');
			console.log(point);
			d3.selectAll('path.link[data-from="' + d3.select(this)[0][0].__data__.uid + '"]' )
			
			.style("stroke", function(d){return ColorLink(point);}).style("stroke-opacity", .5).style('stroke-width','1px'); 
				NodesRedrawRadius();
				 }
			
				}
	) 	
	.on("click", function(){ 
			var temp = d3.select(this).attr('data-uid');
			if (d3.select(this).attr('data-clicked') == 'true'){
				
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked',false)}
			else (
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked',true));
			NodesRedrawRadius();
				})
 	.transition()
	.duration(1500)
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r", HiveplotVars.Radius)
   	.attr("data-Axis",function(d){return "x0"})
	
	.attr('data-clicked','false')
	.attr("id","cloned_node_X")
	.attr("class", "cloned_node")
	.attr("transform", function(d) { return "rotate("+degrees(d.x)+")" });
	

	
for (node in NodedataX1){
NodedataX1[node].x = 3.92486728 }

var Nodes_1 = svg.selectAll(".cloned_node_X1")
    	.data(NodedataX1)
  	.enter()
	.append("circle")
	.attr("transform", function(d) { return "rotate("+150+")" })
	.style('fill', function(d){ return Color();})
	.on("mouseover", function(){
	console.log(this);
		if (d3.select(this).attr('data-clicked') == 'false') {
			d3.select(this).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			 d3.selectAll('.tooltip').remove();
			printServerToSideBar(this);})
    	.on("mouseout", function(){
		if (d3.select(this).attr('data-clicked') == 'false'){
			var point = d3.select(this).attr('data-uid');
			d3.select(this).transition().style("fill", function(d) { return Color();});
	 		$('.side_bar').html("");
			d3.selectAll('path.link[data-from="' + d3.select(this)[0][0].__data__.uid + '"]' )
			.style("stroke", function(d){return ColorLink(point);}).style("stroke-opacity", .5).style('stroke-width','1px'); 
				NodesRedrawRadius();
				 }
			
				}
	) 	
	.on("click", function(){ 
				var temp = d3.select(this).attr('data-uid');
				if (d3.select(this).attr('data-clicked') == 'true'){
					
					d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked',false)}
				else (
					d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked',true));
				NodesRedrawRadius();
				})

 	.transition()
	.duration(1500)
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r", HiveplotVars.Radius)
   	.attr("data-Axis",function(d){return "x1"})
	.attr("data-uid",function(d){return d.uid})
	.attr('data-clicked','false')
	.attr("id","cloned_node_X")
	.attr("class", "cloned_node")
	.attr("transform", function(d) { return "rotate("+degrees(d.x)+")" });
	
svg.selectAll('#x').remove();
svg.select('#Axis_2').remove();

CloneLinksX();
	

svg.append('circle').attr('class','close_button').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+150+")" }).on('click', CloseSplitAxisX).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link")
    .data(HiveplotVars.links)
	.transition()
	.duration(1500)
	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; }) 
	.radius(function(d) { return radius(d.y); }))

function CloneLinksX(){
for (link in HiveplotVars.links){
	if(HiveplotVars.links[link].source.Axis == 'y' && HiveplotVars.links[link].target.Axis == 'x'){
		for (node in NodedataX0){ if(HiveplotVars.links[link].target.uid == NodedataX0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = NodedataX0[node];
								}
							}
											
						}

if(HiveplotVars.links[link].source.Axis == 'x' && HiveplotVars.links[link].target.Axis == 'y'){
		for (node in NodedataX0){ if(HiveplotVars.links[link].source.uid == NodedataX0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = NodedataX0[node];
								}
							}
											
						}
					}

for (link in HiveplotVars.links){
	if(HiveplotVars.links[link].source.Axis == 'z' && HiveplotVars.links[link].target.Axis == 'x'){
		for (node in NodedataX1){ if(HiveplotVars.links[link].target.uid == NodedataX1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = NodedataX1[node];
								}
							}											
						}
if(HiveplotVars.links[link].source.Axis == 'x' && HiveplotVars.links[link].target.Axis == 'z'){
		for (node in NodedataX1){ if(HiveplotVars.links[link].source.uid == NodedataX1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = NodedataX1[node];
								}
							}					
						}
if(HiveplotVars.links[link].source.Axis == 'x' && HiveplotVars.links[link].target.Axis == 'x'){
	for (node in NodedataX0){ if(HiveplotVars.links[link].target.uid == NodedataX0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = NodedataX0[node];
							}
						}
		for (node in NodedataX1){ if(HiveplotVars.links[link].source.uid == NodedataX1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = NodedataX1[node];
								}
							}				
						}
					}
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}
function CopyConstructor(Node){
	var temp = {x:0,y:0,displayed:false,Axis:'',uid:0};
	temp.x = Node.x;
	temp.y = Node.y;
	temp.uid = Node.uid;
	temp.displayed = Node.displayed;
	temp.Axis = Node.Axis;

	return temp;
	}

}




function CloseSplitAxisY(){


var innerRadius = 40,
    outerRadius = 310;

var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));

svg.selectAll("#cloned_axis_Y")
	.transition()
	.duration(1500)
	.attr("transform", function(d,i) { return "rotate(" + 270  + ")" })
	.style('stroke', 'black');

d3.selectAll('.cloned_node').transition().duration(1500).attr("transform", function(d) { return "rotate("+270+")" });

ResetLinks();

svg.selectAll(".link")
    .data(HiveplotVars.links)
	.transition()
	.duration(1500)
	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; }) 
	.radius(function(d) { return radius(d.y); }))
svg.select('.close_button_Y').remove();

Transition();

svg.append('circle').attr('class','close_button_Y').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+270+")" }).on('click', TransitionClonedYAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");




}

function TransitionClonedYAxis(){
console.log('transition cloned y axis')
svg = d3.select(".hiveplot").select("g");



var innerRadius = 40,
    outerRadius = 310;

var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));

var Nodedata0 = [];
var Nodedata1 = [];
for (node in HiveplotVars.nodes){
	if (HiveplotVars.nodes[node].Axis == 'y'){
	Nodedata0.push(CopyConstructor(HiveplotVars.nodes[node]))
	Nodedata0[Nodedata0.length - 1].uid = node;
}};
for (node in HiveplotVars.nodes){
	if (HiveplotVars.nodes[node].Axis == 'y'){
	Nodedata1.push(CopyConstructor(HiveplotVars.nodes[node]))
	Nodedata1[Nodedata1.length - 1].uid = node;
}};
	
console.log(Nodedata0);
	
for (node in Nodedata0){
Nodedata0[node].x =6.02138592};


console.log('appending axis')
svg.selectAll("#cloned_axis_Y")
	.data(d3.range(2))
	.enter()
	.append("line")
	.attr("transform", function(d,i) { return "rotate(" + 270  + ")" })
	.style('stroke', 'black')
	.transition()
	.duration(1500)
    	.attr("class", "cloned_axis")
	.attr('id','cloned_axis_Y')
   	.attr("transform", function(d,i) { return "rotate(" + (255+(30 * i))  + ")" })
    	.attr("x1", radius.range()[0])
    	.attr("x2", radius.range()[1])
	.style('stroke', 'black');

svg.selectAll('#y').remove();
svg.select('#Axis_0').remove();

var Nodes_0 = svg.selectAll(".cloned_node_Y0")
    	.data(Nodedata0)
  	.enter()
	.append("circle")
	.attr("transform", function(d) { return "rotate("+270+")" })
	.style('fill', function(d){ return Color();})
	.on("mouseover", function(){
	console.log(this);
		if (d3.select(this).attr('data-clicked') == 'false') {
			d3.select(this).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			 d3.selectAll('.tooltip').remove();
			printServerToSideBar(this);})
    .on("mouseout", function(){
		if (d3.select(this).attr('data-clicked') == 'false'){
			var point = d3.select(this).attr('data-uid');
			d3.select(this).transition().style("fill", function(d) { return Color();});
	 		$('.side_bar').html("");
			d3.selectAll('path.link[data-from="' + d3.select(this)[0][0].__data__.uid + '"]' )
			.style("stroke", function(d){return ColorLink(point);}).style("stroke-opacity", .5).style('stroke-width','1px'); 
				NodesRedrawRadius();
				 }
			
				}
	) 	
	.on("click", function(){ 
			var temp = d3.select(this).attr('data-uid');
			if (d3.select(this).attr('data-clicked') == 'true'){
				
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked','false')}
			else (
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked','true'));
			NodesRedrawRadius();
				})
 	.transition()
	.duration(1500)
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r", HiveplotVars.Radius)
   	.attr("data-Axis",function(d){return "x0"})
	.attr("data-uid",function(d){return d.uid})
	.attr('data-clicked','false')	
	.attr("id", "cloned_node_Y")
	.attr("class", "cloned_node")
	.attr("transform", function(d) { return "rotate("+degrees(d.x)+")" });
	

for (node in Nodedata1){
Nodedata1[node].x = 0.261799388  }

var Nodes_1 = svg.selectAll(".cloned_node_Y1")
    	.data(Nodedata1)
  	.enter()
	.append("circle")
	.attr("transform", function(d) { return "rotate("+270+")" })
	.style('fill', function(d){ return Color();})
	.on("mouseover", function(){
	console.log(this);
		if (d3.select(this).attr('data-clicked') == 'false') {
			d3.select(this).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			 d3.selectAll('.tooltip').remove();
			printServerToSideBar(this);})
    	.on("mouseout", function(){
		if (d3.select(this).attr('data-clicked') == 'false'){
			var point = d3.select(this).attr('data-uid');
			d3.select(this).transition().style("fill", function(d) { return Color();});
	 		$('.side_bar').html("");
			d3.selectAll('path.link[data-from="' + d3.select(this)[0][0].__data__.uid + '"]' )
			.style("stroke", function(d){return ColorLink(point);}).style("stroke-opacity", .5).style('stroke-width','1px'); 
				NodesRedrawRadius();
				 }
			
				}
	)   	
	.on("click", function(){ 
			var temp = d3.select(this).attr('data-uid');
			if (d3.select(this).attr('data-clicked') == 'true'){
				
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked','false')}
			else (
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked','true'));
			NodesRedrawRadius();
				})
 .transition()
	
	.duration(1500)
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r", HiveplotVars.Radius)
   	.attr("data-Axis",function(d){return "x1"})
	.attr("data-uid",function(d){return d.uid})
	.attr('data-clicked','false')
	.attr("id","cloned_node_Y")
	.attr("class", "cloned_node")
	.attr("transform", function(d) { return "rotate("+degrees(d.x)+")" });
	
CloneLinksY();

svg.append('circle').attr('class','close_button').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+270+")" }).on('click', CloseSplitAxisY).style('stroke','#00ccff').style('fill','white');	

svg.selectAll(".link")
    .data(HiveplotVars.links)
	.transition()
	.duration(1500)
	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; }) 
	.radius(function(d) { return radius(d.y); }))

function CloneLinksY(){
	for (link in HiveplotVars.links){
	if(HiveplotVars.links[link].source.Axis == 'x' && HiveplotVars.links[link].target.Axis == 'y'){
		for (node in Nodedata0){ if(HiveplotVars.links[link].target.uid == Nodedata0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = Nodedata0[node];
								}
							}
											
						}

if(HiveplotVars.links[link].source.Axis == 'y' && HiveplotVars.links[link].target.Axis == 'x'){
		for (node in Nodedata0){ if(HiveplotVars.links[link].source.uid == Nodedata0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = Nodedata0[node];
								}
							}
											
						}
					}

for (link in HiveplotVars.links){
	if(HiveplotVars.links[link].source.Axis == 'y' && HiveplotVars.links[link].target.Axis == 'z'){
		for (node in Nodedata1){ if(HiveplotVars.links[link].source.uid == Nodedata1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = Nodedata1[node];
								}
							}											
						}
if(HiveplotVars.links[link].source.Axis == 'z' && HiveplotVars.links[link].target.Axis == 'y'){
		for (node in Nodedata1){ if(HiveplotVars.links[link].target.uid == Nodedata1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = Nodedata1[node];
								}
							}					
						}
if(HiveplotVars.links[link].source.Axis == 'y' && HiveplotVars.links[link].target.Axis == 'y'){
	for (node in Nodedata0){ if(HiveplotVars.links[link].target.uid == Nodedata0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = Nodedata0[node];
							}
						}
		for (node in Nodedata1){ if(HiveplotVars.links[link].source.uid == Nodedata1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = Nodedata1[node];
								}
							}				
						}
					}
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}
function CopyConstructor(Node){
	var temp = {x:0,y:0,displayed:false,Axis:''};
	temp.x = Node.x;
	temp.y = Node.y;
	temp.uid = Node.uid;
	temp.displayed = Node.displayed;
	temp.Axis = Node.Axis;
	return temp;
	}

}



function CloseSplitAxisZ(){


var innerRadius = 40,
    outerRadius = 310;

var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));

svg.selectAll("#cloned_axis_Z")
	.transition()
	.duration(1500)
	.attr("transform", function(d,i) { return "rotate(" + 30  + ")" })
	.style('stroke', 'black');

d3.selectAll('.cloned_node').transition().duration(1500).attr("transform", function(d) { return "rotate("+30+")" });

ResetLinks();

svg.selectAll(".link")
    .data(HiveplotVars.links)
	.transition()
	.duration(1500)
	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; }) 
	.radius(function(d) { return radius(d.y); }))
svg.select('.close_button_Z').remove();

Transition();

svg.append('circle').attr('class','close_button_Z').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+30+")" }).on('click', TransitionClonedZAxis).style('stroke','#00ccff').style('fill','white');	
svg.selectAll(".link");


}







function TransitionClonedZAxis(){
console.log('transition cloned y axis')
svg = d3.select(".hiveplot").select("g");



var innerRadius = 40,
    outerRadius = 310;

var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));

var Nodedata0 = [];
var Nodedata1 = [];
for (node in HiveplotVars.nodes){
	if (HiveplotVars.nodes[node].Axis == 'z'){
	Nodedata0.push(CopyConstructor(HiveplotVars.nodes[node]))
	Nodedata0[Nodedata0.length - 1].uid = node;
}};
for (node in HiveplotVars.nodes){
	if (HiveplotVars.nodes[node].Axis == 'z'){
	Nodedata1.push(CopyConstructor(HiveplotVars.nodes[node]))
	Nodedata1[Nodedata1.length - 1].uid = node;
}};
	
console.log(Nodedata0);
	
for (node in Nodedata0){
Nodedata0[node].x =2.35619449};


console.log('appending axis')
svg.selectAll("#cloned_axis_Z")
	.data(d3.range(2))
	.enter()
	.append("line")
	.attr("transform", function(d,i) { return "rotate(" + 30  + ")" })
	.style('stroke', 'black')
	.transition()
	.duration(1500)
    	.attr("class", "cloned_axis")
	.attr('id','cloned_axis_Z')
   	.attr("transform", function(d,i) { return "rotate(" + (15+(30 * i))  + ")" })
    	.attr("x1", radius.range()[0])
    	.attr("x2", radius.range()[1])
	.style('stroke', 'black');

svg.selectAll('#z').remove();
svg.select('#Axis_1').remove();

var Nodes_0 = svg.selectAll(".cloned_node_Y0")
    	.data(Nodedata0)
  	.enter()
	.append("circle")
	.attr("transform", function(d) { return "rotate("+30+")" })
	.style('fill', function(d){ return Color();})
	.on("mouseover", function(){
	console.log(this);
		if (d3.select(this).attr('data-clicked') == 'false') {
			d3.select(this).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			 d3.selectAll('.tooltip').remove();
			printServerToSideBar(this);})
    	.on("mouseout", function(){
		if (d3.select(this).attr('data-clicked') == 'false'){
			d3.select(this).transition().style("fill", function(d) { return Color();});
	 		$('.side_bar').html("");
			d3.selectAll('path.link[data-from="' + d3.select(this)[0][0].__data__.uid + '"]' )
			.style("stroke", function(d){return Color();}).style("stroke-opacity", .5).style('stroke-width','1px'); 
				NodesRedrawRadius();
				 }
			
				}
	)  	
	.on("click", function(){ 
			var temp = d3.select(this).attr('data-uid');
			if (d3.select(this).attr('data-clicked') == 'true'){
				
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked','false')}
			else (
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked','true'));
			NodesRedrawRadius();
				})
 	.transition()
	.duration(1500)
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r", HiveplotVars.Radius)
   	.attr("data-Axis",function(d){return "x0"})
	.attr("data-uid",function(d){return d.uid})
	.attr('data-clicked','false')
	.attr("id","cloned_node_Z")
	.attr("class", "cloned_node")
	.attr("transform", function(d) { return "rotate("+degrees(d.x)+")" });
	

for (node in Nodedata1){
Nodedata1[node].x = 1.83259571  }

var Nodes_1 = svg.selectAll(".cloned_node_Y1")
    	.data(Nodedata1)
  	.enter()
	.append("circle")
	.attr("transform", function(d) { return "rotate("+30+")" })
	.style('fill', function(d){ return Color();})
	.on("mouseover", function(){
	console.log(this);
		if (d3.select(this).attr('data-clicked') == 'false') {
			d3.select(this).transition().attr("r",12);
			
			d3.selectAll('path.link[data-from="' + d3.select(this).attr('data-uid') + '"]' )
			.style("stroke", 'black').style("stroke-opacity", 1)};
			 d3.selectAll('.tooltip').remove();
			printServerToSideBar(this);})
    	.on("mouseout", function(){
		if (d3.select(this).attr('data-clicked') == 'false'){
			d3.select(this).transition().style("fill", function(d) { return Color();});
	 		$('.side_bar').html("");
			d3.selectAll('path.link[data-from="' + d3.select(this)[0][0].__data__.uid + '"]' )
			.style("stroke", function(d){return Color();}).style("stroke-opacity", .5).style('stroke-width','1px'); 
				NodesRedrawRadius();
				 }
			
				}
	) 	
	.on("click", function(){ 
			var temp = d3.select(this).attr('data-uid');
			if (d3.select(this).attr('data-clicked') == 'true'){
				
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked','false')}
			else (
				d3.selectAll('.cloned_node[data-uid="' + temp + '"]' ).attr('data-clicked','true'));
			NodesRedrawRadius();
				})
 .transition()
	
	.duration(1500)
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r", HiveplotVars.Radius)
   	.attr("data-Axis",function(d){return "x1"})
	.attr("data-uid",function(d){return d.uid})
	.attr('data-clicked','false')
	.attr("id","cloned_node_Z")
	.attr("class", "cloned_node")
	.attr("transform", function(d) { return "rotate("+degrees(d.x)+")" });
	
CloneLinksY();
	
svg.selectAll(".link")
    .data(HiveplotVars.links)
	.transition()
	.duration(1500)
	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; }) 
	.radius(function(d) { return radius(d.y); }))

svg.append('circle').attr('class','close_button').attr('r', 12).attr("cx", outerRadius + 30 ).attr("transform", function(d) { return "rotate("+30+")" }).on('click', CloseSplitAxisZ).style('stroke','#00ccff').style('fill','white');

function CloneLinksY(){
	for (link in HiveplotVars.links){
	if(HiveplotVars.links[link].source.Axis == 'x' && HiveplotVars.links[link].target.Axis == 'z'){
		for (node in Nodedata0){ if(HiveplotVars.links[link].target.uid == Nodedata0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = Nodedata0[node];
								}
							}
											
						}

if(HiveplotVars.links[link].source.Axis == 'z' && HiveplotVars.links[link].target.Axis == 'x'){
		for (node in Nodedata0){ if(HiveplotVars.links[link].source.uid == Nodedata0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = Nodedata0[node];
								}
							}
											
						}
					}

for (link in HiveplotVars.links){
	if(HiveplotVars.links[link].source.Axis == 'z' && HiveplotVars.links[link].target.Axis == 'y'){
		for (node in Nodedata1){ if(HiveplotVars.links[link].source.uid == Nodedata1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = Nodedata1[node];
								}
							}											
						}
if(HiveplotVars.links[link].source.Axis == 'y' && HiveplotVars.links[link].target.Axis == 'z'){
		for (node in Nodedata1){ if(HiveplotVars.links[link].target.uid == Nodedata1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = Nodedata1[node];
								}
							}					
						}
if(HiveplotVars.links[link].source.Axis == 'z' && HiveplotVars.links[link].target.Axis == 'z'){
	for (node in Nodedata0){ if(HiveplotVars.links[link].target.uid == Nodedata0[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].target = Nodedata0[node];
							}
						}
		for (node in Nodedata1){ if(HiveplotVars.links[link].source.uid == Nodedata1[node].uid ){
			console.log('retarget link');
			HiveplotVars.links[link].source = Nodedata1[node];
								}
							}				
						}
					}
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}
function CopyConstructor(Node){
	var temp = {x:0,y:0,displayed:false,Axis:''};
	temp.x = Node.x;
	temp.y = Node.y;
	temp.uid = Node.uid;
	temp.displayed = Node.displayed;
	temp.Axis = Node.Axis;
	return temp;
	}

}









//_________________________________________________ Config Menu Javascript
//the configuration menu is used to dyamically create new functions based upon input from the configuration menu after submit has been clicked
//the functions created take a single argument, a node obj
function AxisFunctionPusher(){
HiveplotVars.AxesFunctions.push({});
var FuncPoint = HiveplotVars.AxesFunctions.length;
AppendAxisData(FuncPoint);

xFunc = GrabConfigDataX();
yFunc = GrabConfigDataY();
zFunc = GrabConfigDataZ();
AppendFunctionXToHPV(FuncPoint,xFunc);
AppendFunctionYToHPV(FuncPoint,yFunc);
AppendFunctionZToHPV(FuncPoint,zFunc);
initThumbnails();
}


function AppendAxisData(funcPoint){
var xTitl= $('.XAxisLabel').val();
var yTitl= $('.YAxisLabel').val();
var zTitl= $('.ZAxisLabel').val();

HiveplotVars.AxesFunctions[funcPoint-1].xTitle = xTitl;
HiveplotVars.AxesFunctions[funcPoint-1].yTitle = yTitl;
HiveplotVars.AxesFunctions[funcPoint-1].zTitle = zTitl;
}

function GrabConfigDataX(){

var StringSearchCategory = $('.X_string_search_select option:selected').val();
var StringSearchString = $('#SearchString_X').val();
var ThresholdCategory = $('.X_ThresholdCategory').val();
var ThresholdOperator=$('.X_ThresholdOperator').val();
var ThresholdNumber = $('.X_ThresholdNumber').val();
var BooleanOperator = $('#X_Checkbox_Boolean').val();

if (!StringSearchString){StringSearchString = ''};
var CompleteFunction = StringSearchFunction(StringSearchCategory, StringSearchString) + ThresholdFunction(ThresholdCategory,ThresholdOperator, ThresholdNumber) + GetManuallySelectedNodesX(BooleanOperator);
console.log(CompleteFunction);
return CompleteFunction;
}

function GrabConfigDataY(){

var StringSearchCategory = $('.Y_string_search_select option:selected').val();
var StringSearchString = $('#SearchString_Y').val();
var ThresholdCategory = $('.Y_ThresholdCategory').val();
var ThresholdOperator=$('.Y_ThresholdOperator').val();
var ThresholdNumber = $('.Y_ThresholdNumber').val();
var BooleanOperator = $('#Y_Checkbox_Boolean').val();

if (!StringSearchString){StringSearchString = ''};

var CompleteFunction = StringSearchFunction(StringSearchCategory, StringSearchString)
	+ ThresholdFunction(ThresholdCategory,ThresholdOperator, ThresholdNumber)+ GetManuallySelectedNodesY(BooleanOperator);

console.log(CompleteFunction);
return CompleteFunction;
}

function GrabConfigDataZ(){

var StringSearchCategory = $('.Z_string_search_select option:selected').val();
var StringSearchString = $('#SearchString_Z').val();
var ThresholdCategory = $('.Z_ThresholdCategory').val();
var ThresholdOperator=$('.Z_ThresholdOperator').val();
var ThresholdNumber = $('.Z_ThresholdNumber').val();
var BooleanOperator = $('#Z_Checkbox_Boolean').val();

console.log(StringSearchString);
if (!StringSearchString){StringSearchString = ''};

var CompleteFunction =  StringSearchFunction(StringSearchCategory, StringSearchString)
	 + ThresholdFunction(ThresholdCategory,ThresholdOperator, ThresholdNumber)+ GetManuallySelectedNodesZ(BooleanOperator);
console.log(CompleteFunction);

return CompleteFunction;
}


function StringSearchFunction(category, string){
console.log('STRINGSEARCH');
console.log(string);
if(category == 'NONE'){return "var temp = false; ";}

else if (category == 'nickname'){
	return "var temp = (obj." + "id" + '.indexOf("'+ string + '") !== -1);' ;}
else if(category == 'running'){
	return ("for (server in HiveplotVars.servers){if (HiveplotVars.servers[server].nickname == obj.id){" 
		+ 'var temp = (HiveplotVars.servers[server].running.toString() == '+ string + '); }}; ');			
	}

else if(category == 'os'||'distribution'||'architecture'){

return (" for (server in HiveplotVars.servers){if (HiveplotVars.servers[server].nickname == obj.id){" 
		+ "var temp = (HiveplotVars.servers[server]." + category +'.indexOf("'+ string + '") !== -1);}}; ');			
	}

}

function ThresholdFunction(category, operator, thresh){
if (!thresh){thresh = 0};
console.log(category)
if (category == 'NONE'){
return('')

}

if (category == 'fromID' || 'toID'){
		
		return (""
			 +"var tempC = 0;" 
			+"for (edge in HiveplotVars.topology.Edge){" 
			
			+"if (HiveplotVars.topology.Edge[edge]." + category + " == obj.id){" 
				+ "tempC++;}} " 
				+"temp = (temp && (tempC " + operator+ ' ' + thresh + " )?true:false);"
		);
}

}


function GetManuallySelectedNodesX(bool){
var Stringarray = [];
if(bool=='true'){bool = '&&'}
	else(bool = '||');

var Nodes = d3.select("#X_droppable_node_list").selectAll('.selected_node').each(function (){Stringarray.push($(this).attr('id'))})

if (Nodes != undefined){
var ret = "var TEMP = false;" + "TEMP = (TEMP";
for (string in Stringarray){
ret += (" || " +"((obj.id == '" + Stringarray[string]) + "')?true:false)";
}
ret +=  " )?true:false; return (TEMP "+ bool + " temp)?true:false;"
return ret;}
else{ return "return temp;"};

}


function GetManuallySelectedNodesY(bool){
var Stringarray = [];
if(bool == 'true'){bool = '&&'}
	else(bool = '||');
var Nodes = d3.select("#Y_droppable_node_list").selectAll('.selected_node').each(function (){Stringarray.push($(this).attr('id'))})

if (Nodes != undefined){
var ret = "var TEMP = false;" + "TEMP = (TEMP";
for (string in Stringarray){
ret += (" || " +"((obj.id == '" + Stringarray[string]) + "')?true:false)";
}
ret +=  " )?true:false; return (TEMP "+ bool + " temp)?true:false;"
return ret;}
else{ return "return temp;"};



}

function GetManuallySelectedNodesZ(bool){
var Stringarray = [];
if(bool=='true'){bool = '&&'}
	else(bool = '||');
var Nodes = d3.select("#Z_droppable_node_list").selectAll('.selected_node').each(function (){Stringarray.push($(this).attr('id'))})


if (Nodes != undefined){
var ret = "var TEMP = false;" + "TEMP = (TEMP";
for (string in Stringarray){
ret += (" || " +"((obj.id == '" + Stringarray[string]) + "')?true:false)";
}
ret +=  " )?true:false; return (TEMP "+ bool + " temp)?true:false;"
return ret;
}
else{ return "return temp;"};


}





function AppendFunctionXToHPV(int, string){ 
	console.log("Appending Function X");
HiveplotVars.AxesFunctions[int-1].x = new Function('obj',string);
//HiveplotVars.AxesFunctions[int-1].x("obj");
}


function AppendFunctionYToHPV(int, string){

console.log("Appending Function Y");
HiveplotVars.AxesFunctions[int-1].y = new Function('obj',string);
//HiveplotVars.AxesFunctions[int-1].y("obj");

}


function AppendFunctionZToHPV(int, string){

console.log("Appending Function Z");
HiveplotVars.AxesFunctions[int-1].z = new Function('obj',string);
//HiveplotVars.AxesFunctions[int-1].z("obj");

}



//-------------------------------------------------------------------------THUMBNAIL_MENU and BUTTONS



function drawThumbnail(thumbnail){


	console.log(thumbnail);

$(thumbnail).append("<svg id='thumbnail_hiveplot_"+$(thumbnail).data('pointer')+"' class='thumbnail_hiveplot' data-pointer = " +$(thumbnail).data('pointer')+"> </svg>");

HiveplotVars.FunctionPointer = $(thumbnail).data('pointer');

d3.select('#thumbnail_hiveplot_'+$(thumbnail).data('pointer')).on('click',function(){HiveplotVars.FunctionPointer = $(this).data('pointer'); Transition();})


console.log(HiveplotVars.FunctionPointer);

	
AppendCoordinatesToNodes();
ResetLinks();

svg = d3.select('#thumbnail_hiveplot_'+$(thumbnail).data('pointer')).append("g").attr('transform', "translate(37,37)")
	

var innerRadius = 5,
    outerRadius = 32;


var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));


svg.selectAll(".thumbnail_axis")
    .data(d3.range(3))
  .enter().append("line")
    .attr("class", "thumbnail_axis")
    .attr("transform", function(d) { return "rotate(" + degrees(angle(d)) + ")"; })
    .attr("x1", radius.range()[0])
    .attr("x2", radius.range()[1]);

svg.selectAll(".thumbnail_link")
    .data(HiveplotVars.links)
  .enter().append("path")
    .attr("class", "thumbnail_link")
    
    .attr("data-from", function(d){return d.source.uid;})
    .attr("d", d3.hive.link()
    .angle(function(d) { return d.x; })
 
    .radius(function(d) { return radius(d.y); }))
    .style("stroke", function(d) { return Color(); });

svg.selectAll(".thumbnail_node")
    .data(HiveplotVars.nodes)
  .enter().append("circle")
    .attr("class", "thumbnail_node")
    .attr("transform", function(d) { return "rotate(" + degrees(d.x) + ")"; })
    .attr("cx", function(d) { return radius(d.y); })
    .attr("r", .5)
    .attr("data-uid",function(d){return d.uid ;})
  	.style("fill", function(d) { return Color();});









function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}

}





function search_bar_radius(){
//the function executed when a div is clicked inside the scrollable sidebar list
//it Highlights the clicked div as well as enlarging the radius of node corresponding with the server displayed in the div
var search = [$('.search_bar').val()]
var temp = [];
for(node in HiveplotVars.topology.Node)
	if (HiveplotVars.topology.Node[node].id.indexOf(search) !== -1){
		temp.push(node);
		
	}
if (search == ''){
temp = [];
	}

d3.selectAll('.tooltip').remove();

d3.selectAll('.node')
	.transition()
	.duration(1500)
	.attr('r',function (){
	 var point = d3.select(this).attr('data-uid')
	 for (num in temp){ 
		if ($(this).data('uid') == temp[num]){
			
		d3.selectAll('path.link[data-from="' + point + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",'black')
			.style("stroke-opacity", 1);
		 	printServerToSideBar(this);
		d3.select(this).attr('data-clicked',true);
		return 12;}}
		
		d3.selectAll('path.link[data-from="' + point + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",ColorLink(point))
			.style("stroke-opacity", .5);
		d3.select(this).attr('data-clicked',false);
		return HiveplotVars.Radius;

});



d3.selectAll('.cloned_node')
	.transition()
	.duration(1500)
	.attr('r',function ()
	{ for (num in temp){ 
		if ($(this).data('uid') == temp[num]){
		d3.selectAll('path.link[data-from="' + $(this).data('uid') + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",'black')
			.style("stroke-opacity", 1);
		 	//printServerToSideBar(this);
		d3.select(this).attr('data-clicked','true');
		return 12;}}
		d3.selectAll('path.link[data-from="' + $(this).data('uid') + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",'#00ccff')
			.style("stroke-opacity", .5);
		d3.select(this).attr('data-clicked','false');
		return HiveplotVars.Radius;

});





NodesRedrawRadius();
};


function initNodeListSidebar(){
//creates the scrollable list of servers inside the .sidebar element

$('.Sidebar_scroll_list').remove();

d3.select('.Sidebar_scroll_list_wrapper')
	.append('div')
	.attr('class','Sidebar_scroll_list')
	.selectAll('list_option')
	.data(HiveplotVars.topology.Node)
	.enter()
	.append('div')
	.attr('data-clicked','0')
	.attr('class','list_option')
	.on('click', function (){
		
		d3.selectAll('.list_option').transition().duration(1500).style('background-color','white');
		
		var temp = 0;		
		for (node in HiveplotVars.topology.Node){
			if (this.id == HiveplotVars.topology.Node[node].id){
				temp = node;
					}
			}
		var clicked = $(this).attr('data-clicked');
		console.log(clicked);

		d3.select(this).transition().duration(1500).style('background-color', '#00ccff');
				
			


		d3.selectAll('.node')
		.transition().duration(1000)
		.attr('r',function(){if ($(this).data('uid') == temp){
			d3.selectAll('path.link[data-from="' + $(this).data('uid') + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",'black')
			.style("stroke-opacity", 1);
			$('.tooltip').remove();
			printServerToSideBar(this);
			return 12;} 
		      else {
			d3.selectAll('path.link[data-from="' + $(this).data('uid') + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",ColorLink($(this).data('uid')))
			.style("stroke-opacity", .5);
			return HiveplotVars.Radius}})


		d3.selectAll('.cloned_node')
		.transition().duration(1000)
		.attr('r',function(){if ($(this).data('uid') == temp && clicked == 1){
			d3.selectAll('path.link[data-from="' + $(this).data('uid') + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",'black')
			.style("stroke-opacity", 1);
			$('.tooltip').remove();
			printServerToSideBar(this)
			return 12;} 
		      else if($(this).data('uid') == temp && clicked == 0){
			d3.selectAll('path.link[data-from="' + $(this).data('uid') + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",ColorLink($(this).data('uid')))
			.style("stroke-opacity", .5);
			return HiveplotVars.Radius}
			return ($(this).attr('r'))})



		})
	.attr('id',function(d){return d.id;})
	.text(function(d){return d.id;});


}

function getProcessDetail(){
	//Fires an ajax call for each process in serverproc[0]
	for(process in HiveplotVars.serverproc[0]){
		var dict = [];
		dict.push(HiveplotVars.serverproc[0][process].uid);
		dict.push(process);
		getServerIdprocessDetail(dict);
}
}



function processTopology(){
function matchCheck(array, check){
	console.log('MATCH CHECK')
	for (data in array){
		if (array[data] == check){
		return false;
		}
	}
return true;
}


var innerRadius = 40,
    outerRadius = 310;


var angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
    radius = d3.scale.linear().range([innerRadius, outerRadius]),
    color = d3.scale.category10().domain(d3.range(20));

svg = d3.select('.hiveplot').select('g');

var x = (4*3.14/3), y = (3.14*2), z = (2 * 3.14/3);

console.log("RUNNING PROCESS TOPOLOGY")
var processNodeArray = [];
var processLinkArray = [];




var processcounter = 0;
var linkcounter = 0;
var created = 'false';


// this loop intializes which processes will be displayed and are communicatiing with other processes
for (process in HiveplotVars.serverproc[0]){
	created = 'false';
	console.log('process loop');
	//console.log(HiveplotVars.serverproc[0][process]['detail']);
	if (!(typeof HiveplotVars.serverproc[0]
				[process]['detail'][0]['sockets'] === 'undefined')){	
	for (sock in HiveplotVars.serverproc[0][process]['detail'][0]['sockets']){
		console.log('socket loop')
		if (created == 'false'){
			console.log('------' + HiveplotVars.serverproc[0][process].name)
			console.log('process topology sockets');
			processNodeArray.push({x: 1, y: 0, uid: 0, displayed: true, Axis: 'x'})
			created = true;
			processNodeArray[processcounter].x = x;
			processNodeArray[processcounter].y = (1 - (processcounter * .03));
			processNodeArray[processcounter].uid = HiveplotVars.serverproc[0][process].uid;
			processNodeArray[processcounter].pnum = process;
			processNodeArray[processcounter].Axis = 'x';
			processNodeArray[processcounter].displayed = true;
			processcounter++;
			}
		
     	
	}
	}
}



for (node in HiveplotVars.nodes){
	HiveplotVars.nodes[node].displayed = false;}

//this loop finds all servers that should be represented along the y and z axis
// it also intializies edge data;

for (node in processNodeArray){
	var matches = [];
	for (peer in HiveplotVars.serverproc[0][processNodeArray[node].pnum]['detail'][0].sockets){
		
	if (matchCheck(matches, HiveplotVars.serverproc[0][processNodeArray[node].pnum]['detail'][0].sockets[peer]['Peer IP']) != false){

		for (nodes in HiveplotVars.topology.Node){
			console.log(HiveplotVars.serverproc[0][processNodeArray[node].pnum]['detail'][0].sockets[peer]['Peer IP'])
			console.log('Checking Nodes')	
		  var addresses = eval(HiveplotVars.topology.Node[nodes].ips);
		  for (ip in addresses){
			if (HiveplotVars.serverproc[0][processNodeArray[node].pnum]['detail'][0].sockets[peer]['Peer IP'] == addresses[ip]){
				matches.push(HiveplotVars.serverproc[0][processNodeArray[node].pnum]['detail'][0].sockets[peer]['Peer IP']);
				//initialize server nodes and socket links
				console.log('plotting Nodes')
				HiveplotVars.nodes[nodes].displayed = true;
				HiveplotVars.nodes[nodes].x = y;
				processLinkArray.push({
					source:processNodeArray[node],
					target:HiveplotVars.nodes[nodes],
					socketnum:peer,
					uid:0,
					displayed:true})
			}
			
		    }
	        }
		}
	  }
	}





var servercounter = 0;
for (node in HiveplotVars.nodes){
	if (HiveplotVars.nodes[node].displayed == true){
	HiveplotVars.nodes[node].y = (1 - (servercounter * .03));	
	servercounter++;
	}
	else {
	HiveplotVars.nodes[node].x = 0;
	HiveplotVars.nodes[node].y = 0;
	}
}
	




svg.selectAll('.node').remove();
svg.selectAll('.cloned_node').remove();
svg.selectAll('.link').remove();
svg.selectAll('.tooltip').remove();
svg.selectAll('.axis').remove();
svg.selectAll('.cloned_axis').remove();


svg.selectAll(".axis")
   	.data(d3.range(3))
  	.enter()
	.append("line")
   	.attr("transform", function(d) { return "rotate(" + degrees(angle(d-1)) + ")"; })
	
	.transition()
	.duration(1500)
    	.attr("class", "axis")
	.attr('id',function(d,i){ return "Axis_" + i;})
   	.attr("transform", function(d) { return "rotate(" + degrees(angle(d)) + ")"; })
    	.attr("x1", radius.range()[0])
    	.attr("x2", radius.range()[1])
	.style('stroke', 'black');



svg.selectAll(".process_link")
   	.data(processLinkArray)
  	.enter()
	.append("path")
	.attr('class', 'process_link')
	//.style('stroke', 'white')

	/*.transition()
	.delay(800)
	.duration(1500)
   	.attr("class", "process_link")*/
    	.attr("data-from", function(d){return d.source.uid;})
	
    	.attr("d", d3.hive.link()
    	.angle(function(d) { return d.x; })	
   	.radius(function(d) { return radius(d.y); }))
   	.style("stroke", function(d){
			console.log('process color threshold check')
			console.log(d.socketnum)
		if (HiveplotVars.serverproc[0][d.source.pnum]['detail'][0].sockets[d.socketnum]['Total Response Time (ms)'] > 0)
					{return 'red'} 
				else {return '#FE9A2E'}
							})
	.style("stroke-opacity", .3);

svg.selectAll(".process_node")
    	.data(processNodeArray)
  	.enter()
	.append("circle")
		.attr("transform", function(d) { return "rotate(" + degrees(0) + ")"; })
    	.attr("cx", function(d) { return 0; })
	.style('fill', '#FE9A2E')
	.attr('data-processuid',function(d){return d.uid;})
	.attr('data-pnum',function(d){return d.pnum;})
	.attr("data-clicked", false)
	.attr("id", function (d){return d.Axis ;})
	.attr("class", "process_node")
	.on('mouseover', function(){ 
	d3.selectAll('.process_link').style("stroke", '#FE9A2E').style("stroke-opacity", .3)
	d3.selectAll('.tooltip').remove();
	d3.selectAll('path.process_link[data-from="' + d3.select(this).attr('data-processuid') + '"]' )
				.style("stroke", 'black').style("stroke-opacity", 1);
					DisplayProcessNameToolTip(this)})
	/*.on('mouseout',function(){
			d3.selectAll('path.process_link[data-from="' + d3.select(this).attr('data-processuid') + '"]' )
				.style("stroke", '#FE9A2E').style("stroke-opacity", .3);
			d3.selectAll('.tooltip').remove();})*/	
	.transition()
	.duration(1500)
    	.attr("transform", function(d) { return "rotate(" + degrees(d.x) + ")"; })
    	.attr("cx", function(d) { return radius(d.y); })
    	.attr("r",HiveplotVars.Radius)




svg.selectAll(".node")
    	.data(HiveplotVars.nodes)
  	.enter()
	.append("circle")
	.attr("transform", function(d) { return "rotate(" + degrees(0) + ")"; })
    	.attr("cx", function(d) { return .15; })
	.style('fill', 'teal')
	.on('mouseover',function(){printServerToSideBar(this)})
	.on('mouseout',function(){d3.selectAll('.tooltip').remove()})
	.attr("data-clicked", false)
	
	.attr("id", function (d){return d.Axis ;})
	.attr("class", "process_node")
	
	.transition()
	
	.duration(1500)
	
    	.attr("transform", function(d) {return "rotate(" + degrees(d.x) + ")"; })
	
    	//.attr("cx", function(d) { if (d.displayed == false){return 0;}})
    	.attr("r",HiveplotVars.Radius)
	.attr("cx", function(d) { return radius(d.y); })

	



HiveplotVars.processnodes = processNodeArray;
}

function appendProcessesToSidebar(){

$('.Sidebar_scroll_list').remove();
d3.select('.Sidebar_scroll_list_wrapper').transition().duration(1500).style('border-color','#FE9A2E');
d3.select('.Sidebar_scroll_list_wrapper')
	.append('div')
	.attr('class','Sidebar_scroll_list')
	.selectAll('list_option')
	.data(HiveplotVars.processnodes)
	.enter()
	.append('div')
	.attr('data-clicked','0')
	.attr('class','list_option')
	.on('click', function (){
		
		d3.selectAll('.list_option').transition().duration(1500).style('background-color','white');
		
		var temp = 0;	
			
		for (node in HiveplotVars.processnodes){
			if ($(this).data('pnum') == HiveplotVars.processnodes[node].pnum){
				temp = HiveplotVars.processnodes[node].pnum;
					}
			}
		var clicked = $(this).attr('data-clicked');
		console.log(temp);

		d3.select(this).transition().duration(1500).style('background-color', '#FE9A2E');
				
			


		d3.selectAll('.process_node')
		.transition().duration(1000)
		.attr('r',function(){if ($(this).data('pnum') == temp){
			d3.selectAll('path.process_link[data-from="' + $(this).data('pnum') + '"]' )
			.transition()
			.duration(1500)
			.style("stroke",'black')
			.style("stroke-opacity", 1);
			$('.tooltip').remove();
			console.log(this);
			 DisplayProcessNameToolTip(this);
			return 12;} 
		      else {
			d3.selectAll('path.process_link[data-from="' + $(this).data('pnum') + '"]' )
			.transition()
			.duration(1500)
			.style("stroke", '#FE9A2E')
			.style("stroke-opacity", .5);
			return HiveplotVars.Radius}})




		})
	.attr('data-pnum',function(d){return d.pnum;})
	.text(function(d){ 
			console.log(d)
	return HiveplotVars.serverproc[0][d.pnum].name;} );


}

function getProcessDetail(){
	//Fires an ajax call for each process in serverproc[0]
	for(process in HiveplotVars.serverproc[0]){
		var dict = [];
		dict.push(HiveplotVars.serverproc[0][process].uid);
		dict.push(process);
		getServerIdprocessDetail(dict);
}






}





//----------------------------------------------
function DisplayProcessNameToolTip(obj){

	d3.selectAll('.process_tooltip').remove();
var position = $(obj).offset();
	//get mouse coords 
	var coordX =  position.left + 30;
	var coordY =  position.top -100;



		    d3.select('.main_content')
		   .append('div')
		   .attr('class','process_tooltip');

			$('.process_tooltip')
		   	.css('top', coordY)	
		   	.css('left',coordX);
		 	console.log(HiveplotVars.serverproc[0][d3.select(obj).attr('data-pnum')]);
			d3.select('.process_tooltip').append('div').text( HiveplotVars.serverproc[0][d3.select(obj).attr('data-pnum')].name );
			d3.select('.process_tooltip').append('div').style('margin-left','3px').text( HiveplotVars.serverproc[0][d3.select(obj).attr('data-pnum')].uid );
			d3.select('.process_tooltip').append('div').style('margin-left','3px').text('# of open Sockets: '+ HiveplotVars.serverproc[0][d3.select(obj).attr('data-pnum')].detail[0].sockets.length) ;
			d3.select('.process_tooltip').append('div').style('margin-left','3px').text('# of threads: '+ HiveplotVars.serverproc[0][d3.select(obj).attr('data-pnum')].detail[0].threads.length) ;
	$('.process_tooltip').draggable();
/*
			d3.select('.tooltip').append('div').text('# of open Sockets: ' + $('path.link[data-from="' + $(obj).data('uid') + '"]' ).length);
			d3.select('.tooltip').append('div')
						.style('background-color','teal')
						.style('height','24px')
						.style('padding-top','2px')
						.style('padding-left','65px')
						.style('border-radius','5px')
						.style('color','white')
						.text('View Processes')
						.style('margin','5px')*/


	
		
		
	

}
   

function checkProcessMap(processnum){
	/* checkProcessMap was used to create a chart that displayed process data*/
	var ret = 0;

	//console.log(json_data);
	for(server in HiveplotVars.topology.Node){
			
			//console.log("SOCKETS")
			var sockets = eval(HiveplotVars.topology.Node[server].ips);
				//console.log(sockets)
				
				//console.log(HiveplotVars.processes[processnum])
					for (ip in sockets){
							
						for (peer in HiveplotVars.processes[processnum].sockets){
							if (sockets[ip] == HiveplotVars.processes[processnum].sockets[peer]['Peer IP']){
									var row = 'data-row-'+ $('.process_menu_data_wrapper > div').size();	

					d3.select('.process_menu_data_wrapper')
	.append('div')
	.attr('id',row)
	.attr('class','data-row')
	.on('mouseover',
		function(){d3.select(this).style('background-color','white').transition().style('background-color','#00ccff')})
	.on('mouseout',function(){d3.select(this).transition().style('background-color','white')});
					d3.select('#' + row)
						.append('div')
						.attr('class','column_1')
						.attr('data-procnum',function(){return processnum})
						.text(function(){ 
							for (proc in HiveplotVars.serverproc){
							if (HiveplotVars.serverproc[proc].uid == HiveplotVars.processes[processnum].uid){
								return HiveplotVars.serverproc[proc].name}
				
					}})

					d3.select('#' + row)
						.append('div')
						.attr('class','column_2')
						.attr('data-procnum',function(){return processnum})
						.text(function(){ 
							for (proc in HiveplotVars.serverproc[0]){
							if (HiveplotVars.serverproc[0][proc].uid == HiveplotVars.processes[processnum].uid){
								return HiveplotVars.serverproc[0][proc].pid}
				
					}})

					d3.select('#'+ row)
						.append('div')
						.attr('class','column_3')
						.attr('data-procnum',function(){return processnum})
						.text(function(){ 
								return HiveplotVars.topology.Node[server].id;})

					
					d3.select('#' + row)
						.append('div')
						.attr('class','column_4')
						.attr('data-procnum',function(){return processnum})
						.text(function(){ 
								return HiveplotVars.processes[processnum].sockets[peer]['Peer IP'];})

					d3.select('#' + row)
						.append('div')
						.attr('class','column_5')
						.attr('data-procnum',function(){return processnum})
						.text(function(){ 
							return HiveplotVars.processes[processnum].sockets[peer]['Data Received (bytes)'];})
					d3.select('#' + row)
						.append('div')
						.attr('class','column_6')
						.attr('data-procnum',function(){return processnum})
						.text(function(){ 
								return HiveplotVars.processes[processnum].sockets[peer]['Data Sent (bytes)'];})





						
							console.log("SOCKETS")
							console.log(sockets)
							console.log(HiveplotVars.processes[processnum])
							console.log("PEER IP MATCH OPEN NODE")}}
			
		}
	}
	
}





function HandleAjaxProcessCalls(){
HiveplotVars.ajaxcounter++;

if (HiveplotVars.ajaxcounter == HiveplotVars.serverproc[0].length){
$('.Process_popup').fadeOut();
processTopology();
appendProcessesToSidebar();



}
}


function groundsKeepProcess(){
d3.select('.redraw_button').transition().duration(1500).style('background-color','#A4A4A4').style('border-color','#A4A4A4').attr('title','not usable in Process View');
d3.select('#slider').transition().duration(1500).style('background-color','#A4A4A4').attr('title','not usable in Process View');
d3.select('.ui-slider-handle').transition().duration(1500).style('background-color','#A4A4A4').style('border-color','#A4A4A4');

}


function groundsKeepServers(){
d3.select('.redraw_button').transition().duration(1500).style('background-color','white').style('border-color','teal').attr('title','type the name of a server to search');
d3.select('#slider').transition().duration(1500).style('background-color','teal').attr('title','');
d3.select('.ui-slider-handle').transition().duration(1500).style('background-color','white').style('border-color','teal');
d3.select('.Sidebar_scroll_list_wrapper').transition().duration(1500).style('border-color','teal')
}




function UpdateDataAjax(){
ReinitializeHiveplotVars();
console.log('reinitializing data');




}



function Draw_config_menu(){
$('.New_Config_Menu').fadeIn();
$('.X_Axis_config').slideDown();
			if ($('#View_Config').data("loaded") == false){
				console.log("loading in data to DRAGDROP lists");
				d3.selectAll('.Fieldset_Node_List').selectAll('.Node_Options').data(HiveplotVars.topology.Node)
					.enter().append('div').attr('class','Node_Options').attr('id',function(d){return d.id;})
							.text(function(d){return d.id;});
					$('.Node_Options').draggable({
						
						appendTo: '.AxesForm',
						helper:'clone',
						snap:'.Node_Options',
						snapMode: 'outer',
   						//stop: handleDragStop

								});
				$('.droppable_Node_list').droppable({     

					activeClass: "ui-state-default",
     					hoverClass: "ui-state-hover",
    					accept: ":not(.ui-sortable-helper)",
				drop: function( event, ui ) {
					$('.droppable_Node_list').find('#' + ui.draggable.text()).remove();
console.log('remove this server')
	
    					$( "<span></span>" ).text( ui.draggable.text() ).appendTo( this );
					$('.Fieldset_Node_List').find('#' + ui.draggable.text()+'').remove();
					$(this).children().last().attr('id');
				 	$(this).children().last().css('border-width','2px')
						.css('margin','1px')
						.css('padding','4px')
						.css('border-color','teal')
						.css('border-style','solid')
						.css('float','left')
						.attr('id',ui.draggable.text())
						.attr('class', 'selected_node')
						.append('<span class="delete-button"> X </span>');
						
						$('.delete-button').on('click', function(){
						var temp = $(this).parent();
						temp.children().remove();

					      d3.selectAll('.Fieldset_Node_List')
						.append('div')
						.attr('class','Node_Options')
						.attr('id',$(temp).text())
						.text($(temp).text());
					$('.Node_Options').draggable({
						cursor: 'move',
						appendTo: '.AxesForm',
						helper:'clone',
						snap:'.Node_Options',
						snapMode: 'outer',
   						//stop: handleDragStop

								});
								$(temp).remove();})
						
    					 }})
					
							//.on('ondrop', drop(event))
				$('.dropdown_button').data("loaded", true);
					}
			}




