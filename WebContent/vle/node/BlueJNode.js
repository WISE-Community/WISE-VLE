/*
 * BlueJNode is a child of outsideurl at the moment
 */

BlueJNode.prototype = new Node();
BlueJNode.prototype.constructor = BlueJNode;
BlueJNode.prototype.parent = Node.prototype;
function BlueJNode(nodeType, connectionManager) {
	this.connectionManager = connectionManager;
	this.type = "OTBlueJ";
	this.projectPath = "";
}

BlueJNode.prototype.render = function(contentPanel) {
	var content = this.element.getElementsByTagName("content")[0].firstChild.nodeValue;
	
	if(contentPanel == null) {
		window.frames["ifrm"].document.open();
		window.frames["ifrm"].document.write(content);
		window.frames["ifrm"].document.close();
	} else {
		contentPanel.document.open();
		contentPanel.document.write(content);
		contentPanel.document.close();
	}
	
	
	//window.frames["ifrm"].document.open();
	//window.frames["ifrm"].location = "js/node/outsideurl/outsideurl.html";
	//window.frames["ifrm"].document.close();
	
	this.projectPath = this.element.getElementsByTagName("projectPath")[0].firstChild.nodeValue;
}

/*
BlueJNode.prototype.load = function() {
	var url = this.element.getElementsByTagName("url")[0].firstChild.nodeValue;
	window.frames["ifrm"].loadUrl(url);
	document.getElementById('topStepTitle').innerHTML = this.title;
}
*/

BlueJNode.prototype.getDataXML = function() {
	return this.projectPath;
}

BlueJNode.prototype.getDataXML = function(nodeStates) {
	return this.projectPath;
}

//used to notify scriptloader that this script has finished loading
scriptloader.scriptAvailable(scriptloader.baseUrl + "vle/node/BlueJNode.js");