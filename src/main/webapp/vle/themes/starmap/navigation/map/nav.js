/**
 * This file specifies the user interface for navigation components (nodes and sequences),
 * specifies the navigation menu toggle event, and also specifies any navigation
 * events to register with the vle event dispatcher.
 * 
 * REQUIRED items are noted as such.
 * 
 * Theme creators can also define customizations to add when both the navigation
 * menu has been created in the DOM (see 'menuCreated' function) and a when new step
 * has been opened by a student (see 'nodeRendered' function).
 */

/**
 * Called when the navigation menu has been inserted into the DOM (when the project
 * first starts up)
 * 
 * REQUIRED
 * 
 * Any DOM customizations, scripting, or event handlers for this 
 * navigation menu should be included here. (It is okay to leave this function empty.)
 */
NavigationPanel.prototype.menuCreated = function() {
	$('#navigation').show();
	
	// set the text and title for the toggle navigation menu button
	$('#toggleNavLink').attr('title',view.getI18NString("toggle_nav_button_title","theme")).html(view.getI18NString("toggle_nav_button_text","theme"));
	
	// on stepHeader hover show step title, vice versa
	$('#stepHeader').hover(
			function(){
				clearTimeout($(this).data('stepHeaderTimer'));
				$('#stepInfo').fadeIn();
			},
			function(){
				$('#stepInfo').stop(true,true);
				$('#stepInfo').fadeOut();
			}
	);

	// for some reason, the first time a node loads when the project is opened,
	// the stepInfo div is not fading after 4 seconds, so force here
	setTimeout(function(){
		$('#stepInfo').fadeOut();
	}, 4000);

	// show project content
	$('#vle_body').css('opacity',1);

	view.eventManager.subscribe('studentWorkUpdated', this.studentWorkUpdatedListener, this);
	view.eventManager.subscribe('constraintStatusUpdated', this.constraintStatusUpdatedListener, this);
};

/**
 * Called when a new node (step) is rendered
 * 
 * REQUIRED
 * 
 * By default, the new step's content is displayed. The 'currentNode'
 * class is added to the new step's menu element and removed from the previous
 * step's menu element. In addition, the 'inactive' class is added to all step 
 * and activity menu elements that are not part of the current activity.
 * Any DOM customizations, scripting, or event handlers beyond these should be
 * included in this function. (It is okay to leave this function empty.)
 * 
 * @param node Node that has been rendered
 */
NavigationPanel.prototype.nodeRendered = function(node) {
	//$('#stepContent').show();
	$('#navigation').hide();
	
	// clear the stepHeaderTimer timeout actions on the step header
	clearTimeout($('#stepHeader').data('stepHeaderTimer'));

	// show the step title overlay (unless current step is a note, in which case the title is displayed in the note dialog)
	if(node.getType() != "NoteNode"){
		$('#stepInfo').fadeIn();

		// hide step title overlay after 4 seconds
		var stepHeaderTimer = setTimeout(function(){
			$('#stepInfo').fadeOut();
		}, 4000);
		$('#stepHeader').data('stepHeaderTimer',stepHeaderTimer);
	}
};

/**
 * Toggles the visibility of the navigation panel
 * 
 * REQUIRED
 * 
 * Is executed when the 'toggleNav' link is clicked (see 'vle_body.html').
 * 
 * If you would like to remove the navigation toggle link for this specific navigation
 * mode (but include it for other navigation modes in this theme), keep the 'toggleNav'
 * element in the theme's 'vle_body.html' but hide or remove it in this
 * function using javascript/jQuery [e.g. $('#toggleNav').remove();].
 * 
 * If you do not want a navigation toggle link in your theme at all, remove the 'toggleNav'
 * element from your theme's 'vle_body.html' and leave this function empty.
 */
NavigationPanel.prototype.toggleVisibility = function() {
	//var view = this.view;

	/* if there is a disabled panel over the step content, we want to resize that to match the stepContent */
	/*var resizeDisabled = function(){
		if($('#disabledPanel').size()>0){
			// get the step content position, height and width
			var panelPosition = $('#stepContent').offset();
			var panelHeight = $('#stepContent').height() + 2;
			var panelWidth = $('#stepContent').width() + 2;

			// set the panel css with the position, height and width
			$('#disabledPanel').css({top:panelPosition.top, left:panelPosition.left, height:panelHeight, width:panelWidth});
		}
	};*/
	
	$('#navigation').show();
};

/**
 * Listener for the constraintStatusUpdated event
 * @param type the event name
 * @param args the arguments passed into the event when it is fired
 * @param obj the view
 */
NavigationPanel.prototype.constraintStatusUpdatedListener = function(type, args, obj) {
	//get the node id that has been updated
	var nodeId = args[0];

	//get the constraint status
	var constraintStatus = args[1];

	//get the position of the step
	var position = view.getProject().getPositionById(nodeId);
	var positionEscaped = view.escapeIdForJquery(position);

	//add or remove the constraintDisable class 
	if(constraintStatus == 'disabled') {
		//grey out the step
		$('#node_' + positionEscaped).addClass('constraintDisable');
	} else if(constraintStatus == 'enabled') {
		//make the step available
		$('#node_' + positionEscaped).removeClass('constraintDisable');
	}
};

/**
 * Listener for the studentWorkUpdated event
 * @param type the event name
 * @param args the arguments passed into the event when it is fired
 * @param obj the view
 */
NavigationPanel.prototype.studentWorkUpdatedListener = function(type, args, obj) {
	//update the step icon
	//obj.setStepIcon();
};

NavigationPanel.prototype.navigationPanelPrevButtonClickedListener = function() {
	view.renderPrevNode();
};

NavigationPanel.prototype.navigationPanelNextButtonClickedListener = function() {
	view.renderNextNode();
};

