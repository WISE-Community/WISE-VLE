/**
 * An interface to YUI for managing custom events
 */
function EventManager(){
	this.eventObs = [];
	this.eventNames = [];
	this.eventSubscribers = [];
};

/**
 * Given an object (obj), the name of new event (event) and
 * optional arguments (args), creates a new custom event. The
 * given object will now have the necessary functions (subscribe,
 * fire, unsubscribe) to handle events.
 */
EventManager.prototype.addEvent = function(obj, event, args){
	var newEvent = new YAHOO.util.CustomEvent(event, obj);

	this.eventObs.push(newEvent);
	this.eventNames.push(event);
};

/**
 * Given an event name (event) and a function (fun), adds
 * that function as a listener to the associated event
 */
EventManager.prototype.subscribe = function(event, fun){
	var index = this.eventNames.indexOf(event);
	var obj = this.eventObs[index];
	
	if(obj){
		obj.subscribe(fun);
	} else {
		alert('no event with name: ' + event + '  found');
	};
	
	var subs = this.eventSubscribers[index];
	if(subs){
		subs.push(fun);
	} else {
		this.eventSubscribers[index] = [];
		this.eventSubscribers[index].push(fun);
	};
};

/**
 * Fires the event of the given name (event)
 */
EventManager.prototype.fire = function(event){
	var index = this.eventNames.indexOf(event);
	this.eventObs[index].fire();
};

/**
 * Given a subscribed function (fun), removes it
 * as a listener
 */
EventManager.prototype.unsubscribe = function(fun){
	for(var a=0;a<this.eventSubscribers.length;a++){
		for(var b=0;b<this.eventSubscribers[a].length;b++){
			if(this.eventSubscribers[a][b]==fun){
				this.eventSubscribers[a].splice(b,1);
				this.eventObs[a].unsubscribe(fun);
				return;
			};
		};	
	};
};