function VLE() {
	this.config = null;
	this.eventManager = new EventManager();
	this.state = new VLE_STATE();
	this.project = null;
	this.navigationLogic = null;
	this.visibilityLogic = null;
	this.navigationPanel = null;
	this.contentPanel = null;
	this.audioManager = null;
	this.connectionManager = new ConnectionManager(this.eventManager);
	this.journal = null;
	this.journalResize = null;
	this.postNodes = [];
	this.myUserInfo = null;
	this.myClassInfo = null;
	this.getDataUrl = null;
    this.postDataUrl = null;
    this.startEventsAndListeners();
    this.annotations = null;
    this.lastPostStates = "";
    this.runManager = null;
    this.runId = null;
    this.currentNode = null;   // points to current node
    
    shortcutManager.addShortcut(39, 'renderNextNode', ['shift'], this);
    shortcutManager.addShortcut(37, 'renderPrevNode', ['shift'], this);
    shortcutManager.addShortcut(77, 'toggleNavigationPanelVisibility', ['shift'], this);
    shortcutManager.start();
    
	//set the global_yui variable
	YUI().use('node', function(Y) {
		global_yui = Y;
	});
};

VLE.prototype.startEventsAndListeners = function(){
	this.eventManager.addEvent(this, 'vleConfigLoading');
	this.eventManager.addEvent(this, 'vleConfigLoadingComplete');
    this.eventManager.addEvent(this, 'projectLoading');
    this.eventManager.addEvent(this, 'projectLoadingComplete');
    this.eventManager.addEvent(this, 'learnerDataLoading');
    this.eventManager.addEvent(this, 'learnerDataLoadingComplete');
    
    this.eventManager.addEvent(this, 'loadUserAndClassInfo');
    this.eventManager.addEvent(this, 'loadUserAndClassInfoComplete');

    this.eventManager.addEvent(this, 'lockScreenEvent');
    this.eventManager.addEvent(this, 'unlockScreenEvent');

    this.eventManager.inititializeLoading([['projectLoading', 'projectLoadingComplete', 'project'], ['learnerDataLoading', 'learnerDataLoadingComplete', 'learner data']]);

	var renderNodeListener = function(){
		notificationManager.notify('renderNodeListener', 4);
		if(vle && vle.project){
			var startId = vle.project.getStartNodeId();

			
			if (vle.config != null && vle.config.startNode && vle.config.startNode != null) {
				startId = vle.config.startNode;
			}
			
			if(startId){
				vle.renderNode(startId);
			};
			
			//display the title of the project in the upper left box
			if(document.getElementById("title") != null && vle.getProjectTitle() != null) {
				document.getElementById("title").innerHTML = vle.getProjectTitle();
				document.getElementsByTagName("title")[0].innerHTML = vle.getProjectTitle();
				if (window.parent) {
					window.parent.document.title = window.parent.document.title + ": " + vle.getProjectTitle();
				}
			}
			
			//display the user name in the upper left box
			if(document.getElementById("logInBox") != null) {
				document.getElementById("logInBox").innerHTML = "Hello " + vle.getUserName();
			}
			
			//display the "Show Me Flagged Items" link if flagging is enabled
			if(vle.runManager != null && vle.runManager.isFlaggingEnabled) {
				document.getElementById("flagDiv").innerHTML = "<a href='#' id='flagButton' onClick='javascript:vle.displayFlaggedItems();' >Show Me Flagged Items</a>";
			}
		} else {
			notificationManager.notify('VLE and project not ready to load any nodes', 3);
		};
	};
	
	var startMenuListener = function(){
		var menuEl = document.getElementById('my_menu');
		
		if(menuEl){
			myMenu = new SDMenu('my_menu');
		};
	};
	
	var menuInitializerListener = function(){
		if(myMenu){
			myMenu.init();
		};
		
		
		if (vle.config != null && vle.config.mainNav && vle.config.mainNav != null) {
			var mainNav = vle.config.mainNav;
			
			if (mainNav == 'none') {
				vle.toggleNavigationPanelVisibility();
			};
		};
	};
	
	var lockScreenEventListener = function() {
		if (vle){ 
			vle.lockscreen();
		};
	};

	var unlockScreenEventListener = function() {
		if (vle){ 
			vle.unlockscreen();
		};
	};

	this.eventManager.subscribe('projectLoadingComplete', renderNodeListener);
	this.eventManager.subscribe('projectLoadingComplete', startMenuListener);
	this.eventManager.subscribe('projectLoadingComplete', menuInitializerListener);
	this.eventManager.subscribe('lockScreenEvent', lockScreenEventListener);
	this.eventManager.subscribe('unlockScreenEvent', unlockScreenEventListener);
};

/**
 * Sets the Project to render
 */
VLE.prototype.setProject = function(project) {
	this.project = project;
	this.contentPanel = new ContentPanel(project, project.rootNode);
	this.navigationPanel = new NavigationPanel(project.rootNode, project.autoStep, project.stepLevelNumbering, project.stepTerm);
}

/**
 * Set the vle state for this vle. For use mainly in ticker.
 * @param vleState a VLE_STATE object
 */
VLE.prototype.setVLEState = function(vleState) {
	this.state = vleState;
};

/**
 * Updates the audio files. Only available in authoring tool mode.
 */
VLE.prototype.updateAudio = function() {
	this.eventManager.subscribe('projectLoadingComplete', projectLoadingCompleteListenerUpdateAudio);
};

/**
 * call back for when the project finished loading for updating audio files
 */
var projectLoadingCompleteListenerUpdateAudio = function() {
	notificationManager.notify('project loading complete, now on to updating audio files', 4);
	var message = "Generating Audio Files...";
	vle.lockscreen(message);

	setInterval("updateAudioStepThruEveryNode()", 2500);
};

var updateAudioStepThruEveryNode = function() {
	if (vle.renderNextNode() != null) {		
	} else {
		vle.lockscreen("Generating Audio Files...Complete! Please Close this window.");
	}
};


/**
 * rewinds currently-playing audio
 */