NavigationPanel.prototype.navigationPanelToggleVisibilityButtonClickedListener = function() {
	this.toggleVisibility();
	view.endCurrentNode();
};

/**
 * Listens for the navigationNodeClicked event
 * @param nodePosition the node position that was clicked
 */
NavigationPanel.prototype.navigationNodeClickedListener = function(nodePosition) {
	//go to the node position that was clicked if it is available
	this.view.goToNodePosition(nodePosition);
};

NavigationPanel.prototype.visitNodeListener = function(nodeId){
	var nodePosition = view.getProject().getPositionById(nodeId);
	//go to the node position that was clicked if it is available
	view.goToNodePosition(nodePosition);
};

/*
 * Obtain the html from my_menu and run trim on the html to remove all
 * white space. If it is empty string after the trim that means we
 * need to create the nav html. If the string is not empty that means
 * we have previously created the nav html and we only need to update
 * some of the elements.
 * @param forceReRender true iff we want to rerender the navigation from scratch
 */
NavigationPanel.prototype.render = function(forceReRender) {
	//obtain the html in the nav div and run trim on it
	var currentNavHtml = document.getElementById("my_menu").innerHTML.replace(/^\s*/, "").replace(/\s*$/, "");
	
	//check if the nav html is empty string after the trim
	if(!forceReRender && currentNavHtml != "") {
		//the nav html is not empty string so we will just update some of the elements
		
		//obtain the node pos that was previously just highlighted in the nav
		var previousPos = $('.currentNode').attr('id');
		if(previousPos){
			previousPos = previousPos.replace(/(:|\.)/g,'\\$1'); // escape : and . characters to allow them to work with jQuery selectors
		}

		//obtain the new current pos we are moving to
		var currentPos = 'node_' + view.getCurrentPosition();
		currentPos = currentPos.replace(/(:|\.)/g,'\\$1'); // escape : and . characters to allow them to work with jQuery selectors

		//obtain the nav elements for the current  and previous nodes
		var previousNavElement = $('#' + previousPos);
		var currentNavElement = $('#' + currentPos);

		/*
		 * remove the currentNode class from the previousNavElement so
		 * it is no longer highlighted
		 */
		if(previousNavElement != null) {
			previousNavElement.removeClass('currentNode');

			/*
			 * Check for glue sequences and if it was previous set icon
			 * back to glue icon and remove position within the glue from
			 * title
			 */ 
			var prevNode = view.getProject().getNodeByPosition(previousPos);
			var currentNode = view.getProject().getNodeByPosition(currentPos);
			if(prevNode && prevNode.parent.getView()=='glue' && (currentNode.parent != prevNode.parent)){ //then we are a glue sequence different from previous
				var currentTitle = previousNavElement.firstChild.nextSibling.nodeValue;
				var newTitle;
				var parentTitle = prevNode.parent.title;
				previousNavElement.firstChild.src = view.iconUrl + 'instantquiz16.png';

				if(currentTitle && currentTitle.indexOf(parentTitle)!=-1){
					newTitle = currentTitle.substring(0, currentTitle.indexOf(parentTitle) + parentTitle.length + 1);
					previousNavElement.firstChild.nextSibling.nodeValue = newTitle;
				};
			};
		}

		/*
		 * add the currentNode class to the currentNavElement so that
		 * it becomes highlighted
		 */
		if(currentNavElement != null) {
			currentNavElement.addClass('currentNode');

			var child = view.getProject().getNodeById(view.getState().getCurrentNodeVisit().getNodeId());
			if(child.parent.getView()=='glue'){//must be first step in glue
				this.processGlue(currentNavElement, child);
			};
		} else {
			/*
			 * if the currentNavElement is null it's because the current
			 * node we are on is within a glue node so it doesn't have
			 * a nav element. in this case we will just highlight
			 * the parent nav element (which is the parent glue node) 
			 */
			//obtain the parent
			var enclosingNavParentElement = this.getEnclosingNavParent(currentPos);
			if(enclosingNavParentElement != null) {

				/*
				 * if view is set for the glue, then change title to show which step
				 * they are currently on
				 */
				var child = view.getProject().getNodeById(view.getState().getCurrentNodeVisit().getNodeId());
				if(child.parent.getView()=='glue'){
					this.processGlue(enclosingNavParentElement, child);
				};

				/*
				 * add the currentNode class to the parent so that it becomes
				 * highlighted
				 */
				enclosingNavParentElement.addClass('currentNode');
			}
		}

	} else {
		//the nav ui is empty so we need to build it
		$('#navigation').append('<div id="activityControls">' +
			'<a id="prevAct"><img src="/vlewrapper/vle/themes/starmap/navigation/map/images/arrow-left.png" alt="left"></a>' +
			'<div id="currentAct"><span class="pos"></div>' +
			'<a id="nextAct"><img src="/vlewrapper/vle/themes/starmap/navigation/map/images/arrow-right.png" alt="left"></a>' +
			'</div>' +
			'<a id="reset">Zoom Out</a>' +
			'<!-- <a id="toggleView">Student View</a> -->');
		
		this.map = starmap() // create map instance
			.height(528)
			.width(940)
			.backgroundImg('themes/starmap/navigation/map/images/background.png')
			.view(view);
	
		this.currentStepNum = 1;
		var navHtml = "";
		
		/*
		 * add the base href to the nav html. this is required because
		 * if a note step was loaded as the first step, the base href
		 * in the note frame would override the base href for the nav
		 * images and cause them to be dead images. to prevent this, 
		 * we are adding a base href to the nav html so it won't 
		 * accidentally use the note frame base href.
		 */
		navHtml = this.addBaseHref(navHtml);

		//set the nav html into the div
		document.getElementById("my_menu").innerHTML = navHtml;
		
		var project = view.getProject(),
			navPanel = this,
			map = this.map,
			projectJSON = project.projectJSON; // TODO: eventually might use project object and not project JSON to generate map
		map.complete(navPanel.menuLoaded);
		d3.select('#my_menu')
			.datum(projectJSON)
			.call(map);
		
		$('#reset').on('click', function(){
			map.reset();
		});
	};

	/* add appropriate classes for any constraints that may apply to 
	 * the current navigation */
	//this.processConstraints();
	
	//check if the navigation panel has been rendered before
	if(!this.navigationPanelLoaded) {
		//the navigation panel has not been rendered before so we will perform some initialization
		
		//set up listeners for these events
		view.eventManager.subscribe('nodeStatusUpdated', this.nodeStatusUpdatedListener, view);
		view.eventManager.subscribe('navigationLoadingCompleted', this.navigationLoadingCompletedListener, view);
		
		//set this flag so that we do not perform this initialization again for subsequent NavigationPanel.render() calls
		this.navigationPanelLoaded = true;
		
		//add the available global tag maps for the starmap
		view.addAvailableGlobalTagMap(PilotRatingGlobalTagMap);
		view.addAvailableGlobalTagMap(WarpRatingGlobalTagMap);
		view.addAvailableGlobalTagMap(AdvisorRatingGlobalTagMap);
	}
};

