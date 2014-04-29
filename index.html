
var ast;

function draw_graph(){
	var code=document.getElementById("edit_code").value;
	ast=parse(code);
	funcs_obj.reset();
	find_funcs(ast[1]);
	funcs_obj.find_refs();
	make_graph();
	//document.getElementById("code_output").innerHTML = funcs_obj.list_unrefd();
}

function find_funcs(tree){
	if (tree[0]=="defun"){ //function foo(){
		funcs_obj.add(tree[1],tree[1],tree[1],tree[3]);
	}else if (tree[0]=="assign" && tree[3][0]=="function"){ // = function (){
		if (tree[2][0]=="name"){ //foo=function(){
			funcs_obj.add(tree[2][1],tree[2][1],tree[2][1],tree[3][3]);
		}else if (tree[2][0]=="dot"){ //.foo=function(){
			if (tree[2][1][0]=="name"){ //foo.bar=function(){
				funcs_obj.add(tree[2][2],tree[2][1][1]+"."+tree[2][2],tree[2][1][1],tree[3][3]);
			}else if (tree[2][1][0]=="dot" && tree[2][1][1][0]=="name"){//far.bar.foo=function(){
				funcs_obj.add(tree[2][2],tree[2][1][1][1]+"."+tree[2][1][2]+"."+tree[2][2],
																	tree[2][1][1][1],tree[3][3]);
			}
		}
	}else if (tree[0]=="var" && tree[1][0].length>1 && tree[1][0][1][0]=="function"){ //var foo=function(){
		funcs_obj.add(tree[1][0][0],tree[1][0][0],tree[1][0][0],tree[1][0][1][3]);
	}else{
		for (var i=0;i<tree.length;i++){
			if (Array.isArray(tree[i]) && tree[i].length>0){
				find_funcs(tree[i]);
			}
		}
	}
}

var funcs_obj={
	funcs: [],
	count: 0,

	reset: function(){
		this.funcs= [];
		this.count= 0;
	},
	
	add: function(name,display_name,obj_name,func_body){
		this.funcs[this.count]=new funcInfo(name,display_name,obj_name,func_body,this.count);
		this.count++;
	},
	
	get_index: function(name){
		for ( var i=0; i<this.count; i++ ){
			if (name == this.funcs[i].name){
				return i;
			}
		}
		return -1;//not found
	},
	
	find_refs: function(){
		for (var i=0; i<this.count; i++){
			findRefs(i,this.funcs[i].func_body);
		}
	},
	
	pointedByNongraphed: function(index){
		var obj=this.funcs[index].obj_name;
		
		for (var f=0; f<this.count; f++){
			if (this.funcs[f].obj_name == obj){
				if (this.pointedByNongraphed2(f)){
					return true;
				}
			}
		}
		return false;
	},
	
	pointedByNongraphed2: function(index){
		var obj_name=this.funcs[index].obj_name;
		for (var i=0; i<this.funcs[index].referenced_by_count; i++){
			if (this.funcs[index].referenced_by[i] != index){//ignore self-referenced
				if (obj_name != "" && obj_name != this.funcs[this.funcs[index].referenced_by[i]].obj_name ){
					if (!this.funcs[this.funcs[index].referenced_by[i]].graphed){
						return true;
					}
				}
			}
		}
		return false;
	},
	
	pointedByGraphedCount: function(index){
		var count=0;
		for (var i=0; i<this.funcs[index].referenced_by_count; i++){
			if (this.funcs[this.funcs[index].referenced_by[i]].graphed){
				count++;
			}
		}
		return count;
	}
	
};

function findRefs(index,tree){
	if (tree[0]=="name"){ 
		//out+=tree[1]+"; ";
		var ref=funcs_obj.get_index(tree[1]);
		if (ref != -1){
			funcs_obj.funcs[index].add_reference(ref);
			funcs_obj.funcs[ref].add_referenced_by(index);
		}
	}else if (tree[0]=="dot"){
		var ref=funcs_obj.get_index(tree[2]);
		if (ref != -1){
			funcs_obj.funcs[index].add_reference(ref);
			funcs_obj.funcs[ref].add_referenced_by(index);
		}
	}
	for (var i=0;i<tree.length;i++){
		if (Array.isArray(tree[i])){
			findRefs(index,tree[i]);
		}
	}
}

function funcInfo(name, display_name, obj_name, func_body, index){
	this.name=name;
	this.display_name=display_name;
	this.obj_name=obj_name;
	this.func_body=func_body;
	this.references= [];
	this.references_count= 0;
	this.referenced_by= [];
	this.referenced_by_count=0;
	this.index=index;
	this.graphing=false;
	this.graphed=false;
}

funcInfo.prototype.add_reference = function(ref) {
	this.references[this.references_count]=ref;
	this.references_count++;
}

funcInfo.prototype.add_referenced_by = function(index) {
	this.referenced_by[this.referenced_by_count]=index;
	this.referenced_by_count++;
}