VLE.prototype.rewindStepAudio = function() {
	if (this.audioManager) {
		this.audioManager.rewindStepAudio();
	}
};

/**
 * rewinds currently-playing audio
 */
VLE.prototype.previousStepAudio = function() {
	if (this.audioManager) {
		this.audioManager.previousStepAudio();
	}
}

/**
 * forwards to the next audio
 */
VLE.prototype.forwardStepAudio = function() {
	if (this.audioManager) {
		this.audioManager.nextStepAudio();
	}
}
/**
 * toggles play/pause audio
 */
VLE.prototype.playPauseStepAudio = function() {
	if (this.audioManager) {
		this.audioManager.playPauseStepAudio();	
	}
};

/**
 * Renders the VLE.
 *    If nodeId is not specified (is null):
 *          If the student has visited the project before (there is state.visitedNodes), 
 *       find render the last node visited.
 *          Otherwise, show the first non-hidden node.
 *    Otherwise, render node with specified nodeId.   
 * @param {Object} nodeId
 */
VLE.prototype.renderNode = function(nodeId){
	notificationManager.notify('renderNode, nodeId:' + nodeId, 4);
    var nodeToVisit = null;
    if (nodeId == null) {
		if (this.state.visitedNodes.length > 0) {
			nodeToVisit = this.state.visitedNodes[this.state.visitedNodes.length - 1];
		} else {
			nodeToVisit = this.visibilityLogic.getNextVisibleNode(this.state, this.project.rootNode);
		}
    } else {
        nodeToVisit = this.getNodeById(nodeId);
    }
	
	if (nodeToVisit == null) {
		notificationManager.notify("VLE: nodeToVisit is null Exception. Exiting", 3);
		return;
	}
	
    if (this.navigationLogic == null || this.navigationLogic.canVisitNode(this.state, nodeToVisit)) {
        var currentNode = nodeToVisit;
        vle.state.setCurrentNodeVisit(currentNode);
        this.navigationPanel.render('render');
        this.contentPanel.render(currentNode.id);
		if(this.connectionManager != null) {
			if (this.config != null && this.config.mode == "run") {
				this.postToConnectionManager(currentNode);
			}
		}
        //alert('a:' + currentNode.nodeSessionEndedEvent);
        //alert('b:' + this.onNodeSessionEndedEvent);
        currentNode.nodeSessionEndedEvent.subscribe(this.onNodeSessionEndedEvent, this); // add the listener for this node
		this.expandActivity(nodeId);   // always expand the navigation bar
    }
    
    var loadingMessageDiv = document.getElementById("loadingMessageDiv");
    if(loadingMessageDiv != null && loadingMessageDiv != undefined) {
    	loadingMessageDiv.innerHTML = "";
    }
	
	//Set icon in nav bar
	if(currentNode.className && currentNode.className!='null' && currentNode.className!=''){
		document.getElementById('stepIcon').innerHTML = '<img src=\'' + iconUrl + currentNode.className + '28.png\'/>';
	};
	
	// adjust height of iframe. If nav bar is visible, set iframe height=navbarheight.
	// else, leave it untouched
	if (document.getElementById("projectLeftBox").offsetHeight > 0) {
		document.getElementById("ifrm").style.height = 
			document.getElementById("projectLeftBox").offsetHeight;
	}
    // fire currenct changed event
	this.currentNode = currentNode;
}

/**
 * Posts the latest state to the server.
 * @param currentNode
 */
VLE.prototype.postToConnectionManager = function(currentNode) {
	//set postNodes to contain all the leaf nodes
	this.postNodes = this.getLeafNodeIds();
	for(var q=0;q<this.postNodes.length;q++){
		if(currentNode.id==this.postNodes[q]){
			var currentPostStates = this.state.getCompletelyVisitedNodesDataXML();
			var diff = currentPostStates.replace(this.lastPostStates, "");
			if(diff != null && diff != ""){
				var url;
				if(this.postDataUrl){
					url = this.postDataUrl;
				} else {
					url = "postdata.html";
				};
				this.lastPostStates = currentPostStates;
				if(vle.myUserInfo != null) {
					this.connectionManager.request('POST', 3, url, {runId: this.runId, userId: vle.myUserInfo.workgroupId, data: prepareDataForPost(diff)}, this.processPostResponse);
				} else {
					this.connectionManager.request('POST', 3, url, {runId: this.runId, userId: '-2', data: prepareDataForPost(diff)}, this.processPostResponse);
				};
			};
		};
	};
};

/**
 * Given a data, returns it in a post-ready format.
 * For now, this only works on node_visit. It simply wraps the <node_visit>...</node_visit> with <node_visits> tags.
 */
function prepareDataForPost(postData) {
	return "<node_visits>" + postData + "</node_visits>";	
}

VLE.prototype.processPostResponse = function(responseText, responseXML){

};

/**
 * When a node session has ended, re-render the navigation panel, as some nodes might have
 * become visible/invisible.
 */
VLE.prototype.onNodeSessionEndedEvent = function(type, args, me) {
   me.navigationPanel.render(type);
}

VLE.prototype.expandActivity = function(nodeId) {
	if(nodeId.charAt(0)!='J'){
		var idStr = new String(nodeId);
		var newActivityId = idStr.substring(0, idStr.lastIndexOf(":"));
		var node = this.getNodeById(nodeId);
		if(newActivityId){			
			submenu = document.getElementById(newActivityId + "_menu");
			myMenu.expandMenu(submenu);
		}
		if (node.parent) {
			submenu = document.getElementById(node.parent.id + "_menu");
			if(submenu){
				//remove the collapsed class from the menu so it becomes expanded
				submenu.className = submenu.className.replace("collapsed", "");
			};
		};
	};
}

/**
 * Renders the previous node in the sequence. If prev node does not exist, return null.
 * @return previous node. if previous node does not exist, return null.
 */
