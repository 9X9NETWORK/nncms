<!DOCTYPE html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="stylesheets/style.css" />
<link rel="stylesheet" href="stylesheets/lightbox.css" />
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
<div id="content-wrap" class="epcurate-shopping">
<form name="epcurateForm" id="epcurateForm" method="get" action="">

<div id="content-nav">
<div id="func-nav">
<ul>
<li><a href="epcurate-publish.html" class="publish">Publish settings</a></li>
<li class="active"><a href="epcurate-shopping.html" class="shopping">Shopping information</a></li>
</ul>
</div>
</div>

<div id="main-wrap-slider" class="slider-wrap"><div class="slider-vertical"></div></div>

<div id="content-main">
<div id="title-func">
<p class="required"><acronym title="Required field" class="mark-required">*</acronym>Required field</p>
</div>

<div id="content-main-wrap">
<div class="constrain">
<div id="epcurate-info">
<div class="fminput">
<label>Shopping information<a href="#"><img src="images/icon_question.png" alt="" /><img src="images/graphic_shopping_info.png" alt="" class="notice"/></a></label>
<div class="fmfield">
<a href="#" class="switch-off">OFF</a>
<a href="#" class="switch-on">ON</a>
</div>
</div>
<div class="fminput disable">
<label for="title"><acronym title="Required field" class="mark-required">*</acronym>Call to action message</label>
<div class="fmfield">
<p class="text"><span><input type="text" name="actionMsg" id="actionMsg" maxlength="100" value="Input message (maximum 32 characters)" class="text" /></span></p>
<span class="character">32</span>
<p class="notice">This field is required.</p>
</div>
</div>
<div class="fminput disable">
<label for="title"><acronym title="Required field" class="mark-required">*</acronym>URL</label>
<div class="fmfield">
<p class="text"><span><input type="text" name="url" id="url" maxlength="100" value="Paste an URL" class="text" /></span></p>
<p class="notice">This field is required.</p>
</div>
</div>
<div class="fminput disable">
<label>Email</label>
<div class="fmfield">
<p class="textarea"><span><textarea name="description" id="description" cols="80" class="textarea">Input promotion email body</textarea></span></p>
</div>
</div>
<div class="fminput disable">
<label>Display time</label>
<div class="fmfield">
<ul class="radio">
<li><a href="#" class="radio-customized">Customized</a></li>
<li><a href="#" class="radio-first">First 15 seconds</a></li>
<li><a href="#" class="radio-last">Last 15 seconds</a></li>
<li class="on"><a href="#" class="radio-whole">From start to end</a></li>
</ul>
</div>
</div>
</div>
</div>
</div>
</div>

<div class="form-btn">
<div class="wrap">
<p class="back"><a href="#">&lt; Back to Curation</a></p>
<p class="btns btn-leave"><span><input type="button" value="Leave" /></span></p>
<p class="btns btn-save"><span><input type="submit" value="Save" /></span></p>
</div>
<div class="publish-btn">
<p class="btns btn-vert"><span><input type="button" value="Revert to draft" /></span></p>
<p class="btns glow btn-rerun"><span><input type="button" value="Rerun as the latest" /></span></p>
</div>
</div>

</form>
</div>
<!--============================== content-main start ========================-->

</body>
</html>