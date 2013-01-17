(function (window)
{
	/** Creates a menu with the names of the materials */
	function ObjectLibrary (width_px, height_px, shape_width_px, shape_height_px, shape_dx, shape_dy)
	{
		this.initialize(width_px, height_px, shape_width_px, shape_height_px, shape_dx, shape_dy);
	}
	var p = ObjectLibrary.prototype = new createjs.Container();
	p.Container_initialize = ObjectLibrary.prototype.initialize;
	p.Container_tick = p._tick;
	p.TEXT_COLOR = "rgba(0,0,0,1.0)";
	p.BACKGROUND_COLOR = "rgba(255,245,245,1.0)";
	p.FLOOR_COLOR = "rgba(200,145,145,1.0)";
	p.BACK_COLOR = "rgba(100,45,45,1.0)";
	p.PLACE_ON_GROUND = true;
	
	p.initialize = function(width_px, height_px, shape_width_px, shape_height_px, shape_dx, shape_dy)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
		this.shape_width_px = shape_width_px;
		this.shape_height_px = shape_height_px;
		this.shape_dx = shape_dx;
		this.shape_dy = shape_dy;
		//background
		this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(this.g);
		this.addChild(this.shape);

		// text
		this.title = new createjs.Text("Model \nLibrary", "20px Arial", this.TEXT_COLOR);
		this.title.x = 20;
		this.title.y = 20;
		this.addChild(this.title);
		
	
		this.g.beginFill(this.BACKGROUND_COLOR);
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();

		this.shapes = new Array();
		this.num_rows = Math.floor((this.height_px)/shape_height_px)
		this.num_cols = Math.floor((this.width_px)/shape_width_px);
		this.MAX_OBJECTS_IN_LIBRARY = Math.min(this.num_rows * this.num_cols -1, GLOBAL_PARAMETERS.MAX_OBJECTS_IN_LIBRARY);

		this.g.beginStroke("rgba(100,100,100,1.0)");
		this.g.beginFill(this.FLOOR_COLOR);
		for (var i = 0; i < this.num_rows; i++){
			for (var j = 0; j < this.num_cols; j++){
				if (!(i==0&&j==0)){
					this.g.moveTo(shape_width_px*j, shape_height_px*(i+1));
					this.g.lineTo(shape_width_px*(j+1), shape_height_px*(i+1));
					this.g.lineTo(shape_width_px*(j+1)+shape_dx, shape_height_px*(i+1)-shape_dy);
					this.g.lineTo(shape_width_px*(j)+shape_dx, shape_height_px*(i+1)-shape_dy);
					this.g.lineTo(shape_width_px*j, shape_height_px*(i+1));
				}
			}	
		}
		this.g.beginStroke("rgba(100,100,100,1.0)");
		this.g.beginFill(this.BACK_COLOR);
		for (var i = 0; i < this.num_rows; i++){
			for (var j = 0; j < this.num_cols; j++){
				if (!(i==0&&j==0)){
					this.g.moveTo(shape_width_px*(j+1)+shape_dx, shape_height_px*(i+1)-shape_dy);
					this.g.lineTo(shape_width_px*(j)+shape_dx, shape_height_px*(i+1)-shape_dy);					
					this.g.lineTo(shape_width_px*j+shape_dx, shape_height_px*(i));
					this.g.lineTo(shape_width_px*(j+1)+shape_dx, shape_height_px*(i));
					this.g.lineTo(shape_width_px*(j+1)+shape_dx, shape_height_px*(i+1)-shape_dy);
					
				}
			}	
		}
		this.g.endFill();


		stage.ready_to_update = true;
	}
	p.getIsFull = function(){
		return this.shapes.length >= this.MAX_OBJECTS_IN_LIBRARY;
	}

	p.addObject = function (o)
	{
		var index = this.shapes.length + 1;
		if (index <= this.MAX_OBJECTS_IN_LIBRARY)
		{
			this.addChild(o);
			o.x = (index % this.num_cols) * this.shape_width_px + this.shape_dx;
			if(this.PLACE_ON_GROUND){
				o.y = Math.ceil(index / this.num_cols) * this.shape_height_px - o.height_px_below;
			} else {
				o.y = Math.floor(index / this.num_cols) * this.shape_height_px + this.shape_dy;
			}
			this.shapes.push(o);

			// add html buttons
			var id = typeof o.skin.savedObject.id === "undefined" ? GLOBAL_PARAMETERS.total_objects_made : o.skin.savedObject.id;
			o.skin.savedObject.id = id;
			if (typeof o.skin.savedObject.is_deletable === "undefined") o.skin.savedObject.is_deletable = true;
			
			var b_id = "library-button-" + id;
			var htmlText;
			if (o.skin.savedObject.is_deletable){
				htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Duplicate</a></li><li><a href="#">Delete</a></li></ul></div>';
			} else {
				htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Duplicate</a></li></ul></div>';				
			}

			$('#library-button-holder').append(htmlText);
			$('#library-button-holder').find("ul").menu().hide();
			var htmlElement = $("#" + b_id)
				.find("input")
				.button({
                    label: "Actions",
                    icons: {
                        primary: 'ui-icon-triangle-1-s'
                    }
                })
                .click(function() {
			        var menu = $(this).parent().find("ul").show().position({
			      		my: "left top",
                        at: "left bottom",
                        of: this
                    });
                    $( document ).one( "click",function() {
                         if ($(event.target).text() == "Duplicate")
                        {
                        	tester.library.duplicateObjectFromHTML($(event.target).parent().parent().parent());
                        	
                        } else if ($(event.target).text() == "Delete")
                        {
                        	tester.library.deleteObjectFromHTML($(event.target).parent().parent().parent());
                        }
                        menu.hide();
                    });
                    return false;
			    });
                
			var element = new createjs.DOMElement(htmlElement[0]);
			this.addChild(element);
			element.x = this.x + o.x;
			if (this.PLACE_ON_GROUND){
				element.y = this.y;
			} else {
				element.y = this.y + this.height_px - 30;
			}
			
			o.html = htmlElement.parent();
			o.button = element;

			return true;
		} else {
			return false;
		}
	}


	p.duplicateObjectFromHTML = function (html)
	{
		for (var i = 0; i < this.shapes.length; i++)
		{
			if (this.shapes[i].html.attr("id") == html.attr("id"))
			{
				this.duplicateObject(this.shapes[i]);
				eventManager.fire("duplicate-model", [this.shapes[i].skin.savedObject]);
				return true;
			}
		}
		return false;
	}

	p.duplicateObject = function (o)
	{
		// always make duplicates deletable
		o.skin.savedObject.is_deletable = true;
		createObject(o.skin.savedObject);
	}

	p.deleteObjectFromHTML = function (html)
	{
		for (var i = 0; i < this.shapes.length; i++)
		{
			if (this.shapes[i].html.attr("id") == html.attr("id"))
			{
				this.shapes[i].skin.savedObject.is_deleted = true;
				eventManager.fire("delete-model", [this.shapes[i].skin.savedObject]);
				this.removeObject(this.shapes[i]);
				this.parent.removeObjectFromLibrary();
				return true;
			}
		}
		return false;
	}

		p.removeObject= function (o)
		{
			console.log(o.skin.savedObject.id);
			var index = this.shapes.indexOf(o);
			this.shapes.splice(index, 1);
			if (typeof o.button != "undefined") this.removeChild(o.button);
			if (typeof o.html != "undefined" && o.html != null)	o.html.remove();
			this.removeChild(o);
			// move shapes below up
			for (var i = index; i < this.shapes.length; i++)
			{
				var s = this.shapes[i];
				var new_index = i + 1;
				s.x = (new_index % this.num_cols) * this.shape_width_px + this.shape_dx;
				if(this.PLACE_ON_GROUND){
					s.y = Math.ceil(new_index / this.num_cols) * this.shape_height_px - s.height_px_below;
				} else {
					s.y = Math.floor(new_index / this.num_cols) * this.shape_height_px + this.shape_dy;
				}

				
				if (typeof s.button != "undefined")
				{
					s.button.x = this.x + s.x;
					if (this.PLACE_ON_GROUND){
						s.button.y = this.y;
					} else {
						s.button.y = this.y + this.height_px - 30;
					}					
				}
			}			
		}

	p._tick = function()
	{
		this.Container_tick();
	}

	p.redraw = function()
	{
		stage.ready_to_update = true;
			
	}
	
	window.ObjectLibrary = ObjectLibrary;
}(window));
