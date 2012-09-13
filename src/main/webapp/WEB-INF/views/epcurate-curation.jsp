<!DOCTYPE html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="stylesheets/style.css" />
<link rel="stylesheet" href="stylesheets/lightbox.css" />
<link rel="stylesheet" href="stylesheets/epcurate.css" />
<link rel="stylesheet" href="stylesheets/ep-curation.css" />
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script>
<script src="javascripts/jquery.mousewheel.min.js"></script>
<script src="javascripts/horizontal-slider.js"></script>
<script src="javascripts/jquery.ellipsis.js"></script>
<script src="javascripts/jquery.blockUI.js"></script>
<script src="javascripts/jquery.corner.js"></script>
<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<script src="javascripts/automeasure.js"></script>
<!--<script src="javascripts/basic.js"></script>-->
<script src="javascripts/curation.js"></script>
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
<div id="header" class="hide">
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

<div id="epcurate-nav">
<div class="epcurate-nav-wrap">
<h3><a href="#">Episode Curation</a></h3>
<ul>
<li>Information</li>
<li class="on">Curation</li>
<li>Publish</li>
</ul>
</div>
</div>

<!--============================== content-main start ========================-->
<div id="content-wrap" class="epcurate-curation">
<form name="epcurateForm" id="epcurateForm" method="get" action="" class="clearfix">

<div id="main-wrap-slider" class="slider-wrap"><div class="slider-vertical"></div></div>

<div id="content-main">
<div id="content-main-wrap">
<div class="constrain">
<div id="epcurate-curation" class="clearfix">
<div id="video-player">
<div class="video"></div>
<div id="video-control">
<p id="play-dragger"></p>
<div id="progress-bar">
<p id="loaded"></p>
<p id="played"></p>
</div>
<ul>
<li id="btn-prev"></li>
<li id="btn-pause"></li>
<li id="btn-next"></li>
<li id="volume-control">
<p id="btn-volume" class="loud"></p>
<p id="volume-bar"></p>
<p id="volume-dragger"></p>
</li>
<li id="play-time">
<span id="played-length">0:14</span><span class="divider">/</span><span id="total-length">3:25</span>
</li>
<li id="btn-expand"></li>
</ul>
</div>
</div>

<ul class="tabs">
<li class="first on"><span><a href="#cur-youtube" class="cur-youtube">My YouTube</a></span></li>
<li><span><a href="#cur-library" class="cur-library">My Library</a></span></li>
<li><span><a href="#cur-uploads" class="cur-uploads">My Uploads</a></span></li>
<li class="last"><span><a href="#cur-add" class="cur-add">Add Video</a></span></li>
<li class="last on hide"><span><a href="#cur-edit" class="cur-edit">Edit</a></span></li>
</ul>

<div id="cur-youtube" class="tab-content">
<ul class="yt-category">
<li class="on"><a href="#yt-history">Watch history</a></li>
<li><a href="#yt-uploads">Uploads</a></li>
<li class="playlist"><a href="#yt-playlists">Playlists</a></li>
<li class="last">
<div class="select disable">
<p class="select-btn"></p>
<p class="select-txt"><a href="#"></a></p>
</div>
</li>
</ul>

<div id="yt-history" class="result-list">
<div class="yt-connect">
<a href="#"><img src="images/icon_youtube_lg.png" alt="YouTube" title="YouTube" class="youtube" /></a>
<p class="btns"><span><a href="#">Connect to YouTube</a></span></p>
</div>
</div>

<div id="yt-uploads" class="result-list hide">
<a href="#" class="video-prev">Prev</a>
<a href="#" class="video-next">Next</a>
<ul class="clearfix">
<li>
<img src="images/icon_red_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="play-no">Not playable outside Youtube</p>
</div>
</div>
</div>
</li>
<li>
<img src="images/icon_yellow_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
</ul>
</div>

<div id="yt-playlists" class="result-list hide">
<a href="#" class="video-prev">Prev</a>
<a href="#" class="video-next">Next</a>
<ul class="clearfix">
<li>
<img src="images/icon_red_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="play-no">Not playable outside Youtube</p>
</div>
</div>
</div>
</li>
<li>
<img src="images/icon_yellow_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
</ul>
</div>
</div>

<div id="cur-library" class="tab-content hide">
<div class="no-video">
<img src="images/text_novideo.png" alt="" />
<p class="btns btn-add"><span><a href="#">Add some videos</a></span></p>
</div>
<div class="result-list clearfix hide">
<a href="#" class="video-prev">Prev</a>
<a href="#" class="video-next">Next</a>
<ul class="clearfix">
<li>
<img src="images/icon_red_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="play-no">Not playable outside Youtube</p>
</div>
</div>
</div>
</li>
</ul>
</div>
</div>

