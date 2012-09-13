<!DOCTYPE html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="stylesheets/style.css" />
<link rel="stylesheet" href="stylesheets/lightbox.css" />
<link rel="stylesheet" href="stylesheets/library.css" />
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script>
<script src="javascripts/jquery.mousewheel.min.js"></script>
<script src="javascripts/vertical.slider.js"></script>
<script src="javascripts/jquery.ellipsis.js"></script>
<script src="javascripts/jquery.blockUI.js"></script>
<script src="javascripts/jquery.corner.js"></script>
<script src="javascripts/jquery.toggleval.min.js"></script>
<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<script src="javascripts/automeasure.js"></script>
<script src="javascripts/basic.js"></script>
<script src="javascripts/uploads.js"></script>
<title>9x9.tv</title>
</head>
<body>

<div id="lightbox-upload-video" class="lightbox-content lightbox-upload-video">
<div class="upload-audio">
<div class="upload-audio-wrap">
<a href="#" class="btn-close">Close</a>
<h3><img src="images/text_audio_file.png" alt="Upload Audio File" title="Upload Audio File" /></h3>
<p class="required"><acronym title="Required field" class="mark-required">*</acronym>Required field</p>
<form name="lightboxUploadForm" id="lightboxUploadForm" method="get" action="uploads-list.html">
<div class="fminput">
<label><acronym title="Required field" class="mark-required">*</acronym>Upload file</label>
<div class="fmfield">
<p class="btns btn-upload-file"><span><input type="button" name="fileName" value="Select file from your computer" /></span></p>
<p class="notice clear">Support mp3 file.</p>
</div>
</div>
<div class="fminput">
<label><acronym title="Required field" class="mark-required">*</acronym>File title</label>
<div class="fmfield">
<p class="text"><span><input type="text" name="title" id="title" maxlength="100" value="" class="text" /></span></p>
</div>
</div>
<div class="fminput">
<label>Playback image</label>
<div class="fmfield">
<p class="img"><img src="images/logo_2.png" alt="" width="57" height="44" /></p>
<div class="upload-func">
<p class="radio-list">
<span class="radio first on"><a href="#" class="radio-upload">Upload file</a></span>
<span class="radio"><a href="#" class="radio-url">From URL</a></span>
</p>
<p class="btns upload"><span><a href="#">Upload</a></span></p>
<p class="img-url text"><span><input type="text" name="imgUrl" id="imgUrl" maxlength="100" value="Copy and paste image URL here" class="text" /></span></p>
</div>
<span class="notice clear">Better results with 720x480 or higher resolution image.</span>
</div>
</div>
<div class="form-btn">
<div class="form-btn-wrap">
<p class="btns btn-cancel"><span><input type="reset" value="Cancel" /></span></p>
<p class="btns btn-save"><span><input type="submit" value="Save" /></span></p>
</div>
</div>
</form>
</div>
</div>
</div>

<!--============================== header start ==============================-->
<div id="header">
  <p id="logo"></p>
  <ul id="nav">
    <li id="home"><span>Home</span></li>
    <li id="guide"><span>Guide</span></li>
    <li id="browse"> <span>Browse</span>
      <ul id="browse-dropdown" class="dropdown">
        <li>All</li>
        <li>Animals & Pets</li>
        <li>Art & Design</li>
        <li>Autos & Vehicles</li>
        <li>Cartoons & Animation</li>
        <li>Comedy</li>
        <li>Fashion, Food & Living</li>
        <li>Gaming</li>
        <li>How-To</li>
        <li>Education & Lectures</li>
        <li>Music</li>
        <li>News</li>
        <li>Nonprofits & Faith</li>
        <li>People, Blogs & Shorts</li>
        <li>Science</li>
        <li>Sports & Health</li>
        <li>Tech & Apps</li>
        <li>TV & Film</li>
      </ul>
    </li>
    <li id="search">
      <p id="btn-search"></p>
      <input type="text" class="textfield" value="Search" id="search-field">
    </li>
    <li id="profile">
      <p id="btn-profile"></p>
      <p id="selected-profile">Snowball</p>
      <ul id="profile-dropdown" class="dropdown">
        <li>My page</li>
        <li>Studio</li>
        <li>Settings</li>
        <li>Log out</li>
      </ul>
    </li>
  </ul>
</div>
<!--============================== header close ==============================-->

<div id="studio-nav">
<div class="studio-nav-wrap">
<h3><a href="index.html">Studio</a></h3>
<ul>
<li><span><a href="index.html">My Channels</a></span></li>
<li><span><a href="library-first.html">My Library</a></span></li>
<li class="on"><span><a href="uploads-first.html">My Uploads</a></span></li>
</ul>
</div>
</div>

<!--============================== content-main start ========================-->
<div id="content-wrap">

<div id="content-nav">
&nbsp;
</div>

<div id="main-wrap-slider" class="slider-wrap"><div class="slider-vertical"></div></div>

<div id="content-main">
<div id="title-func" class="clearfix">
<h2>My Uploads</h2>
</div>

<div id="content-main-wrap">
<div class="constrain">
<div id="uploads-video-list" class="video-list">
<p class="no-video"><img src="images/text_noupload.png" alt="You have no videos in your library." title="You have no videos in your library." /></p>
<p class="btn-upload-audio btns"><span><a href="#">Upload audio file</a></span></p>
</div>
</div>
</div>
</div>

</div>
<!--============================== content-main start ========================-->

<!--============================== footer start ==============================-->
<!-- Footer Begin -->
<p id="footer-control"></p>
<div id="footer">
  <ul id="footer-list">
    <li id="siteinfo">
      <p id="btn-siteinfo"></p>
      <p id="selected-siteinfo">Company</p>
      <ul id="siteinfo-dropdown" class="dropdown">
        <li class="on">Company</li>
        <li>Blog</li>
        <li>Forum</li>
      </ul>
    </li>
    <li id="sitelang">
      <p id="btn-sitelang"></p>
      <p id="selected-sitelang">English Site</p>
      <ul id="sitelang-dropdown" class="dropdown">
        <li class="on">English Site</li>
        <li>中文網站</li>
      </ul>
    </li>
  </ul>
  <p id="copyright"><span>&copy; 2012 9x9.tv.  All right reserved</span></p>
</div>
<!--============================== footer close ==============================-->

</body>
</html>