PilotRatingGlobalTagMap.prototype = new GlobalTagMap();
PilotRatingGlobalTagMap.prototype.constructor = PilotRatingGlobalTagMap;
PilotRatingGlobalTagMap.prototype.parent = GlobalTagMap.prototype;
PilotRatingGlobalTagMap.functionName = 'pilotRating';

/**
 * The constructor for the PilotRatingGlobalTagMap. This global tag
 * map will accumulate the total score for all the steps in the project
 * and give the student a rank based upon that score.
 * @param view the view
 * @param parameters parameters for this global tag map
 */
function PilotRatingGlobalTagMap(view, parameters) {
	this.view = view;
	
	/*
	 * get the tag name. this global tag map doesn't actually use the tag
	 * since it looks at all steps in the project
	 */
	this.tagName = parameters.tagName;
	
	//get the possible scores
	this.scores = parameters.scores;
	
	//get the id for the img element we will create
	var pilotRatingId = PilotRatingGlobalTagMap.functionName;
	this.pilotRatingId = pilotRatingId;
	
	//get the student's total score for all the steps
	var totalScore = this.getTotalScore();
	
	//get the icon to initially display
	var icon = this.getIconFromScore(totalScore);
	
	/*
	 * subscribe to the studentWorkUpdated event so this tag map
	 * can perform any necessary changes when the student work
	 * changes
	 */
	view.eventManager.subscribe('studentWorkUpdated', this.studentWorkUpdatedListener, this);
	
	//create the img element to display the pilot rating
	var img = document.createElementNS('http://www.w3.org/2000/svg','image');
	img.setAttributeNS(null, 'id', pilotRatingId);
	img.setAttributeNS(null, 'height', '100');
	img.setAttributeNS(null, 'width', '200');
	img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', icon);
	img.setAttributeNS(null, 'x', '10');
	img.setAttributeNS(null, 'y', '10');
	img.setAttributeNS(null, 'visibility', 'visible');
	
	//add the img element to the starmap
	$('#wrap').append(img);
};

/**
 * The listener for the studentWorkUpdated event
 * @param type the event type studentWorkUpdated
 * @param args the arguments passed in when the event is fired
 * @param obj this pilot rating global tag map object
 */
PilotRatingGlobalTagMap.prototype.studentWorkUpdatedListener = function(type, args, obj) {
	var thisGlobalTagMap = obj;
	
	//call the handler
	obj.studentWorkUpdatedHandler();
};

/**
 * The handler for the studentWorkUpdated event
 */
PilotRatingGlobalTagMap.prototype.studentWorkUpdatedHandler = function() {
	var view = this.view;

	//get the student's total score for all the steps
	var totalScore = this.getTotalScore();
	
	//get the rank from the score
	var rank = this.getRankFromScore(totalScore);
	
	//get the icon path to display from the score
	var icon = this.getIconFromScore(totalScore);

	if(icon != null) {
		//update the icon path to display for the pilot rating
		$('#' + this.pilotRatingId).attr('href', icon);	
	}
};

/**
 * Get the student's total score for the project
 */
PilotRatingGlobalTagMap.prototype.getTotalScore = function() {
	//get all the student work
	var vleState = this.view.getState();
	
	//get all the step node ids
	var nodeIds = this.view.getProject().getNodeIds();
	
	//accumulates the total score
	var totalScore = 0;
	
	//loop through all the step node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];
		
		//get a node
		var node = this.view.getProject().getNodeById(nodeId);
		
		if(node != null) {
			//get the latest work for the step
			var latestWork = vleState.getLatestWorkByNodeId(nodeId);
			
			//get the score for the work
			var score = node.getScore(latestWork);
			
			if(score != null) {
				//accumulate the score
				totalScore += score;
			}
		}
	}
	
	return totalScore;
};

/**
 * Get the rank from the score
 * @param score the score
 * @return the rank for the score
 */
PilotRatingGlobalTagMap.prototype.getRankFromScore = function(score) {
	var rank = null;
	
	//get the possible scores
	var scores = this.scores;
	
	if(scores != null) {
		//loop through all the possible scores
		for(var x=0; x<scores.length; x++) {
			//get a score object
			var tempScoreObject = scores[x];
			
			//get the score
			var tempScore = tempScoreObject.score;
			
			//get the rank
			var tempRank = tempScoreObject.rank;
			
			/*
			 * check if the score the student has is larger than the
			 * score for this score object. the first score that the
			 * student surpasses will determine their rank so scores
			 * should be ordered from highest to lowest in the scores
			 * array.
			 */
			if(score >= tempScore) {
				//the student has a larger score so they have achieved the rank
				rank = tempRank;
				break;
			}
		}
	}
	
	return rank;
};

