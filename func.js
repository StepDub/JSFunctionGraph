
var ast;
var scale=1;
var contracted;
var anonymous_count;
//change_scale(1);

function draw(){
	contracted = !document.getElementById('expand_objects').checked;
	var code=document.getElementById("edit_code").value;
	//document.getElementById("debug").innerHTML=" ("+Date().now()+"parsing...)";
	//console.log(" ("+Date().now()+"parsing...)");
	ast=parse(code);
	funcs_obj.reset();
	//document.getElementById("debug").innerHTML+="("+Date.now()+"find functions...)";
	anonymous_count=0;
	find_funcs(ast[1],0);
	var un_found = count_function_defs(ast[1]) - funcs_obj.count;
	if ( un_found >= 1 ){
		document.getElementById("warning").innerHTML="*"+un_found+
														" functions not found - transfered to [Global]*";
	}else{
		document.getElementById("warning").innerHTML="";
	}
	funcs_obj.add("[Global]","[Global]","[Global]",ast);
	//document.getElementById("debug").innerHTML+="("+Date.now()+"find references...)";
	funcs_obj.find_refs();
	//document.getElementById("debug").innerHTML+="("+Date.now()+"arrange graph...)";
	make_graph_data();
	//document.getElementById("debug").innerHTML+="("+Date.now()+"draw graph...)";
	draw_graph(scale);
	//document.getElementById("debug").innerHTML+="("+Date.now()+"done)";
}

function find_funcs(tree){
	if (tree[0]=="defun"){ //function foo(){
		funcs_obj.add(tree[1],tree[1],tree[1],tree[3]);
		tree[3]=null;
		//tree[1]="";
	}else if (tree[0]=="assign" && tree[3][0]=="function" && tree[2][0]=="name"){ // foo=function (){
		funcs_obj.add(tree[2][1],tree[2][1],tree[2][1],tree[3][3]);
		tree[3][3]=null;
		//tree[3][0]=="";
	}else if (tree[0]=="assign" && tree[3][0]=="function" && tree[2][0]=="dot" 
														&& tree[2][1][0]=="name"){ //.foo=function(){
		funcs_obj.add(tree[2][2],tree[2][1][1]+"."+tree[2][2],tree[2][1][1],tree[3][3]);
		tree[3][3]=null;
		//tree[3][0]=="";
	}else if (tree[0]=="assign" && tree[3][0]=="function" && tree[2][0]=="dot" && tree[2][1][0]=="dot" 
													&& tree[2][1][1][0]=="name"){//far.bar.foo=function(){
		funcs_obj.add(tree[2][2],tree[2][1][1][1]+"."+tree[2][1][2]+"."+tree[2][2],	tree[2][1][1][1],
																							tree[3][3]);
		tree[3][3]=null;
		//tree[3][0]=="";
	}else if (tree[0]=="var" && tree[1][0].length>1 && tree[1][0][1][0]=="function"){ //var foo=function(){
		funcs_obj.add(tree[1][0][0],tree[1][0][0],tree[1][0][0],tree[1][0][1][3]);
		tree[1][0][1][3]=null;
	}else if (tree[0]=="var" && tree[1][0].length>1 && tree[1][0][1][0]=="object" ){//search object
		for (var p=0; p<tree[1][0][1][1].length; p++){
			if (tree[1][0][1][1][p][1][0]=="function" ){// foo: function(){
				funcs_obj.add(tree[1][0][1][1][p][0],tree[1][0][0]+"."+tree[1][0][1][1][p][0],
																tree[1][0][0],tree[1][0][1][1][p][1][3]);
				tree[1][0][1][1][p][1][3]=null;
			}
		}
	}else if (tree[0]=="function" && tree[1]==null){ //var foo=function(){
		var name="[Anonymous function "+anonymous_count+"]";
		funcs_obj.add(name,name+get_params_string(tree[2]),name,tree[3]);
		tree[3]=null;
		anonymous_count++;
	}else{
		for (var i=0;i<tree.length;i++){
			if (Array.isArray(tree[i]) && tree[i].length>0){
				find_funcs(tree[i]);
			}
		}
	}
}

function get_params_string(tree){
	var params="(";
	for (var p=0; p<tree.length; p++){
		if (p > 0) { 
			params+=",";
		}
		params+= tree[p];
	}
	return params+")";
}

function count_function_defs(tree){
	var count = 0;
	for (var i=0; i<tree.length; i++){
		if (tree[i] == "defun" || tree[i] == "function"){
			count++;
		}else if (Array.isArray(tree[i]) && tree[i].length>0){
			count+=count_function_defs(tree[i]);
		}
	}
	return count;
}

