<?php
// index.php -- HotCRP home page
// Copyright (c) 2006-2017 Eddie Kohler; see LICENSE.

require_once("lib/navigation.php");

if (Navigation::page() !== "index") {
    $page = Navigation::page();
    if (is_readable("$page.php")
        /* The following is paranoia (currently can't happen): */
        && strpos($page, "/") === false) {
        include("$page.php");
        exit;
    } else if ($page == "images" || $page == "scripts" || $page == "stylesheets") {
        $_GET["file"] = $page . Navigation::path();
        include("cacheable.php");
        exit;
    } else {
        require_once("lib/ht.php");
        Navigation::redirect_site("index");
    }
}

require_once("pages/home.php");