/**
 * Get the icon path from the score
 * @param score the score
 * @return the icon path for the score
 */
PilotRatingGlobalTagMap.prototype.getIconFromScore = function(score) {
	var icon = null;
	
	//get the possible scores
	var scores = this.scores;
	
	if(scores != null) {
		//loop through all the scores
		for(var x=0; x<scores.length; x++) {
			//get a score object
			var tempScoreObject = scores[x];
			
			//get the score
			var tempScore = tempScoreObject.score;
			
			//get the icon path
			var tempIcon = tempScoreObject.icon;
			
			/*
			 * check if the score the student has is larger than the
			 * score for this score object. the first score that the
			 * student surpasses will determine their icon so scores
			 * should be ordered from highest to lowest in the scores
			 * array.
			 */
			if(score >= tempScore) {
				//the student has a larger score so they have achieved the icon
				icon = tempIcon;
				break;
			}
		}
	}
	
	return icon;
};


WarpRatingGlobalTagMap.prototype = new GlobalTagMap();
WarpRatingGlobalTagMap.prototype.constructor = WarpRatingGlobalTagMap;
WarpRatingGlobalTagMap.prototype.parent = GlobalTagMap.prototype;
WarpRatingGlobalTagMap.functionName = 'warpRating';

/**
 * The constructor for the WarpRatingGlobalTagMap. This global tag
 * map will accumulate the score for all the steps with a specific
 * tag and give the student a rank based upon that score.
 * @param view the view
 * @param parameters parameters for this global tag map
 */
function WarpRatingGlobalTagMap(view, parameters) {
	this.view = view;
	
	//get the tag name
	this.tagName = parameters.tagName;
	
	//get the possible scores
	this.scores = parameters.scores;
	
	//get all the step node ids for the steps that have the given tag
	var nodeIds = view.getProject().getNodeIdsByTag(this.tagName);
	
	//remember the node ids
	this.nodeIds = nodeIds;
	
	/*
	 * subscribe to the studentWorkUpdated event so this tag map
	 * can perform any necessary changes when the student work
	 * changes
	 */
	view.eventManager.subscribe('studentWorkUpdated', this.studentWorkUpdatedListener, this);
	
	/*
	 * initialize the warp count since there can be multiple warp rating
	 * global tag maps
	 */
	if(WarpRatingGlobalTagMap.warpCount == null) {
		WarpRatingGlobalTagMap.warpCount = 0;
	}
	
	//increment the warp count
	WarpRatingGlobalTagMap.warpCount += 1;
	
	//set the warp number
	var warpNumber = WarpRatingGlobalTagMap.warpCount;
	this.warpNumber = warpNumber;
	
	//get the id for the img element we will create
	var warpRatingId = WarpRatingGlobalTagMap.functionName + warpNumber;
	this.warpRatingId = warpRatingId;
	
	//get the student's score for the tagged step(s)
	var score = this.getScore();
	
	//get the icon to display based on the student's score
	var icon = this.getIconFromScore(score);
	
	//get the y position where we will place the icon
	var y = 10 + (100 * warpNumber);
	
	//create the img element to display the warp rating
	var img = document.createElementNS('http://www.w3.org/2000/svg','image');
	img.setAttributeNS(null, 'id', warpRatingId);
	img.setAttributeNS(null, 'height', '100');
	img.setAttributeNS(null, 'width', '200');
	img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', icon);
	img.setAttributeNS(null, 'x', '10');
	img.setAttributeNS(null, 'y', y);
	img.setAttributeNS(null, 'visibility', 'visible');
	
	//add the img element to the starmap
	$('#wrap').append(img);
};

/**
 * The listener for the studentWorkUpdated event
 * @param type the event type studentWorkUpdated
 * @param args the arguments passed in when the event is fired
 * @param obj this warp rating global tag map object
 */
WarpRatingGlobalTagMap.prototype.studentWorkUpdatedListener = function(type, args, obj) {
	var thisGlobalTagMap = obj;
	
	//get the node id and node visit from the args
	var nodeId = args[0];
	var nodeVisit = args[1];
	
	//call the handler
	obj.studentWorkUpdatedHandler(nodeId, nodeVisit);
};

/**
 * The handler for the studentWorkUpdated event
 * @param nodeId the node id that the student work is for
 * @param nodeVisit the node visit that was just submitted by the student
 */
WarpRatingGlobalTagMap.prototype.studentWorkUpdatedHandler = function(nodeId, nodeVisit) {
	
	//get the step node ids that were tagged
	var nodeIds = this.nodeIds;
	
	if(nodeIds != null) {
		
		/*
		 * check if the step that was updated is one of the
		 * steps that were tagged for this global tag map
		 */
		if(nodeIds.indexOf(nodeId) != -1) {
			//student work has been updated for a node that this global tag map has tagged
			
			//get the student's score for the tagged step(s)
			var score = this.getScore();
			
			//get the rank
			var rank = this.getRankFromScore(score);
			
			//get the icon path
			var icon = this.getIconFromScore(score);
			
			//update the icon path for the warp rating
			$('#' + this.warpRatingId).attr('href', icon);
		}
	}
};

/**
 * Get the student's score for the the tagged step(s)
 * @return the student's score for the tagged steps
 */
