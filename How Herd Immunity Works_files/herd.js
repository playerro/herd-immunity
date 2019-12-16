var width = 500,
    height = 500,
	sliderwidth =500,
	sliderheight = 100,
	buttonwidth =500,
	buttonheight =100,
	plotswidth =100,
	plotsheight =100,
	pieradius = 48,
	personscale=0.06,
	N= 300,
	N_max=300,
	simulation_on=false,
	gostate = 0,
	radius = 10,
	initially_infected=0.1,
	gamma = .3 / N,
	beta = 1 / N,
	P = 0.;
	
	speed = 5;
	gamma = gamma*speed;
	beta = beta*speed;
	
	R0_min=2.0;
	R0_max=25.0;
	R0_start=6;
	alpha = (gamma+beta)*R0_start / 6;
	

	
var classes = [
	{label:"Подверженные",state:"S"},
	{label:"Зараженные",state:"I"},
	{label:"Переболевшие",state:"R"},
	{label:"Вакцинированные",state:"V"}
		
]

r0sliderlabel = {english:"Основной коэффициент размножения"}
r0sliderlimit = {english:["низкий","высокий"]}
vsliderlabel = {english:"Процент вакцинации"}

statecolors=[];
classes.forEach(function(d){statecolors.push(d.color)});


	var X=d3.scale.linear().range([0, width]);
	var Y=d3.scale.linear().range([0, height]);
//	var color=d3.scale.ordinal().domain(["S","I","R","V"]).range(statecolors)
		
	var nodes = d3.range(N).map(function(d,i) { return {
		radius:radius, 
		x: X(Math.random()), y:Y(Math.random()),
		state: Math.random() < initially_infected ? "I" : "S",
		id:i}
	});
	


var arc = d3.svg.arc()
    .outerRadius(pieradius - 10)
    .innerRadius(0);

var labelArc = d3.svg.arc()
    .outerRadius(pieradius - 20)
    .innerRadius(pieradius + 20);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });		
	
var force = d3.layout.force()
    .gravity(0.025)
    .charge(-2)
	.friction(0.8)

    .nodes(nodes,function(d){return d.id})
    .size([width, height]);



var svg = d3.select("#container").append("svg").attr("class",".animation")
    .attr("width", width)
    .attr("height", height);

	var man1 = "M53.5,476c0,14,6.833,21,20.5,21s20.5-7,20.5-21V287h21v189c0,14,6.834,21,20.5,21   c13.667,0,20.5-7,20.5-21V154h10v116c0,7.334,2.5,12.667,7.5,16s10.167,3.333,15.5,0s8-8.667,8-16V145c0-13.334-4.5-23.667-13.5-31   s-21.5-11-37.5-11h-82c-15.333,0-27.833,3.333-37.5,10s-14.5,17-14.5,31v133c0,6,2.667,10.333,8,13s10.5,2.667,15.5,0s7.5-7,7.5-13   V154h10V476z";
	var man2 ="M61.5,42.5c0,11.667,4.167,21.667,12.5,30S92.333,85,104,85s21.667-4.167,30-12.5S146.5,54,146.5,42   c0-11.335-4.167-21.168-12.5-29.5C125.667,4.167,115.667,0,104,0S82.333,4.167,74,12.5S61.5,30.833,61.5,42.5z" 


 		
var gront = svg.selectAll(".legenditem").data(classes).enter().append("g")
	.attr("transform",function(d,i)
		{return "translate("+(50+i*(width)/classes.length)+","+(height-20)+")"})
	.attr("class","legenditem");
	
	gront.append("circle").attr("class",function(d){return d.state})
	.attr("r","5px").style("stroke-width","1px")
	.style("stroke","black")
	
	gront.append("text")
	.attr("transform","translate(15,6)").text(function(d){return lang=="english" ? d.label : d.label}).style("opacity",1);

var r0slider = d3.select("#container").append("svg").attr("class",".r0slider")
    .attr("width", sliderwidth)
    .attr("height", sliderheight);

