EpigameNode.prototype=new Node;EpigameNode.prototype.constructor=EpigameNode;EpigameNode.prototype.parent=Node.prototype;EpigameNode.authoringToolName="Epigame";EpigameNode.authoringToolDescription="This is a generic step only used by developers";function EpigameNode(a,b){this.view=b;this.type=a;this.prevWorkNodeIds=[]}EpigameNode.prototype.parseDataJSONObj=function(a){return EpigameState.prototype.parseDataJSONObj(a)};EpigameNode.prototype.translateStudentWork=function(a){return a};
EpigameNode.prototype.onExit=function(){this.contentPanel&&this.contentPanel.save&&this.contentPanel.save()};EpigameNode.prototype.renderGradingView=function(a,b){var c=b.getLatestWork().getStudentWork();$("#"+a).html(c.response)};EpigameNode.prototype.getHTMLContentTemplate=function(){return createContent("node/epigame/epigame.html")};NodeFactory.addNode("EpigameNode",EpigameNode);typeof eventManager!="undefined"&&eventManager.fire("scriptLoaded","vle/node/epigame/EpigameNode.js");View.prototype.epigameDispatcher=function(a,b,c){a=="epigameUpdatePrompt"?c.EpigameNode.updatePrompt():a=="epigameUpdatedSwfUrlInput"?c.EpigameNode.updateSwfUrl():a=="epigameUpdateLevelString"&&c.EpigameNode.updateLevelString(b)};for(var events=["epigameUpdatePrompt","epigameUpdatedSwfUrlInput","epigameUpdateLevelString"],x=0;x<events.length;x++)componentloader.addEvent(events[x],"epigameDispatcher");typeof eventManager!="undefined"&&eventManager.fire("scriptLoaded","vle/node/epigame/epigameEvents.js");
if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/epigame/epigame_core_min.js');}