<div id="cur-uploads" class="tab-content hide">
<div class="no-video">
<img src="images/text_noupload.png" alt="" />
<p class="btns btn-upload"><span><a href="#">Upload audio file</a></span></p>
</div>
<div class="result-list clearfix hide">
<p class="btns btn-upload"><span><a href="#">Upload audio file</a></span></p>
<a href="#" class="video-prev">Prev</a>
<a href="#" class="video-next">Next</a>
<ul class="clearfix">
<li>
<img src="images/icon_red_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="play-no">Not playable outside Youtube</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<img src="images/icon_yellow_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-play">Video Play</a>
</p>
<p class="tip-arrow"><img src="images/bubble_arrow_up.png" alt="" /></p>
<div class="video-tip">
<div class="video-bubble">
<div class="video-bubble-wrap">
<p>Kate Nash Song - Live in Paradiso</p>
<p>From <a href="#">Youtube.com</a><br />By <a href="#">John</a><br/>on 2012-12-08</p>
<p>kara Guardi & Jason Reeves singing "terrified" no copyright infringements ...</p>
<p class="region-no">Not playable in some regions</p>
<p class="mobile-no">Not playable on mobile device</p>
</div>
</div>
</div>
</li>
</ul>
</div>
</div>

<div id="cur-add" class="tab-content hide">
<p>Add video by URL</p>
<textarea name="description" id="description" cols="80" class="textarea">Paste YouTube video URLs to add (separate with different lines)</textarea>
<p class="notice">You have reached the maximum amount 0f 50 videos.</p>
<div class="func">
<p class="checkbox"><a href="#">Also add to My Library</a></p>
<p class="btns btn-add"><span><a href="#">Add</a></span></p>
</div>
</div>

<div id="cur-edit" class="tab-content hide">
<div class="edit-title disable">
<div class="wrap">
<div class="text-container clearfix">
<h5>Text</h5>
<div class="text-func clearfix">
<div class="func-wrap clearfix">
<ul>
<li><a href="#" class="font-bold">粗體</a></li>
<li><a href="#" class="font-italic">斜體</a></li>
<li><a href="#" class="font-color">字體顏色
<ul class="color-list">
<li class="c-fff">#ffffff</li>
<li class="c-eee">#eeeeee</li>
<li class="c-bbb">#bbbbbb</li>
<li class="c-777">#777777</li>
<li class="c-333">#333333</li>
<li class="c-000">#000000</li>
<li class="c-f00">#ff0000</li>
<li class="c-f60">#ff6600</li>
<li class="c-ff0">#ffff00</li>
<li class="c-090">#009900</li>
<li class="c-03f">#0033ff</li>
<li class="c-60f">#6600ff</li>
</ul>
</a>
</li>
<li><a href="#" class="font-l">字體放大</a></li>
<li><a href="#" class="font-s">字體縮小</a></li>
<li><a href="#" class="font-left">文字置左</a></li>
<li><a href="#" class="font-center">文字置中</a></li>
<li><a href="#" class="font-right">文字置右</a></li>
</ul>
</div>
</div>
</div>

<div class="effect-container clearfix">
<h5>Change Effect</h5>
<p class="effect-demo"><span>9x9.tv</span></p>
<div class="select">
<p class="select-btn"></p>
<div class="select-txt"><a href="#">none
<ul class="select-list">
<li>Blind</li>
<li>Clip</li>
<li>Fade</li>
</ul>
</a></div>
</div>
</div>

<div class="duration-container clearfix">
<h5>Duration</h5>
<div class="select">
<p class="select-btn"></p>
<div class="select-txt"><a href="#">0
<ul class="dropdown">
<li>1.0</li>
<li>1.5</li>
<li>2.0</li>
</ul>
</a>
</div>
</div>
<p class="notice hide">Invalid duration, please try again.</p>
</div>
</div>

<div class="background-container">
<h5>Background</h5>
<p class="radio-list">
<span class="radio first on"><a href="#" class="radio-bgcolor">Color</a></span>
<span class="radio"><a href="#" class="radio-bgimg">Image</a></span>
</p>
<div class="bg-color">
<a href="#">背景顏色
<ul class="color-list">
<li class="c-fff">#ffffff</li>
<li class="c-eee">#eeeeee</li>
<li class="c-bbb">#bbbbbb</li>
<li class="c-777">#777777</li>
<li class="c-333">#333333</li>
<li class="c-000">#000000</li>
<li class="c-f00">#ff0000</li>
<li class="c-f60">#ff6600</li>
<li class="c-ff0">#ffff00</li>
<li class="c-090">#009900</li>
<li class="c-03f">#0033ff</li>
<li class="c-60f">#6600ff</li>
</ul>
</a>
</div>
<div class="bg-img hide">
<p class="img"><img src="images/logo_2.png" alt="" width="57" height="44" /></p>
<p class="btns upload"><span><a href="#">Upload</a></span></p>
<p class="notice">Better results with 720x480 or higher resolution image.<span class="hide">Please upload jpeg, png, or gif file.</span></p>
</div>
</div>