r0slider.append("text").text(vsliderlabel[lang])
	.attr("transform","translate("+sliderwidth/2+",20)")
	.style("text-anchor","middle").attr("class","sliderlabel")	

var vslider = d3.select("#container").append("svg").attr("class",".vslider")
    .attr("width", sliderwidth)
    .attr("height", sliderheight);

var plots = svg.append("g").attr("class",".plots")
	.attr("transform","translate("+(width-pieradius-5)+","+(pieradius+5)+")")
	;
	

vslider.append("text").text(r0sliderlabel[lang])
	.attr("transform","translate("+sliderwidth/2+",20)")
	.style("text-anchor","middle").attr("class","sliderlabel")		

// start stop button
	
var ssb = d3.select("#container").append("svg").attr("class",".ssb")
    .attr("width", buttonwidth)
    .attr("height", buttonheight);

var startstopbutton = ssb.append("g")
		.attr("transform",function(d){return "translate("+buttonwidth/4+","+ buttonheight/2+ ")"});

startstopbutton.append("circle").attr("r",buttonheight/2).attr("class","buttonring")

	.on("mousedown", function() {
		gostate ? stopsim() : startsim();
	})
	.on("mouseover",function(){
		startstopbutton.selectAll(".buttonring").style("stroke","darkred").style("stroke-width","4px")
	})
	.on("mouseout",function(){
		startstopbutton.selectAll(".buttonring").style("stroke",null).style("stroke-width",null)
	})
	startstopbutton.append("circle")
		.attr("class","playbutton")
		.attr("r",buttonheight/2-4)

		
	
	startstopbutton.append('g')
	.attr("transform","translate(0,"+( 5)+")")
		.append("text").attr("class","playbuttonlabel")
		.text("Старт").style("text-anchor","middle")
		.style("fill","black")

// reset button
	
var resetbutton = ssb.append("g")
		.attr("transform",function(d){return "translate("+3*buttonwidth/4+","+ buttonheight/2+ ")"});

resetbutton.append("circle").attr("r",buttonheight/2).attr("class","buttonring")

	.on("mousedown", function() {
		resetsim();
		d3.selectAll(".resetbutton").transition().duration(500)
		.style("fill","blue").transition().duration(500).style("fill","white")
	})
	.on("mouseover",function(){
		resetbutton.selectAll(".buttonring").style("stroke","darkblue").style("stroke-width","4px")
	})
	.on("mouseout",function(){
		resetbutton.selectAll(".buttonring").style("stroke",null).style("stroke-width",null)
	})
	resetbutton.append("circle")
		.attr("class","resetbutton")
		.attr("r",buttonheight/2-4)

		
	
	resetbutton.append('g')
	.attr("transform","translate(0,"+( 5)+")")
		.append("text").attr("class","playbuttonlabel")
		.text("Сброс").style("text-anchor","middle")
		.style("fill","black")

// V slider
	
var Qscale = d3.scale.linear()
    .domain([0, 100])
	    .range([0, 0.8*sliderwidth])
    .clamp(true);

var Qbrush = d3.svg.brush()
    .x(Qscale)
    .extent([0, 0])
    .on("brush", Qbrushed);
	
var Q_axis = d3.svg.axis()
      .scale(Qscale)
      .orient("bottom")
      .tickFormat(function(d) { return d3.round(d,3)+"%"; })
      .tickSize(0)
      .tickPadding(15)

var Qaxis = r0slider.append("g")
	.attr("transform","translate("+(sliderwidth*0.1)+","+ sliderheight/2+ ")")
    .attr("class", "x axis")
    .call(Q_axis)
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
     .attr("class", "halo");

var Qslider = r0slider.append("g")
	 .attr("transform",function(d){return "translate("+(sliderwidth*0.1)+","+ sliderheight/2+ ")"})
    .attr("class", "slider")
    .call(Qbrush);

Qslider.selectAll(".extent,.resize").remove();