WarpRatingGlobalTagMap.prototype.getScore = function() {
	//get the step node ids that were tagged
	var nodeIds = this.nodeIds;
	
	//get all the student work
	var vleState = this.view.getState();
	
	//accumulate the score
	var score = 0;
	
	if(nodeIds != null) {
		
		//loop through all the step node ids that were tagged
		for(var x=0; x<nodeIds.length; x++) {
			
			//get a node id
			var nodeId = nodeIds[x];
			
			//get the node
			var node = this.view.getProject().getNodeById(nodeId);
			
			if(node != null) {
				//get the latest node state for the step
				var latestWork = vleState.getLatestWorkByNodeId(nodeId);
				
				if(latestWork != null) {
					
					//get the score
					var stepScore = node.getScore(latestWork);
					
					if(stepScore != null) {
						//accumulate the score
						score += stepScore;						
					}
				}
			}
		}
	}
	
	return score;
};

/**
 * Get the rank from the score
 * @param score the score
 * @return the rank for the score
 */
WarpRatingGlobalTagMap.prototype.getRankFromScore = function(score) {
	var rank = null;
	
	//get the possible scores
	var scores = this.scores;
	
	if(scores != null) {
		//loop through all the scores
		for(var x=0; x<scores.length; x++) {
			//get a score object
			var tempScoreObject = scores[x];
			
			//get the score
			var tempScore = tempScoreObject.score;
			
			//get the rank
			var tempRank = tempScoreObject.rank;
			
			/*
			 * check if the score the student has is larger than the
			 * score for this score object. the first score that the
			 * student surpasses will determine their rank so scores
			 * should be ordered from highest to lowest in the scores
			 * array.
			 */
			if(score >= tempScore) {
				//the student has a larger score so they have achieved the rank
				rank = tempRank;
				break;
			}
		}
	}
	
	return rank;
};

/**
 * Get the icon path from the score
 * @param score the score
 * @return the icon path for the score
 */
WarpRatingGlobalTagMap.prototype.getIconFromScore = function(score) {
	var icon = null;
	
	//get the possible scores
	var scores = this.scores;
	
	if(scores != null) {
		//loop through all the scores
		for(var x=0; x<scores.length; x++) {
			//get a score object
			var tempScoreObject = scores[x];
			
			//get the score
			var tempScore = tempScoreObject.score;
			
			//get the icon path
			var tempIcon = tempScoreObject.icon;
			
			/*
			 * check if the score the student has is larger than the
			 * score for this score object. the first score that the
			 * student surpasses will determine their icon so scores
			 * should be ordered from highest to lowest in the scores
			 * array.
			 */
			if(score >= tempScore) {
				//the student has a larger score so they have achieved the icon
				icon = tempIcon;
				break;
			}
		}
	}
	
	return icon;
};


AdvisorRatingGlobalTagMap.prototype = new GlobalTagMap();
AdvisorRatingGlobalTagMap.prototype.constructor = AdvisorRatingGlobalTagMap;
AdvisorRatingGlobalTagMap.prototype.parent = GlobalTagMap.prototype;
AdvisorRatingGlobalTagMap.functionName = 'advisorRating';

/**
 * The constructor for the AdvisorRatingGlobalTagMap. This global tag
 * map will accumulate the score for all the steps with a specific
 * tag and give the student a rank based upon that score.
 * @param view the view
 * @param parameters parameters for this global tag map
 */
function AdvisorRatingGlobalTagMap(view, parameters) {
	this.view = view;
	
	//get the tag name
	this.tagName = parameters.tagName;
	
	//get the possible scores
	this.scores = parameters.scores;
	
	//get all the step node ids for the steps that have the given tag
	var nodeIds = view.getProject().getNodeIdsByTag(this.tagName);
	
	//remember the node ids
	this.nodeIds = nodeIds;
	
	//get the id for the img element we will create
	var advisorRatingId = AdvisorRatingGlobalTagMap.functionName;
	this.advisorRatingId = advisorRatingId;
	
	/*
	 * subscribe to the studentWorkUpdated event so this tag map
	 * can perform any necessary changes when the student work
	 * changes
	 */
	view.eventManager.subscribe('studentWorkUpdated', this.studentWorkUpdatedListener, this);
	
	//get the student's score for the tagged step(s)
	var score = this.getScore();
	
	//get the icon to display based on the student's score
	var icon = this.getIconFromScore(score);
	
	//get the y position where we will place the icon
	var y = 10 + (100 * 4);
	
	//create the img element to display the warp rating
	var img = document.createElementNS('http://www.w3.org/2000/svg','image');
	img.setAttributeNS(null, 'id', 'advisorRating');
	img.setAttributeNS(null, 'height', '100');
	img.setAttributeNS(null, 'width', '200');
	img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', icon);
	img.setAttributeNS(null, 'x', '10');
	img.setAttributeNS(null, 'y', y);
	img.setAttributeNS(null, 'visibility', 'visible');
	
	//add the img element to the starmap
	$('#wrap').append(img);
};

/**
 * The listener for the studentWorkUpdated event
 * @param type the event type studentWorkUpdated
 * @param args the arguments passed in when the event is fired
 * @param obj this warp rating global tag map object
 */
AdvisorRatingGlobalTagMap.prototype.studentWorkUpdatedListener = function(type, args, obj) {
	var thisGlobalTagMap = obj;
	
	//get the node id and node visit from the args
	var nodeId = args[0];
	var nodeVisit = args[1];
	
	//call the handler
	obj.studentWorkUpdatedHandler(nodeId, nodeVisit);
};

/**
 * The handler for the studentWorkUpdated event
 * @param nodeId the node id that the student work is for
 * @param nodeVisit the node visit that was just submitted by the student
 */
