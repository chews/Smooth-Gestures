var navWin=navigator.platform.indexOf("Win")!=-1,navMac=navigator.platform.indexOf("Mac")!=-1,navLinux=navigator.platform.indexOf("Linux")!=-1,instanceId=null,profile=null,bookmarksync=null,extVersion=null,log={action:{}},extId=chrome.extension.getURL("").substr(19,32),nav=navigator.platform.match(/Win/)?"win":navigator.platform.match(/Mac/)?"mac":navigator.platform.match(/Linux/)?"linux":"unknown",chromeVersion=navigator.userAgent.replace(/^.*Chrome\/(\d+)\D.*$/,"$1")*1,pluginport=null,contents=
{},prevSelectedTabId=null,selectedTabId=null,focusedWindows=[],activeTabs={},closedTabs=[],loadHistory={},validGestures=null,gesturesjs=null,chainGesture=null,customActions={},externalActions={},localCopy={},gestures={},settings={},defaults={"Smooth Gestures":{}};
defaults["Smooth Gestures"].settings=JSON.stringify({holdButton:2,contextOnLink:!1,newTabUrl:"chrome://newtab/",newTabRight:!1,newTabLinkRight:!0,trailColor:{r:255,g:0,b:0,a:1},trailWidth:2,trailBlock:!1,blacklist:[],selectToLink:!0,marketing:!0,"hide-empty-cat_hacks":!0});
defaults["Smooth Gestures"].gestures=JSON.stringify({U:"new-tab",lU:"new-tab-link",D:"toggle-pin",L:"page-back",rRL:"page-back",R:"page-forward",rLR:"page-forward",UL:"prev-tab",UR:"next-tab",wU:"goto-top",wD:"goto-bottom",DR:"close-tab",LU:"undo-close",DU:"clone-tab",lDU:"new-tab-back",UD:"reload-tab",UDU:"reload-tab-full",URD:"view-source",UDR:"split-tabs",UDL:"merge-tabs",LDR:"show-cookies",RDLUR:"options",RDLD:"status"});defaults.Opera={};defaults.Opera.settings=JSON.stringify({});
defaults.Opera.gestures=JSON.stringify({L:"page-back",rRL:"page-back",R:"page-forward",rLR:"page-forward",U:"stop",UD:"reload-tab",DR:"close-tab",RLR:"close-tab",D:"new-tab",lD:"new-tab-link",DU:"clone-tab",lDU:"new-tab-back",UL:"parent-dir"});defaults["All-in-One Gestures"]={};defaults["All-in-One Gestures"].settings=JSON.stringify({});
defaults["All-in-One Gestures"].gestures=JSON.stringify({L:"page-back",rRL:"page-back",R:"page-forward",rLR:"page-forward",UD:"reload-tab",UDU:"reload-tab-full",LU:"stop",U:"new-tab",RLR:"new-tab-link",DUD:"clone-tab",UL:"prev-tab",UR:"next-tab",DR:"close-tab",D:"new-window",URD:"view-source",LDR:"show-cookies",DRD:"options"});defaults.FireGestures={};defaults.FireGestures.settings=JSON.stringify({});
defaults.FireGestures.gestures=JSON.stringify({L:"page-back",R:"page-forward",UD:"reload-tab",UDU:"reload-tab-full",DRU:"new-window",URD:"close-window",LR:"new-tab",DR:"close-tab",RL:"undo-close",UL:"prev-tab",UR:"next-tab",LU:"goto-top",LD:"goto-bottom",lU:"new-tab-link",lD:"new-tab-back",LDRUL:"options",DU:"parent-dir"});
var categories={cat_page_navigation:{actions:"page-back,page-forward,page-back-close,reload-tab,reload-tab-full,reload-all-tabs,stop,page-next,page-prev".split(",")},cat_tab_management:{actions:"new-tab,new-tab-link,new-tab-back,navigate-tab,close-tab,close-other-tabs,close-left-tabs,close-right-tabs,undo-close,clone-tab,new-window,new-window-link,close-window,prev-tab,next-tab,split-tabs,merge-tabs,tab-to-left,tab-to-right,toggle-pin,pin,unpin".split(",")},cat_utilities:{actions:"goto-top,goto-bottom,page-up,page-down,print,parent-dir,view-source,show-cookies,search-sel,zoom-in,zoom-out,zoom-zero,open-image,hide-image,zoom-img-in,zoom-img-out,zoom-img-zero,translate,copy,toggle-bookmark,bookmark,unbookmark".split(",")},
cat_other:{actions:"options,status,open-history,open-downloads,open-extensions,open-bookmarks".split(",")},cat_hacks:{actions:"undo-close-hack,clone-tab-hack,prev-window,next-window,maximize-x,minimize-x".split(",")},cat_custom:{customActions:!0},cat_external:{externalActions:!0},cat_settings:{settings:!0}},contexts={"new-tab-link":"l","new-tab-back":"l","new-window-link":"l","zoom-img-in":"i","zoom-img-out":"i","zoom-img-zero":"i","open-image":"i","hide-image":"i","search-sel":"s",translate:"s",
copy:"s"},actions={"new-tab":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){var d={url:settings.newTabUrl!="homepage"?settings.newTabUrl:void 0,windowId:a.windowId};if(settings.newTabRight)d.index=a.index+1;chrome.tabs.create(d,b)})},"new-tab-link":function(a,b,c){chrome.tabs.get(contents[a].detail.tabId,function(a){for(var e=0;e<c.links.length;e++){var f={url:c.links[e].src,windowId:a.windowId};if(settings.newTabLinkRight)f.index=a.index+1+e;chrome.tabs.create(f,e==c.links.length-
1?b:null)}})},"new-tab-back":function(a,b,c){chrome.tabs.get(contents[a].detail.tabId,function(a){for(var e=0;e<c.links.length;e++){var f={url:c.links[e].src,windowId:a.windowId,selected:!1};if(settings.newTabLinkRight)f.index=a.index+1+e;chrome.tabs.create(f,e==c.links.length-1?b:null)}})},"navigate-tab":function(a,b){chrome.tabs.update(contents[a].detail.tabId,{url:settings.newTabUrl!="homepage"?settings.newTabUrl:void 0},b)},"close-tab":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(c){c.pinned?
b():settings.closeLastBlock?chrome.windows.getAll({populate:!0},function(c){c.length==1&&c[0].tabs.length==1?chrome.tabs.update(contents[a].detail.tabId,{url:settings.newTabUrl!="homepage"?settings.newTabUrl:void 0},b):chrome.tabs.remove(contents[a].detail.tabId,b)}):chrome.tabs.remove(contents[a].detail.tabId,b)})},"close-other-tabs":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.getAllInWindow(a.windowId,function(d){for(i=0;i<d.length;i++)d[i].id!=a.id&&!a.pinned&&
chrome.tabs.remove(d[i].id);b()})})},"close-left-tabs":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.getAllInWindow(a.windowId,function(d){for(i=0;i<d.length;i++)d[i].index<a.index&&!a.pinned&&chrome.tabs.remove(d[i].id);b()})})},"close-right-tabs":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.getAllInWindow(a.windowId,function(d){for(i=0;i<d.length;i++)d[i].index>a.index&&!a.pinned&&chrome.tabs.remove(d[i].id);b()})})},"undo-close":function(a,
b){if(pluginport)pluginport.postMessage(JSON.stringify({sendkey:{keys:["t"],mods:[navMac?"alt":"ctrl","shift"]}})),b();else{var c=closedTabs.pop();c?chrome.windows.get(c.winId,function(a){a?chrome.tabs.create({windowId:c.winId,index:c.index,url:c.history[c.history.length-1]},b):chrome.windows.create({url:c.history[c.history.length-1]},function(a){for(var d=0;d<closedTabs.length;d++)if(closedTabs[d].winId==c.winId)closedTabs[d].winId=a.id;b()})}):b()}},"undo-close-hack":function(a,b){for(var c=closedTabs.pop(),
d=c.history.length>10?c.history.length-10:0,e=d;e<c.history.length-1;e++)c.history[e].substr(0,4)!="http"&&(d=e);c.history=c.history.slice(d);c.titles=c.titles.slice(d);c?chrome.windows.get(c.winId,function(a){if(c.history.length>1){var d=Math.random()+"";loadHistory[d]=c.history.length;for(var e=0;e<c.titles.length;e++){for(var n="",l=0;l<c.titles[e].length;l++)n+=String.fromCharCode(c.titles[e].charCodeAt(l)+10);c.titles[e]=n}for(e=0;e<c.history.length;e++){n="";for(l=0;l<c.history[e].length;l++)n+=
String.fromCharCode(c.history[e].charCodeAt(l)+10);c.history[e]=n}d="http://www.google.com/?index=0#:--:"+d+":--:"+escape(JSON.stringify(c.titles))+":--:"+escape(JSON.stringify(c.history))}else d=c.history[0];a?chrome.tabs.create({windowId:c.winId,index:c.index,url:d},b):chrome.windows.create({url:d},function(a){for(var d=0;d<closedTabs.length;d++)if(closedTabs[d].winId==c.winId)closedTabs[d].winId=a.id;b()})}):b()},"reload-tab":function(a,b){runJS(a,"location.reload()");b()},"reload-tab-full":function(a,
b){runJS(a,"location.reload(true)");b()},"reload-all-tabs":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.getAllInWindow(a.windowId,function(a){for(i=0;i<a.length;i++)chrome.tabs.update(a[i].id,{url:a[i].url});b()})})},stop:function(a,b){runJS(a,"window.stop()");b()},"view-source":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(c){chrome.tabs.create({url:"view-source:"+(contents[a].detail.url?contents[a].detail.url:c.url),windowId:c.windowId,index:c.index+
1},b)})},"prev-tab":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.getAllInWindow(null,function(d){var e=null;for(i=d.length-1;i>=0;i--)if(e=d[(a.index+i)%d.length].id,contentForTab(e))break;chrome.tabs.update(e,{selected:!0},b)})})},"next-tab":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.getAllInWindow(null,function(d){var e=null;for(i=1;i<=d.length;i++)if(e=d[(a.index+i)%d.length].id,contentForTab(e))break;chrome.tabs.update(e,{selected:!0},
b)})})},"page-back":function(a,b){runJS(a,"history.back()");b()},"page-forward":function(a,b){runJS(a,"history.forward()");b()},"new-window":function(a,b){chrome.windows.create({url:settings.newTabUrl!="homepage"?settings.newTabUrl:void 0},b)},"new-window-link":function(a,b,c){for(a=0;a<c.links.length;a++)chrome.windows.create({url:c.links[a].src},a==c.links.length-1?b:null)},"close-window":function(a,b){chrome.windows.getCurrent(function(a){chrome.windows.remove(a.id,b)})},"split-tabs":function(a,
b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.windows.get(a.windowId,function(d){chrome.tabs.getAllInWindow(d.id,function(e){chrome.windows.create({incognito:d.incognito},function(d){for(i=a.index;i<e.length;i++)chrome.tabs.move(e[i].id,{windowId:d.id,index:i-a.index});chrome.tabs.getAllInWindow(d.id,function(a){chrome.tabs.remove(a[a.length-1].id);chrome.tabs.update(a[0].id,{selected:!0},b)})})})})})},"merge-tabs":function(a,b){chrome.tabs.getAllInWindow(null,function(c){var d=focusedWindows[focusedWindows.length-
2];if(d){for(i=0;i<c.length;i++)chrome.tabs.move(c[i].id,{windowId:d,index:1E6});chrome.tabs.update(contents[a].detail.tabId,{selected:!0},b)}})},options:function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.create({url:chrome.extension.getURL("options.html"),windowId:a.windowId},b)})},status:function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.create({url:chrome.extension.getURL("status.html"),windowId:a.windowId},b)})},"page-back-close":function(a,
b){runJS(a,"history.back();"+(activeTabs[contents[a].detail.tabId].history.length==1?" setTimeout(function(){ port.postMessage(JSON.stringify({closetab:true})); },400);":""));b()},"goto-top":function(a,b,c){runJS(a,c.startPoint?"for(var t = document.elementFromPoint("+c.startPoint.x+","+c.startPoint.y+"); t!=document.documentElement && t!=document.body && (t.scrollHeight<=t.clientHeight || t.scrollTop==0 || ['auto','scroll'].indexOf(document.defaultView.getComputedStyle(t)['overflow-y'])==-1); t = t.parentNode); if(t == document.documentElement) t = document.body; t.scrollTop = 0":
"document.body.scrollTop = 0");b()},"goto-bottom":function(a,b,c){runJS(a,c.startPoint?"for(var t = document.elementFromPoint("+c.startPoint.x+","+c.startPoint.y+"); t!=document.documentElement && t!=document.body && (t.scrollHeight<=t.clientHeight || t.scrollTop==t.scrollHeight-t.clientHeight || ['auto','scroll'].indexOf(document.defaultView.getComputedStyle(t)['overflow-y'])==-1); t = t.parentNode); if(t == document.documentElement) t = document.body; t.scrollTop = t.scrollHeight":"document.body.scrollTop = document.body.scrollHeight");
b()},"page-up":function(a,b,c){runJS(a,c.startPoint?"for(var t = document.elementFromPoint("+c.startPoint.x+","+c.startPoint.y+"); t!=document.documentElement && t!=document.body && (t.scrollHeight<=t.clientHeight || t.scrollTop==0 || ['auto','scroll'].indexOf(document.defaultView.getComputedStyle(t)['overflow-y'])==-1); t = t.parentNode); if(t == document.documentElement) t = document.body; t.scrollTop -= .8*Math.min(document.documentElement.clientHeight,t.clientHeight)":"document.body.scrollTop -= .8*document.documentElement.clientHeight");
b()},"page-down":function(a,b,c){runJS(a,c.startPoint?"for(var t = document.elementFromPoint("+c.startPoint.x+","+c.startPoint.y+"); t!=document.documentElement && t!=document.body && (t.scrollHeight<=t.clientHeight || t.scrollTop==t.scrollHeight-t.clientHeight || ['auto','scroll'].indexOf(document.defaultView.getComputedStyle(t)['overflow-y'])==-1); t = t.parentNode); if(t == document.documentElement) t = document.body; t.scrollTop += .8*Math.min(document.documentElement.clientHeight,t.clientHeight)":
"document.body.scrollTop += .8*document.documentElement.clientHeight");b()},"page-next":function(a,b){runJS(a,"var url = null;if(!url) { var links = $('link[rel=next][href]');if(links.length > 0) url = links[0].href; }if(!url) { var anchors = $('a[rel=next][href]');if(anchors.length > 0) url = anchors[0].href; }if(!url) { var anchors = $('a[href]');for(var i=0; i<anchors.length; i++) {if($(anchors[i]).text().match(/(next|\u4e0b\u4e00\u9875|\u4e0b\u9875)/i)) { url = anchors[i].href; break; }}}if(!url) { var anchors = $('a[href]');for(var i=0; i<anchors.length; i++) {if($(anchors[i]).text().match(/(>|\u203a)/i)) { url = anchors[i].href; break; }}}if(url) location.href = url;",
!0);b()},"page-prev":function(a,b){runJS(a,"var url = null;if(!url) { var links = $('link[rel=prev][href]');if(links.length > 0) url = links[0].href; }if(!url) { var anchors = $('a[rel=prev][href]');if(anchors.length > 0) url = anchors[0].href; }if(!url) { var anchors = $('a[href]');for(var i=0; i<anchors.length; i++) {if($(anchors[i]).text().match(/(prev|\u4e0a\u4e00\u9875|\u4e0a\u9875)/i)) { url = anchors[i].href; break; }}}if(!url) { var anchors = $('a[href]');for(var i=0; i<anchors.length; i++) {if($(anchors[i]).text().match(/(<|\u2039)/i)) { url = anchors[i].href; break; }}}if(url) location.href = url;",
!0);b()},"clone-tab":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.create({url:a.url,selected:!1,windowId:a.windowId,index:a.index},b)})},"clone-tab-hack":function(a,b){for(var c=activeTabs[contents[a].detail.tabId],d=c.history.length>10?c.history.length-10:0,e=d;e<c.history.length-1;e++)c.history[e].substr(0,4)!="http"&&(d=e);var f=c.history.slice(d),h=c.titles.slice(d);c?chrome.windows.get(c.winId,function(a){if(f.length>1){var d=Math.random()+"";loadHistory[d]=
f.length;for(var e=0;e<h.length;e++){for(var o="",m=0;m<h[e].length;m++)o+=String.fromCharCode(h[e].charCodeAt(m)+10);h[e]=o}for(e=0;e<f.length;e++){o="";for(m=0;m<f[e].length;m++)o+=String.fromCharCode(f[e].charCodeAt(m)+10);f[e]=o}d="http://www.google.com/?index=0#:--:"+d+":--:"+escape(JSON.stringify(h))+":--:"+escape(JSON.stringify(f))}else d=f[0];chrome.tabs.create({url:d,windowId:a.windowId,selected:!1,index:c.index},b)}):b()},"prev-window":function(a,b){focusedWindows.length<=1?b():focusWindow(focusedWindows[focusedWindows.length-
2],b)},"next-window":function(a,b){focusedWindows.length<=1?b():focusWindow(focusedWindows[0],b)},"maximize-x":function(a,b){chrome.windows.getLastFocused(function(a){if(maximizeXWindow[a.id]){var d=maximizeXWindow[a.id].dim;maximizeXWindow[a.id]=null;chrome.windows.update(a.id,{left:d.left,top:d.top,width:d.width,height:d.height},function(){setTimeout(function(){chrome.windows.update(a.id,{left:d.left,top:d.top,width:d.width,height:d.height},b)},10)})}else maximizeXWindow[a.id]={dim:a},chrome.windows.update(a.id,
{left:screen.availWidth>screen.availHeight&&a.left>=screen.availWidth/2?screen.availWidth/2:0,top:0,width:(screen.availWidth>screen.availHeight?0.5:1)*screen.availWidth,height:screen.availHeight},b)})},"minimize-x":function(a,b){chrome.windows.getLastFocused(function(a){chrome.windows.update(a.id,{left:screen.availWidth-10,top:screen.availHeight-10,width:10,height:10},function(){setTimeout(function(){chrome.windows.update(a.id,{left:screen.availWidth-10,top:screen.availHeight-10,width:10,height:10},
function(){var d=function(b,e){b!=a.id?e():(chrome.windows.onFocusChanged.removeListener(d),minimizeXWindow[a.id]=null,chrome.windows.update(a.id,{left:a.left,top:a.top,width:a.width,height:a.height},e))};minimizeXWindow[a.id]={dim:a,listener:d};chrome.windows.onFocusChanged.addListener(d);for(var e=focusedWindows.length-2;e>=0&&minimizeXWindow[focusedWindows[e]];e--);e<0?b():focusWindow(focusedWindows[e],b)})},10)})})},"zoom-in":function(a,b){pluginport?pluginport.postMessage(JSON.stringify({sendkey:{keys:["+"],
mods:[navMac?"alt":"ctrl"]}})):runJS(a,"var zoom = document.body.style.zoom ? document.body.style.zoom*1.1 : 1.1; document.body.style.zoom = zoom; canvas.style.zoom = 1/zoom;");b()},"zoom-out":function(a,b){pluginport?pluginport.postMessage(JSON.stringify({sendkey:{keys:["-"],mods:[navMac?"alt":"ctrl"]}})):runJS(a,"var zoom = document.body.style.zoom ? document.body.style.zoom*(1/1.1) : 1/1.1; document.body.style.zoom = zoom; canvas.style.zoom = 1/zoom;");b()},"zoom-zero":function(a,b){pluginport?
pluginport.postMessage(JSON.stringify({sendkey:{keys:["0"],mods:[navMac?"alt":"ctrl"]}})):runJS(a,"document.body.style.zoom = 1; canvas.style.zoom = 1;");b()},"zoom-img-in":function(a,b,c){for(var d=0;d<c.images.length;d++)runJS(a,"var img = $('img[gestureid="+c.images[d].gestureid+"]'); if(img) { if(!img.attr('origsize')) img.attr('origsize', img.width()+'x'+img.height()); img.css({'width':img.width()*1.2, 'height':img.height()*1.2}); }");b()},"zoom-img-out":function(a,b,c){for(var d=0;d<c.images.length;d++)runJS(a,
"var img = $('img[gestureid="+c.images[d].gestureid+"]'); if(img) { if(!img.attr('origsize')) img.attr('origsize', img.width()+'x'+img.height()); img.css({'width':img.width()/1.2, 'height':img.height()/1.2}); }");b()},"zoom-img-zero":function(a,b,c){for(var d=0;d<c.images.length;d++)runJS(a,"var img = $('img[gestureid="+c.images[d].gestureid+"]'); if(img && img.attr('origsize')) { var size = img.attr('origsize').split('x'); img.css({'width':size[0]+'px', 'height':size[1]+'px'}); }");b()},"tab-to-left":function(a){chrome.tabs.get(contents[a].detail.tabId,
function(a){chrome.tabs.move(a.id,{index:a.index>0?a.index-1:0})})},"tab-to-right":function(a){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.move(a.id,{index:a.index+1})})},"parent-dir":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){var d=a.url.split("#")[0].split("?")[0].split("/");d[d.length-1]==""&&(d=d.slice(0,d.length-1));var e=null;(e=d.length>3?d.slice(0,d.length-1).join("/")+"/":d.join("/")+"/")?chrome.tabs.update(a.id,{url:e},b):b()})},"open-history":function(a,
b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.create({url:"chrome://history/",windowId:a.windowId},b)})},"open-downloads":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.create({url:"chrome://downloads/",windowId:a.windowId},b)})},"open-extensions":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.create({url:"chrome://extensions/",windowId:a.windowId},b)})},"open-bookmarks":function(a,b){chrome.tabs.get(contents[a].detail.tabId,
function(a){chrome.tabs.create({url:"chrome://bookmarks/",windowId:a.windowId},b)})},"open-image":function(a,b,c){chrome.tabs.get(contents[a].detail.tabId,function(a){for(var e=0;e<c.images.length;e++)chrome.tabs.create({url:c.images[e].src,windowId:a.windowId},b)})},"hide-image":function(a,b,c){for(var d=0;d<c.images.length;d++)runJS(a,"var img = $('img[gestureid="+c.images[d].gestureid+"]'); if(img) { img.css({'display':'none'}); }");b()},"show-cookies":function(a,b){runJS(a,"window.alert('Cookies stored by this host or domain:\\n'+('\\n'+document.cookie).replace(/; /g,';\\n').replace(/\\n(.{192})([^\\n]{5})/gm,\"\\n$1\\n        $2\").replace(/\\n(.{100})([^\\n]{5})/gm,\"\\n$1\\n        $2\"));",
!0);b()},"search-sel":function(a,b,c){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.tabs.create({url:"http://www.google.com/search?q="+c.selection,windowId:a.windowId,index:a.index+1},b)})},print:function(a,b){runJS(a,"window.print()");b()},translate:function(a,b,c){chrome.i18n.getAcceptLanguages(function(a){$.post("http://ajax.googleapis.com/ajax/services/language/translate",{v:"1.0",langpair:"|"+a[0].substr(0,2),format:"html",q:c.selectionHTML},function(a){try{a=JSON.parse(a),alert(a.responseData.translatedText)}catch(b){}})});
b()},"toggle-pin":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chromeVersion>=9&&chrome.tabs.update(a.id,{pinned:!a.pinned},b)})},pin:function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chromeVersion>=9&&chrome.tabs.update(a.id,{pinned:!0},b)})},unpin:function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chromeVersion>=9&&chrome.tabs.update(a.id,{pinned:!1},b)})},copy:function(a,b,c){if(!c.selection)return b();a=document.createElement("textarea");
a.value=c.selection;document.body.appendChild(a);a.select();document.execCommand("Copy");document.body.removeChild(a);b()},"toggle-bookmark":function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.bookmarks.search(a.url,function(d){d.length<=0?chrome.bookmarks.create({parentId:"2",title:a.title,url:a.url},b):chrome.bookmarks.remove(d[0].id,b)})})},bookmark:function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.bookmarks.create({parentId:"2",title:a.title,url:a.url},
b)})},unbookmark:function(a,b){chrome.tabs.get(contents[a].detail.tabId,function(a){chrome.bookmarks.search(a.url,function(a){a.length<=0?b():chrome.bookmarks.remove(a[0].id,b)})})}},runCustomAction=function(a,b,c,d){if(a=customActions[a])a.env=="page"?(runJS(b,a.code),setTimeout(c,50)):a.env=="ext"&&((new Function("id","targets",a.code))(b,d),setTimeout(c,50))},minimizeXWindow={},maximizeXWindow={},focusWindow=function(a,b){focusedWindows.length<=1?b():chrome.tabs.getSelected(a,function(c){chrome.tabs.getAllInWindow(a,
function(d){(minimizeXWindow[a]?function(a,b){minimizeXWindow[a].listener&&chrome.windows.onFocusChanged.removeListener(minimizeXWindow[a].listener);var c=minimizeXWindow[a].dim;minimizeXWindow[a]=null;b(c)}:chrome.windows.get)(a,function(a){chrome.windows.create({left:a.left,top:a.top,width:a.width,height:a.height},function(a){for(i=0;i<d.length;i++)chrome.tabs.move(d[i].id,{windowId:a.id,index:i});chrome.tabs.getAllInWindow(a.id,function(a){chrome.tabs.remove(a[a.length-1].id);chrome.tabs.update(c.id,
{selected:!0},b)})})})})})};
chrome.extension.onRequest.addListener(function(a,b,c){if(a.getstates)getTabStates(function(a){c(JSON.stringify({states:a}))});else if(a.log)console.log(a.log),c(null);else if(a.requestType!=void 0)switch(a.requestType){case "openNewTab":chrome.tabs.create({index:1E8,url:a.linkURL});break;case "getLocalStorage":c(localStorage);break;case "saveLocalStorage":for(var d in a.data)localStorage.setItem(d,a.data[d]);localStorage.setItem("importedFromForeground",!0);c(localStorage);break;case "localStorage":switch(a.operation){case "getItem":c({status:!0,
value:localStorage.getItem(a.itemName)});break;case "removeItem":localStorage.removeItem(a.itemName);c({status:!0,value:null});break;case "setItem":localStorage.setItem(a.itemName,a.itemValue),c({status:!0,value:null})}break;default:c({status:"unrecognized request type"})}else if(a.loadhistory!=void 0)loadHistory[a.id]?(a.loadhistory>=loadHistory[a.id]-1&&delete loadHistory[a.id],c(!1)):c(!0);else if(a.reloadtab){if(a.reloadtab==!0)a.reloadtab=b.tab.id;chrome.tabs.get(a.reloadtab,function(a){chrome.tabs.update(a.id,
{url:a.url},c)})}else c(null)});chrome.extension.onConnect.addListener(function(a){if(a.sender&&a.sender.tab&&(a.detail=JSON.parse(a.name),a.detail.id))a.detail.tabId=a.sender.tab.id,initConnectTab(a)});
chrome.extension.onRequestExternal.addListener(function(a,b,c){if(a.getgestures)gesturesjs?c({gestures:gesturesjs}):$.get(chrome.extension.getURL("js/gestures.js"),null,function(a){gesturesjs="window.SGextId='"+extId+"';\n"+a;c({gestures:gesturesjs})});else if(a.externalactions)if(a=a.externalactions,a.name&&a.actions){if(a.actions.length>0){externalActions[b.id]=a;for(i=0;i<externalActions[b.id].actions.length;i++)contexts[b.id+"-"+externalActions[b.id].actions[i].id]=externalActions[b.id].actions[i].context}else delete externalActions[b.id];
saveExternalActions();c(!0)}else c(!1);else c(null)});
chrome.extension.onConnectExternal.addListener(function(a){if(a.name=="sgplugin"&&(a.sender.id=="bkojnmffeemeacfnhgiighecdfojgpdm"||a.sender.id=="apagmdofhjomjncpiebpaaonngppcpcl"))for(id in pluginport=a,pluginport.onMessage.addListener(function(){}),pluginport.onDisconnect.addListener(function(){pluginport=null;for(id in contents)contents[id].postMessage(JSON.stringify({sgplugin:!1}))}),contents)contents[id].postMessage(JSON.stringify({sgplugin:!0}));if(a.sender.tab&&(a.detail=JSON.parse(a.name),
a.detail.id))a.detail.tabId=a.sender.tab.id,initConnectTab(a)});
var contentMessage=function(a,b){b=JSON.parse(b);if(b.selection&&b.selection.length>0&&gestures["s"+b.gesture])b.gesture="s"+b.gesture;else if(b.links&&b.links.length>0&&gestures["l"+b.gesture])b.gesture="l"+b.gesture;else if(b.images&&b.images.length>0&&gestures["i"+b.gesture])b.gesture="i"+b.gesture;if(b.gesture&&gestures[b.gesture]){chainGesture&&clearTimeout(chainGesture.timeout);chainGesture=null;b.gesture[0]=="r"&&(chainGesture={rocker:!0,timeout:setTimeout(function(){chainGesture=null},2E3)});
b.gesture[0]=="w"&&(chainGesture={wheel:!0,timeout:setTimeout(function(){chainGesture=null},2E3)});if(chainGesture&&b.buttonDown)chainGesture.buttonDown=b.buttonDown;if(chainGesture&&b.startPoint)chainGesture.startPoint=b.startPoint;var c=!chainGesture?null:function(){chrome.tabs.getSelected(null,function(b){if(chainGesture)for(a in chainGesture.tabId=b.id,contents)b.id==contents[a].detail.tabId&&contents[a].postMessage(JSON.stringify({chain:chainGesture}))})};try{actions[gestures[b.gesture]]?actions[gestures[b.gesture]].call(null,
a,c,b):externalActions[gestures[b.gesture].substr(0,32)]?chrome.extension.sendRequest(gestures[b.gesture].substr(0,32),{doaction:gestures[b.gesture].substr(33)}):runCustomAction(gestures[b.gesture],a,c,b)}catch(d){}if(!log.action)log.action={};log.action[gestures[b.gesture]]||(log.action[gestures[b.gesture]]={});log.action[gestures[b.gesture]][b.gesture]||(log.action[gestures[b.gesture]][b.gesture]={count:0});log.action[gestures[b.gesture]][b.gesture].count+=1;if(!log.line)log.line={distance:0,segments:0};
b.line&&(log.line.distance+=b.line.distance,log.line.segments+=b.line.segments)}if(b.syncButton){if(chainGesture){if(!chainGesture.buttonDown)chainGesture.buttonDown={};chainGesture.buttonDown[b.syncButton.id]=b.syncButton.down}setTimeout(function(){chrome.tabs.getSelected(null,function(c){for(a in contents)c.id==contents[a].detail.tabId&&contents[a].postMessage(JSON.stringify({syncButton:b.syncButton}))})},20)}if(b.alertDoubleclick)window.rightclickPopup&&window.rightclickPopup.close(),window.rightclickPopup=
window.open("rightclick.html","rightclick","width=750,height=230,top="+(b.alertDoubleclick.centerY-230/1.5)+",left="+(b.alertDoubleclick.centerX-375));if(b.closetab){if(b.closetab==!0)b.closetab=contents[a].detail.tabId;chrome.tabs.get(b.closetab,function(a){chrome.tabs.remove(a.id)})}b.sgplugin&&pluginport&&b.sgplugin.rightclick&&pluginport.postMessage(JSON.stringify({sendbutton:3}))},initConnectTab=function(a){if(a.sender&&a.sender.tab&&a.detail.id){var b=a.sender.tab,c=a.detail.id;contents[c]=
a;contents[c].onMessage.addListener(function(a){contentMessage(c,a)});contents[c].onDisconnect.addListener(function(){delete contents[c]});a={enable:!0,extVersion:extVersion,settings:settings,validGestures:validGestures,sgplugin:pluginport!=null};if(chainGesture&&chainGesture.tabId==b.id)b.selected?a.chain=chainGesture:(clearTimeout(chainGesture.timeout),chainGesture=null);for(var d=b.url.substr(b.url.indexOf("//")+2),d=d.substr(0,d.indexOf("/")).toLowerCase(),e=0;e<settings.blacklist.length;e++)if(settings.blacklist[e]==
d)a.enable=!1;contents[c].postMessage(JSON.stringify(a));refreshPageAction(b.id)}},runJS=function(a,b){var c={eval:b};contents[a]&&contents[a].postMessage(JSON.stringify(c))},selectionChanged=function(a){if(selectedTabId!=a){for(id in contents)selectedTabId==contents[id].detail.tabId&&contents[id].postMessage(JSON.stringify({windowBlurred:!0}));prevSelectedTabId=selectedTabId;selectedTabId=a}};chrome.tabs.onSelectionChanged.addListener(selectionChanged);
chrome.windows.onFocusChanged.addListener(function(a){focusedWindows=focusedWindows.filter(function(b){return b!=a});focusedWindows.push(a);focusedWindows.length>50&&focusedWindows.shift();chrome.tabs.getSelected(null,function(a){selectionChanged(a.id)})});
var updateActiveTab=function(a,b){chrome.tabs.get(a,function(c){if(b&&b.url)c.url=b.url,c.title=b.url;if(c.url.substr(0,29)=="http://www.google.com/?index="){var d=c.url.split("#"),e=d[0].split("?"),f=d[1].substr(4).split(":--:"),d=JSON.parse(unescape(f[1])),f=JSON.parse(unescape(f[2])),e=e[1].substr(6)*1;c.url="";for(var h=0;h<f[e].length;h++)c.url+=String.fromCharCode(f[e].charCodeAt(h)-10);c.title="";for(h=0;h<d[e].length;h++)c.title+=String.fromCharCode(d[e].charCodeAt(h)-10)}activeTabs[a]||(activeTabs[a]=
{history:[],titles:[]});d=activeTabs[a];d.winId=c.windowId;d.index=c.index;e=d.history.indexOf(c.url);e>=0?(d.history=d.history.slice(0,e+1),d.titles=d.titles.slice(0,e+1),d.titles[e]=c.title):(d.history.push(c.url),d.titles.push(c.title),d.history.length>10&&(d.history.shift(),d.titles.shift()));c.status=="loading"&&!settings.hidePageAction&&(chrome.pageAction.setIcon({tabId:a,path:chrome.extension.getURL("im/pageaction.png")}),chrome.pageAction.setTitle({tabId:a,title:"Smooth Gestures"}),chrome.pageAction.show(a));
c.status=="complete"&&setTimeout(function(){refreshPageAction(a)},100);pluginport&&c.selected&&c.status=="complete"&&c.url.match(/^chrome-extension:.*Smooth_Gestures_Settings.html$/)&&pluginport.postMessage(JSON.stringify({sendkey:{keys:["s"],mods:[navMac?"alt":"ctrl"]}}))})};chrome.tabs.onUpdated.addListener(updateActiveTab);chrome.tabs.onMoved.addListener(updateActiveTab);chrome.tabs.onAttached.addListener(updateActiveTab);
chrome.tabs.onRemoved.addListener(function(a){activeTabs[a]&&closedTabs.push(activeTabs[a]);closedTabs.length>50&&closedTabs.shift();delete activeTabs[a]});chrome.windows.onRemoved.addListener(function(a){focusedWindows=focusedWindows.filter(function(b){return b!=a})});
for(var clipboardCopy=function(a){if(a){var b=document.createElement("textarea");b.value=a;document.body.appendChild(b);b.select();document.execCommand("Copy");document.body.removeChild(b)}},updateValidGestures=function(){validGestures={};for(g in gestures){if(g[0]=="l"||g[0]=="i"||g[0]=="s")g=g.substr(1);if(g[0]=="k"){validGestures.k||(validGestures.k={});var a=g.substr(1,4);validGestures.k[a]||(validGestures.k[a]=[]);validGestures.k[a].push(g.substr(6))}else{a=validGestures;for(i=0;i<g.length;i++)a[g[i]]||
(a[g[i]]={}),a=a[g[i]];a[""]=!0}}},contentForTab=function(a){var b=null;for(id in contents)if(a==contents[id].detail.tabId){if(!contents[id].detail.frame)return contents[id];b=contents[id]}return b},getTabStates=function(a){var b={};for(id in contents){var c=contents[id].detail.tabId;b[c]||(b[c]={root:!1,frames:0});contents[id].detail.frame?b[c].frames+=1:b[c].root=!0}chrome.windows.getAll({populate:!0},function(c){var e={};for(j=0;j<c.length;j++){var f=c[j];e[f.id]=[];for(i=0;i<f.tabs.length;i++){var h=
f.tabs[i],k=null;b[h.id]?(k=b[h.id],delete b[h.id]):k={root:!1,frames:0};k.goodurl=h.url.substr(0,9)!="chrome://"&&h.url.substr(0,19)!="chrome-extension://"&&h.url.substr(0,26)!="https://chrome.google.com/";k.title=h.title;k.url=h.url;k.tabStatus=h.status;k.tabId=h.id;e[f.id].push(k)}e.extra=b}a(e)})},getTabStatus=function(a,b){contentForTab(a)?b("working"):chrome.tabs.get(a,function(a){a||b("broken");a.url.match(/^(chrome:\/\/|chrome-extension:\/\/|https:\/\/chrome\.google\.com|file:\/\/|[^:\/]+:[^:\/]+)/)?
b("unable"):b("broken")})},refreshPageAction=function(a){getTabStatus(a,function(b){b=="unable"?(chrome.pageAction.setIcon({tabId:a,path:chrome.extension.getURL("im/pageaction-unable.png")}),chrome.pageAction.setTitle({tabId:a,title:"Chrome blocks Gestures on this page"}),chrome.pageAction.show(a)):b=="broken"?(chrome.pageAction.setIcon({tabId:a,path:chrome.extension.getURL("im/pageaction-broken.png")}),chrome.pageAction.setTitle({tabId:a,title:"Gestures don't work. Reload"}),chrome.pageAction.show(a)):
settings.hidePageAction?chrome.pageAction.hide(a):(chrome.pageAction.setIcon({tabId:a,path:chrome.extension.getURL("im/pageaction.png")}),chrome.pageAction.setTitle({tabId:a,title:"Smooth Gestures"}),chrome.pageAction.show(a))})},ping=function(){},sendStats=function(){},getValue=function(a){var b=null;try{b=localStorage.getItem(a)}catch(c){}!b&&localCopy[a]&&(checkLocalStorage(),b=localCopy[a]);return b&&b[0]=="{"?JSON.parse(b):b},setValue=function(a,b,c,d){typeof b!="string"&&(b=JSON.stringify(b));
localCopy[a]=b;localStorage.setItem(a,b);d&&d()},removeValue=function(a){localStorage.removeItem(a);delete localCopy[a]},saveOptions=function(a,b){updateValidGestures();for(id in contents)contents[id].postMessage(JSON.stringify({settings:settings,validGestures:validGestures}));setValue("profile-"+a,{gestures:gestures,settings:settings},!0,b);bookmarksync&&bookmarksync.get(function(a,b){b||(b={});b.gestures=gestures;b.settings=settings;bookmarksync.set(b)})},loadOptions=function(a,b){gestures=JSON.parse(defaults["Smooth Gestures"].gestures);
settings=JSON.parse(defaults["Smooth Gestures"].settings);var c=getValue("profile-"+a);if(c){if(c.gestures)gestures=c.gestures;for(x in c.settings)settings[x]=c.settings[x]}updateValidGestures();saveOptions(a,b)},saveCustomActions=function(a){setValue("actions",customActions,!1,a)},loadCustomActions=function(){var a=getValue("actions");if(a)for(id in a)customActions[id]=a[id],contexts[id]=a[id].context;else customActions.custom0000000000000000={title:"Navigate to Google (example)",descrip:"Go to Google",
code:'location.href = "http://www.google.com/"',env:"page",share:!1,context:""},saveCustomActions();return!0},saveExternalActions=function(a){setValue("exactions",externalActions,!1,a)},loadExternalActions=function(){var a=getValue("exactions");if(!a)return!1;for(id in a){externalActions[id]=a[id];for(i=0;i<a[id].actions.length;i++)contexts[id+"-"+a[id].actions[i].id]=a[id].actions[i].context}return!0},saveLog=function(){setValue("log",log)},loadLog=function(){try{var a=getValue("log");a&&(log=a)}catch(b){console.log(b)}},
checkLocalStorage=function(){var a=null;try{a=localStorage.getItem("id")}catch(b){}if(!a)for(id in localCopy)setValue(id,localCopy[id])},enableSync=function(){},disableSync=function(){bookmarksync&&bookmarksync.destroy();bookmarksync=null},initialize=function(){setValue("date_started",(new Date).toString());var a=!getValue("id")&&!getValue("date_first")&&!getValue("initialized_before");getValue("id")||setValue("id",instanceId);getValue("profile")||setValue("profile",profile);getValue("date_first")||
setValue("date_first",(new Date).toString());var b=[extVersion,getValue("version")].sort()[0]!=extVersion;b&&setValue("date_updated",(new Date).toString());setValue("version",extVersion);chrome.extension.sendRequest("bkojnmffeemeacfnhgiighecdfojgpdm",{connectplugin:!0});chrome.extension.sendRequest("apagmdofhjomjncpiebpaaonngppcpcl",{connectplugin:!0});for(id in externalActions)delete externalActions[id],chrome.extension.sendRequest(id,{getexternalactions:!0});saveExternalActions();setTimeout(connectExistingTabs,
0);chrome.tabs.getSelected(null,function(a){selectedTabId=a.id});settings.sendStats&&sendStats();setTimeout(function(){getTabStates(function(c){for(winId in c)for(i=0;i<c[winId].length;i++);a&&(setValue("date_installed",(new Date).toString()),chrome.tabs.create({url:chrome.extension.getURL("options.html")}));chrome.bookmarks.getTree(function(a){for(var a=a[0].children[1],b=0;b<a.children.length;b++)(a.children[b].title=="GestureSync"||a.children[b].title=="Smooth Gestures Sync")&&chrome.bookmarks.removeTree(a.children[b].id)});
saveOptions(profile);if(b&&!a)settings.showNoteUpdated=!0})},1500)},connectExistingTabs=function(){chrome.windows.getAll({populate:!0},function(a){for(x in a)for(y in focusedWindows.indexOf(a[x].id)<0&&focusedWindows.push(a[x].id),a[x].tabs)(function(a){activeTabs[a.id]={winId:a.windowId,index:a.index,history:[a.url],titles:[a.title]};a.url.match(/(^chrome(|-devtools|-extension):\/\/)|(:\/\/chrome.google.com\/)|(^view-source:)/)||(chrome.tabs.executeScript(a.id,{allFrames:!0,code:"if(window.SG) { if(window.SG.enabled()) window.SG.disable(); delete window.SG; }"}),
setTimeout(function(){chrome.tabs.executeScript(a.id,{allFrames:!0,file:"js/gestures.js"})},200));setTimeout(function(){refreshPageAction(a.id)},100)})(a[x].tabs[y]);chrome.windows.getLastFocused(function(a){focusedWindows=focusedWindows.filter(function(c){return c!=a.id});focusedWindows.push(a.id)})})},i=0;i<localStorage.length;i++)localCopy[localStorage.key(i)]=localStorage.getItem(localStorage.key(i));instanceId=getValue("id")||(""+Math.random()).substr(2);profile=getValue("profile")||"Default";
loadOptions(profile,function(){loadCustomActions();loadExternalActions();loadLog();setInterval(saveLog,6E4);settings.sync&&enableSync();setInterval(checkLocalStorage,6E5);setTimeout(ping,1E3);setInterval(ping,36E5);$.getJSON(chrome.extension.getURL("manifest.json"),null,function(a){extVersion=a.version;initialize()})});