Qslider.select(".background")
    .attr("height", sliderheight)
	.attr("transform", "translate(0," + ( -sliderheight/2) + ")");

var Qhandle = Qslider.append("circle")
    .attr("class", "handle")
    .attr("r", 9);

var Qtag = Qslider.append("text").text("hello")
		.attr("transform","translate(0,-15)").style("text-anchor","middle")
		.attr("class","tag")


Qslider
    .call(Qbrush.event)
    .transition() // gratuitous intro!
    .duration(750)
    .call(Qbrush.extent([0, 0]))
    .call(Qbrush.event);
	


// R0 slider
	
var Rscale = d3.scale.linear()
    .domain([R0_min, R0_max])
	    .range([0, 0.8*sliderwidth])
    .clamp(true);

var Rbrush = d3.svg.brush()
    .x(Rscale)
    .extent([0, 0])
    .on("brush", Rbrushed);
	
var R_axis = d3.svg.axis()
      .scale(Rscale)
      .orient("bottom")
	  .tickValues([R0_min,R0_max])
      .tickFormat(function(d) { return d<5 ? r0sliderlimit[lang][0] : r0sliderlimit[lang][1] })
      .tickSize(0)
      .tickPadding(10)

var Raxis = vslider.append("g")
	.attr("transform","translate("+(sliderwidth*0.1)+","+ sliderheight/2+ ")")
    .attr("class", "x axis")
    .call(R_axis)
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
     .attr("class", "halo");

var Rslider = vslider.append("g")
	 .attr("transform",function(d){return "translate("+(sliderwidth*0.1)+","+ sliderheight/2+ ")"})
    .attr("class", "slider")
    .call(Rbrush);

Rslider.selectAll(".extent,.resize").remove();

Rslider.select(".background")
    .attr("height", sliderheight)
	.attr("transform", "translate(0," + ( -sliderheight/2) + ")");

var Rhandle = Rslider.append("circle")
    .attr("class", "handle")
    .attr("r", 9);

//var Rtag = Rslider.append("text").text("hello")
//		.attr("transform","translate(0,-15)").style("text-anchor","middle")
//		.attr("class","tag")


Rslider
    .call(Rbrush.event)
    .transition() // gratuitous intro!
    .duration(750)
    .call(Rbrush.extent([R0_start, R0_start]))
    .call(Rbrush.event);
	
		
// here come the nodes
	
	var node = svg.selectAll(".node").data(nodes).enter().append("g")
		.attr("class","node")
		.call(force.drag);
		
	
		var person  = node.append("g").attr("class","person");
		
		person.append("path").attr("class",function(d){return "man " + d.state})
			.attr("d",man1)
			.attr("transform","translate(-10,0)scale(0.0)")

		
		person.append("path").attr("class",function(d){return "man " + d.state})
			.attr("d",man2)	.style("stroke-width","1px")
			.attr("transform","translate(-10,0)scale(0.0)")
		
	
	svg.selectAll(".man").transition().duration(1000)
		.attr("transform","translate(-5.5,-12)scale("+personscale+")").style("stroke-width",""+0.5/personscale+"px")
			
force.start();

//график
var pheight = 500,
    pwidth = 500,
    pmargin=30,
    suspiciousData = [
        {x: 0, y: 0}
    ],
    infectedData = [
        {x: 0, y: 0}
    ],
	recoveredData = [
        {x: 0, y: 0}
    ],
	vaccinatedData = [
        {x: 0, y: 0}
    ],
    data=[];
    data2=[];
    data3=[];
    data4=[];

// создание объекта svg
var plot = d3.select("#plot").append("svg")
    .attr("class", "axis")
    .attr("width", pwidth)
    .attr("height", pheight);

// длина оси X= ширина контейнера svg - отступ слева и справа
var xAxisLength = pwidth - 2 * pmargin;

// длина оси Y = высота контейнера svg - отступ сверху и снизу
var yAxisLength = pheight - 2 * pmargin;