var funcs_obj={
	funcs: [],
	count: 0,

	reset: function(){
		this.funcs= [];
		this.count= 0;
	},
	
	add: function(name,display_name,obj_name,func_body){
		//var match=this.get_obj_index(obj_name);
		//if (match == -1){
		this.funcs[this.count]=new funcInfo(name,display_name,obj_name,func_body);
		this.count++;
	},
	
	/*get_obj_index: function(name){
		for (var i=0; i<this.count; i++){
			if (name==this.funcs.obj_name){
				return i;
			}
		}
		return -1;
	},*/
	
	get_widest: function(){
		var widest=0, w_name="";
		for (var w=0; w<this.count; w++){
			if (this.funcs[w].display_name.length > widest){
				w_name=this.funcs[w].display_name;
				widest=w_name.length;
			}
		}
		return w_name;
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
			if (Array.isArray(this.funcs[i].func_body)){
				findRefs(i,this.funcs[i].func_body);
			}
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
	if (tree[0]=="call" && tree[1][0]=="name"){ 
		//out+=tree[1]+"; ";
		var ref=funcs_obj.get_index(tree[1][1]);
		if (ref != -1){
			funcs_obj.funcs[index].add_reference(ref);
			funcs_obj.funcs[ref].add_referenced_by(index);
		}
	}else if (tree[0]=="call" && tree[1][0]=="dot"){
		var ref=funcs_obj.get_index(tree[1][2]);
		if (ref != -1){
			funcs_obj.funcs[index].add_reference(ref);
			funcs_obj.funcs[ref].add_referenced_by(index);
		}
	}else if(tree[0]=="new" && tree[1][0]=="name"){
		var ref=funcs_obj.get_index(tree[1][1]);
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

function funcInfo(name, display_name, obj_name, func_body){
	this.name=name;
	this.display_name=display_name;
	this.obj_name=obj_name;
	this.func_body=func_body;
	this.references= [];
	this.references_count= 0;
	this.referenced_by= [];
	this.referenced_by_count=0;
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

function make_graph_data(){
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
}

function draw_graph(scale){
	//
	var canvas = document.getElementById("graph_canvas");
	var ctx = canvas.getContext("2d");
	ctx.font="14px Sans";
	var xwidth=ctx.measureText(funcs_obj.get_widest()).width+70;
	canvas.width=Math.min( (levels_obj.levels_count-1)*xwidth*scale , 16000 );
	canvas.height=Math.min( (levels_obj.height+1)*40*scale , 16000 );
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.scale(scale,scale);
	ctx.beginPath();
	ctx.strokeStyle = "rgb(180,180,180)";
	ctx.font="14px Sans";
	for (var draw_func=0; draw_func<funcs_obj.count; draw_func++){
		var pos=levels_obj.get_pos(draw_func);
		for (var a=0; a<funcs_obj.funcs[draw_func].referenced_by_count; a++){
			var from_func=funcs_obj.funcs[draw_func].referenced_by[a];
			var from_pos=levels_obj.get_pos(from_func);
			var name_size;
			if (contracted_objs.is_contracted(funcs_obj.funcs[from_func].obj_name)){
				name_size=ctx.measureText(funcs_obj.funcs[from_func].obj_name+" [Obj]").width+30;
			}else{
				name_size=ctx.measureText(funcs_obj.funcs[from_func].display_name).width+30;
			}
			canvas_arrow(ctx, from_pos.x*xwidth+name_size, from_pos.y, pos.x*xwidth+15, pos.y);
		}
	}
	ctx.stroke();
	//document.getElementById("debug").innerHTML+="("+Date.now()+"draw text...)";
	ctx.beginPath();
	//ctx.miterLimit = 2;
	////ctx.lineJoin = 'circle';
	//ctx.strokeStyle = "White";//'rgb(200,200,200)';
	for (var draw_func=0; draw_func<funcs_obj.count; draw_func++){
		var pos=levels_obj.get_pos(draw_func);
		var name;
		if (contracted_objs.is_contracted(funcs_obj.funcs[draw_func].obj_name)){
			name=funcs_obj.funcs[draw_func].obj_name+" [Obj]";
		}else{
			name=funcs_obj.funcs[draw_func].display_name;
		}
		var x=pos.x*xwidth+20, y=pos.y+5;
		//ctx.lineWidth = 7;
		//ctx.strokeText(name, x, y);
		ctx.lineWidth = 1;
		ctx.fillText(name, x, y);
	}
	//ctx.stroke();
}

function canvas_arrow(context, fromx, fromy, tox, toy){
    var avgx=(fromx+tox)/2;
    var loop_size=12;
    
    context.moveTo(fromx, fromy);
    if (tox < fromx){
		if (fromy == toy){
			context.bezierCurveTo(fromx+20,fromy,fromx+20,toy-loop_size,fromx,toy-loop_size);
			context.lineTo(tox,toy-loop_size);
			context.bezierCurveTo(tox-20,toy-loop_size,tox-20,toy,tox,toy);
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
		if (!contracted_objs.is_contracted(funcs_obj.funcs[func].obj_name)){
			for (var l=0; l<this.levels_count; l++){
				for (var f=0; f<this.levels[l].funcs_count; f++){
					if (this.levels[l].funcs[f] == func){
						var level_y_spacing = this.height / this.levels[l].funcs_count;
						return {x: l, y: (f*level_y_spacing*40+level_y_spacing*20+20)};
					}
				}
			}
		}else{
			for (var l=0; l<this.levels_count; l++){
				var keep_f;
				var matches=0;
				for (var f=0; f<this.levels[l].funcs_count; f++){
					if (funcs_obj.funcs[this.levels[l].funcs[f]].obj_name == funcs_obj.funcs[func].obj_name){
						matches++;
						keep_f=f;
					}
				}
				if (matches == 1){
					var level_y_spacing = this.height / this.levels[l].funcs_count;
					return {x: l, y: (keep_f*level_y_spacing*40+level_y_spacing*20+20)};
				}else if (matches > 1){
					var match_to_use=Math.floor( (matches+1) / 2 );
					var matches2=0;
					for (var f=0; f<this.levels[l].funcs_count; f++){
						if (funcs_obj.funcs[this.levels[l].funcs[f]].obj_name == 
																	funcs_obj.funcs[func].obj_name){
							matches2++;
							if (matches2 == match_to_use){
								var level_y_spacing = this.height / this.levels[l].funcs_count;
								return {x: l, y: (f*level_y_spacing*40+level_y_spacing*20+20)};
							}
						}
					} 
				}
						
				
			}
		}	
	},
	sort_levels: function(){
		for (var l=1; l<this.levels_count; l++){
			this.sort_level_br(l);	
		}
		for (var l=0; l<this.levels_count; l++){
			this.sort_level_all(l);	
		}
		for (var l=0; l<this.levels_count; l++){
			this.sort_level_all(l);	
		}
	},
	sort_level_br: function(lev){
		var temp= [];
		for (var f=0; f<this.levels[lev].funcs_count; f++){
			var ref_by_count=funcs_obj.funcs[this.levels[lev].funcs[f]].referenced_by_count;
			var pos_y_total=0;
			var pos_y_count=0;
			for (var r=0; r<ref_by_count; r++){
				var pos= this.get_pos(funcs_obj.funcs[this.levels[lev].funcs[f]].referenced_by[r]);
				if (pos.x < lev){
					pos_y_total+= pos.y;
					pos_y_count++;
				}
			}
			if ( pos_y_count > 0 ){
				ideal_y=pos_y_total/pos_y_count;
			}else{
				ideal_y=this.get_pos(this.levels[lev].funcs[f]).y;
			}
			temp[f]= {func: this.levels[lev].funcs[f], ideal_y: ideal_y};
		}
		temp.sort( function(a,b) {	if (a.ideal_y < b.ideal_y) {return -1;} else {return 1;} } );
		for (var b=0; b<this.levels[lev].funcs_count; b++){
			this.levels[lev].funcs[b] = temp[b].func;
		}	
	},
	sort_level_all: function(lev){
		var temp= [];
		for (var f=0; f<this.levels[lev].funcs_count; f++){
			var pos_y_total=0, pos_y_count=0;
			for (var r=0; r<funcs_obj.funcs[this.levels[lev].funcs[f]].referenced_by_count; r++){
				pos_y_total+=this.get_pos(funcs_obj.funcs[this.levels[lev].funcs[f]].referenced_by[r]).y;
				pos_y_count++;
			}
			for (var r=0; r<funcs_obj.funcs[this.levels[lev].funcs[f]].references_count; r++){
				pos_y_total+=this.get_pos(funcs_obj.funcs[this.levels[lev].funcs[f]].references[r]).y;
				pos_y_count++;
			}
			var ideal_y;
			if ( pos_y_count > 0 ){
				ideal_y=pos_y_total/pos_y_count;
			}else{
				ideal_y=this.get_pos(this.levels[lev].funcs[f]).y;
			}
			temp[f]= {func: this.levels[lev].funcs[f], ideal_y: ideal_y};
		}
		temp.sort( function(a,b) {	if (a.ideal_y < b.ideal_y) {return -1;} else {return 1;} } );
		for (var b=0; b<this.levels[lev].funcs_count; b++){
			this.levels[lev].funcs[b] = temp[b].func;
		}	
	}
}
	
function level_obj(){
	this.funcs = [];
	this.funcs_count = 0;
}

var contracted_objs={
	name: [],
	count: 0,
	
	is_contracted: function(name){
		if (contracted){
			var count_matches=0;
			for (var i=0; i<funcs_obj.count; i++){
				if (name == funcs_obj.funcs[i].obj_name){
					count_matches++;
					if (count_matches > 1){
						return true;
					}
				}
			}
			return false;
			/*for (var i=0; i<this.count; i++){
				if (this.name[i]==name){
					return true;
				}
			}
			return false;*/
		}else{
			return false;
		}
	},
	
	add_contracted: function(){
		if (!this.is_contracted(name)){
			this.name[this.count]=name;
			this.count++;
		}
	
	}
	
}

function two_dec(n){  return Math.round(n*100)/100;  }

function change_scale(factor){
	scale*=factor;
	document.getElementById("display_scale").innerHTML=two_dec(scale);
}
