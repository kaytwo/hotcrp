// settings.js -- HotCRP JavaScript library for settings
// Copyright (c) 2006-2017 Eddie Kohler; see LICENSE.

function next_lexicographic_permutation(i, size) {
    var y = (i & -i) || 1, c = i + y, highbit = 1 << size;
    i = (((i ^ c) >> 2) / y) | c;
    if (i >= highbit) {
        i = ((i & (highbit - 1)) << 2) | 3;
        if (i >= highbit)
            i = false;
    }
    return i;
}


function settings_option_type() {
    var v = this.value;
    foldup.call(this, null, {n: 2, f: !/:final/.test(v)});
    foldup.call(this, null, {n: 3, f: v != "pdf:final"});
    foldup.call(this, null, {n: 4, f: v != "selector" && v != "radio"});
    return true;
}

function settings_option_move() {
    var odiv = $(this).closest(".settings-opt")[0];
    if ($(this).hasClass("settings-opt-moveup") && odiv.previousSibling)
        odiv.parentNode.insertBefore(odiv, odiv.previousSibling);
    else if ($(this).hasClass("settings-opt-movedown") && odiv.nextSibling)
        odiv.parentNode.insertBefore(odiv, odiv.nextSibling.nextSibling);
    else if ($(this).hasClass("settings-opt-delete")) {
        if ($(odiv).find(".settings-opt-id").val() === "new")
            $(odiv).remove();
        else {
            $(odiv).find(".settings-opt-fp").val("deleted").change();
            $(odiv).find(".f-i, .f-ix").each(function () {
                if (!$(this).find(".settings-opt-fp").length)
                    $(this).remove();
            });
            $(odiv).find("input[type=text]").prop("disabled", true).css("text-decoration", "line-through");
            $(odiv).append('<div class="f-i"><em>(Option deleted)</em></div></div>');
        }
    } else if ($(this).hasClass("settings-opt-new")) {
        var h = $("#settings_newopt").html();
        var next = 1;
        while ($("#optn_" + next).length)
            ++next;
        h = h.replace(/_0/g, "_" + next);
        odiv = $(h).appendTo("#settings_opts");
        mktemptext(odiv);
        odiv.find("textarea").autogrow();
        $("#optn_" + next)[0].focus();
    }
    settings_option_move_enable();
    return false;
}

function settings_option_move_enable() {
    $(".settings-opt-moveup, .settings-opt-movedown").prop("disabled", false);
    $(".settings-opt:first-child .settings-opt-moveup").prop("disabled", true);
    $(".settings-opt:last-child .settings-opt-movedown").prop("disabled", true);
    var index = 0;
    $(".settings-opt-fp").each(function () {
        if (this.value !== "deleted" && this.name !== "optfp_0") {
            ++index;
            if (this.value != index)
                $(this).val(index).change();
        }
    });
}


function settings_tag_autosearch() {
    var odiv = $(this).closest(".settings_tag_autosearch")[0];
    if ($(this).hasClass("settings_tag_autosearch_delete")) {
        $(odiv).find("input[name^=tag_autosearch_q_]").val("");
        $(odiv).find("input[type=text]").prop("disabled", true).css("text-decoration", "line-through");
    } else if ($(this).hasClass("settings_tag_autosearch_new")) {
        var h = $("#settings_newtag_autosearch").html();
        var next = 1;
        while ($("#tag_autosearch_t_" + next).length)
            ++next;
        h = h.replace(/_0/g, "_" + next);
        odiv = $(h).appendTo("#settings_tag_autosearch");
        mktemptext(odiv);
        odiv.find("input[type=text]").autogrow();
        $("#tag_autosearch_t_" + next)[0].focus();
    }
    return false;
}


function settings_add_track() {
    for (var i = 1; jQuery("#trackgroup" + i).length; ++i)
        /* do nothing */;
    $("#trackgroup" + (i - 1)).after("<div id=\"trackgroup" + i + "\" class=\"mg\"></div>");
    var $j = jQuery("#trackgroup" + i);
    $j.html(jQuery("#trackgroup0").html().replace(/_track0/g, "_track" + i));
    mktemptext($j);
    $j.find("input[name^=name]").focus();
}