VLE.prototype.renderPrevNode = function() {
	var currentNode = this.currentNode;
	if (this.navigationLogic == null) {
		notificationManager.notify("prev is not defined.", 1);
	}
	
	if(currentNode.type=='GlueNode'){
		currentNode.renderPrev();
	} else {
		//if current node is note, we are leaving and should 'close' note panel
		if(currentNode.type=='NoteNode'){
			notePanel.cfg.setProperty("visible", false);
		};
		var prevNode = this.navigationLogic.getPrevNode(currentNode);
		while (prevNode != null && (prevNode.type == "Activity" || prevNode.children.length > 0)) {
			prevNode = this.navigationLogic.getPrevNode(prevNode);
		}
		
		if (prevNode == null) {
			notificationManager.notify("prevNode does not exist", 1);
		} else {
			this.renderNode(prevNode.id);
			
			this.collapseAllNonImmediate(prevNode);	
			return prevNode;
		}
	};
}

/**
 * Renders the next node in the sequence.  If next node does not exist, return null.
 * @return next node. if next node does not exist, return null.
 */
VLE.prototype.renderNextNode = function() {
	var currentNode = this.currentNode;
	if (this.navigationLogic == null) {
		notificationManager.notify("next is not defined.", 1);
	}
	
	if(currentNode.type=='GlueNode'){
		currentNode.renderNext();
	} else {
		//if current node is note, we are leaving and should 'close' note panel
		if(currentNode.type=='NoteNode'){
			notePanel.cfg.setProperty("visible", false);
		};
		var nextNode = this.navigationLogic.getNextNode(currentNode);
		while (nextNode != null && (nextNode.type == "Activity" || nextNode.children.length > 0)) {
			nextNode = this.navigationLogic.getNextNode(nextNode);
		}
		if (nextNode == null) {
			notificationManager.notify("nextNode does not exist", 1);
		} else {
			this.renderNode(nextNode.id);
		
			this.collapseAllNonImmediate(nextNode);
			return nextNode;
		}
	};
}

/* 
* finds and collapses all nodes except parents, grandparents, etc
*/
VLE.prototype.collapseAllNonImmediate = function(node) {
		//obtain all the parents, grandparents, etc of this node
		var enclosingNavParents = this.getEnclosingNavParents(node);
		
		if(enclosingNavParents != null && enclosingNavParents.length != 0) {
			//collapse all nodes except parents, grandparents, etc
			myMenu.forceCollapseOthersNDeep(enclosingNavParents);	
		}
}

/**
 * Obtain an array of the parent, grandparent, etc. basically the parent,
 * the parent's parent, the parent's parent's parent, etc. so that when
 * the nav menu is displaying a project that is n-levels deep, we know
 * which parents to keep open. We need to keep all of these ancestors
 * open and not just the immediate parent.
 * @param node the node we are currently on
 * @param enclosingNavParents an array containing all the parents
 * @return the array of ancestors
 */
VLE.prototype.getEnclosingNavParents = function(node, enclosingNavParents) {
	//initialize the ancestors array
	if(enclosingNavParents == null) {
		enclosingNavParents = new Array();
	}
	
	if(node != null && node.parent != null) {
		//see if the parent has an element in the nav
		var parentNavElement = document.getElementById(node.parent.id + '_menu');
		if(parentNavElement != null) {
			/*
			 * the parent does have an element in the nav so we will add it
			 * to our array of ancestors
			 */
			enclosingNavParents.push(parentNavElement);
		}
		//look for the ancestors of the parent recursively
		return this.getEnclosingNavParents(node.parent, enclosingNavParents);
	} else {
		/*
		 * we have reached to top of the parent tree so we will now
		 * return the ancestor array
		 */
		return enclosingNavParents;
	}
}

/**
 * Returns the node that the user is currently viewing.
 * @return
 */
VLE.prototype.getCurrentNode = function() {
	//return this.currentNode;
	var nodeVisit = this.state.getCurrentNodeVisit();
	if (nodeVisit != null) {
		return nodeVisit.node;
	}
	return null;
}

/**
 * displays flagged items in Contentpanel for currentNode
 * This only works if the VLE is running in a portal context and the
 * runId is set.
 */
VLE.prototype.displayFlaggedItems = function() {
	if (this.config == null || this.config.getFlagsUrl == null) {
		return;
	}
	var currentNodeId = this.currentNode.id;
	var runId = this.runManager.runId;
	
	//retrieve the flagged items for the current node
	this.connectionManager.request('GET', 2, this.config.getFlagsUrl, {nodeId: currentNodeId}, this.getFlagCallback);
}

/**
 * Displays the flagged items that have been sent back in the response
 * @param responseText
 * @param responseXML the xml that contains the flagged items
 * @return
 */
VLE.prototype.getFlagCallback = function(responseText, responseXML) {
	//parse the xml flags object that contains all the flags for this run/node
	flags = Flags.prototype.parseDataXML(responseXML);
	
	//create the html that will display the flagged items
	var flagHtml = "";
	flagHtml += "<table border='1'>";
	flagHtml += "<tr><th>Flagged Responses</th></tr>";
	
	if(flags.flagsArray.length == 0) {
		//notify the user if there were no flagged items
		flagHtml += "<tr><td>No flagged responses</td></tr>";
	} else {
		//loop through all the flagged items
		for(var x=0; x<flags.flagsArray.length; x++) {
			flagHtml += "<tr><td>" + flags.flagsArray[x].studentWork + "</td></tr>";
		}
	}
	
	flagHtml += "</table>";
	
	//set the html into the iframe so the student can see it
	window.frames["ifrm"].document.open();
	window.frames["ifrm"].document.write(flagHtml);
	window.frames["ifrm"].document.close();
}

VLE.prototype.toggleNavigationPanelVisibility = function() {
	this.navigationPanel.toggleVisibility();	
}

VLE.prototype.print = function() {
	window.print();
}

VLE.prototype.getNodeVisitedInfo = function() {
	var infoInHtml = "";
	for (var i=0; i < vle.state.visitedNodes.length; i++) {
		var currNode = vle.state.visitedNodes[i];
		infoInHtml += "nodeId: " + currNode.node.id + "<br/>startTime: " + currNode.visitStartTime + "<br/>endTime: " + currNode.visitEndTime + "<br/><br/>";
	}
	document.getElementById("experimentaloutput").innerHTML = infoInHtml;
}

