
NetlogoNode.prototype = new Node();
NetlogoNode.prototype.constructor = NetlogoNode;
NetlogoNode.prototype.parent = Node.prototype;
NetlogoNode.authoringToolName = "Netlogo";
NetlogoNode.authoringToolDescription = "Students work on a NetLogo activity";

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {NetLogoNode}
 */
function NetlogoNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.content = null;
	this.audios = [];
	this.contentBase;
	this.audioSupported = true;
}

NetlogoNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return NetlogoState.prototype.parseDataJSONObj(stateJSONObj);
};

NetlogoNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/netlogo/netlogo.html');
};

/**
 * Called when the step is exited. This is used for auto-saving.
 */
NetlogoNode.prototype.onExit = function() {
	//check if the content panel exists
	if(this.contentPanel && this.contentPanel.save) {
		//tell the content panel to save
		this.contentPanel.save();
	};
};

NodeFactory.addNode('NetlogoNode', NetlogoNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/netlogo/NetlogoNode.js');
};