window.review_round_settings = (function ($) {
var added = 0;

function namechange() {
    var roundnum = this.id.substr(10), name = $.trim($(this).val());
    $("#rev_roundtag_" + roundnum + ", #extrev_roundtag_" + roundnum)
        .text(name === "" ? "(no name)" : name);
}

function add() {
    var i, h, j;
    for (i = 1; $("#roundname_" + i).length; ++i)
        /* do nothing */;
    $("#round_container").show();
    $("#roundtable").append($("#newround").html().replace(/\$/g, i));
    var $mydiv = $("#roundname_" + i).closest(".js-settings-review-round");
    if (++added == 1 && i == 1)
        $mydiv.children().first().append('<div class="hint">Example name: “R1”</div>');
    $("#rev_roundtag").append('<option value="#' + i + '" id="rev_roundtag_' + i + '">(new round)</option>');
    $("#extrev_roundtag").append('<option value="#' + i + '" id="extrev_roundtag_' + i + '">(new round)</option>');
    mktemptext($mydiv);
    $("#roundname_" + i).focus().on("input change", namechange);
}

function kill() {
    var divj = $(this).closest(".js-settings-review-round"),
        roundnum = divj.data("reviewRoundNumber"),
        vj = divj.find("input[name=deleteround_" + roundnum + "]"),
        ej = divj.find("input[name=roundname_" + roundnum + "]");
    if (vj.val()) {
        vj.val("");
        divj.find(".js-settings-review-round-deleted").remove();
        ej.prop("disabled", false);
        $(this).html("Delete round");
    } else {
        vj.val(1);
        ej.prop("disabled", true);
        $(this).html("Restore round").after('<strong class="js-settings-review-round-deleted" style="padding-left:1.5em;font-style:italic;color:red">&nbsp; Review round deleted</strong>');
    }
    divj.find("table").toggle(!vj.val());
    form_highlight("#settingsform");
}

return function () {
    $("#roundtable input[type=text]").on("input change", namechange);
    $("#settings_review_round_add").on("click", add);
    $("#roundtable").on("click", ".js-settings-review-round-delete", kill);
};
})($);