AdvisorRatingGlobalTagMap.prototype.studentWorkUpdatedHandler = function(nodeId, nodeVisit) {
	
	//get the step node ids that were tagged
	var nodeIds = this.nodeIds;
	
	if(nodeIds != null) {
		
		/*
		 * check if the step that was updated is one of the
		 * steps that were tagged for this global tag map
		 */
		if(nodeIds.indexOf(nodeId) != -1) {
			//student work has been updated for a node that this global tag map has tagged

			//get the student's score for the tagged step(s)
			var score = this.getScore();
			
			//get the rank
			var rank = this.getRankFromScore(score);
			
			//get the icon path
			var icon = this.getIconFromScore(score);
			
			//update the icon path for the warp rating
			$('#' + this.advisorRatingId).attr('href', icon);
		}
	}
};

/**
 * Get the student's score for the the tagged step(s)
 * @return the student's score for the tagged steps
 */
AdvisorRatingGlobalTagMap.prototype.getScore = function() {
	//get the step node ids that were tagged
	var nodeIds = this.nodeIds;
	
	//get all the student work
	var vleState = this.view.getState();
	
	//accumulate the score
	var score = 0;
	
	if(nodeIds != null) {
		
		//loop through all the step node ids that were tagged
		for(var x=0; x<nodeIds.length; x++) {
			
			//get a node id
			var nodeId = nodeIds[x];
			
			//get the node
			var node = this.view.getProject().getNodeById(nodeId);
			
			if(node != null) {
				//get the latest node state for the step
				var latestWork = vleState.getLatestWorkByNodeId(nodeId);
				
				if(latestWork != null) {
					
					//get the score
					var stepScore = node.getScore(latestWork);
					
					if(stepScore != null) {
						//accumulate the score
						score += stepScore;						
					}
				}
			}
		}
	}
	
	return score;
};

/**
 * Get the rank from the score
 * @param score the score
 * @return the rank for the score
 */
AdvisorRatingGlobalTagMap.prototype.getRankFromScore = function(score) {
	var rank = null;
	
	//get the possible scores
	var scores = this.scores;
	
	if(scores != null) {
		//loop through all the scores
		for(var x=0; x<scores.length; x++) {
			//get a score object
			var tempScoreObject = scores[x];
			
			//get the score
			var tempScore = tempScoreObject.score;
			
			//get the rank
			var tempRank = tempScoreObject.rank;
			
			/*
			 * check if the score the student has is larger than the
			 * score for this score object. the first score that the
			 * student surpasses will determine their rank so scores
			 * should be ordered from highest to lowest in the scores
			 * array.
			 */
			if(score >= tempScore) {
				//the student has a larger score so they have achieved the rank
				rank = tempRank;
				break;
			}
		}
	}
	
	return rank;
};

/**
 * Get the icon path from the score
 * @param score the score
 * @return the icon path for the score
 */
AdvisorRatingGlobalTagMap.prototype.getIconFromScore = function(score) {
	var icon = null;
	
	//get the possible scores
	var scores = this.scores;
	
	if(scores != null) {
		//loop through all the scores
		for(var x=0; x<scores.length; x++) {
			//get a score object
			var tempScoreObject = scores[x];
			
			//get the score
			var tempScore = tempScoreObject.score;
			
			//get the icon path
			var tempIcon = tempScoreObject.icon;
			
			/*
			 * check if the score the student has is larger than the
			 * score for this score object. the first score that the
			 * student surpasses will determine their icon so scores
			 * should be ordered from highest to lowest in the scores
			 * array.
			 */
			if(score >= tempScore) {
				//the student has a larger score so they have achieved the icon
				icon = tempIcon;
				break;
			}
		}
	}
	
	return icon;
};

NavigationPanel.prototype.menuLoaded = function() {
	var project = view.getProject(),
		navPanel = this;
	// insert step icons
	/*$('.node').each(function(){
		var nodeId = $(this).attr('id');
		var node = project.getNodeById(nodeId);
		if(node.getNodeClass() && node.getNodeClass()!='null' && node.getNodeClass()!=''){
  			//icon = '<img src=\'' + this.view.iconUrl + node.getNodeClass() + '16.png\'/> ';
  			var nodeClass = node.getNodeClass();
  			var isValid = false;
  			for(var a=0;a<view.nodeClasses[node.type].length;a++){
  				if(view.nodeClasses[node.type][a].nodeClass == nodeClass){
  					isValid = true;
  					break;
  				}
  			}
  			if(!isValid){
  				nodeClass = view.nodeClasses[node.type][0].nodeClass;
  			}
  			var nodeIconPath = view.nodeIconPaths[node.type];
  			$(this).find('image').attr("xlink:href",nodeIconPath + nodeClass + '16.png');
  		};
	});*/
	
	//collapse all activities except for the current one
	//eventManager.fire('menuCollapseAllNonImmediate');

	//eventManager.fire('resizeMenu');
	eventManager.fire('navigationMenuCreated');
	//eventManager.fire('menuCreated');
};

/**
 * Add a base href to the html
 * @param navHtml that navigation menu html
 * @return the navigation menu html with a base href tag prepended to it
 */
NavigationPanel.prototype.addBaseHref = function(navHtml) {
	//add a base href so it knows where to retrieve the nav images

	/*
	 * get the href of the current document. it will look something
	 * like
	 * http://wise4.telscenter.org/vlewrapper/vle/vle.html
	 */
	var documentLocationHref = document.location.href;

	/*
	 * get everything up until the last '/' inclusive. the documentBase
	 * will look something like
	 * http://wise4.telscenter.org/vlewrapper/vle/
	 */
	var documentBase = documentLocationHref.substring(0, documentLocationHref.lastIndexOf('/') + 1);

	/*
	 * add the base href with the document base to the beginning of
	 * the nav html
	 */
	navHtml = "<base href='" + documentBase + "'>" + navHtml;

	return navHtml;
};