// функция интерполяции значений на ось Х
var xDomain = [0, 100];
var scaleX = d3.scale.linear()
    .domain(xDomain)
    .range([0, xAxisLength]);

// функция интерполяции значений на ось Y
var scaleY = d3.scale.linear()
    .domain([100, 0])
    .range([0, yAxisLength]);


// создаем ось X
var xAxis = d3.svg.axis()
    .scale(scaleX)
    .orient("bottom");
// создаем ось Y
var yAxis = d3.svg.axis()
    .scale(scaleY)
    .orient("left");

// отрисовка оси Х
plot.append("g")
    .attr("class", "x-axis")
    .attr("transform",  // сдвиг оси вниз и вправо
        "translate(" + pmargin + "," + (pheight - pmargin) + ")")
    .call(xAxis);

// отрисовка оси Y
plot.append("g")
    .attr("class", "y-axis")
    .attr("transform", // сдвиг оси вниз и вправо на margin
        "translate(" + pmargin + "," + pmargin + ")")
    .call(yAxis);

// создаем набор вертикальных линий для сетки
d3.selectAll("g.x-axis g.tick")
    .append("line")
    .classed("grid-line", true)
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", - (yAxisLength));

// рисуем горизонтальные линии координатной сетки
d3.selectAll("g.y-axis g.tick")
    .append("line")
    .classed("grid-line", true)
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", xAxisLength)
    .attr("y2", 0);

// функция, создающая по массиву точек линии
var line = d3.svg.line()
    .x(function(d){return d.x;})
    .y(function(d){return d.y;});

histo();

//диаграмма
var pchart = plots.selectAll(".arc")
      .data(pie(classes))
    .enter().append("g")
      .attr("class", "arc");

var pieces = pchart.append("path").attr("class",function(d){return d.data.state})
      .attr("d", arc)
  //    .style("fill", function(d) { return color(d.data.state); })
	  .each(function(d) { this._current = d; });

var pielabels =  pchart.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { return d.data.count; });	  

force.on("tick", function(e) {
  var q = d3.geom.quadtree(nodes),
      i = 0,
      n = nodes.length;

  while (++i < n) q.visit(collide(nodes[i]));

  svg.selectAll(".node")
      .attr("transform", function(d) { return "translate("+d.x+","+d.y+")" });

});


function resetsim(){
	nodes.forEach(function(d){
		d.state = Math.random() < initially_infected ? "I" : "S";
	});
	d3.selectAll(".man").attr("class",function(d){return "man "+ d.state})
	histo();
	
	pieces.data(pie(classes));

	pieces.transition().duration(0).attrTween("d", arcTween).attr("class",function(d){return d.data.state})
//	      .style("cl", function(d) { return color(d.data.state); });

	pielabels.data(pie(classes)) 
	      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
	      .attr("dy", ".35em")
	      .text(function(d) { return d.data.count; })
		  .style("opacity",function(d) { return d.data.count > 5 ? 1 : 0; });

	//график
	suspiciousData = [{x: 0, y: 0}];
	infectedData = [{x: 0, y: 0}];
	recoveredData = [{x: 0, y: 0}];
	vaccinatedData = [{x: 0, y: 0}];
	xDomain = [0, 100];
	histo();
}

function startsim(){
	gostate = true;
	force.gravity(0.0125).friction(0.3);
	state=setInterval(runsim,100);
	
	d3.select(".playbutton").transition().style("fill","red");
		d3.select(".playbuttonlabel").text("Стоп");

}