<div class="btn-container">
<p class="btn-del"><a href="#">Del</a></p>
<p class="btns btn-cancel"><span><a href="#">Cancel</a></span></p>
<p class="btns btn-done"><span><a href="#">Done</a></span></p>
<p class="btns btn-edit"><span><a href="#">Edit file</a></span></p>
</div>
</div>

<div class="edit-time hide">
<h3>Bruno Mars - "The Lazy Song" MV</h3>
<p>02:35 (original 03:25) | From <a href="#">YouTube.com</a> | By <a href="#">BrunoMars</a> on 2007-06-11</p>
<p class="desc">
Kate Nash singing Skeleton Song - Live in Paradiso - Amsterdam 04/02/2008<br />
Kate Nash singing Skeleton Song - Live in Paradiso - Amsterdam 04/02/2008<br />
Kate Nash singing Skeleton Song - Live in Paradiso - Amsterdam 04/02/2008
</p>
<div class="set-time">
<div class="time-wrap">
<div class="start-time">
<span>Start from</span>
<p class="time disable"><input type="text" name="startH" id="startH" maxlength="2" value="00" class="time" disabled="disabled" /> :</p>
<p class="time disable"><input type="text" name="startM" id="startM" maxlength="2" value="00" class="time" disabled="disabled" /> :</p>
<p class="time disable"><input type="text" name="startS" id="startS" maxlength="2" value="00" class="time" disabled="disabled" /></p>
</div>
<div class="end-time">
<span>To</span>
<p class="time disable"><input type="text" name="startH" id="startH" maxlength="2" value="00" class="time" disabled="disabled" /> :</p>
<p class="time disable"><input type="text" name="startM" id="startM" maxlength="2" value="00" class="time" disabled="disabled" /> :</p>
<p class="time disable"><input type="text" name="startS" id="startS" maxlength="2" value="00" class="time" disabled="disabled" /></p>
</div>
</div>
<div class="btn-wrap">
<p class="notice">Invalid time, please try again.</p>
<p class="btns btn-edit"><span><a href="#">Edit</a></span></p>
<p class="btns btn-cancel hide"><span><a href="#">Cancel</a></span></p>
<p class="btns btn-done hide"><span><a href="#">Done</a></span></p>
</div>
</div>
<ul>
<li class="region">Not playable in some regions</li>
<li class="device">Not playable on mobile device</li>
</ul>
</div>
</div>
</div>

<div id="storyboard">
<p>Episode storyboard (50 videos left)<span>Duration 00:17:32</span></p>
<div class="storyboard-list">
<p class="notice">+Drag & drop videos here</p>
<ul>
<li>
<img src="images/icon_yellow_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="title">
<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Preview Title</span></span></span></span></a>
<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Preview Title</span></span></span></span></a>
</p>
<p class="hover-func">
<a href="#" class="video-del">Video Del</a>
<a href="#" class="video-play">Video Play</a>
</p>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-del">Video Del</a>
<a href="#" class="video-play">Video Play</a>
<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>
<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>
</p>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="title">
<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Preview Title</span></span></span></span></a>
<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Preview Title</span></span></span></span></a>
</p>
<p class="hover-func">
<a href="#" class="video-del">Video Del</a>
<a href="#" class="video-play">Video Play</a>
</p>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-del">Video Del</a>
<a href="#" class="video-play">Video Play</a>
<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>
<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>
</p>
</li>
<li>
<img src="images/icon_red_warning.png" alt="Warning" class="warning" />
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="title">
<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Preview Title</span></span></span></span></a>
<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Preview Title</span></span></span></span></a>
</p>
<p class="hover-func">
<a href="#" class="video-del">Video Del</a>
<a href="#" class="video-play">Video Play</a>
</p>
</li>
<li>
<p class="img">
<img src="thumbnail/04.jpg" alt="" width="80" height="45" />
<span class="time">13:43</span>
</p>
<h4 class="ellipsis multiline">kara DioGuardi singing terrified</h4>
<p class="hover-func">
<a href="#" class="video-del">Video Del</a>
<a href="#" class="video-play">Video Play</a>
<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>
<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>
</p>
</li>
</ul>
</div>
</div>

<div class="form-btn">
<div class="wrap">
<p class="back info"><a href="epcurate-info.html">&lt; Back to Information</a></p>
<p class="btns btn-leave"><span><input type="button" value="Leave" /></span></p>
<p class="btns btn-save"><span><input type="submit" value="Save" /></span></p>
<p class="next"><a href="epcurate-publish.html">Next to Publish &gt;</a></p>
</div>
</div>
</div>
</div>
</div>

</form>
</div>
<!--============================== content-main start ========================-->

<!--============================== footer start ==============================-->
<!-- Footer Begin -->
<p id="footer-control" class="hide"></p>
<div id="footer" class="hide">
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