window.review_form_settings = (function () {
var fieldorder, original, samples, stemplate, ttemplate,
    colors = ["sv", "Red to green", "svr", "Green to red",
              "sv-blpu", "Blue to purple", "sv-publ", "Purple to blue",
              "sv-viridis", "Purple to yellow", "sv-viridisr", "Yellow to purple"];

function get_fid(elt) {
    return elt.id.replace(/^.*_/, "");
}

function options_to_text(fieldj) {
    var cc = 49, ccdelta = 1, i, t = [];
    if (!fieldj.options)
        return "";
    if (fieldj.option_letter) {
        cc = fieldj.option_letter.charCodeAt(0) + fieldj.options.length - 1;
        ccdelta = -1;
    }
    for (i = 0; i != fieldj.options.length; ++i, cc += ccdelta)
        t.push(String.fromCharCode(cc) + ". " + fieldj.options[i]);
    fieldj.option_letter && t.reverse();
    fieldj.allow_empty && t.push("No entry");
    t.length && t.push(""); // get a trailing newline
    return t.join("\n");
}

/* parse HTML form into JSON review form description -- currently unused
function parse_field(fid) {
    var fieldj = {name: $("#shortName_" + fid).val()}, x;
    if ((x = $("#order_" + fid).val()))
        fieldj.position = x|0;
    if ((x = $.trim($("#description_" + fid).val())) !== "")
        fieldj.description = x;
    if ((x = $("#options_" + fid).val()) != "pc")
        fieldj.visibility = x;
    if (original[fid].options) {
        if (!text_to_options(fieldj, $("#options_" + fid).val()))
            return false;
        x = $("#option_class_prefix_" + fid).val() || "sv";
        if ($("#option_class_prefix_flipped_" + fid).val())
            x = colors[(colors.indexOf(x) || 0) ^ 2];
        if (x != "sv")
            fieldj.option_class_prefix = x;
    }
    return fieldj;
}

function text_to_options(fieldj, text) {
    var lines = $.split(/[\r\n\v]+/), i, s, cc, xlines = [], m;
    for (i in lines)
        if ((s = $.trim(lines[i])) !== "")
            xlines.push(s);
    xlines.sort();
    if (xlines.length >= 1 && xlines.length <= 9
        && /^[1A-Z](?:[.]|\s)\s*\S/.test(xlines[0]))
        cc = xlines[0].charCodeAt(0);
    else
        return false;
    lines = [];
    for (i = 0; i < xlines.length; ++i)
        if ((m = /^[1-9A-Z](?:[.]|\s)\s*(\S.*)\z/.exec(xlines[i]))
            && xlines[i].charCodeAt(0) == cc + i)
            lines.push(m[1]);
        else
            return false;
    if (cc != 49) {
        lines.reverse();
        fieldj.option_letter = String.fromCharCode(cc + lines.length - 1);
    }
    fieldj.options = lines;
    return true;
} */

function option_class_prefix(fieldj) {
    var sv = fieldj.option_class_prefix || "sv";
    if (fieldj.option_letter)
        sv = colors[(colors.indexOf(sv) || 0) ^ 2];
    return sv;
}

function check_change(fid) {
    var fieldj = original[fid] || {}, j, sv;
    function ch(why) {
        hiliter("reviewform_container");
        return true;
    }
    if ($.trim($("#shortName_" + fid).val()) != fieldj.name)
        return ch("shortName");
    if ($("#order_" + fid).val() != (fieldj.position || 0))
        return ch("order");
    if (!text_eq($("#description_" + fid).val(), fieldj.description))
        return ch("description");
    if ($("#authorView_" + fid).val() != (fieldj.visibility || "pc"))
        return ch("authorView");
    if (!text_eq($.trim($("#options_" + fid).val()), $.trim(options_to_text(fieldj))))
        return ch("options");
    if ((j = $("#option_class_prefix_" + fid)) && j.length
        && j.val() != option_class_prefix(fieldj))
        return ch("option_class_prefix");
    if (($("#round_list_" + fid).val() || "") != (fieldj.round_list || []).join(" "))
        return ch("round_list");
    return false;
}

function check_this_change() {
    check_change(get_fid(this));
}

function fill_order() {
    var i, c = $("#reviewform_container")[0], n;
    for (i = 1, n = c.firstChild; n; ++i, n = n.nextSibling)
        $(n).find(".revfield_order").val(i);
    c = $("#reviewform_removedcontainer")[0];
    for (n = c.firstChild; n; n = n.nextSibling)
        $(n).find(".revfield_order").val(0);
}

function fill_field1(sel, value, order) {
    var $j = $(sel).val(value);
    order && $j.attr("data-default-value", value);
}

function fill_field(fid, fieldj, order) {
    fieldj = fieldj || original[fid] || {};
    fill_field1("#shortName_" + fid, fieldj.name || "", order);
    order && fill_field1("#order_" + fid, fieldj.position || 0, order);
    fill_field1("#description_" + fid, fieldj.description || "", order);
    fill_field1("#authorView_" + fid, fieldj.visibility || "pc", order);
    fill_field1("#options_" + fid, options_to_text(fieldj), order);
    fill_field1("#option_class_prefix_flipped_" + fid, fieldj.option_letter ? "1" : "", order);
    fill_field1("#option_class_prefix_" + fid, option_class_prefix(fieldj), order);
    fill_field1("#round_list_" + fid, (fieldj.round_list || []).join(" "), order);
    $("#revfield_" + fid + " textarea").trigger("change");
    $("#revfieldview_" + fid).html("").append(create_field_view(fid, fieldj));
    $("#remove_" + fid).html(fieldj.has_any_nonempty ? "Delete from form and current reviews" : "Delete from form");
    check_change(fid);
    return false;
}

function remove() {
    var $f = $(this).closest(".settings-revfield"),
        fid = $f.attr("data-revfield");
    $f.find(".revfield_order").val(0);
    $f.detach().hide().appendTo("#reviewform_removedcontainer");
    check_change(fid);
    $("#reviewform_removedcontainer").append('<div id="revfieldremoved_' + fid + '" class="settings-revfieldremoved"><span class="settings-revfn" style="text-decoration:line-through">' + escape_entities($f.find("#shortName_" + fid).val()) + '</span>&nbsp; (field removed)</div>');
    fill_order();
}

var revfield_template = '<table id="revfield_$" class="settings-revfield f-contain has-fold fold2c errloc_$" data-revfield="$"><tbody>\
<tr><td class="nw"><a href="#" class="q revfield-folder">\
<span class="expander"><span class="in0 fx2">▼</span><span class="in1 fn2 need-tooltip" data-tooltip="Edit field" data-tooltip-dir="r">▶</span></span>\
</a></td><td>\
<div id="revfieldview_$" class="settings-revfieldview fn2 ui js-foldup"></div>\
<div id="revfieldedit_$" class="settings-revfieldedit fx2">\
  <div class="f-i errloc_shortName_$">\
    <input name="shortName_$" id="shortName_$" type="text" size="50" style="font-weight:bold" placeholder="Field name" />\
  </div>\
  <div class="f-i">\
    <div class="f-ix">\
      <div class="f-c">Visibility</div>\
      <select name="authorView_$" id="authorView_$" class="reviewfield_authorView">\
        <option value="au">Shown to authors</option>\
        <option value="pc">Hidden from authors</option>\
        <option value="audec">Hidden from authors until decision</option>\
        <option value="admin">Shown only to administrators</option>\
      </select>\
    </div>\
    <div class="f-ix reviewrow_options">\
      <div class="f-c">Colors</div>\
      <select name="option_class_prefix_$" id="option_class_prefix_$" class="reviewfield_option_class_prefix"></select>\
<input type="hidden" name="option_class_prefix_flipped_$" id="option_class_prefix_flipped_$" value="" />\
    </div>\
    <div class="f-ix reviewrow_rounds">\
      <div class="f-c">Rounds</div>\
      <select name="round_list_$" id="round_list_$" class="reviewfield_round_list"></select>\
    </div>\
    <hr class="c" />\
  </div>\
  <div class="f-i errloc_description_$">\
    <div class="f-c">Description</div>\
    <textarea name="description_$" id="description_$" class="reviewtext need-tooltip" rows="6" data-tooltip-info="settings-review-form" data-tooltip-type="focus"></textarea>\
  </div>\
  <div class="f-i errloc_options_$ reviewrow_options">\
    <div class="f-c">Options</div>\
    <textarea name="options_$" id="options_$" class="reviewtext need-tooltip" rows="6" data-tooltip-info="settings-review-form" data-tooltip-type="focus"></textarea>\
  </div>\
  <div class="f-i">\
    <button id="moveup_$" class="btn revfield_moveup" type="button">Move up</button><span class="sep"></span>\
<button id="movedown_$" class="btn revfield_movedown" type="button">Move down</button><span class="sep"></span>\
<button id="remove_$" class="btn revfield_remove" type="button">Delete from form</button><span class="sep"></span>\
<input type="hidden" name="order_$" id="order_$" class="revfield_order" value="0" />\
  </div>\
</div><hr class="c" />\
</td></tr></tbody></table>';

var revfieldview_template = '<div style="line-height:1.35">\
<span class="settings-revfn"></span>\
<span class="settings-revrounds"></span>\
<span class="settings-revvis"></span>\
<div class="settings-revdata"></div>\
</div>';

tooltip.add_builder("settings-review-form", function (info) {
    return $.extend({
        dir: "h", content: $(/^description/.test(this.name) ? "#review_form_caption_description" : "#review_form_caption_options").html()
    }, info);
});

function option_value_html(fieldj, value) {
    var cc = 48, ccdelta = 1, t, n;
    if (!value || value < 0)
        return ["", "No entry"];
    if (fieldj.option_letter) {
        cc = fieldj.option_letter.charCodeAt(0) + fieldj.options.length;
        ccdelta = -1;
    }
    t = '<span class="rev_num sv';
    if (value <= fieldj.options.length) {
        if (fieldj.options.length > 1)
            n = Math.floor((value - 1) * 8 / (fieldj.options.length - 1) + 1.5);
        else
            n = 1;
        t += " " + (fieldj.option_class_prefix || "sv") + n;
    }
    return [t + '">' + String.fromCharCode(cc + value * ccdelta) + '.</span>',
            escape_entities(fieldj.options[value - 1] || "Unknown")];
}

function view_unfold(event) {
    var $f = $(event.target).closest(".settings-revfield");
    if ($f.hasClass("fold2c") || !form_differs($f))
        foldup.call(event.target, event, {n: 2});
    return false;
}

function field_visibility_text(visibility) {
    if ((visibility || "pc") === "pc")
        return "(hidden from authors)";
    else if (visibility === "admin")
        return "(shown only to administrators)";
    else if (visibility === "secret")
        return "(secret)";
    else if (visibility === "audec")
        return "(hidden from authors until decision)";
    else
        return "";
}

function create_field_view(fid, fieldj) {
    var $f = $(revfieldview_template.replace(/\$/g, fid)), $x, i, j, x;
    $f.find(".settings-revfn").text(fieldj.name || "<unnamed>");

    $x = $f.find(".settings-revvis");
    x = field_visibility_text(fieldj.visibility);
    x ? $x.text(x) : $x.remove();

    x = "";
    if ((fieldj.round_list || []).length == 1)
        x = "(" + fieldj.round_list[0] + " only)";
    else if ((fieldj.round_list || []).length > 1)
        x = "(" + commajoin(fieldj.round_list) + ")";
    $x = $f.find(".settings-revrounds");
    x ? $x.text(x) : $x.remove();

    if (fieldj.options) {
        x = [option_value_html(fieldj, 1).join(" "),
             option_value_html(fieldj, fieldj.options.length).join(" ")];
        fieldj.option_letter && x.reverse();
    } else
        x = ["Text field"];
    $f.find(".settings-revdata").html(x.join(" … "));

    return $f;
}

function move_field(event) {
    var isup = $(this).hasClass("revfield_moveup"),
        $f = $(this).closest(".settings-revfield").detach(),
        fid = $f.attr("data-revfield"),
        pos = $f.find(".revfield_order").val() | 0,
        $c = $("#reviewform_container")[0], $n, i;
    for (i = 1, $n = $c.firstChild;
         $n && i < (isup ? pos - 1 : pos + 1);
         ++i, $n = $n.nextSibling)
        /* nada */;
    $c.insertBefore($f[0], $n);
    fill_order();
    check_change(fid);
}

function append_field(fid, pos) {
    var $f = $("#revfield_" + fid), i, $j;
    $("#revfieldremoved_" + fid).remove();

    if ($f.length) {
        $f.detach().show().appendTo("#reviewform_container");
        fill_order();
        return;
    }

    $f = $(revfield_template.replace(/\$/g, fid));

    if (fid.charAt(0) === "s") {
        $j = $f.find(".reviewfield_option_class_prefix");
        for (i = 0; i < colors.length; i += 2)
            $j.append("<option value=\"" + colors[i] + "\">" + colors[i+1] + "</option>");
    } else
        $f.find(".reviewrow_options").remove();

    var rnames = [];
    for (i in hotcrp_status.revs || {})
        rnames.push(i);
    if (rnames.length > 1) {
        var v, j, text;
        $j = $f.find(".reviewfield_round_list");
        for (i = 0; i < (1 << rnames.length) - 1;
             i = next_lexicographic_permutation(i, rnames.length)) {
            text = [];
            for (j = 0; j < rnames.length; ++j)
                if (i & (1 << j))
                    text.push(rnames[j]);
            if (!text.length)
                $j.append("<option value=\"\">All rounds</option>");
            else if (text.length == 1)
                $j.append("<option value=\"" + text[0] + "\">" + text[0] + " only</option>");
            else
                $j.append("<option value=\"" + text.join(" ") + "\">" + commajoin(text) + "</option>");
        }
    } else
        $f.find(".reviewrow_rounds").remove();

    $f.find(".revfield_remove").on("click", remove);
    $f.find(".revfield_moveup, .revfield_movedown").on("click", move_field);
    $f.find("input, textarea, select").on("change input", check_this_change);
    $f.appendTo("#reviewform_container");

    fill_field(fid, original[fid], true);
    $f.find(".need-tooltip").each(tooltip);
}

function rfs(data) {
    var i, fid, $j;
    original = data.fields;
    samples = data.samples;
    stemplate = data.stemplate;
    ttemplate = data.ttemplate;

    fieldorder = [];
    for (fid in original)
        if (original[fid].position)
            fieldorder.push(fid);
    fieldorder.sort(function (a, b) {
        return original[a].position - original[b].position;
    });

    // construct form
    for (i = 0; i != fieldorder.length; ++i)
        append_field(fieldorder[i], i + 1);
    $("#reviewform_container").on("click", "a.revfield-folder", view_unfold);
    $("#reviewform_container").on("fold", ".settings-revfield", function (evt, opts) {
        if (!opts.f) {
            $(this).find("textarea").css("height", "auto").autogrow();
            $(this).find("input[type=text]").autogrow();
            mktemptext($(this));
        }
    });

    // highlight errors, apply request
    for (i in data.req || {}) {
        if (!$("#" + i).length)
            rfs.add(false, i.replace(/^.*_/, ""));
        $j = $("#" + i);
        if (!text_eq($j.val(), data.req[i])) {
            $j.val(data.req[i]);
            hiliter("reviewform_container");
            foldup.call($j[0], null, {n: 2, f: false});
        }
    }
    for (i in data.errf || {}) {
        $j = $(".errloc_" + i);
        $j.addClass("error");
        foldup.call($j[0], null, {n: 2, f: false});
    }
};

function add_field(fid) {
    fieldorder.push(fid);
    original[fid] = original[fid] || {};
    original[fid].position = fieldorder.length;
    append_field(fid, fieldorder.length);
    foldup.call($("#revfield_" + fid)[0], null, {n: 2, f: false});
    hiliter("reviewform_container");
    return true;
}

function add_dialog(fid, focus) {
    var $d, template = 0, has_options = fid.charAt(0) === "s";
    function render_template() {
        var $dtn = $d.find(".newreviewfield-template-name"),
            $dt = $d.find(".newreviewfield-template"),
            hc = new HtmlCollector;
        if (!template || !samples[template - 1] || !samples[template - 1].options != !has_options) {
            template = 0;
            $dtn.text("(Blank)");
        } else {
            var s = samples[template - 1];
            $d.find(".newreviewfield-template-name").text(s.selector);
            var hc = new HtmlCollector;
            hc.push('<div><span class="settings-revfn">' + text_to_html(s.name) + '</span>', '<hr class="c" /></div>');
            var x = field_visibility_text(s.visibility);
            if (x)
                hc.push('<span class="settings-revvis">' + text_to_html(x) + '</span>');
            hc.pop();
            hc.push('<div class="settings-revhint">' + text_to_html(s.description || "") + '</div>');
            if (s.options) {
                x = [];
                for (var i = 1; i <= s.options.length; ++i)
                    x.push(i);
                if (s.option_letter)
                    x.reverse();
                hc.push('<table class="settings-revoptions"><tbody>', '</tbody></table>');
                for (var i = 0; i < x.length; ++i) {
                    var ov = option_value_html(s, x[i]);
                    hc.push('<tr><td class="nw">' + ov[0] + ' </td>' +
                            '<td>' + ov[1] + '</td></tr>');
                }
                if (s.allow_empty)
                    hc.push('<tr><td colspan="2">No entry</td></tr>');
                hc.pop();
            }
        }
        $dt.html(hc.render());
    }
    function submit(event) {
        add_field(fid);
        template && fill_field(fid, samples[template - 1], false);
        $("#shortName_" + fid)[0].focus();
        popup_close($d);
        event.preventDefault();
    }
    function click() {
        if (this.name == "next" || this.name == "prev") {
            var dir = this.name == "next" ? 1 : -1;
            template += dir;
            if (template < 0)
                template = samples.length;
            while (template && samples[template - 1] && !samples[template - 1].options != !has_options)
                template += dir;
            render_template();
        }
    }
    function change_template() {
        ++template;
        while (samples[template - 1] && !samples[template - 1].options != !has_options)
            ++template;
        render_template();
    }
    function create() {
        var hc = popup_skeleton();
        hc.push('<h2>' + (has_options ? "Add score field" : "Add text field") + '</h2>');
        hc.push('<p>Choose a template for the new field.</p>');
        hc.push('<table style="width:500px;max-width:90%;margin-bottom:2em"><tbody><tr>', '</tr></tbody></table>');
        hc.push('<td style="text-align:left"><button name="prev" type="button" tabindex="1002" class="btn need-tooltip" data-tooltip="Previous template">&lt;</button></td>');
        hc.push('<td class="newreviewfield-template-name" style="text-align:center"></td>');
        hc.push('<td style="text-align:right"><button name="next" type="button" tabindex="1002" class="btn need-tooltip" data-tooltip="Next template">&gt;</button></td>');
        hc.pop();
        hc.push('<div class="newreviewfield-template" style="width:500px;max-width:90%;min-height:6em"></div>');
        hc.push_actions(['<button type="submit" name="add" tabindex="1000" class="btn btn-default want-focus">Create field</button>',
            '<button type="button" name="cancel" tabindex="1001" class="btn">Cancel</button>']);
        $d = hc.show();
        render_template();
        $d.find(".newreviewfield-template-name").on("click", change_template);
        $d.on("click", "button", click);
        $d.find("form").on("submit", submit);
    }
    create();
}

rfs.add = function (has_options, fid) {
    if (fid)
        return add_field(fid);
    // prefer recently removed fields
    var i = 0, x = [];
    for (var $n = $("#reviewform_removedcontainer")[0].firstChild;
         $n && $n.hasAttribute("data-revfield"); $n = $n.nextSibling) {
        x.push([$n.getAttribute("data-revfield"), i]);
        ++i;
    }
    // otherwise prefer fields that have ever been defined
    for (fid in original)
        if ($.inArray(fid, fieldorder) < 0) {
            x.push([fid, i + (original[fid].name && original[fid].name !== "Field name" ? 0 : 1000)]);
            ++i;
        }
    // find a field
    x.sort(function (a, b) { return a[1] - b[1]; });
    for (i = 0; i != x.length; ++i)
        if (!has_options === (x[i][0].charAt(0) === "t"))
            return add_dialog(x[i][0]);
    // no field found, so add one
    var ffmt = has_options ? "s%02d" : "t%02d";
    for (i = 1; ; ++i) {
        fid = sprintf(ffmt, i);
        if ($.inArray(fid, fieldorder) < 0)
            break;
    }
    original[fid] = has_options ? stemplate : ttemplate;
    return add_dialog(fid);
};

return rfs;
})();


function settings_add_resp_round() {
    var i, j;
    for (i = 1; jQuery("#response_" + i).length; ++i)
        /* do nothing */;
    jQuery("#response_n").before("<div id=\"response_" + i + "\" style=\"padding-top:1em\"></div>");
    j = jQuery("#response_" + i);
    j.html(jQuery("#response_n").html().replace(/_n\"/g, "_" + i + "\""));
    mktemptext(j);
    j.find("textarea").css({height: "auto"}).autogrow().val(jQuery("#response_n textarea").val());
    return false;
}


function settings_radio_table(name) {
    var $j = $("#" + name + "_table");
    fold($j.find("tr"), true);
    var value = $j.find("input[name=" + name + "]:checked").val();
    if (value != null)
        fold($("#" + name + "_row_" + value), false);
}
