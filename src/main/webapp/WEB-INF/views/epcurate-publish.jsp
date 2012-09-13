<!DOCTYPE html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="stylesheets/style.css" />
<link rel="stylesheet" href="stylesheets/lightbox.css" />

<link rel="stylesheet" href="stylesheets/jquery.datepick.css" />
<link rel="stylesheet" href="stylesheets/epcurate.css" />
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script>
<script src="javascripts/jquery.mousewheel.min.js"></script>
<script src="javascripts/vertical.slider.js"></script>
<script src="javascripts/jquery.ellipsis.js"></script>
<script src="javascripts/jquery.blockUI.js"></script>
<script src="javascripts/jquery.corner.js"></script>
<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<script src="javascripts/automeasure.js"></script>
<script src="javascripts/basic.js"></script>
<script src="javascripts/epcurate.js"></script>
<title>9x9.tv</title>
</head>
<body>

<div id="epcurate-nav">
<div class="epcurate-nav-wrap">
<h3><a href="#">Episode Curation</a></h3>
<ul>
<li>Information</li>
<li>Curation</li>
<li class="on">Publish</li>
</ul>
</div>
</div>

<!--============================== content-main start ========================-->
<div id="content-wrap" class="epcurate-publish">
<form name="epcurateForm" id="epcurateForm" method="get" action="">

<div id="content-nav">
<div id="func-nav">
<ul>
<li class="active"><a href="epcurate-publish.html" class="publish">Publish settings</a></li>
<li><a href="epcurate-shopping.html" class="shopping">Shopping information</a></li>
</ul>
</div>
</div>

<div id="main-wrap-slider" class="slider-wrap"><div class="slider-vertical"></div></div>

<div id="content-main">
<div id="content-main-wrap">
<div class="constrain">
<div id="epcurate-info">
<div class="fminput">
<label>Episode thumbnail</label>
<div class="fmfield">
<div class="img-list">
<a href="#" class="img-prev">Prev</a>
<a href="#" class="img-next">Next</a>
<ul>
<li><a href="#"><img src="thumbnail/04.jpg" alt="" width="110" height="62" /></a></li>
</ul>
</div>
<div class="img-upload-func">
<p class="btns"><span><a href="#">Upload</a></span></p>
<p class="upload-notice">Better results with 720x480 or higher resolution image</p>
</div>
</div>
</div>
<div class="fminput">
<label>Return schedule</label>
<div class="fmfield">
<p class="checkbox"><a href="#">Set rerun schedule</a></p>
<div id="date-time">
<div class="datepicker"></div>
<div class="select">
<p class="select-btn"></p>
<p class="select-txt"><a href="#">Select a time</a></p>
<ul  class="dropdown">
<li>08:00 PM</li>
<li>09:00 PM</li>
<li>10:00 PM</li>
<li>11:00 PM</li>
</ul>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>

<div class="form-btn">
<div class="wrap">
<p class="back"><a href="epcurate-curation.html">&lt; Back to Curation</a></p>
<p class="btns btn-leave"><span><input type="button" value="Leave" /></span></p>
<p class="btns btn-save"><span><input type="submit" value="Save" /></span></p>
</div>
<div class="publish-btn">
<p class="btns btn-revert"><span><input type="button" value="Revert to draft" /></span></p>
<p class="btns glow btn-publish"><span><input type="button" value="Publish" /></span></p>
</div>
</div>

</form>
</div>
<!--============================== content-main start ========================-->

</body>
</html>