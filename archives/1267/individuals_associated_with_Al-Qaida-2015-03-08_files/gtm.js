// Copyright 2012 Google Inc. All rights reserved.
// Container Version: 1
(function(w,g){w[g]=w[g]||{};w[g].e=function(s){return eval(s);};})(window,'google_tag_manager');(function(){
var p=this,aa=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var d=Object.prototype.toString.call(a);if("[object Window]"==d)return"object";if("[object Array]"==d||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==d||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b},ba=function(a,b){var d=Array.prototype.slice.call(arguments,1);return function(){var b=d.slice();b.push.apply(b,arguments);return a.apply(this,b)}},ca=null;/*
 jQuery v1.9.1 (c) 2005, 2012 jQuery Foundation, Inc. jquery.org/license. */
var da=/\[object (Boolean|Number|String|Function|Array|Date|RegExp)\]/,ea=function(a){if(null==a)return String(a);var b=da.exec(Object.prototype.toString.call(Object(a)));return b?b[1].toLowerCase():"object"},fa=function(a,b){return Object.prototype.hasOwnProperty.call(Object(a),b)},ga=function(a){if(!a||"object"!=ea(a)||a.nodeType||a==a.window)return!1;try{if(a.constructor&&!fa(a,"constructor")&&!fa(a.constructor.prototype,"isPrototypeOf"))return!1}catch(b){return!1}for(var d in a);return void 0===
d||fa(a,d)},ha=function(a,b){var d=b||("array"==ea(a)?[]:{}),c;for(c in a)if(fa(a,c)){var e=a[c];"array"==ea(e)?("array"!=ea(d[c])&&(d[c]=[]),d[c]=ha(e,d[c])):ga(e)?(ga(d[c])||(d[c]={}),d[c]=ha(e,d[c])):d[c]=e}return d};var ia=function(){},y=function(a){return"function"==typeof a},C=function(a){return"[object Array]"==Object.prototype.toString.call(Object(a))},ja=function(a){return"number"==ea(a)&&!isNaN(a)},ka=function(a,b){if(Array.prototype.indexOf){var d=a.indexOf(b);return"number"==typeof d?d:-1}for(var c=0;c<a.length;c++)if(a[c]===b)return c;return-1},la=function(a){return a?a.replace(/^\s+|\s+$/g,""):""},D=function(a){return Math.round(Number(a))||0},na=function(a){var b=[];if(C(a))for(var d=0;d<a.length;d++)b.push(String(a[d]));
return b},E=function(){return new Date},oa=function(a,b){if(!ja(a)||!ja(b)||a>b)a=0,b=2147483647;return Math.round(Math.random()*(b-a)+a)},pa=function(){this.prefix="gtm.";this.values={}};pa.prototype.set=function(a,b){this.values[this.prefix+a]=b};pa.prototype.get=function(a){return this.values[this.prefix+a]};pa.prototype.contains=function(a){return void 0!==this.get(a)};
var qa=function(a,b,d){try{return a["0"](a,b||ia,d||ia)}catch(c){}return!1},ra=function(a,b){function d(b,c){a.contains(b)||a.set(b,[]);a.get(b).push(c)}for(var c=la(b).split("&"),e=0;e<c.length;e++)if(c[e]){var f=c[e].indexOf("=");0>f?d(c[e],"1"):d(c[e].substring(0,f),c[e].substring(f+1))}},sa=function(a){var b=a?a.length:0;return 0<b?a[b-1]:""},ta=function(a){for(var b=0;b<a.length;b++)a[b]()},ua=E().getTime(),va=function(a,b,d){return a&&a.hasOwnProperty(b)?a[b]:d},wa=function(a,
b,d){a.prototype["gtm_proxy_"+b]=a.prototype[b];a.prototype[b]=d},ya=function(a){return null!==a&&void 0!==a&&void 0!==a.length};var H=window,I=document,za=navigator,J=function(a,b,d){var c=H[a];if(a&&/^[a-zA-Z_]\w*$/g.test(a)){var e="var "+a+";";if(p.execScript)p.execScript(e,"JavaScript");else if(p.eval)if(null==ca&&(p.eval("var _et_ = 1;"),"undefined"!=typeof p._et_?(delete p._et_,ca=!0):ca=!1),ca)p.eval(e);else{var f=p.document,g=f.createElement("script");g.type="text/javascript";g.defer=!1;g.appendChild(f.createTextNode(e));f.body.appendChild(g);f.body.removeChild(g)}else throw Error("goog.globalEval not available");}H[a]=
void 0===c||d?b:c;return H[a]},K=function(a,b,d,c){return(c||"http:"!=H.location.protocol?a:b)+d},Aa=function(a){var b=I.getElementsByTagName("script")[0];b.parentNode.insertBefore(a,b)},Ba=function(a,b){b&&(a.addEventListener?a.onload=b:a.onreadystatechange=function(){a.readyState in{loaded:1,complete:1}&&(a.onreadystatechange=null,b())})},L=function(a,b,d){var c=I.createElement("script");c.type="text/javascript";c.async=!0;c.src=a;Ba(c,b);d&&(c.onerror=d);Aa(c)},Ca=function(a,b){var d=I.createElement("iframe");
d.height="0";d.width="0";d.style.display="none";d.style.visibility="hidden";Aa(d);Ba(d,b);void 0!==a&&(d.src=a);return d},m=function(a,b,d){var c=new Image(1,1);c.onload=function(){c.onload=null;b&&b()};c.onerror=function(){c.onerror=null;d&&d()};c.src=a},N=function(a,b,d,c){a.addEventListener?a.addEventListener(b,d,!!c):a.attachEvent&&a.attachEvent("on"+b,d)},P=function(a){H.setTimeout(a,0)},Da=!1,Ea=[],Fa=function(a){if(!Da){var b=I.createEventObject,d="complete"==I.readyState,c="interactive"==
I.readyState;if(!a||"readystatechange"!=a.type||d||!b&&c){Da=!0;for(var e=0;e<Ea.length;e++)Ea[e]()}}},Ga=0,Ha=function(){if(!Da&&140>Ga){Ga++;try{I.documentElement.doScroll("left"),Fa()}catch(a){H.setTimeout(Ha,50)}}},Ka=function(a){var b=I.getElementById(a);if(b&&Ja(b,"id")!=a)for(var d=1;d<document.all[a].length;d++)if(Ja(document.all[a][d],"id")==a)return document.all[a][d];return b},Ja=function(a,b){return a&&b&&a.attributes&&a.attributes[b]?a.attributes[b].value:null},La=function(a){return a.target||
a.srcElement||{}},Ma=function(a){var b=I.createElement("div");b.innerHTML="A<div>"+a+"</div>";for(var b=b.lastChild,d=[];b.firstChild;)d.push(b.removeChild(b.firstChild));return d},Na=function(a,b){for(var d={},c=0;c<b.length;c++)d[b[c]]=!0;for(var e=a,c=0;e&&!d[String(e.tagName).toLowerCase()]&&100>c;c++)e=e.parentElement;e&&!d[String(e.tagName).toLowerCase()]&&(e=null);return e},Oa=!1,Pa=[],Qa=function(){if(!Oa){Oa=!0;for(var a=0;a<Pa.length;a++)Pa[a]()}},Ra=function(a){a=a||H;var b=a.location.href,
d=b.indexOf("#");return 0>d?"":b.substring(d+1)},Sa=function(a){window.console&&window.console.log&&window.console.log(a)};var Ta=new pa,Ua={},Wa={set:function(a,b){ha(Va(a,b),Ua)},get:function(a){return R(a,2)},reset:function(){Ta=new pa;Ua={}}},R=function(a,b){if(2==b){for(var d=Ua,c=a.split("."),e=0;e<c.length;e++){if(void 0===d[c[e]])return;d=d[c[e]]}return d}return Ta.get(a)},Va=function(a,b){for(var d={},c=d,e=a.split("."),f=0;f<e.length-1;f++)c=c[e[f]]={};c[e[e.length-1]]=b;return d};var Xa=new RegExp(/^(.*\.)?(google|youtube|blogger)(\.com?)?(\.[a-z]{2})?\.?$/),Ya={customPixels:["nonGooglePixels"],html:["customScripts","customPixels","nonGooglePixels","nonGoogleScripts","nonGoogleIframes"],customScripts:["html","customPixels","nonGooglePixels","nonGoogleScripts","nonGoogleIframes"],nonGooglePixels:[],nonGoogleScripts:["nonGooglePixels"],nonGoogleIframes:["nonGooglePixels"]},Za={customPixels:["customScripts","html"],html:["customScripts"],customScripts:["html"],nonGooglePixels:["customPixels",
"customScripts","html","nonGoogleScripts","nonGoogleIframes"],nonGoogleScripts:["customScripts","html"],nonGoogleIframes:["customScripts","html","nonGoogleScripts"]},$a=function(a,b){for(var d=[],c=0;c<a.length;c++)d.push(a[c]),d.push.apply(d,b[a[c]]||[]);return d},ab=function(){var a=R("gtm.whitelist");
var b=a&&$a(na(a),Ya),d=R("gtm.blacklist")||R("tagTypeBlacklist")||[];var c=d&&$a(na(d),Za),e={};return function(f){var g=f&&f["0"];if(!g)return!0;if(void 0!==e[g.a])return e[g.a];var h=!0;if(a)e:{if(0>ka(b,g.a))if(g.b&&0<g.b.length)for(var k=0;k<g.b.length;k++){if(0>ka(b,g.b[k])){h=
!1;break e}}else{h=!1;break e}h=!0}var n=!1;if(d){var l;if(!(l=0<=ka(c,g.a)))e:{for(var q=g.b||[],r=new pa,t=0;t<c.length;t++)r.set(c[t],!0);for(t=0;t<q.length;t++)if(r.get(q[t])){l=!0;break e}l=!1}n=l}return e[g.a]=!h||n}};var cb=function(a){return bb?I.querySelectorAll(a):null},db;e:{var gb=/MSIE +([\d\.]+)/.exec(za.userAgent);if(gb&&gb[1]){var hb=I.documentMode;hb||(hb="CSS1Compat"==I.compatMode?parseInt(gb[1],10):5);if(!hb||8>=hb){db=!1;break e}}db=!!I.querySelectorAll}var bb=db;var ib=function(a,b,d,c,e){var f,g=(a.protocol.replace(":","")||H.location.protocol.replace(":","")).toLowerCase();switch(b){case "protocol":f=g;break;case "host":f=(a.hostname||H.location.hostname).split(":")[0].toLowerCase();if(d){var h=/^www\d*\./.exec(f);h&&h[0]&&(f=f.substr(h[0].length))}break;case "port":f=String(1*(a.hostname?a.port:H.location.port)||("http"==g?80:"https"==g?443:""));break;case "path":f="/"==a.pathname.substr(0,1)?a.pathname:"/"+a.pathname;var k=f.split("/");0<=ka(c||[],k[k.length-
1])&&(k[k.length-1]="");f=k.join("/");break;case "query":f=a.search.replace("?","");if(e)e:{for(var n=f.split("&"),l=0;l<n.length;l++){var q=n[l].split("=");if(decodeURIComponent(q[0]).replace("+"," ")==e){f=decodeURIComponent(q.slice(1).join("=")).replace("+"," ");break e}}f=void 0}break;case "fragment":f=a.hash.replace("#","");break;default:f=a&&a.href}return f},jb=function(a){var b="";a&&a.href&&(b=a.hash?a.href.replace(a.hash,""):a.href);return b},kb=function(a){var b=I.createElement("a");a&&
(b.href=a);return b};var _eu=function(a){var b=String(R("gtm.elementUrl")||a[""]||""),d=kb(b);return b};_eu.a="eu";_eu.b=["google"];var lb=Math.random(),mb=null,nb=null;var _e=function(){return nb};_e.a="e";_e.b=["google"];var _f=function(a){var b=String(R("gtm.referrer")||I.referrer);if(!b)return b;var d=kb(b);return b};_f.a="f";_f.b=["google"];var ob=function(a){var b=H.location,d=b.hash?b.href.replace(b.hash,""):b.href,c;if(c=a[""]?a[""]:R("gtm.url"))d=String(c),b=kb(d);return d},_u=ob;_u.a="u";_u.b=["google"];var _eq=function(a){return String(a[""])==String(a[""])};_eq.a="eq";_eq.b=["google"];var ub=ia,vb=[],wb=!1,xb=function(a){return H["dataLayer"].push(a)},yb=function(a){var b=!1;return function(){!b&&y(a)&&P(a);b=!0}},Eb=function(){for(var a=!1;!wb&&0<vb.length;){wb=!0;var b=vb.shift();if(y(b))try{b.call(Wa)}catch(d){}else if(C(b))e:{var c=b;if("string"==ea(c[0])){for(var e=c[0].split("."),f=e.pop(),g=c.slice(1),h=Ua,k=0;k<e.length;k++){if(void 0===h[e[k]])break e;h=h[e[k]]}try{h[f].apply(h,g)}catch(n){}}}else{var l=b,q=void 0;for(q in l)if(l.hasOwnProperty(q)){var r=q,t=l[q];
Ta.set(r,t);ha(Va(r,t),Ua)}var u=!1,v=l.event;if(v){nb=v;var z=yb(l.eventCallback),Q=l.eventTimeout;Q&&H.setTimeout(z,Number(Q));u=ub(v,z,l.eventReporter)}if(!mb&&(mb=l["gtm.start"])){}nb=null;a=u||a}var x=b,O=Ua;Db();wb=!1}return!a};var Fb,Gb=/(Firefox\D28\D)/g.test(za.userAgent),Hb={nwnc:{},nwc:{},wnc:{},wc:{},wt:null,l:!1},Ib={nwnc:{},nwc:{},wnc:{},wc:{},wt:null,l:!1},Ob=function(a,b){return function(d){d=d||H.event;var c=La(d),e=!1;if(3!==d.which||"LINK_CLICK"!=a){"LINK_CLICK"==a&&(c=Na(c,["a","area"]),e=!c||!c.href||Jb(c.href)||2===d.which||null==d.which&&4==d.button||d.ctrlKey||d.shiftKey||d.altKey||!0===d.metaKey);var f="FORM_SUBMIT"==a?Ib:Hb;if(d.defaultPrevented||!1===d.returnValue||d.S&&d.S()){if(c){var g={simulateDefault:!1},
h=Kb(f,["wnc","nwnc"]);h&&Lb(a,c,g,f.wt,h)}}else{if(c){var g={},k=!0,n=Kb(f,["wnc","nwnc","nwc","wc"]);(k=Lb(a,c,g,f.wt,n))||(Mb(g.eventReport,f)?b=!0:e=!0);e=e||k||"LINK_CLICK"==a&&Gb;g.simulateDefault=!k&&b&&!e;g.simulateDefault&&(e=Nb(c,g)||e,!e&&d.preventDefault&&d.preventDefault());d.returnValue=k||!b||e;return d.returnValue}return!0}}}},Lb=function(a,b,d,c,e){var f=c||2E3,g={"gtm.element":b,"gtm.elementClasses":b.className,"gtm.elementId":b["for"]||Ja(b,"id")||"","gtm.elementTarget":b.formTarget||
b.target||""};switch(a){case "LINK_CLICK":g["gtm.triggers"]=e||"";g.event="gtm.linkClick";g["gtm.elementUrl"]=b.href;g.eventTimeout=f;g.eventCallback=Pb(b,d);g.eventReporter=function(a){d.eventReport=a};break;case "FORM_SUBMIT":g["gtm.triggers"]=e||"";g.event="gtm.formSubmit";g["gtm.elementUrl"]=Qb(b);g.eventTimeout=f;g.eventCallback=Rb(b,d);g.eventReporter=function(a){d.eventReport=a};break;case "CLICK":g.event="gtm.click";g["gtm.elementUrl"]=b.formAction||b.action||b.href||b.src||b.code||b.codebase||
"";break;default:return!0}return xb(g)},Qb=function(a){var b=a.action;b&&b.tagName&&(b=a.cloneNode(!1).action);return b},Sb=function(a){var b=a.target;if(!b)switch(String(a.tagName).toLowerCase()){case "a":case "area":case "form":b="_self"}return b},Nb=function(a,b){var d=!1,c=/(iPad|iPhone|iPod)/g.test(za.userAgent),e=Sb(a).toLowerCase();switch(e){case "":case "_self":case "_parent":case "_top":var f;f=(e||"_self").substring(1);b.targetWindow=H.frames&&H.frames[f]||H[f];break;case "_blank":c?(b.simulateDefault=
!1,d=!0):(b.targetWindowName="gtm_autoEvent_"+E().getTime(),b.targetWindow=H.open("",b.targetWindowName));break;default:c&&!H.frames[e]?(b.simulateDefault=!1,d=!0):(H.frames[e]||(b.targetWindowName=e),b.targetWindow=H.frames[e]||H.open("",e))}return d},Pb=function(a,b,d){return function(){b.simulateDefault&&(b.targetWindow?b.targetWindow.location.href=a.href:(d=d||E().getTime(),500>E().getTime()-d&&H.setTimeout(Pb(a,b,d),25)))}},Rb=function(a,b,d){return function(){if(b.simulateDefault)if(b.targetWindow){var c;
b.targetWindowName&&(c=a.target,a.target=b.targetWindowName);I.gtmSubmitFormNow=!0;Vb(a).call(a);b.targetWindowName&&(a.target=c)}else d=d||E().getTime(),500>E().getTime()-d&&H.setTimeout(Rb(a,b,d),25)}},Kb=function(a,b){for(var d=[],c=0;c<b.length;c++){var e=a[b[c]],f;for(f in e)e.hasOwnProperty(f)&&e[f]&&d.push(f)}return d.join(",")},Wb=function(a,b,d,c,e){var f=e;if(!f||"0"==f){if(a.l)return;a.l=!0;f="0"}var g=a.wt;b&&(!g||g>c)&&(a.wt=c);a[b?d?"wc":"wnc":d?"nwc":"nwnc"][f]=!0},Mb=function(a,b){if(b.wnc["0"]||
b.wc["0"])return!0;for(var d=0;d<Xb.length;d++)if(a.passingRules[d]){var c=Xb[d],e=Yb[d],f=e&&e[0]&&e[0][0]||e[1]&&e[1][0];if(f&&"0"!=f&&(b.wc[f]||b.wnc[f]))for(var g=c[1],h=0;h<g.length;h++)if(a.resolvedTags[g[h]])return!0}return!1},Zb=function(a,b,d,c,e){var f,g,h=!1;switch(a){case "CLICK":if(I.gtmHasClickListenerTag)return;I.gtmHasClickListenerTag=!0;f="click";g=function(a){var b=La(a);b&&Lb("CLICK",b,{},c)};h=!0;break;case "LINK_CLICK":b&&!Fb&&(Fb=jb(I.location));Wb(Hb,b||!1,d||!1,c,e);if(I.gtmHasLinkClickListenerTag)return;
I.gtmHasLinkClickListenerTag=!0;f="click";g=Ob(a,b||!1);break;case "FORM_SUBMIT":Wb(Ib,b||!1,d||!1,c,e);if(I.gtmHasFormSubmitListenerTag)return;I.gtmHasFormSubmitListenerTag=!0;f="submit";g=Ob(a,b||!1);break;default:return}N(I,f,g,h)},Jb=function(a){if(!Fb)return!0;var b=a.indexOf("#");if(0>b)return!1;if(0==b)return!0;var d=kb(a);return Fb==jb(d)},Vb=function(a){try{if(a.constructor&&a.constructor.prototype)return a.constructor.prototype.submit}catch(b){}if(a.gtmReplacedFormSubmit)return a.gtmReplacedFormSubmit;
I.gtmFormElementSubmitter||(I.gtmFormElementSubmitter=I.createElement("form"));return I.gtmFormElementSubmitter.submit.call?I.gtmFormElementSubmitter.submit:a.submit};var gc=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")},hc=function(a,b){return a<b?-1:a>b?1:0};var U;e:{var ic=p.navigator;if(ic){var jc=ic.userAgent;if(jc){U=jc;break e}}U=""};var kc=function(){return-1!=U.indexOf("Edge")};var lc=-1!=U.indexOf("Opera")||-1!=U.indexOf("OPR"),V=-1!=U.indexOf("Edge")||-1!=U.indexOf("Trident")||-1!=U.indexOf("MSIE"),mc=-1!=U.indexOf("Gecko")&&!(-1!=U.toLowerCase().indexOf("webkit")&&!kc())&&!(-1!=U.indexOf("Trident")||-1!=U.indexOf("MSIE"))&&!kc(),nc=-1!=U.toLowerCase().indexOf("webkit")&&!kc(),oc=function(){var a=U;if(mc)return/rv\:([^\);]+)(\)|;)/.exec(a);if(V&&kc())return/Edge\/([\d\.]+)/.exec(a);if(V)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(nc)return/WebKit\/(\S+)/.exec(a)},
pc=function(){var a=p.document;return a?a.documentMode:void 0},qc=function(){if(lc&&p.opera){var a=p.opera.version;return"function"==aa(a)?a():a}var b="",d=oc();d&&(b=d?d[1]:"");if(V&&!kc()){var c=pc();if(c>parseFloat(b))return String(c)}return b}(),rc={},sc=function(a){var b;if(!(b=rc[a])){for(var d=0,c=gc(String(qc)).split("."),e=gc(String(a)).split("."),f=Math.max(c.length,e.length),g=0;0==d&&g<f;g++){var h=c[g]||"",k=e[g]||"",n=RegExp("(\\d*)(\\D*)","g"),l=RegExp("(\\d*)(\\D*)","g");do{var q=
n.exec(h)||["","",""],r=l.exec(k)||["","",""];if(0==q[0].length&&0==r[0].length)break;d=hc(0==q[1].length?0:parseInt(q[1],10),0==r[1].length?0:parseInt(r[1],10))||hc(0==q[2].length,0==r[2].length)||hc(q[2],r[2])}while(0==d)}b=rc[a]=0<=d}return b},tc=p.document,uc=pc(),vc=!tc||!V||!uc&&kc()?void 0:uc||("CSS1Compat"==tc.compatMode?parseInt(qc,10):5);var wc;if(!(wc=!mc&&!V)){var xc;if(xc=V)xc=V&&(kc()||9<=vc);wc=xc}wc||mc&&sc("1.9.1");V&&sc("9");var yc=function(a){yc[" "](a);return a};yc[" "]=function(){};var Dc=function(a,b){var d="";V&&!zc(a)&&(d='<script>document.domain="'+document.domain+'";\x3c/script>'+d);var c="<!DOCTYPE html><html><head><script>var inDapIF=true;\x3c/script>"+d+"</head><body>"+b+"</body></html>";if(Ac)a.srcdoc=c;else if(Bc){var e=a.contentWindow.document;e.open("text/html","replace");e.write(c);e.close()}else Cc(a,c)},Ac=nc&&"srcdoc"in document.createElement("iframe"),Bc=mc||nc||V&&sc(11),Cc=function(a,b){V&&sc(7)&&!sc(10)&&6>Ec()&&Fc(b)&&(b=Gc(b));var d=function(){a.contentWindow.goog_content=
b;a.contentWindow.location.replace("javascript:window.goog_content")};V&&!zc(a)?Hc(a,d):d()},Ec=function(){var a=navigator.userAgent.match(/Trident\/([0-9]+.[0-9]+)/);return a?parseFloat(a[1]):0},zc=function(a){try{var b;var d=a.contentWindow;try{var c;if(c=!!d&&null!=d.location.href)t:{try{yc(d.foo);c=!0;break t}catch(e){}c=!1}b=c}catch(f){b=!1}return b}catch(g){return!1}},Ic=0,Hc=function(a,b){var d="goog_rendering_callback"+Ic++;window[d]=b;a.src="javascript:'<script>(function() {document.domain = \""+
document.domain+'";var continuation = window.parent.'+d+";window.parent."+d+" = null;continuation();})()\x3c/script>'"},Fc=function(a){for(var b=0;b<a.length;++b)if(127<a.charCodeAt(b))return!0;return!1},Gc=function(a){for(var b=unescape(encodeURIComponent(a)),d=Math.floor(b.length/2),c=[],e=0;e<d;++e)c[e]=String.fromCharCode(256*b.charCodeAt(2*e+1)+b.charCodeAt(2*e));1==b.length%2&&(c[d]=b.charAt(b.length-1));return c.join("")};/*
 Copyright (c) 2014 Derek Brans, MIT license https://github.com/krux/postscribe/blob/master/LICENSE. Portions derived from simplehtmlparser, which is licensed under the Apache License, Version 2.0 */
var Qc,Rc;
var ad=function(a){return function(){}},bd=function(a){return function(){}};var dd={},fd=function(a,b,d,c,e){if(!bb)return!1;var f=dd[a];f||(f={id:a,s:[],I:0,ba:null},dd[a]=f);var g={id:a+":"+f.s.length,xa:d,sa:c,r:b,R:0,P:e||null,fa:0,H:!1};f.s.push(g);null===b?(g.H=!0,d(null)):ed(f);return!0},ed=function(a){for(var b=a.I;b<a.s.length;b++){var d=a.s[b],c=b==a.I;if(!d.H&&!gd(c,d))break;d.H&&c&&a.I++}a.s.length>a.I&&!a.ba&&(a.ba=H.setTimeout(function(){a.ba=null;ed(a)},200))},gd=function(a,b){var d=[];if(b.r){var c=hd(b.r,b.id),e=null;b.P&&(e=hd(b.P,b.id+"-t"));for(var f=
0;f<c.length;f++){var g=c[f],h;if(null!=e&&(h=e.length>f?e[f]:null,!h&&!Da&&(null===b.P.f||b.fa+d.length<b.P.f)))break;d.push({element:g,Wa:h})}}if(!Da&&b.sa&&(!a||null==b.r.f||b.r.f!=b.R+d.length))return!1;for(var k=0;k<d.length;k++){var n=d[k].element,l=d[k].Wa;b.R++;id(n,b.id);l&&(b.fa++,id(l,b.id+"-t"));b.xa(n,l)}if(b.r.f&&b.r.f==b.R||Da)b.H=!0;return!0},id=function(a,b){a.gtmProgressiveApplied||(a.gtmProgressiveApplied={});a.gtmProgressiveApplied[b]=!0},hd=function(a,b){for(var d=cb(a.m)||[],
c=[],e=0;e<d.length;e++){var f=d[e];if(!f.gtmProgressiveApplied||!f.gtmProgressiveApplied[b]){var g;if(g=a.p){var h;e:{for(var k=f;k;){if(k.nextSibling){h=!0;break e}k=k.parentNode}h=!1}g=!h}if(g)break;c.push(f)}}return c};var Gd=function(a){var b=H||p,d=b.onerror,c=!1;nc&&!sc("535.3")&&(c=!c);b.onerror=function(b,f,g,h,k){d&&d(b,f,g,h,k);a({message:b,fileName:f,Pa:g,mb:h,error:k});return c}};var Id=function(){var a=this;this.t=!1;this.qa=[];this.la=[];this.K=function(){a.t||ta(a.qa);a.t=!0};this.J=function(){a.t||ta(a.la);a.t=!0};this.h=ia},Jd=function(a,b){a.qa.push(b)},Kd=function(a,b){a.la.push(b)},Ld=function(){this.j=[];this.ja={};this.W=[];this.u=0};Ld.prototype.addListener=function(a){this.W.push(a)};
var Md=function(a,b,d,c){if(!d.t){a.j[b]=d;void 0==c&&(c=[]);C(c)||(c=["or",c]);a.ja[b]=c;a.u++;var e=function(){0<a.u&&a.u--;0<a.u||ta(a.W)};Jd(d,e);Kd(d,e)}},Nd=function(a,b,d){a.j[b]&&(Jd(a.j[b],function(){d(b,!0)}),Kd(a.j[b],function(){d(b,!1)}))},Od=function(a,b){var d=!1;return function(c,e){var f=ka(a,c);d||0>f||("or"==a[0]?e?(d=!0,b()):(a.splice(f,1),1==a.length&&(d=!0)):e?(a.splice(f,1),1==a.length&&(d=!0,b())):d=!0)}};var Pd=function(a,b){return function(){a["2"]=b.K;a["3"]=b.J;qa(a,b.K,b.J)}},Qd=function(a){var b=new Id;Jd(b,ad(a));Kd(b,bd(a));b.h=Pd(a,b);return b};var Ud,Vd;var xe=function(){this.i=[]};xe.prototype.set=function(a,b){this.i.push([a,b]);return this};xe.prototype.resolve=function(a,b){for(var d={},c=0;c<this.i.length;c++){var e=ye(this.i[c][0],a,b),f=ye(this.i[c][1],a,b);d[e]=f}return d};var ze=function(a){this.index=a};ze.prototype.resolve=function(a,b){var d=zb[this.index];if(d&&!b(d)){var c=d["1"];if(a){if(a.get(c))return;a.set(c,!0)}d=ye(d,a,b);a&&a.set(c,!1);return qa(d)}};
for(var _M=function(a){return new ze(a)},Be=function(a){this.resolve=function(b,d){for(var c=[],e=0;e<a.length;e++)c.push(ye(Ae[a[e]],b,d));return c.join("")}},_T=function(a){return new Be(arguments)},De=function(a){function b(b){for(var c=1;c<a.length;c++)if(a[c]==b)return!0;return!1}this.resolve=function(d,c){var e=ye(a[0],d,c);
if(a[0]instanceof ze&&b(8)&&b(16)){var f="gtm"+ua++;Ce.set(f,e);return'google_tag_manager["GTM-LQCS"].macro(\''+f+"')"}for(var e=String(e),g=1;g<a.length;g++)e=Y[a[g]](e);return e}},_E=function(a,b){return new De(arguments)},Cb=function(a,b){return ye(a,new pa,b)},ye=function(a,b,d){var c=a;if(a instanceof ze||a instanceof xe||a instanceof Be||a instanceof De)return a.resolve(b,d);if(C(a))for(var c=[],e=0;e<a.length;e++)c[e]=ye(a[e],b,d);else if(a&&"object"==typeof a){var c={},f;for(f in a)a.hasOwnProperty(f)&&
(c[f]=ye(a[f],b,d))}return c},Ee=function(a,b){var d=b[a],c=d;if(d instanceof ze||d instanceof De||d instanceof Be)c=d;else if(C(d))for(var c=[],e=0;e<d.length;e++)c[e]=Ee(d[e],b);else if("object"==typeof d){var c=new xe,f;for(f in d)d.hasOwnProperty(f)&&c.set(b[f],Ee(d[f],b))}return c},Z=function(a,b){for(var d=b?b.split(","):[],c=0;c<d.length;c++){var e=d[c]=d[c].split(":");0==a&&(e[1]=Ae[e[1]]);if(1==a)for(var f=Fe(e[0]),e=d[c]={},g=0;g<f.length;g++){var h=Ge[f[g]];e[h[0]]=h[1]}if(2==a)for(g=0;4>
g;g++)e[g]=Fe(e[g]);3==a&&(d[c]=Ae[e[0]]);if(4==a)for(g=0;2>g;g++)if(e[g]){e[g]=e[g].split(".");for(var k=0;k<e[g].length;k++)e[g][k]=Ae[e[g][k]]}else e[g]=[];5==a&&(d[c]=e[0])}return d},Fe=function(a){var b=[];if(!a)return b;for(var d=0,c=0;c<a.length&&d<He;d+=6,c++){var e=a&&a.charCodeAt(c)||65;if(65!=e){var f=0,f=65<e&&90>=e?e-65:97<=e&&122>=e?e-97+26:95==e?63:48<=e?e-48+52:62;1&f&&b.push(d);2&f&&b.push(d+1);4&f&&b.push(d+2);8&f&&b.push(d+3);16&f&&b.push(d+4);32&f&&b.push(d+5)}}return b},He=6,
Ie=[_u,'url',_e,'event',_f,'referrer'],Je=[],Ke=0;Ke<Ie.length;Ke++)Je[Ke]=Ee(Ke,Ie);var Ae=Je,Ge=Z(0,"0:0,1:1,0:2,1:3,0:4,1:5"),zb=Z(1,"D,M,w"),Ce=new pa,Le=Z(1,""),X=Z(1,""),Xb=Z(2,""),Yb=Z(4,"");var Db=function(){};var Qe=function(){var a=[];return function(b,d){if(void 0===a[b]){var c=Le[b]&&Cb(Le[b],d);a[b]=[c&&qa(c),c]}return a[b]}},Re=function(a,b){for(var d=b[0],c=0;c<d.length;c++)if(!a.o(d[c],a.d)[0])return!1;for(var e=b[2],c=0;c<e.length;c++)if(a.o(e[c],a.d)[0])return!1;return!0},Se=!1,ub=function(a,b,d){switch(a){case "gtm.js":if(Se)return!1;Se=!0;break;case "gtm.sync":if(R("gtm.snippet")!=lb)return!1}R("tagTypeBlacklist");for(var c={name:a,D:b||ia,C:Fe(),N:Fe(),o:Qe(),d:ab()},e=[],f=0;f<Xb.length;f++)if(Re(c,
Xb[f])){e[f]=!0;for(var g=c,h=Xb[f],k=h[1],n=0;n<k.length;n++)g.C[k[n]]=!0;for(var l=h[3],n=0;n<l.length;n++)g.N[l[n]]=!0}else e[f]=!1;var q=[];for(var r=0;r<He;r++)if(c.C[r]&&!c.N[r])if(c.d(X[r])){}else{q[r]=Cb(X[r],c.d);}c.O=
q;for(var t=new Ld,u=0;u<He;u++)if(c.C[u]&&!c.N[u]&&!c.d(X[u])){var v=c.O[u],z=Qd(v);Md(t,u,z,v[""]);if(v[""])break}t.addListener(c.D);for(var Q=[],A=0;A<t.j.length;A++){var M=t.j[A];if(M){var G=t.ja[A];if(0==G.length)Q.push(A);else for(var B=Od(G,M.h),w=0;w<G.length;w++)G[w]!=A&&Nd(t,G[w],B)}}for(A=0;A<Q.length;A++)t.j[Q[A]].h();0<t.u||ta(t.W);
d&&y(d)&&d({passingRules:e,resolvedTags:c.O});return 0<c.O.length};var Te={macro:function(a){if(Ce.contains(a))return Ce.get(a)}};Te.dataLayer=Wa;Te.Ba=function(){var a=H.google_tag_manager;a||(a=H.google_tag_manager={});a["GTM-LQCS"]||(a["GTM-LQCS"]=Te)};Te.Ba();
(function(){var a=J("dataLayer",[],!1),b=J("google_tag_manager",{},!1),b=b["dataLayer"]=b["dataLayer"]||{};Ea.push(function(){b.gtmDom||(b.gtmDom=!0,a.push({event:"gtm.dom"}))});Pa.push(function(){b.gtmLoad||(b.gtmLoad=!0,a.push({event:"gtm.load"}))});var d=a.push;a.push=function(){var b=[].slice.call(arguments,0);d.apply(a,b);for(vb.push.apply(vb,b);300<this.length;)this.shift();return Eb()};vb.push.apply(vb,a.slice(0));P(Eb)})();
if("interactive"==I.readyState&&!I.createEventObject||"complete"==I.readyState)Fa();else{N(I,"DOMContentLoaded",Fa);N(I,"readystatechange",Fa);if(I.createEventObject&&I.documentElement.doScroll){var Ue=!0;try{Ue=!H.frameElement}catch(Ve){}Ue&&Ha()}N(H,"load",Fa)}"complete"===I.readyState?Qa():N(H,"load",Qa);
(function(a){})("async");var _vs="res_ts:1374771773321000,srv_cl:87433443,ds:live,cv:1";
})()
