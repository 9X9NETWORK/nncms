<!DOCTYPE html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="stylesheets/style.css" />
<link rel="stylesheet" href="stylesheets/lightbox.css" />
<link rel="stylesheet" href="stylesheets/channel.css" />
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
<script src="javascripts/channel.js"></script>
<title>9x9.tv</title>
</head>
<body>

<div id="lightbox-create-channel" class="lightbox-content">
<h3><img src="images/text_collect.png" alt="" /></h3>
<p class="desc">Studio is the management center for your 9x9.tv list-form channels!</p>
<p class="create">
<a href="channel-add.html">create
<img src="images/icon_add.png" alt="" />
<span>Create a<br />new channel</span>
</a>
</p>
<p class="btns unblock"><span><a href="#">Not right now, thanks!</a></span></p>
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
<p id="process-notice">Saving...</p>
<div class="studio-nav-wrap">
<h3><a href="index.html">Studio</a></h3>
<ul>
<li class="on"><span><a href="index.html">My Channels</a></span></li>
<li><span><a href="library-first.html">My Library</a></span></li>
<li><span><a href="uploads-first.html">My Uploads</a></span></li>
</ul>
</div>
</div>

<!--============================== content-main start ========================-->
<div id="content-wrap">

<div id="content-nav">
<div id="func-nav">
<ul>
<li class="btns"><span><a href="channel-add.html">Create a new channel</a></span></li>
<!--<li class="on"><span><a href="#">Create a new channel</a></span></li>-->
</ul>
</div>
</div>

<div id="main-wrap-slider" class="slider-wrap"><div class="slider-vertical"></div></div>

<div id="content-main">
<div id="title-func" class="clearfix">
<h2>My Channels (3)</h2>
<p class="save btns"><span><a href="#">Save Order</a></span></p>
</div>

<div id="content-main-wrap">
<div class="constrain">
<ul id="channel-list">
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/05.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list-favorite.html">Snowball's Favorites</a></h3>
<p><span>1</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add disable">Add</a></li>
<li><a href="episode-list-favorite.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="#" class="setting disable">Setting</a></li>
<li><a href="#" class="del disable">Del</a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/06.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Wedding Plans</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/07.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Wedding Plans</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/08.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Wedding Plans</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/09.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Wedding Plans</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/10.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Wedding Plans</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/01.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Wedding Plans</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/02.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Wedding Plans</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/03.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Wedding Plans</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
<li class="clearfix">
<div class="photo-list">
<a href="#" target="_blank">
<img src="images/icon_playlist.png" alt="" class="watermark" />
<img src="thumbnail/04.jpg" alt="" width="152" height="86" class="img" />
<img src="thumbnail/06.jpg" alt="" width="70" height="40" class="img" />
<img src="thumbnail/07.jpg" alt="" width="70" height="40" class="img" />
</a>
</div>

<div class="info">
<h3><a href="episode-list.html">Lasttttttttttttttttttttttttttttttttt</a></h3>
<p><span>99</span>Episodes</p>
<p><span>20</span>Followers</p>
<p><span>3456</span>Views</p>
</div>

<div class="func-wrap">
<p class="time">Update：2012-05-25 12:45</p>
<div class="func-btns">
<div class="btn-wrap">
<ul>
<li><a href="#" class="add">Add<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Curate a new episode</span></span></span></span></a></li>
<li><a href="episode-list.html" class="detail">Detail<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Episode list</span></span></span></span></a></li>
<li><a href="channel-setting.html" class="setting">Setting<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Channel settings</span></span></span></span></a></li>
<li><a href="#" class="del">Del<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Delete this channel</span></span></span></span></a></li>
</ul>
</div>
</div>
<p class="drag">move</p>
</div>
</li>
</ul>
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