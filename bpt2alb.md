---
layout: page
title: Brockport &amp; UAlbany Library Search Bookmarklet
---
<div class="container" markdown="1">

Instructions
---
This bookmarklet will allow you to swap between Brockport and Albany's library discovery layers.
 1. Drag this icon into your bookmarks bar.
 2. Accept the addition of the bookmark.
 3. Search in either discovery layer.
 4. Click the bookmarklet to go to the other institution.

<div class="row">
<h2></h2>
<p class="text-center"><a href='javascript:!function(){
var x = window.location.href;
var p = window.location.hostname;
if (p == "search.library.albany.edu") {
  var r1 = p;
  var r2 = "suny-bro.primo.exlibrisgroup.com";
  var r3 = "01SUNY_ALB:01SUNY_ALB";
  var r4 = "01SUNY_BRO:01SUNY_BRO";
	var r5 = "suny-alb";
	var r6 = "01SUNY_BRO";
  }
else if (p == "suny-bro.primo.exlibrisgroup.com") {
  var r1 = p;
  var r2 = "search.library.albany.edu";
  var r3 = "01SUNY_BRO:01SUNY_BRO";
  var r4 = "01SUNY_ALB:01SUNY_ALB";
	var r5 = "01SUNY_BRO";
	var r6 = "suny-alb";
}
else {
	alert ("This bookmarklet will not work on this page.");
}
var y = x.replace(r1,r2);
var z = y.replace(r3,r4);
var a = z.replace(r5,r6);
window.location.href = a
}();
'><i class="fa fa-search-plus fa-6x" aria-hidden="true"></i><span style="display:none;">BPT <--> ALB</span></a></p>
</div>

</div>

Code
----
<p>This is the direct code for the bookmarklet if you wish to copy and paste:</p>
<textarea disabled="disabled" cols="100" rows="5">
javascript:!function(){
var x = window.location.href;
var p = window.location.hostname;
if (p == "search.lib.buffalo.edu") {
  var r1 = p;
  var r2 = "suny-bro.primo.exlibrisgroup.com";
  var r3 = "01SUNY_BUF:everything";
  var r4 = "01SUNY_BRO:01SUNY_BRO";
	var r5 = "01SUNY_BUF";
	var r6 = "01SUNY_BRO";
  }
else if (p == "suny-bro.primo.exlibrisgroup.com") {
  var r1 = p;
  var r2 = "search.lib.buffalo.edu";
  var r3 = "01SUNY_BRO:01SUNY_BRO";
  var r4 = "01SUNY_BUF:everything";
	var r5 = "01SUNY_BRO";
	var r6 = "01SUNY_BUF";
}
else {
	alert ("This bookmarklet only works for Brockport and UB's library pages.")
}
var y = x.replace(r1,r2);
var z = y.replace(r3,r4);
var a = z.replace(r5,r6);
window.location.href = a
}();
</textarea>
