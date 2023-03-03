---
layout: page
title: Bookmarklet
---
<div class="container" markdown="1">

Instructions
---
To use this bookmarklet, drag the icon into your browser's bookmarks toolbar. Then, when you are on the page with the form, click the bookmark to have it fill out the form for you.

<div class="row">
<h2>Brockport &amp; UB Library Search</h2>
<p class="text-center"><a href='javascript:!function(){
var x = window.location.href;
var p = window.location.hostname;
if (p == "search.lib.buffalo.edu") {
  var r1 = p;
  var r2 = "suny-bro.primo.exlibrisgroup.com";
  var r3 = "01SUNY_BUF:everything";
  var r4 = "01SUNY_BRO:01SUNY_BRO";
  }
if (p == "suny-bro.primo.exlibrisgroup.com") {
  var r1 = p;
  var r2 = "search.lib.buffalo.edu";
  var r3 = "01SUNY_BRO:01SUNY_BRO";
  var r4 = "01SUNY_BUF:everything";
}
var y = x.replace(r1,r2);
var z = y.replace(r3,r4);
window.location.href = z
}();
'><i class="fa fa-search-plus fa-6x" aria-hidden="true"></i><span style="display:none;">BPT <--> UB</span></a></p>
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
  }
if (p == "suny-bro.primo.exlibrisgroup.com") {
  var r1 = p;
  var r2 = "search.lib.buffalo.edu";
  var r3 = "01SUNY_BRO:01SUNY_BRO";
  var r4 = "01SUNY_BUF:everything";
}
var y = x.replace(r1,r2);
var z = y.replace(r3,r4);
window.location.href = z
}();
</textarea>
</div>