function histo(){
	classes.forEach(function(gr){
		gr.count=nodes.filter(function(d){return d.state==gr.state}).length;
		gr.state === 'S'?suspiciousData.push({x: suspiciousData[suspiciousData.length - 1].x + 5, y: Math.ceil(gr.count/nodes.length*100)}):null;
		gr.state === 'I'?infectedData.push({x: infectedData[infectedData.length - 1].x + 5, y: Math.ceil(gr.count/nodes.length*100)}):null;
		gr.state === 'R'?recoveredData.push({x: recoveredData[recoveredData.length - 1].x + 5, y: Math.ceil(gr.count/nodes.length*100)}):null;
		gr.state === 'V'?vaccinatedData.push({x: vaccinatedData[vaccinatedData.length - 1].x + 5, y: Math.ceil(gr.count/nodes.length*100)}):null;
	});

    // масштабирование реальных данных в данные для нашей координатной системы
	data=[];
	data2=[];
	data3=[];
	data4=[];
    for(i=0; i<suspiciousData.length; i++) {
        data.push({x: scaleX(suspiciousData[i].x)+pmargin, y: scaleY(suspiciousData[i].y) + pmargin});
    }
    for(i=0; i<infectedData.length; i++) {
		data2.push({x: scaleX(infectedData[i].x)+pmargin, y: scaleY(infectedData[i].y) + pmargin});
    }
    for(i=0; i<recoveredData.length; i++) {
		data3.push({x: scaleX(recoveredData[i].x)+pmargin, y: scaleY(recoveredData[i].y) + pmargin});
    }
    for(i=0; i<vaccinatedData.length; i++) {
		data4.push({x: scaleX(vaccinatedData[i].x)+pmargin, y: scaleY(vaccinatedData[i].y) + pmargin});
    }
	// обновляем ось X
	plot.selectAll("g.x-axis").remove();
    [suspiciousData,infectedData, recoveredData, vaccinatedData].forEach((data)=> {
    	if (data[data.length - 1].x > xDomain[1]-20) {
			xDomain[1] = data[data.length - 1].x + 20;
		}
	});
	scaleX = d3.scale.linear()
		.domain(xDomain)
		.range([0, xAxisLength]);
	xAxis = d3.svg.axis()
		.scale(scaleX)
		.orient("bottom");
	// отрисовка оси Х
	plot.append("g")
		.attr("class", "x-axis")
		.attr("transform",  // сдвиг оси вниз и вправо
			"translate(" + pmargin + "," + (pheight - pmargin) + ")")
		.call(xAxis);
	// создаем набор вертикальных линий для сетки
	d3.selectAll("g.x-axis g.tick")
		.append("line")
		.classed("grid-line", true)
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", - (yAxisLength));

    //удаляем старый путь
	plot.selectAll("g:not(.y-axis):not(.x-axis):not(.tick)").remove();
    // добавляем путь
    plot.append("g").append("path")
        .attr("d", line(data))
        .style("stroke", "steelblue")
        .style("stroke-width", 2);
    plot.append("g").append("path")
        .attr("d", line(data2))
        .style("stroke", "red")
        .style("stroke-width", 2);
    plot.append("g").append("path")
        .attr("d", line(data3))
        .style("stroke", "slategray")
        .style("stroke-width", 2);
    plot.append("g").append("path")
        .attr("d", line(data4))
        .style("stroke", "lime")
        .style("stroke-width", 2);

}

function stopsim(){
	clearInterval(state);
		gostate = false;
		d3.select(".playbutton").transition().style("fill",null);
		d3.select(".playbuttonlabel").text("Start");
}

function runsim(){
	
	var N = nodes.length; 
	index = Array.apply(null, {length: N}).map(Number.call, Number);
	d3.shuffle(index);
	
	var q = d3.geom.quadtree(nodes),
    	i = 0,
    	n = nodes.length;

		while (++i < n) {
			var k = index[i];
			if (nodes[k].state=="I") {
				if(Math.random() < beta) {nodes[k].state="R"} ;
				q.visit(infect(nodes[k]))
			}
		};
		
		nb=birth();
		death(nb);

	svg.selectAll(".man").attr("class",function(d){return "man " + d.state})
		//.style("fill",function(d){return color(d.state)})
		
	histo();
	
	pieces.data(pie(classes));
	pieces.transition().duration(200).attrTween("d", arcTween)
	      .style("class", function(d) { return d.data.state; });

	pielabels.data(pie(classes)) 
	      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
	      .attr("dy", ".35em")
	      .text(function(d) { return d.data.count; })
		  .style("opacity",function(d) { return d.data.count > 5 ? 1 : 0; });	  
	
	force.start();
	
	if (nodes.filter(function(d){return d.state=="I"}).length==0) {

		stopsim();
	};
}

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