VLE.prototype.showAllWork = function(doGrading){
    var allWorkHtml = "";
	allWorkHtml = "<div style=\"width: 950px; text-align:left; height: 550px; overflow: auto\">" + this.project.getShowAllWorkHtml(this.project.rootNode, doGrading) + "</div>";
    YAHOO.namespace("example.container");
    var content = document.getElementById("showAllWorkDiv");
    
    content.innerHTML = "";
    
    if (!YAHOO.example.container.showallwork) {
    
        // Initialize the temporary Panel to display while showallworking for external content to load
        
        YAHOO.example.container.showallwork = new YAHOO.widget.Panel("showallwork", {
            width: "1000px",
			height: "600px",
			fixedcenter: true,
            close: true,
            draggable: false,
            zindex: 4,
            modal: true,
            visible: false
        });
        
        YAHOO.example.container.showallwork.setHeader("Your Work");
        YAHOO.example.container.showallwork.setBody(allWorkHtml);
        YAHOO.example.container.showallwork.render(document.body);
        
    }
    else {
        YAHOO.example.container.showallwork.setBody(allWorkHtml);
    }
    
    // Show the Panel
    YAHOO.example.container.showallwork.show();
}

/**
 * This returns html that displays the student's progress e.g.
 * 
 * <table><tr><td>aa11</td><td>7%</td><td>Q15 (0:0:15)</td><td>Q6 (0:0:6), Q7 (0:0:7), Q8 (0:0:8), Q9 (0:0:9), Q11 (0:0:11), Q12 (0:0:12), Q13 (0:0:13), Q14 (0:0:14)</td></tr></table>
 * 
 * @param vle the vle object that has it's vle_state populated with 
 * 		student data
 * @param reportsToShow array of report names to show. Possible values
 * are: {onlyLatestAsCSV,allAnswerRevisionsCSV,allAnswerRevisionsHtml, timeline} 
 * @return an html string that displays the student user name,
 * 		percentage completion of project, current step they're on,
 * 		and steps they skipped
 */
VLE.prototype.getProgress = function(reportsToShow) {
	var progressHtml = "";
	
	/*
	 * all the nodes/steps in the project
	 * (node and step are the same in this context)
	 */
	var nodeIds = this.getLeafNodeIds();
	
	//a counter to keep track of the number of nodes visited by the student
	var nodesVisited = 0;
	
	//the last step the student visited
	var lastNodeIdVisitedByStudent = "";
	
	//keeps track of nodes that might have been skipped
	var nodesPossiblySkipped = "";
	
	//keeps track of the nodes that were skipped
	var nodesSkipped = "";
	
	//loop through all the nodes in the project
	for(var x=0; x<nodeIds.length; x++) {
		//obtain a specific node from the vle
		var nodeId = nodeIds[x];
		var nodeTitle = this.getNodeById(nodeId).title;
		var nodeTitleAndId = nodeTitle + " (" + nodeId + ")";
		
		/*
		 * get all the node visits by this student that the vle represents
		 * for this node
		 */
		nodeVisitsForNodeId = this.state.getNodeVisitsByNodeId(nodeId);
		
		if(nodeVisitsForNodeId.length != 0) {
			//the student has visited this step
			
			/*
			 * increment the count of nodes visited so we can calculate
			 * the percentage of project completed
			 */
			nodesVisited++;
			
			/*
			 * remember this current node because it may be the last node
			 * the student visited
			 */
			lastNodeIdVisitedByStudent = nodeTitleAndId;
			
			
			if(nodesPossiblySkipped != "") {
				//if there were any previous nodes possibly skipped, add a comma
				if(nodesSkipped != "") {
					nodesSkipped += ", ";
				}
				
				/*
				 * add the nodes possibly skipped to the nodes skipped
				 * because now we know they really did skip these nodes
				 * because the current node, which comes after the 
				 * possibly skipped nodes has been visited
				 */
				nodesSkipped += nodesPossiblySkipped;
				
				//clear out the nodes possibly skipped
				nodesPossiblySkipped = "";
			}
		} else {
			/*
			 * the student has not visited this step so we will remember
			 * this step. if we find that the student has visited a step
			 * after this step, that means this step was skipped, otherwise
			 * it just means the student has only gotten this far in the
			 * project and did not actually skip any steps
			 */
			
			//add a comma if there were previous nodes possibly skipped
			if(nodesPossiblySkipped != "") {
				nodesPossiblySkipped += ", ";
			}
			
			//add the current node to the nodes possibly skipped
			nodesPossiblySkipped += nodeTitleAndId;
		}
	}
	
	//output the data in html form
	progressHtml += "<table width='100%'>";
	progressHtml += "<tr>";
	
	//username
	progressHtml += "<td width='15%'>" + this.getUserName() + "</td>";
	
	//percentage of project completed
	progressHtml += "<td width='15%'>" + Math.floor(nodesVisited * 100 / nodeIds.length) + "%" + "</td>";
	
	//furthest node the student visited
	progressHtml += "<td width='15%'>" + lastNodeIdVisitedByStudent + "</td>";
	
	//the nodes the student skipped
	progressHtml += "<td width='30%'>" + nodesSkipped + "</td>";
	
	/*
	 * the save button that allows the user to save the student's
	 * data as a csv file. this only saves the student's latest
	 * answers
	 */ 
	progressHtml += "<td width='25%'>";
	
	
	var onlyLatestAsCSV = "<input type='button' value='Save Only Latest Answers as CSV File' onclick='saveStudentWorkToFile(\"simpleCSV\")' /><br><br>";
	
	/*
	 * the save button that allows the user to save the student's
	 * data as a csv file. this saves all the revisions of the
	 * student's answers.
	 */
	var allAnswerRevisionsCSV = "<input type='button' value='Save All Answer Revisions as CSV File' onclick='saveStudentWorkToFile(\"detailedCSV\")' /><br><br>";

	/*
	 * the save button that allows the user to save the student's
	 * data as an html file. this saves all the revisions of the
	 * student's answers.
	 */
	var allAnswerRevisionsHtml = "<input type='button' value='Save All Answer Revisions as HTML File' onclick='saveStudentWorkToFile(\"HTML\")' /><br><br>";

	/*
	 * the save button that allows the user to save the student's
	 * data as a csv file. this saves all the revisions of the
	 * student's answers in the order they answered them including
	 * timestamps.
	 */
	var timeline = "<input type='button' value='Save Timeline as CSV File' onclick='saveStudentWorkToFile(\"timelineCSV\")' />";

	// show specified reports. If none specified, show all.
	if(reportsToShow != null && reportsToShow.length > 0) {
		if (reportsToShow.contains("onlyLatestAsCSV")) {
			progressHtml += onlyLatestAsCSV;
		}
		if (reportsToShow.contains("allAnswerRevisionsCSV")) {
			progressHtml += allAnswerRevisionsCSV;
		}
		if (reportsToShow.contains("allAnswerRevisionsHtml")) {
			progressHtml += allAnswerRevisionsHtml;
		}
		if (reportsToShow.contains("timeline")) {
			progressHtml += timeline;
		}
	} else {
		progressHtml += onlyLatestAsCSV + allAnswerRevisionsCSV + allAnswerRevisionsHtml + timeline;
	}

	progressHtml += "</td></tr></table>";
	//alert(progressHtml);
	
	return progressHtml;
}