function make_graph(){
	levels_count=0;
	var done=false;
	levels_obj.reset();
	
	while (!done){
		done=true;
		var some_found=false;
		levels_obj.create_next();
		for (var i=0; i<funcs_obj.count; i++){
			if (!funcs_obj.funcs[i].graphed){
				done=false;
				if(!funcs_obj.pointedByNongraphed(i)){
					levels_obj.add_func(levels_count,i);
					funcs_obj.funcs[i].graphing=true;
					some_found=true;
				}
			}
		}
		if (!done && !some_found){
			var busy_high=0,busyest=0;
			for (var i=0; i<funcs_obj.count; i++){
				if (!funcs_obj.funcs[i].graphed){
					var busy=funcs_obj.pointedByGraphedCount(i)+funcs_obj.funcs[i].references_count;
					if(busy > busy_high){
						busy_high=busy;
						busyest=i;
					}
				}
			}
			var obj_name=funcs_obj.funcs[busyest].obj_name;
			for (var h=0; h<funcs_obj.count; h++){
				if ( funcs_obj.funcs[h].obj_name == obj_name && !funcs_obj.funcs[h].graphed ){
					//2nd cond. not needed
					levels_obj.add_func(levels_count,h);
					funcs_obj.funcs[h].graphing=true;
				}
			}
		}
		for (var i=0; i<funcs_obj.count; i++){
			funcs_obj.funcs[i].graphed=funcs_obj.funcs[i].graphing;
		}
		levels_count++;
	}
	levels_count--;
	levels_obj.find_height();
	levels_obj.sort_levels();
	var canvas = document.getElementById("graph_canvas");
	var widest=0, w_name="";
	for (var w=0; w<funcs_obj.count; w++){
		if (funcs_obj.funcs[w].display_name.length > widest){
			w_name=funcs_obj.funcs[w].display_name;
			widest=w_name.length;
		}
	}
	//
	var canvas = document.getElementById("graph_canvas");
	var ctx = canvas.getContext("2d");
	ctx.font="14px Sans";
	var xwidth=ctx.measureText(w_name).width+70;
	canvas.width=Math.min( (levels_count)*xwidth , 6000 );
	canvas.height=Math.min( levels_obj.height*40 , 12000 );
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.beginPath();
	ctx.font="14px Sans";
	for (var draw_func=0; draw_func<funcs_obj.count; draw_func++){
		var pos=levels_obj.get_pos(draw_func);
		ctx.fillText(funcs_obj.funcs[draw_func].display_name,pos.x*xwidth+20,pos.y+5);
		for (var a=0; a<funcs_obj.funcs[draw_func].referenced_by_count; a++){
			var from_func=funcs_obj.funcs[draw_func].referenced_by[a];
			var from_pos=levels_obj.get_pos(from_func);
			var name_size=ctx.measureText(funcs_obj.funcs[from_func].display_name).width+30;
			
			canvas_arrow(ctx, from_pos.x*xwidth+name_size, from_pos.y, pos.x*xwidth+15, pos.y);
		}
	}
	ctx.stroke();
}

function canvas_arrow(context, fromx, fromy, tox, toy){
    var avgx=(fromx+tox)/2;
    
    context.moveTo(fromx, fromy);
    if (tox < fromx){
		if (fromy == toy){
			context.bezierCurveTo(fromx+20,fromy,fromx+20,toy-8,fromx,toy-8);
			context.lineTo(tox,toy-8);
			context.bezierCurveTo(tox-20,toy-8,tox-20,toy,tox,toy);
		}else{
			context.bezierCurveTo(Math.max(avgx,fromx+150),fromy,Math.min(avgx,tox-150),toy,tox,toy);
		}
	}else{
		context.bezierCurveTo(Math.max(avgx,fromx+20),fromy,Math.min(avgx,tox-20),toy,tox,toy);
	}
    context.lineTo(tox-7,toy-5);
    context.moveTo(tox, toy);
    context.lineTo(tox-7,toy+5);
}

var levels_obj={
	levels: [],
	levels_count: 0,
	height: 0,
	reset: function(){
		this.levels= [];
		this.levels_count= 0;
		this.height= 0;
	},
	create_next: function(){
		this.levels[this.levels_count]=new level_obj();
		this.levels_count++;
	},
	add_func: function(level,func){
		this.levels[level].funcs[this.levels[level].funcs_count]=func;
		this.levels[level].funcs_count++;
	},
	find_height: function(){
		for (var l=0; l<(this.levels_count-1); l++){
			if ( this.levels[l].funcs_count > this.height ){
				this.height = this.levels[l].funcs_count;
			}
		}
	},
	get_pos: function(func){
		for (var l=0; l<this.levels_count; l++){
			for (var f=0; f<this.levels[l].funcs_count; f++){
				if (this.levels[l].funcs[f] == func){
					var level_y_spacing = this.height / this.levels[l].funcs_count;
					return {x: l, y: (f*level_y_spacing*40+20)};
				}
			}
		}	
	},
	sort_levels: function(){
		for (var l=1; l<this.levels_count; l++){
			var temp= [];
			for (var f=0; f<this.levels[l].funcs_count; f++){
				var ref_by_count=funcs_obj.funcs[this.levels[l].funcs[f]].referenced_by_count;
				var pos_y_total=0;
				var pos_y_count=0;
				for (var r=0; r<ref_by_count; r++){
					var pos= this.get_pos(funcs_obj.funcs[this.levels[l].funcs[f]].referenced_by[r]);
					if (pos.x < l){
						pos_y_total+= pos.y;
						pos_y_count++;
					}
				}
				temp[f]= {func: this.levels[l].funcs[f], ideal_y: pos_y_total/pos_y_count};
			}
			temp.sort( function(a,b) {	if (a.ideal_y < b.ideal_y) {return -1;} else {return 1;} } );
			for (var b=0; b<this.levels[l].funcs_count; b++){
				this.levels[l].funcs[b] = temp[b].func;
			}		
		}
		
	}
}
	
function level_obj(){
	this.funcs = [];
	this.funcs_count = 0;
}

