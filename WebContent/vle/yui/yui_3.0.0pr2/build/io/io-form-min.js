/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 3.0.0pr2
*/
YUI.add("io-form",function(A){A.mix(A.io,{_serialize:function(C){var I=(typeof C.id==="object")?C.id:A.config.doc.getElementById(C.id),H=encodeURIComponent,G=[],L=C.useDisabled||false,O=0,J,D,M,K,F,B,E,N,C;for(F=0,B=I.elements.length;F<B;++F){J=I.elements[F];K=J.disabled;D=J.name;if((L)?D:(D&&!K)){D=encodeURIComponent(D)+"=";M=encodeURIComponent(J.value);switch(J.type){case"select-one":if(J.selectedIndex>-1){C=J.options[J.selectedIndex];G[O++]=D+H((C.attributes.value&&C.attributes.value.specified)?C.value:C.text);}break;case"select-multiple":if(J.selectedIndex>-1){for(E=J.selectedIndex,N=J.options.length;E<N;++E){C=J.options[E];if(C.selected){G[O++]=D+H((C.attributes.value&&opt.attributes.value.specified)?C.value:C.text);}}}break;case"radio":case"checkbox":if(J.checked){G[O++]=D+M;}break;case"file":case undefined:case"reset":case"button":break;case"submit":break;default:G[O++]=D+M;}}}return G.join("&");}},true);},"3.0.0pr2",{requires:["io-base"]});