VLE.prototype.showGradingTool = function() {
}

VLE.prototype.setJournal = function(journal){
	this.journal = journal;
};

VLE.prototype.getJournal = function(){
	return this.journal;
};

VLE.prototype.getNodeById = function(nodeId){
	return this.project.rootNode.getNodeById(nodeId);
};

VLE.prototype.getLeafNodeIds = function() {
	var nodeIds = [];
	this.project.rootNode.getLeafNodeIds(nodeIds);
	return nodeIds;
}

/**
 * Takes in an xml object and sets the myUserInfo and myClassInfo
 * @param userAndClassInfoXMLObject an xml object containing user and
 * 		class info
 */
VLE.prototype.loadUserAndClassInfo = function(userAndClassInfoXMLObject) {
	this.eventManager.fire('loadUserAndClassInfo');
	
	//retrieve the xml node object for myUserInfo
	var myUserInfoXML = userAndClassInfoXMLObject.getElementsByTagName("myUserInfo")[0];
	
	if(myUserInfoXML != null ) {
		//create and set my user info in this vle instance
		//alert(myUserInfoXML.getElementsByTagName("workgroupId")[0].firstChild.nodeValue);
		//alert(myUserInfoXML.getElementsByTagName("userName")[0].firstChild.nodeValue);
		this.myUserInfo = USER_INFO.prototype.parseUserInfo(myUserInfoXML);
		//alert(this.myUserInfo.userName);
	}
	
	//retrieve the xml node object for myClassInfo
	var myClassInfoXML = userAndClassInfoXMLObject.getElementsByTagName("myClassInfo")[0];
	
	if(myClassInfoXML != null) {
		var myClassInfo = new CLASS_INFO();

		//create and set the teacher
		var teacherInfoXML = myClassInfoXML.getElementsByTagName("teacherUserInfo")[0];
		if (teacherInfoXML && teacherInfoXML != null) {
			myClassInfo.teacher = USER_INFO.prototype.parseUserInfo(teacherInfoXML);
		}
		
		//create and set all the classmates
		var classmateUserInfoXMLList = myClassInfoXML.getElementsByTagName("classmateUserInfo");
		for(var x=0; x<classmateUserInfoXMLList.length; x++) {
			var classmateUserInfoXML = classmateUserInfoXMLList[x];
			var classmateUserInfo = USER_INFO.prototype.parseUserInfo(classmateUserInfoXML);
			myClassInfo.addClassmate(classmateUserInfo);
		}
		
		//set the class info in this vle instance
		this.myClassInfo = myClassInfo;
	}
	
	//load the student data...This should be called outside of this function
	//this.loadVLEState(this.myUserInfo.workgroupId, this);
	
	this.eventManager.fire('loadUserAndClassInfoComplete');
}

 
VLE.prototype.getWorkgroupId = function() {
	if(this.myUserInfo != null) {
		return this.myUserInfo.workgroupId;
	} else {
		return "";
	}
}

VLE.prototype.setUserName = function(userName) {
	if(this.myUserInfo != null) {
		this.myUserInfo.userName;
	}
}

VLE.prototype.setWorkgroupId = function(workgroupId) {
	if(this.myUserInfo != null) {
		this.myUserInfo.workgroupId = workgroupId;
	}
}

VLE.prototype.getUserName = function() {
	if(this.myUserInfo != null) {
		return this.myUserInfo.userName;
	} else {
		return "";
	}
}

/**
 * Get the project title
 * @return the title of the project that is loaded in the vle
 */
VLE.prototype.getProjectTitle = function() {
	return this.project.title;
}

/*
 * Returns all of the students in the student's class including the student.
 */
VLE.prototype.getClassUsers = function() {
	var allStudentsArray = new Array();
	for (var i=0; i<this.myClassInfo.classmates.length; i++) {
		allStudentsArray.push(this.myClassInfo.classmates[i]);
	}
	allStudentsArray.push(this.myUserInfo);
	return allStudentsArray;
}

/**
 * Returns the userName associated with the userId
 * @param userId the id of the user we want the userName for
 * @return the userName with the given userId or null if
 * 		no one has the userId
 */
VLE.prototype.getUserNameByUserId = function(userId) {
	//check the current logged in user
	if(userId == this.getWorkgroupId()) {
		return this.getUserName();
	}
	
	//check the class mates
	for(var x=0; x<this.myClassInfo.classmates.length; x++) {
		if(userId == this.myClassInfo.classmates[x].workgroupId) {
			return this.myClassInfo.classmates[x].userName;
		}
	}
	
	//return null if no one was found with the userId
	return null;
}

/**
 * Loads the student's latest work from the last time they worked on it
 * @param dataId the workgroupId
 * @param vle this vle
 */