function recovery(){
	N=nodes.length;
	infecteds = nodes.filter(function(d){return d.state=="I"});
	NI=infecteds.length;
	if(NI>0){
	var ix = Math.floor(Math.random()*NI);
	if(Math.random() < beta) {infecteds[ix].state="R"} ;
	}
}

function birth(){

	var N = nodes.length;
	var babies = [];
	
	nodes.forEach(function(d){
		if (Math.random() < gamma) {
		babies.push({x: d.x + d.radius * Math.sin(2*Math.PI *Math.random() )  , 
			y: d.y + d.radius * Math.cos(2*Math.PI *Math.random() ) , 
			radius: radius, state: Math.random() < P ? "V" : "S"});
		}
	})
	var nb = babies.length
	nodes=nodes.concat(babies);
	force.nodes(nodes);	

	node = svg.selectAll(".node").data(nodes,function(d){return d.index})

	var knoedel = node.enter().append("g").attr("class","node").call(force.drag);
	
	var person  = knoedel.append("g").attr("class","person");
	
	person.append("path").attr("class","man")
		.attr("d",man1)
		.attr("transform","translate(-10,0)scale(0.0)")
	//	.style("fill",function(d){return color(d.state)})
	
	person.append("path").attr("class","man")
		.attr("d",man2)	.style("stroke-width","1px")
		.attr("transform","translate(-10,0)scale(0.0)")
	//	.style("fill",function(d){return color(d.state)})
	

	person.selectAll(".man").transition().duration(100)
		.attr("transform","translate(-5.5,-12)scale("+personscale+")").style("stroke-width",""+0.5/personscale+"px")
	
	
	return nb;
}

function death(nb){
	var N = nodes.length;	
	var horst = Array.apply(null, {length: N}).map(Number.call, Number);
	d3.shuffle(horst);
	nodes.forEach(function(d){d.die=false});
	for(i=0;i<nb;i++){
		nodes[horst[i]].die=true;
	}
	
	//var poeter = svg.selectAll(".node").data(nodes);
	//poeter.filter(function(d){return d.die}).transition().duration(1000).style("fill","yellow").remove();
	
	nodes=nodes.filter(function(d){return !d.die})
	var bronk = svg.selectAll(".node").data(nodes,function(d){return d.index});
	var broedel = bronk.exit();
	broedel.selectAll(".man").transition().duration(100).attr("transform","scale(0)")
	.each("end",function(){broedel.transition().duration(100).remove()}
	)
	

	force.nodes(nodes);
	force.start();
	
	
}

function infect(node) {
  var r = node.radius + 100,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = 3*node.radius;
      if (l < r && Math.random()<alpha && quad.point.state=="S") {
		  quad.point.state="I";

      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

function collide(node) {
  var r = node.radius + 100,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / r * 0.5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

function Qbrushed() {
  var value = Qbrush.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value = Qscale.invert(d3.mouse(this)[0]);
    Qbrush.extent([value, value]);
  }

  Qhandle.attr("cx", Qscale(value));
  Qtag.attr("x",Qscale(value)).text("V = "+d3.round(value,3)+"%")
  P=value/100;
	  
}

function Rbrushed() {
  var value = Rbrush.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value = Rscale.invert(d3.mouse(this)[0]);
    Rbrush.extent([value, value]);
  }

  Rhandle.attr("cx", Rscale(value));
 // Rtag.attr("x",Rscale(value)).text("transmission rate = "+d3.round(value,3)+"%")
  alpha=(gamma+beta)*value / 6 ;
	  
}