/**
 * Checks if there are any constraints in effect for the node being rendered
 * and applies the appropriate classes to the menu.
 */
NavigationPanel.prototype.processConstraints = function(){
	var status = (this.view.navigationLogic) ? this.view.navigationLogic.getVisitableStatus(this.view.getCurrentPosition()) : null;

	/* we only need to continue if the nav logic exists and has returned a status object */
	if(status && status.menuStatus){
		var menuItems = this.getMenuItems();

		/* for each item in the menu, we want to look up the status in the menuStatus
		 * and add/remove appropriate classess */
		for(var id in menuItems){
			/* remove existing constraint classes */
			$(menuItems[id]).removeClass('constraintHidden constraintDisable');

			/* look it up in the menuStatus to see if we need to add any constraint classes */
			var ms = status.menuStatus[id];
			if(ms == 1){
				$(menuItems[id]).addClass('constraintDisable');
			} else if(ms == 2){
				$(menuItems[id]).addClass('constraintHidden');
			}
		}
	}
};

/**
 * Retrieves and returns a map of html menu items keyed to their associated nodeIds.
 * 
 * @return object
 */
NavigationPanel.prototype.getMenuItems = function(){
	var view = this.view;
	var menuItems = {};

	$('[name="menuItem"]').each(function(ndx,el){
		var node = view.getProject().getNodeByPosition($(this).attr('id').replace('node_',''));
		if(node){
			menuItems[node.id] = this;
		}
	});

	return menuItems;
};

/**
 * Set the constraint status to disabled for all the steps that come after the given node id.
 * If the node id is for a sequence, we will disable all steps after the sequence.
 * @param nodeId the node id to disable all steps after
 */
NavigationPanel.prototype.disableAllStepsAfter = function(nodeId) {
	//get all the node ids that come after this one
	var nodeIdsAfter = view.getProject().getNodeIdsAfter(nodeId);

	//loop through all the node ids that come after the one passed in
	for(var x=0; x<nodeIdsAfter.length; x++) {
		//get a node id
		var nodeIdAfter = nodeIdsAfter[x];

		//get the node
		var node = view.getProject().getNodeById(nodeIdAfter);

		//set the constraint status to disabled
		node.setConstraintStatus('disabled');
	}
};

/**
 * Set the constraint status to disabled for all the steps except for the given node id.
 * If the node id is for a sequence, we will disable all steps outside of the sequence.
 * @param nodeId the node id to not disable
 */
NavigationPanel.prototype.disableAllOtherSteps = function(nodeId) {
	//get all the menu elements
	var menuItems = this.getMenuItems();

	//get the node
	var node = this.view.getProject().getNodeById(nodeId);
	var nodeIds = [];

	if(node.type == 'sequence') {
		//the node is a sequence so we will get all the node ids in it
		nodeIds = this.view.getProject().getNodeIdsInSequence(nodeId);
	}

	//get all the step node ids in the project
	var allNodeIds = this.view.getProject().getNodeIds();

	//loop through all the step node ids
	for(var x=0; x<allNodeIds.length; x++) {
		//get a node id
		var tempNodeId = allNodeIds[x];

		//get the node
		var tempNode = view.getProject().getNodeById(tempNodeId);

		if(node.type == 'sequence') {
			//the node we want to keep enabled is a sequence
			if(nodeIds.indexOf(tempNodeId) == -1) {
				//the temp node id is not in our sequence so we will disable it

				//set the constraint status to disabled
				tempNode.setConstraintStatus('disabled');
			}
		} else {
			//the node that we want to keep enabled is a step
			if(nodeId != tempNodeId) {
				//set the constraint status to disabled
				tempNode.setConstraintStatus('disabled');
			}
		}
	}
};

/**
 * Set the constraint status to disabled for the given node id
 * @param nodeId the node id to disable
 */
NavigationPanel.prototype.disableStepOrActivity = function(nodeId) {
	//get the node
	var node = this.view.getProject().getNodeById(nodeId);

	if(node.type == 'sequence') {
		//the node is a sequence

		//get all the node ids in the sequence
		var nodeIds = this.view.getProject().getNodeIdsInSequence(nodeId);

		//loop through all the node ids
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var tempNodeId = nodeIds[x];

			//get the node
			var tempNode = this.view.getProject().getNodeById(tempNodeId);

			//set the constraint status to disabled
			tempNode.setConstraintStatus('disabled');
		}
	} else {
		//the node is a step

		//get the node
		var node = this.view.getProject().getNodeById(nodeId);

		//set the constraint status to disabled
		node.setConstraintStatus('disabled');
	}
};

/**
 * Enable all the steps
 */
NavigationPanel.prototype.enableAllSteps = function() {
	//get all the step node ids in the project
	var nodeIds = this.view.getProject().getNodeIds();

	//loop through all the node ids
	for(var x=0; x<nodeIds.length; x++) {
		//get a node id
		var nodeId = nodeIds[x];

		//get the node
		var node = this.view.getProject().getNodeById(nodeId);

		//set the constraint status to disabled
		node.setConstraintStatus('enabled');
	}
};


/**
 * Set the step icon in the navigation
 * @param nodeId the node id
 * @param stepIconPath the path to the new icon
 */
NavigationPanel.prototype.setIcon = function(nodeId, stepIconPath) {
	if(nodeId != null && nodeId != '' && stepIconPath != null && stepIconPath != '') {
		//the node id and step icon path were provided so we will use them

		/*
		 * replace all the '.' with '\\.' so that the jquery id selector works
		 * if we didn't do this, it would treat the '.' as a class selector and
		 * would not be able to find the element by its id because almost all
		 * of our ids contain a '.'
		 * e.g. node_1.ht
		 */
		nodeId = nodeId.replace(/\./g, '\\.');

		//set the img src to the step icon path
		$('#anchor_' + nodeId).attr('xlink:href', stepIconPath);
	}
};