VLE.prototype.loadVLEState = function() {		
	if (vle.myUserInfo && vle.myUserInfo.workgroupId) {
		this.connectionManager.request('GET', 2, this.getDataUrl, {userId: vle.myUserInfo.workgroupId}, this.processLoadVLEStateResponse);
	} else {
		this.connectionManager.request('GET', 2, this.getDataUrl, null, this.processLoadVLEStateResponse);
	};
};

/**
 * Process the response from connection manager's async call to loadevlestate
 */
VLE.prototype.processLoadVLEStateResponse = function(responseText, responseXML){
	if(responseXML){
		var vleStateXMLObj = responseXML.getElementsByTagName("vle_state")[0];
		if (vleStateXMLObj) {
			var vleStateObj = VLE_STATE.prototype.parseDataXML(vleStateXMLObj);
			vle.setVLEState(vleStateObj);
		};
	};
	vle.lastPostStates = vle.state.getCompletelyVisitedNodesDataXML();
	
	/*
	 * when the vle is initially loaded up, the last node visit from the
	 * last session becomes the current node visit which is incorrect.
	 * this is because when the student performs work on the current
	 * node visit the start time of the node visit was way back when
	 * they visited the node during the last session. we will resolve this
	 * below
	 */
	
	//get the current node visit
	var currentNodeVisit = vle.state.getCurrentNodeVisit();
	
	if(currentNodeVisit != null) {
		//get the current node
		var node = currentNodeVisit.node;
		
		//create a new visit visiting the node we are on
		var newNodeVisit = new NODE_VISIT(node);
		
		/*
		 * add the new node visit to the vle state so it now becomes
		 * the "current node visit"
		 */
		vle.state.visitedNodes.push(newNodeVisit);
	}
	
	/*
	 * fire the event that this function is done, also pass in the workgroupId
	 * which is used by the progress monitor, if this is not being called
	 * by the progress monitor, the workgroupId can just be ignored
	 */
	vle.eventManager.fire('learnerDataLoadingComplete', vle.getWorkgroupId());
};

/**
 * Given the vleConfigUrl, fetches the VLE Config file and starts up the VLE
 * @param vleConfigUrl
 * @return
 */
VLE.prototype.initialize = function(vleConfigUrl) {
	//alert("vle.js, initialize: "+ vleConfigUrl);
	this.eventManager.fire('vleConfigLoading');
	this.connectionManager.request('GET', 1, vleConfigUrl, null, this.processRetrievedVLEConfig);
}

VLE.prototype.processRetrievedVLEConfig = function(responseText, responseXML) {
	//alert('processRegtrieveVLEConfig, xml:' + responseXML + '\ntext:' + responseText);
	if (responseXML) {
		var vleConfig = new VLEConfig();
		vleConfig.parse(responseXML);
		vle.initializeFromConfig(vleConfig);
		vle.config = vleConfig;
	}
}


/**
 * Given a VLE config object, loads the project and user data
 */
VLE.prototype.initializeFromConfig = function(vleConfig) {
	//alert('initializefromconfig, vleconfig:' + vleConfig);
	vle.getDataUrl = vleConfig.getDataUrl;
    vle.postDataUrl = vleConfig.postDataUrl;
    vle.runId = vleConfig.runId;
	vle.loadProject(vleConfig.contentUrl, vleConfig.contentBaseUrl);
	if (vleConfig.useAudio != null) {
		notificationManager.notify('vleConfig.useAudio: ' + vleConfig.useAudio, 4);
		vle.audioManager = new AudioManager(vleConfig.useAudio);
        notificationManager.notify('vle.html: vle.audioManager=' + vle.audioManager, 4);
	}
	if (vleConfig.mode == "run") {
		notificationManager.notify('vleConfig.mode is run, userInfourl:' + vleConfig.userInfoUrl, 4);
		vle.loadLearnerData(vleConfig.userInfoUrl);
		if (vleConfig.runInfoUrl != null && vleConfig.runInfoRequestInterval != null) {
			vle.runManager = new RunManager(vleConfig.runInfoUrl, parseInt(vleConfig.runInfoRequestInterval), this.connectionManager, this.eventManager, vleConfig.runId);
		}
	}
	this.loadTheme(vleConfig.theme);
}

/**
 * Loads the theme and re-renders the VLE.
 * Default is the wise theme.
 */
VLE.prototype.loadTheme = function(theme) {
	var cssArrayName = "wise";   // maps to array name in scriptloader's css array.
	if (theme && theme != null) {
		cssArrayName = theme.toLowerCase();
		
		if (theme == "UCCP") {
			// update the project menu links
			document.getElementById("gotoStudentHomePageLink").href="../../moodle/index.php";
			document.getElementById("quitAndLogoutLink").href="../index.php";
		}
	}
	// start in WISE theme          
	scriptloader.generateScripts(null, scriptloader.css[cssArrayName]);
	scriptloader.loadCsss(scriptloader.css[cssArrayName]);
};

/**
 * Renders all of the nodes that are used in the project
 * for this VLE all at once in their own frames
 */
