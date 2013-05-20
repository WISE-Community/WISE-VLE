(function (window)
{

	function Beakerb2World (width_px, height_px, world_dx, world_dy, SCALE)
	{
		this.initialize (width_px, height_px, world_dx, world_dy, SCALE);
	}

	var p = Beakerb2World.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.NUM_BACK_OBJECTS = 5;	

	p.initialize = function (width_px, height_px, world_dx, world_dy, SCALE)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
		this.world_dx = world_dx;
		this.world_dy = world_dy;
		this.SCALE = SCALE;

		var g = this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(g);
		this.addChild(this.shape);

		g.beginLinearGradientFill(["rgba(250,250,250,1.0)","rgba(230,210,220,1.0)"],[0,1.0],0,0,this.width_px,this.height_px);
		g.drawRect(0, 0, this.width_px, this.height_px);
		g.endFill();
		//draw floor
		g.beginLinearGradientFill(["rgba(120,120,120,1.0)","rgba(80,80,80,1.0)"],[0,1.0],0,this.height_px-100,this.width_px,this.height_px);
		//g.drawRect(-this.width_px/2, this.height_px/2-10, this.width_px, 10);
		g.drawRect(0, this.height_px-100, this.width_px, 100);
		g.endFill();

		this.b2world = new b2World(new b2Vec2(0, 10), true);
		var floorFixture = new b2FixtureDef;
		floorFixture.density = 1;
		floorFixture.restitution = 0.2;
		floorFixture.filter.categoryBits = 2;
		floorFixture.filter.maskBits = 3;
		floorFixture.shape = new b2PolygonShape;
		floorFixture.shape.SetAsBox(this.width_px / 2 / GLOBAL_PARAMETERS.SCALE, 10 / 2 / GLOBAL_PARAMETERS.SCALE);
		var floorBodyDef = new b2BodyDef;
		floorBodyDef.type = b2Body.b2_staticBody;
		floorBodyDef.position.x = (this.world_dx + (this.width_px) / 2 ) / GLOBAL_PARAMETERS.SCALE;
		floorBodyDef.position.y = (this.world_dy + this.height_px - ( 10 ) / 2 ) / GLOBAL_PARAMETERS.SCALE;
		var floor = this.floor = this.b2world.CreateBody(floorBodyDef);
		floor.CreateFixture(floorFixture);

		var leftWallFixture = new b2FixtureDef;
		leftWallFixture.density = 1;
		leftWallFixture.restitution = 0.2;
		leftWallFixture.filter.categoryBits = 2;
		leftWallFixture.filter.maskBits = 3;
		leftWallFixture.shape = new b2PolygonShape;
		leftWallFixture.shape.SetAsBox(4 / 2 / GLOBAL_PARAMETERS.SCALE, this.height_px / 2 / GLOBAL_PARAMETERS.SCALE);
		var leftWallBodyDef = new b2BodyDef;
		leftWallBodyDef.type = b2Body.b2_staticBody;
		leftWallBodyDef.position.x = (this.world_dx + (4 / 2) ) / GLOBAL_PARAMETERS.SCALE;
		leftWallBodyDef.position.y = (this.world_dy + (this.height_px) / 2 ) / GLOBAL_PARAMETERS.SCALE;
		var leftWall = this.b2world.CreateBody(leftWallBodyDef);
		leftWall.CreateFixture(leftWallFixture);

		var rightWallFixture = new b2FixtureDef;
		rightWallFixture.density = 1;
		rightWallFixture.restitution = 0.2;
		rightWallFixture.filter.categoryBits = 2;
		rightWallFixture.filter.maskBits = 3;
		rightWallFixture.shape = new b2PolygonShape;
		rightWallFixture.shape.SetAsBox(4 / 2 / GLOBAL_PARAMETERS.SCALE, this.height_px / 2 / GLOBAL_PARAMETERS.SCALE);
		var rightWallBodyDef = new b2BodyDef;
		rightWallBodyDef.type = b2Body.b2_staticBody;
		rightWallBodyDef.position.x = (this.world_dx + this.width_px - (4 / 2) ) / GLOBAL_PARAMETERS.SCALE;
		rightWallBodyDef.position.y = (this.world_dy + (this.height_px) / 2 ) / GLOBAL_PARAMETERS.SCALE;
		var rightWall = this.b2world.CreateBody(rightWallBodyDef);
		rightWall.CreateFixture(rightWallFixture);

		this.actors = [];
		// add a beaker
		this.beakers = [];

		this.createBeaker(this.width_px/4, this.height_px-10, 5, 10, 5);
		this.createBeaker(this.width_px*3/4, this.height_px-10, 5, 5, 5);
		// contact listener
		var contactListener = new b2ContactListener;
		contactListener.BeginContact = this.BeginContact.bind(this);
		this.b2world.SetContactListener(contactListener);

		if (GLOBAL_PARAMETERS.DEBUG)
		{
			var debugDraw = this.debugDraw = new b2DebugDraw;
			debugDraw.SetSprite(document.getElementById("debugcanvas").getContext("2d"));
			debugDraw.SetDrawScale(GLOBAL_PARAMETERS.SCALE);
			debugDraw.SetFillAlpha(1.0);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_controllerBit);
			this.b2world.SetDebugDraw(debugDraw);
		}
	}

	/** This works for objecs where the width_px_left, height_px_above, width_px_right, width_px_below are defined
	    i.e., there is no assumption of where 0,0 is relative to the object.
	    Both objects must be on the stage, i.e. must have parents */
	p.hitTestObject = function (o)
	{
		if (typeof(o.width_px_left) != "undefined" && typeof(o.width_px_right) != "undefined" && typeof(o.height_px_above) != "undefined" && typeof(o.height_px_below) != "undefined")
		{
			if (typeof(o.parent) != "undefined" && typeof(this.parent) != "undefined")
			{
				var gp = o.parent.localToGlobal(o.x, o.y);
				var lp = this.globalToLocal(gp.x, gp.y);
				if (this.hitTest(lp.x-o.width_px_left, lp.y+o.height_px_below) && this.hitTest(lp.x+o.width_px_right, lp.y+o.height_px_below))
				{
					return true;
				} else
				{
					return false;
				}
			} else		
			{
				return false;
			}
		} else
		{
			console.log("The height and width next to the object are not defined.");
			return false;
		}

	}
	p.createBeaker = function (x, y, width_units, height_units, depth_units){
		var beaker = new Beakerb2Actor(this, width_units, height_units, depth_units);
		beaker.setupInWorld((this.world_dx + x ) / GLOBAL_PARAMETERS.SCALE, (this.world_dy + y ) / GLOBAL_PARAMETERS.SCALE, this.b2world);
		beaker.world = this;
		this.beakers.push(beaker);
	}

	p.addActor = function (actor, x, y)
	{
		eventManager.fire('add-beaker-world',[actor.skin.savedObject], box2dModel);
		
		actor.setupInWorld((this.world_dx + x) / GLOBAL_PARAMETERS.SCALE, (this.world_dy + y ) / GLOBAL_PARAMETERS.SCALE, this.b2world);

		//actor.x = x;
		//actor.y = y;
		
		actor.world = this;
		
		
		this.actors.push(actor);
		// set a flag so we can look for initial contact with this object
		this.justAddedActor = actor;
		this.justRemovedActor = null;
		this.update_mass_flag = true;
		//this.updateMassOnPan();

		// figure out where to place this object based on it's relative position to other actors.
		for (var i = 0; i < this.actors.length; i++){ this.actors[i].body.SetAwake(true); } 

		//this.addChildAt(actor, this.NUM_BACK_OBJECTS);
		this.addChildAt(actor, this.getNumChildren() - this.beakers.length);
		
		this.sortActorsDisplayDepth();
	}

	p.removeActor = function (actor)
	{
		this.justRemovedActor = actor;
		this.justAddedActor = null;
		//this.sortActorsDisplayDepth();

		eventManager.fire('remove-beaker-world',[actor.skin.savedObject], box2dModel);
		this.actors.splice(this.actors.indexOf(actor), 1);
		
		if (actor.controlledByBuoyancy){
			actor.containedWithin.removeActor(actor);	
		}
		this.b2world.DestroyBody(actor.body);
		actor.body = null;
		actor.world = null;
	}

	/** Called whenever anything touches anything.  Useful for knowing when something happens in world */
	p.BeginContact = function (contact)
	{
		this.sortActorsDisplayDepth();

		if (contact.GetFixtureA().m_body == this.justAddedActorToBuoyancy)
		{	
			contact.GetFixtureB().m_body.SetAwake(true);
		} else if (contact.GetFixtureB().m_body == this.justAddedActorToBuoyancy)
		{
			contact.GetFixtureA().m_body.SetAwake(true);
		} 
	}

	/**
	*	Will sort by the highest objects on top, then right-most objects
	*/
	p.sortActorsDisplayDepth = function(){
		for (var i = this.actors.length-1; i >= 0; i--){
			var i_index = this.getChildIndex(this.actors[i]);
			for (var j = i+1; j < this.actors.length; j++){
				var j_index = this.getChildIndex(this.actors[j]);
				console.log(i_index, j_index, this.getChildAt(i_index).x, this.getChildAt(i_index).y, this.getChildAt(j_index).x, this.getChildAt(j_index).y);
				if (this.getChildAt(j_index).y - this.getChildAt(i_index).y > 10  || (Math.abs(this.getChildAt(i_index).y - this.getChildAt(j_index).y) <= 10 && this.getChildAt(i_index).x > this.getChildAt(j_index).x)){
					// Actor i is in front of j if order in display is not the same, switch
					if (i_index < j_index){
						this.swapChildrenAt(i_index, j_index);
						i_index = j_index;
					}
				} else {
					// Actor j is in front of i if order in display is not the same, switch
					if (j_index < i_index){
						this.swapChildrenAt(i_index, j_index);
						i_index = j_index;
					}
				}
			}
		}
	}


	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
		for (var i = 0; i < this.beakers.length; i++){
			this.beakers[i].update();
		}
		for(i = 0; i < this.actors.length; i++){
			if (this.actors[i].body.IsAwake()){
				for (var j = 0; j < this.beakers.length; j++){
					this.beakers[j].addIfWithin(this.actors[i]);
				}
			} 
			this.actors[i].update();
		}
		this.b2world.Step(1/createjs.Ticker.getFPS(), 10, 10);
		if (GLOBAL_PARAMETERS.DEBUG) this.b2world.DrawDebugData();
		this.b2world.ClearForces();
	}
	
	
	window.Beakerb2World = Beakerb2World;
}(window));