/**
 * A node has updated its status so we will perform any changes based on
 * the new node status
 * 
 * @param type the type of event that was fired
 * @param args the parameters passed to the event when the event was fired
 * @param obj the view object
 */
NavigationPanel.prototype.nodeStatusUpdatedListener = function(type, args, obj) {
	var thisView = obj;
	var nodeId = args[0];
	var statusType = args[1];
	var statusValue = args[2];
	
	//get the node that had its status updated
	var node = thisView.getProject().getNodeById(nodeId);
	
	//get all the node ids that depend on this node's status
	var nodeIdsListening = node.nodeIdsListening;
	
	//loop through all the node ids that depend on this node's status
	for(var x=0; x<nodeIdsListening.length; x++) {
		//get a node id
		var nodeIdListening = nodeIdsListening[x];
		
		//get the node
		var tempNode = thisView.getProject().getNodeById(nodeIdListening);

		//get the icon path for the node depending on the statuses
		var tempIconPath = tempNode.getIconPathForStatuses();

		//set the icon for the node
		thisView.navigationPanel.setIcon(nodeIdListening, tempIconPath);
	}
	
	if(statusType == 'isVisitable' && statusValue == false) {
		//the step is not visitable so we will grey out the step
		
		//get the position of the step
		var position = thisView.getProject().getPositionById(nodeId);
		var positionEscaped = thisView.escapeIdForJquery(position);

		//grey out the step
		$('#node_' + positionEscaped).addClass('constraintDisable');
	} else if(statusType == 'isVisitable' && statusValue == true) {
		//the step is visitable so we will make sure it is not greyed out
		
		//get the position of the step
		var position = thisView.getProject().getPositionById(nodeId);
		var positionEscaped = thisView.escapeIdForJquery(position);

		//remove the class that greys out the step
		$('#node_' + positionEscaped).removeClass('constraintDisable');
	}
};

/**
 * Get the full node name
 * @param nodeId the node id
 * @return the titles of all the nodes in the hierarchy including
 * the highest sequence number
 * e.g.
 * if activity 1 is called 'First Galaxy' and the second step in
 * that activity is called 'Silver', we would return
 * '#1: First Galaxy: Silver'
 */
NavigationPanel.prototype.getFullNodeName = function(nodeId) {
	var fullStepName = view.getProject().getNodeTitles(nodeId);
	
	//get the highest sequence number in the hierarchy
	var highestSequenceNumberInHierarchy = view.getHighestSequenceNumberInHierarchy(nodeId);
	
	fullStepName = '#' + highestSequenceNumberInHierarchy + ': ' + fullStepName; 
	
	return fullStepName;
};


/**
* The navMode dispatcher catches events specific to this project
* navigation mode and delegates them to the appropriate functions for
* this view.
* 
* REQUIRED
*/
View.prototype.navModeDispatcher = function(type,args,obj){
	if(type=='renderNodeCompleted') { // REQUIRED (DO NOT EDIT)
		obj.renderNavigationPanel();
	} if(type=='navigationMenuCreated'){ // REQUIRED (DO NOT EDIT)
		obj.navigationPanel.menuCreated();
	} else if(type=='navNodeRendered'){ // REQUIRED  (DO NOT EDIT)
		if(obj.navigationPanel){
			obj.navigationPanel.nodeRendered(args[0]);
		}
	} else if(type=='toggleNavigationVisibility'){ 
		obj.navigationPanel.toggleVisibility();
	} else if(type=='navSequenceOpened'){ 
		obj.navigationPanel.sequenceOpened(args[0]);
	} else if(type=='navSequenceClosed'){ 
		obj.navigationPanel.sequenceClosed(args[0]);
	} else if(type=="navigationPanelPrevButtonClicked") {
		obj.navigationPanel.navigationPanelPrevButtonClickedListener();
	} else if(type=="navigationPanelNextButtonClicked") {
		obj.navigationPanel.navigationPanelNextButtonClickedListener();
	} else if(type=="navigationPanelToggleVisibilityButtonClicked") { // REQUIRED (DO NOT EDIT)
		obj.navigationPanel.navigationPanelToggleVisibilityButtonClickedListener();
	} else if(type=="navigationNodeClicked") {
		obj.navigationPanel.navigationNodeClickedListener(args[0]);
	} else if(type=="visitNode") {
		obj.navigationPanel.visitNodeListener(args[0]);
	};
};

/**
* this list of events (should include each of the types specified in the navModeDispatcher above)
* REQUIRED
*/
var events = [
             'renderNodeCompleted', // REQUIRED (DO NOT EDIT)
             'toggleNavigationVisibility', 
             'navigationMenuCreated', // REQUIRED (DO NOT EDIT)
             'navNodeRendered', // REQUIRED (DO NOT EDIT)
             'navSequenceOpened', 
             'navSequenceClosed', 
             'navigationPanelPrevButtonClicked',
             'navigationPanelNextButtonClicked',
             'navigationPanelToggleVisibilityButtonClicked', // REQUIRED (DO NOT EDIT)
             'navigationNodeClicked',
             'visitNode'
             ];

/**
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 * REQUIRED (DO NOT EDIT)
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'navModeDispatcher');
};


/**
 * used to notify scriptloader that this script has finished loading
 * REQUIRED
 */
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename file path to include your theme and navigation mode folder names
	 * 
	 * e.g. if you were creating a navigation mode called 'classic' in the theme called
	 * 'wise', it would look like:
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/themes/wise/navigation/classic/nav.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/themes/starmap/navigation/map/nav.js');
}