VLE.prototype.renderAll = function(contentURL, contentBaseUrl, cfgXml){
	var afterProjectLoaded = function(){
		var b = document.body;
		//remove centered div
		var cDiv = document.getElementById('centeredDiv');
		cDiv.parentNode.removeChild(cDiv);
		
		//remove frames
		var frms = window.frames;
		for(var s=0;s<frms.length;s++){
			if(frms[s].name && document.getElementById(frms[s].name)){
				var frmEl = document.getElementById(frms[s].name);
				frmEl.parent.removeChild(frmEl);
			} else if(frms[s].id && document.getElementById(frms[s].id)){
				var frmEl = document.getElementById(frms[s].id);
				frmEl.parent.removeChild(frmEl);
			};
		};
		
		//set project name if it exists
		if(vle.project.title){
			pDiv = window.parent.document.getElementById(window.name).previousSibling;
			pDiv.innerHTML = 'Project Title: ' + vle.project.title + '</br>' + pDiv.innerHTML;
		};
		
		//create frames and display elements for each node in project and
		//set initial values
		var currentNode = vle.getNodeById(vle.project.getStartNodeId());
		var count = 0;
		while(currentNode){
			var frmDiv = createElement(document, 'div', {id: 'frame_' + count + '_frameDiv', style:"border: 2px black solid;"});
			var titleDiv = createElement(document, 'div', {id: 'frame_' + count + '_displayTitleDiv'});
			var typeDiv = createElement(document, 'div', {id: 'frame_' + count + '_displayTypeDiv'});
			var filenameDiv = createElement(document, 'div', {id: 'frame_' + count + '_displayFilenameDiv'});
			
			var frm = createElement(document, 'iframe', {name: 'frame_' + count, id: 'frame_' + count, src: 'empty.html', width: '100%', height: '527'});

			b.appendChild(frmDiv);
			frmDiv.appendChild(titleDiv);
			titleDiv.innerHTML = 'Node Title: ' + currentNode.title;
			frmDiv.appendChild(typeDiv);
			typeDiv.innerHTML = 'Node Type: ' + currentNode.type;
			frmDiv.appendChild(filenameDiv);
			filenameDiv.innerHTML = 'Node ID: ' + currentNode.id;
			frmDiv.appendChild(frm);
			
			//get display settings from cfgXml and set initial state for display settings
			if(cfgXml.getElementsByTagName('displayFilenameDiv')[0].getAttribute('checked')=='true'){
				filenameDiv.style.display = 'block';
			} else {
				filenameDiv.style.display = 'none';
			};
			
			if(cfgXml.getElementsByTagName('displayTypeDiv')[0].getAttribute('checked')=='true'){
				typeDiv.style.display = 'block';
			} else {
				typeDiv.style.display = 'none';
			};
			
			if(cfgXml.getElementsByTagName('displayTitleDiv')[0].getAttribute('checked')=='true'){
				titleDiv.style.display = 'block';
			} else {
				titleDiv.style.display = 'none';
			};
			
			//Render if necessary
			if(cfgXml.getElementsByTagName('rendered')[0].getAttribute('checked')=='true'){
				currentNode.render(frm);
			} else {
				frm.style.display = 'none';
			};
			
			//display surrounding div if nodetype is checked, hide otherwise
			if(cfgXml.getElementsByTagName(currentNode.type)[0].getAttribute('checked')=='true'){
				frmDiv.style.display = 'block';
			} else {
				frmDiv.style.display = 'none';
			};
			
			//get the next visitable node for this project
			var nextNode = this.navigationLogic.getNextNode(currentNode);
			while (nextNode != null && (nextNode.type == "Activity" || nextNode.children.length > 0)) {
				nextNode = this.navigationLogic.getNextNode(nextNode);
			}
			
			//attach the node to its frame
			window.frames[frm.name].frameNode = currentNode;
			
			currentNode = nextNode;
			count ++;
		};
	};

	this.eventManager.subscribe('projectLoadingComplete', afterProjectLoaded);
	this.loadProject(contentURL, contentBaseUrl);
};

/**
 * Given the content URL, loads a project in the VLE
 */
VLE.prototype.loadProject = function(contentURL, contentBaseUrl){
	this.eventManager.fire('projectLoading');
	this.connectionManager.request('GET', 1, contentURL, null, this.processLoadProjectResponse, contentBaseUrl);
};

/**
 * Processes the response to the connectionManagers LoadProject function
 */
VLE.prototype.processLoadProjectResponse = function(responseText, responseXML, contentBaseUrl){
	if(responseXML){
		var project = new Project(responseXML, contentBaseUrl, vle.connectionManager);
		project.xmlDoc = responseXML;
		project.generateNode(responseXML);
	
		vle.setProject(project);
		var dfs = new DFS(project.rootNode);
		vle.navigationLogic = new NavigationLogic(dfs);
		//vle.audioManager = null;
	};
	
	var startId = vle.project.getStartNodeId();
	
	if(startId){
		var startNode = vle.getNodeById(startId);
		if(!startNode.contentLoaded){
			var waitForStartNodeContent = function(type, args, obj){
				vle.eventManager.fire('projectLoadingComplete');
			};
			vle.eventManager.subscribe('nodeLoadingContentComplete_' + startNode.id, waitForStartNodeContent);
		} else {
			vle.eventManager.fire('projectLoadingComplete');
		};
	} else {
		vle.eventManager.fire('projectLoadingComplete');
	}; 
};

/**
 * Given a user URL, loads learner data for this vle and project
 */
VLE.prototype.loadLearnerData = function(userURL){
	if (userURL && userURL != null) {
		this.eventManager.fire('learnerDataLoading');
		this.connectionManager.request('GET', 1, userURL, null, this.processLoadLearnerDataResponse);
	};
};

/**
 * Handles response from connectionManagers loadLearnerData function
 */
VLE.prototype.processLoadLearnerDataResponse = function(responseText, responseXML){
	if(responseXML){
		vle.loadUserAndClassInfo(responseXML);
		vle.loadVLEState(vle);
	};
}; 

/**
 * Given a projectName, loads the specified project from the server
 */
VLE.prototype.loadProjectFromServer = function(o){
	vle.eventManager.fire('projectLoading');
	this.connectionManager.request('POST', 1, 'filemanager.html', {command:'retrieveFile', param1: currentProjectPath + pathSeparator + currentProjectName}, this.processLoadProjectFromServerResponse, o);
};

/**
 * Handles the server response from the connectionManagers call to loadProjectFromSErver
 */
VLE.prototype.processLoadProjectFromServerResponse = function(responseText, responseXML, o){
		if(responseXML){
			project = new Project(responseXML, null, vle.connectionManager, true);
			project.xmlDoc = responseXML;
			
			vle.setProject(project);
			var dfs = new DFS(project.rootNode);
			vle.navigationLogic = new NavigationLogic(dfs);
			//vle.audioManager = new AudioManager(true);
			vle.audioManager = null;
			vle.eventManager.fire('projectLoadingComplete');
			if(o){
				var t = vle.project.getNodeByTitle(o.title);
				o.authorFun(t.id);
			};
		};
		vle.eventManager.fire('projectLoadingComplete');
};

/**
 * This should be called when the browser window that contains the vle
 * closes so we can perform clean up.
 */
VLE.prototype.closeVLE = function() {
	//set the endVisitTime to the current time for the current state
	this.state.endCurrentNodeVisit();
	
	//post the latest student data to the server
	this.postToConnectionManager(this.currentNode);
}

VLE.prototype.setConnection = function(connectionManager) {
	this.connectionManager = connectionManager;
	this.connectionManager.setPostStates(this);
	this.connectionManager.setPostURL(this.postDataUrl);
}

/**
 * @return returns the state of the vle in xml
 */
VLE.prototype.getDataXML = function() {console.warn('getDataXML VLE: ' + this.state);
	//retrieve the xml for the current state of the vle
	var dataXML = this.state.getDataXML();
	return dataXML;
}

VLE.prototype.saveStudentData = function(){
	this.connectionManager.post(vle.myUserInfo.workgroupId, this, true);
};

VLE.prototype.getLastStateTimestamp = function(){
	var nodeVisits = this.state.visitedNodes;
	var lastDate = new Date().setTime(0);
	for(var y=0;y<nodeVisits.length;y++){
		if(nodeVisits[y].visitEndTime){
			var currentDate = nodeVisits[y].visitEndTime;
			if(currentDate>lastDate){
				lastDate = currentDate;
			};
		};
	};
	return lastDate;
};

/**
 * Given the type and optional arguments, creates a new 
 * state of the type, passing in the arguments.
 */
VLE.prototype.createState = function(type, args){
	if(type==='multiplechoice'){
		return new MCSTATE(args);
	} else if(type==='brainstorm'){
		return new BRAINSTORMSTATE(args);
	} else if(type==='fillin'){
		return new FILLINSTATE(args);
	} else if(type==='openresponse'){
		return new OPENRESPONSESTATE(args);
	} else {
		return null;
	};
};

/**
 * Displays the journal
 */
VLE.prototype.showJournal = function() {
	if(this.journal == null || 
			this.journal.cfg == null) {
        
		this.journal = new YAHOO.widget.Panel("journalPanel", {
			width: "600px",
			height: "600px",
			fixedcenter: false,
			constraintoviewport: false,
			underlay: "shadow",
			close: true,
			visible: true,
			draggable: true,
			context: ["showbtn", "tl", "bl"]
		});
		
		this.journal.setHeader("My Journal");
		this.journal.setBody("<iframe name='journalFrame' id='journalFrame' frameborder='0' width='100%' height='100%' src='journal/journal.html'></iframe>");

		//this.journal.cfg.setProperty("underlay", "matte");
		this.journal.render();
	} else {
		this.journal.cfg.setProperty("visible", true);
	}
}

/**
 * Resizes the journal
 * @param size a string argument of "minimize", "medium", or "maximize"
 */
VLE.prototype.resizeJournal = function(size) {
	var windowHeight = window.innerHeight;
	var windowWidth = window.innerWidth;
	
	if(size == "minimize") {
		//resize the journal to only display the resize buttons
		this.journal.cfg.setProperty("height", "100px");
		this.journal.cfg.setProperty("width", "430px");
	} else if(size == "original") {
		//resize the journal to display all the journal elements easily
		this.journal.cfg.setProperty("height", "600px");
		this.journal.cfg.setProperty("width", "600px");
	} else if(size == "narrow") {
		//resize the journal to fit over the left nav area
		this.journal.cfg.setProperty("height", (windowHeight - 10) + "px");
		this.journal.cfg.setProperty("width", "225px");
	} else if(size == "wide") {
		//resize the journal to be short and wide
		this.journal.cfg.setProperty("height", "200px");
		this.journal.cfg.setProperty("width", "1000px");
	} else if(size == "maximize") {
		//resize the journal to fit over the whole vle
		this.journal.cfg.setProperty("height", (windowHeight - 10) + "px");
		this.journal.cfg.setProperty("width", "1000px");
	}
}

/*
 * TODO: GEOFF: make this into VLE function, and change where it gets called.
 */
function saveStudentWorkToFile(format) {
	  //if(confirm("Saving locally requires a file download. If you do not wish to do this, click CANCEL now. Otherwise, click OK.")){
		  //var htmlString = document.getElementById('sourceTextArea').value;
	
	  //retrieve the current timestamp so we can use it in the file name
	  var currentTime = new Date();
	  thisFilename = vle.getUserName() + "." + 
	  		currentTime.getFullYear() + "." + (currentTime.getMonth() + 1) + "." + currentTime.getDate();


	  //the string that will contain the content we will put in the file
	  var contentString = "";
	  
	  if(format == "simpleCSV") {
		thisFilename += ".csv";
		
		//retrieve the simplified csv which only contains the latest answers
		contentString = vle.getSimpleCSV();
	  } else if(format == "detailedCSV") {
		thisFilename += ".csv";
		  
		//retrieve the detailed csv which contains all revisions of the student's answers
		contentString = vle.exportToFile(format);
	  } else if(format == "HTML") {
		thisFilename += ".html";

		//retrieve html which contains all revisions of the student's answers
		contentString = vle.exportToFile(format);
	  } else if(format == "timelineCSV") {
		  thisFilename += ".csv";
		  
		  /*
		   * retrieve the csv which contains the timeline of the student
		   * and work
		   */
		  contentString = vle.exportToFile(format);
	  }
	  
	  //set the text into the variable whose content will be stored in the file
      document.getElementById('localData').value = contentString;

      if (thisFilename != null) {
      	document.getElementById('form_filename').value = thisFilename;
      }

      /*
       * this submits the hidden form and asks the user to confirm
       * that they want to save the file to their local system
       */
      document.getElementById('saveLocal').submit();
	   //};
}


//used to notify scriptloader that this script has finished loading
scriptloader.scriptAvailable(scriptloader.baseUrl + "vle/VLE.js");