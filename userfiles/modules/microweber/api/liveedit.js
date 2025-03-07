mw.isDrag = false;
mw.resizable_row_width = false;
mw.mouse_over_handle = false;
mw.external_content_dragged = false;

mw.have_new_items = false;

mw.dragCurrent = null;
mw.currentDragMouseOver = null;

mw.modulesClickInsert = true;

mw.mouseDownOnEditor = false;
mw.mouseDownStarted = false;
mw.SmallEditorIsDragging = false;


mw.states = {}


/**
 * Makes Droppable area
 *
 * @return Dom Element
 */
mw.dropables = {
    prepare: function () {
        var dropable = document.createElement('div');
        dropable.className = 'mw_dropable';
        dropable.innerHTML = '<span class="mw_dropable_arr"></span>';
        document.body.appendChild(dropable);
        mw.dropable = $(dropable);
        mw.dropable.bind("mouseenter", function () {
            $(this).hide();
        });
    },
    display: function (el) {

        var el = $(el);
        var offset = el.offset();
        var width = el.outerWidth();
        var height = el.outerHeight();
        if (mw.drop_regions.global_drop_is_in_region) {
            //console.log(1)
        }
        else {
            mw.dropable.css({
                top: offset.top + height,
                left: offset.left,
                width: width
            });
        }
    },
    set: function (pos, offset, height, width) {
        if (pos === 'top') {
            mw.top_half = true;
            mw.dropable.css({
                top: offset.top - 2,
                left: offset.left,
                width: width,
                height: ''
            });
            mw.dropable.data("position", "top");
            mw.dropable.addClass("mw_dropable_arr_up");
        }
        else if (pos === 'bottom') {
            mw.top_half = false;
            mw.dropable.css({
                top: offset.top + height + 2,
                left: offset.left,
                width: width,
                height: ''
            });
            mw.dropable.data("position", "bottom");
            mw.dropable.removeClass("mw_dropable_arr_up");
            mw.dropable.removeClass("mw_dropable_arr_rigt");
        }
        else if (pos === 'left') {
            mw.dropable.data("position", 'left');
            mw.dropable.css({
                top: offset.top,
                height: height,
                width: '',
                left: offset.left
            });
        }
        else if (pos === 'right') {
            mw.dropable.data("position", 'right');
            mw.dropable.addClass("mw_dropable_arr_rigt");
            mw.dropable.css({
                top: offset.top,
                left: offset.left + width,
                height: height,
                width: ''
            });
        }
    }
}


$(document).ready(function () {

    mw.$("#toolbar-template-settings").click(function () {
        mw.tools.toggle_template_settings();
    });


    mw.$("#mw-toolbar-css-editor-btn").click(function () {
        mw.tools.open_custom_css_editor();
    });
    mw.drag.create();
    $(mwd.body).keyup(function (e) {
        mw.$(".mw_master_handle").css({
            left: "",
            top: ""
        });
        mw.on.stopWriting(e.target, function () {
            if (mw.tools.hasClass(e.target, 'edit') || mw.tools.hasParentsWithClass(this, 'edit')) {
                mw.drag.saveDraft();
            }
        });
    });

    $(mwd.body).bind("keydown", function (e) {

        if (e.keyCode == 83 && e.ctrlKey) {
            mw.event.cancel(e, true);
            mw.drag.save();
        }
    })

    mw.edits = mw.$('.edit');

    mw.edits.mouseleave(function (e) {
        if (mw.isDrag) {
            var el = $(this);
            var off = el.offset();
            var h = el.outerHeight();
            var w = el.outerWidth();
            if (e.pageX > off.left && e.pageX < off.left + w) {
                mw.currentDragMouseOver = this;
                if (off.top + h < e.pageY) {
                    mw.dropables.set("top", off, h, w);
                    mw.dropable.show();
                }
                else {
                    mw.dropables.set("bottom", off, h, w);
                    mw.dropable.show();
                }
            }
            mw.dropable.addClass("mw_dropable_onleaveedit");
        }
    });

    $(window).bind("onDragHoverOnEmpty", function (e, el) {
        if ($.browser.webkit) {
            var _el = $(el);
            _el.addClass("hover");
            if (!_el.hasClass("mw-webkit-drag-hover-binded")) {
                _el.addClass("mw-webkit-drag-hover-binded");
                _el.mouseleave(function () {
                    _el.removeClass("hover");
                });
            }
        }
    });


    $(window).bind("onIconElementClick", function (e, el) {
        mw.iconSelector._activeElement = el;
        mw.iconSelector.popup(true);

    });
    $(window).bind("onElementClick", function (e, el) {

        if (typeof(mw.iconSelectorToolTip) != "undefined") {
            $(mw.iconSelectorToolTip).hide();
            // mw.iconSelector.hide();
        }
    });


    var t = mwd.querySelectorAll('[field="title"]'), l = t.length, i = 0;

    for (; i < l; i++) {
        $(t[i]).addClass("nodrop");
    }

    $(mwd.body).bind("mousedown mouseup", function (e) {
        if (e.type == 'mousedown') {
            if (!mw.tools.hasClass(e.target, 'ui-resizable-handle') && !mw.tools.hasParentsWithClass(e.target, 'ui-resizable-handle')) {
                mw.tools.addClass(mwd.body, 'state-element')
            }
            else {
                mw.tools.removeClass(mwd.body, 'state-element');
            }

            if (!mw.tools.hasParentsWithClass(e.target, 'mw-tooltip-insert-module') && !mw.tools.hasAnyOfClasses(e.target, ['mw-plus-bottom', 'mw-plus-top'])) {
                mw.$('.mw-tooltip-insert-module').remove();
                mw.drag.plus.locked = false;
            }

        }
        else {
            mw.tools.removeClass(mwd.body, 'state-element');
        }
    });

});


hasAbilityToDropElementsInside = function (target) {
    var items = /^(span|h[1-6]|hr|ul|ol|input|table|b|em|i|a|img|textarea|br|canvas|font|strike|sub|sup|dl|button|small|select|big|abbr|body)$/i;
    if (typeof target === 'string') {
        return !items.test(target);
    }
    var x = items.test(target.nodeName);
    if (x) {
        return false;
    }
    if (mw.tools.hasParentsWithClass(target, 'module')) {
        if (mw.tools.hasParentsWithClass(target, 'edit')) {
            return true;
        }
        else {
            return false;
        }
    }
    else if (mw.tools.hasClass(target, 'module')) {
        return false;
    }
    return true;
}


mw.drag = {
    external_grids_row_classes: ['row'],
    external_grids_col_classes: ['col-lg-1', 'col-lg-10', 'col-lg-11', 'col-lg-12', 'col-lg-2', 'col-lg-3', 'col-lg-4', 'col-lg-5', 'col-lg-6', 'col-lg-7', 'col-lg-8', 'col-lg-9', 'col-md-1', 'col-md-10', 'col-md-11', 'col-md-12', 'col-md-2', 'col-md-3', 'col-md-4', 'col-md-5', 'col-md-6', 'col-md-7', 'col-md-8', 'col-md-9', 'col-sm-1', 'col-sm-10', 'col-sm-11', 'col-sm-12', 'col-sm-2', 'col-sm-3', 'col-sm-4', 'col-sm-5', 'col-sm-6', 'col-sm-7', 'col-sm-8', 'col-sm-9', 'col-xs-1', 'col-xs-10', 'col-xs-11', 'col-xs-12', 'col-xs-2', 'col-xs-3', 'col-xs-4', 'col-xs-5', 'col-xs-6', 'col-xs-7', 'col-xs-8', 'col-xs-9'],
    external_css_no_element_classes: ['navbar', 'navbar-header', 'navbar-collapse', 'navbar-static', 'navbar-static-top', 'navbar-default', 'navbar-text', 'navbar-right', 'navbar-center', 'navbar-left', 'nav navbar-nav', 'collapse', 'header-collapse', 'panel-heading', 'panel-body', 'panel-footer'],
    columnout: false,
    noop: mwd.createElement('div'),
    create: function () {
        mw.top_half = false;
        var edits = mwd.body.querySelectorAll(".edit"), elen = edits.length, ei = 0;
        for (; ei < elen; ei++) {
            var els = edits[ei].querySelectorAll('p,div,h1,h2,h3,h4,h5,h6'), i = 0, l = els.length;
            for (; i < l; i++) {
                var el = els[i];
                var noelements = ['mw-ui-col', 'mw-col-container', 'mw-ui-col-container'];

                //Bootrap 3 classes 
                var noelements_bs3 = mw.drag.external_grids_col_classes;
                var noelements_ext = mw.drag.external_css_no_element_classes;
                var noelements = noelements.concat(noelements_bs3);
                var noelements = noelements.concat(noelements_ext);


                if (mw.tools.hasAnyOfClasses(el, noelements)) {
                    continue;
                }
                var cls = el.className;
                if (!mw.tools.hasParentsWithClass(el, 'module') && !mw.tools.hasClass(cls, 'module') && !mw.tools.hasClass(cls, 'mw-col') && !mw.tools.hasClass(cls, 'mw-row')) {
                    mw.tools.addClass(el, 'element');
                }
            }
        }
        mw.$("#live_edit_toolbar_holder .module").removeClass("module");

        $(mwd.body).mousemove(function (event) {

            mw.tools.removeClass(this, 'isTyping');

            if (!mw.settings.resize_started) {

                /*if(mw.mouseDownOnEditor && (mw.tools.hasClass(event.target, 'editor_wrapper') || mw.tools.hasClass(event.target, 'wysiwyg-table') || mw.mouseDownStarted)){
                 mw.mouseDownStarted = true;
                 $("#mw_small_editor").css({
                 top:event.pageY-$(window).scrollTop(),
                 left:event.pageX-100,
                 visibility: "visible"
                 });
                 mw.$("#mw-text-editor").slideUp('fast', function(){mw.toolbar.fixPad()})

                 }
                 if(mw.SmallEditorIsDragging){
                 var offset_small = mw.smallEditor.offset();
                 var offset_big = mw.bigEditor.offset();
                 if(offset_small.top<offset_big.top+50){
                 mw.SmallEditorIsDragging = false;
                 mw.smallEditor.invisible();
                 mw.bigEditor.visible();

                 mw.smallEditor.draggable({ disabled: true });
                 mw.$("#mw-text-editor").slideDown('fast', function(){mw.toolbar.fixPad()})
                 }
                 }*/

                mw.emouse = {
                    x: event.pageX,
                    y: event.pageY
                }

                mw.mm_target = event.target;
                mw.$mm_target = $(mw.mm_target);

                if (!mw.isDrag) {
                    if (mw.emouse.x % 2 === 0 && mw.drag.columns.resizing === false) {
                        if (mw.$mm_target.hasClass("element") && !mw.$mm_target.hasClass("module") && !mw.tools.hasParentsWithClass(mw.mm_target, 'module')) {
                            $(window).trigger("onElementOver", mw.mm_target);
                        }
                        else if (mw.$mm_target.parents(".element").length > 0 && !mw.tools.hasParentsWithClass(mw.mm_target, 'module')) {
                            $(window).trigger("onElementOver", mw.$mm_target.parents(".element:first")[0]);
                        }
                        else if (mw.mm_target.id != 'mw_handle_element' && mw.$mm_target.parents("#mw_handle_element").length == 0) {
                            $(window).trigger("onElementLeave", mw.mm_target);
                        }
                        if (mw.$mm_target.hasClass("module") && !mw.$mm_target.hasClass("no-settings")) {
                            $(window).trigger("onModuleOver", mw.mm_target);
                        }
                        else if (mw.tools.hasParentsWithClass(mw.mm_target, 'module')) {
                            var _parentmodule = mw.tools.firstParentWithClass(mw.mm_target, 'module');
                            if (!mw.tools.hasClass(_parentmodule, "no-settings")) {
                                $(window).trigger("onModuleOver", _parentmodule);
                            }

                        }
                        else if (mw.mm_target.id != 'mw_handle_module' && mw.$mm_target.parents("#mw_handle_module").length == 0) {
                            $(window).trigger("onModuleLeave", mw.mm_target);
                        }


                        if (mw.mm_target === mw.image_resizer) {
                            $(window).trigger("onElementOver", mw.image.currentResizing[0]);
                        }




                        if (mw.drag.columns.resizing === false && mw.tools.hasParentsWithClass(mw.mm_target, 'edit') && !mw.tools.hasParentsWithClass(mw.mm_target, 'module') ) {

                            //trigger on row
                            if (mw.$mm_target.hasClass("mw-row")) {
                                $(window).trigger("onRowOver", mw.mm_target);
                            }
                            else if (mw.tools.hasParentsWithClass(mw.mm_target, 'mw-row')) {
                                $(window).trigger("onRowOver", mw.tools.firstParentWithClass(mw.mm_target, 'mw-row'));
                            }
                            else if (mw.mm_target.id != 'mw_handle_row' && mw.$mm_target.parents("#mw_handle_row").length == 0) {
                                $(window).trigger("onRowLeave", mw.mm_target);
                            }

                            //onColumn

                            if (mw.drag.columns.resizing === false && mw.tools.hasClass(mw.mm_target, 'mw-col')) {
                                mw.drag.columnout = false;
                                $(window).trigger("onColumnOver", mw.mm_target);
                            }
                            else if (mw.drag.columns.resizing === false && mw.tools.hasParentsWithClass(mw.mm_target, 'mw-col')) {
                                mw.drag.columnout = false;
                                $(window).trigger("onColumnOver", mw.tools.firstParentWithClass(mw.mm_target, 'mw-col'));
                            }
                            else {
                                if (!mw.drag.columnout && !mw.tools.hasClass(mw.mm_target, 'mw-columns-resizer')) {
                                    mw.drag.columnout = true;
                                    $(window).trigger("onColumnOut", mw.mm_target)
                                }

                            }
                        }



                        if (mw.$mm_target.parents(".edit,.mw_master_handle").length == 0) {
                            if (!mw.$mm_target.hasClass(".edit") && !mw.$mm_target.hasClass("mw_master_handle")) {
                                //$(window).trigger("onAllLeave", mw.mm_target);
                            }
                        }

                    }
                    mw.image._dragTxt(event);


                    if (!mw.image.isResizing) {
                        if (event.target.nodeName === 'IMG' && mw.tools.hasClass(event.target, 'element') && mw.drag.columns.resizing === false) {
                            $(mw.image_resizer).addClass("active");
                            mw.image.resize.resizerSet(event.target, false);
                        }
                        else {
                            if (!event.target.mwImageResizerComponent) {
                                mw.tools.removeClass(mw.image_resizer, 'active')
                            }
                        }

                    }
                }
                else {

                    if (mw.tools.hasClass(mw.mm_target, 'nodrop') || mw.tools.hasParentsWithClass(mw.mm_target, 'nodrop')) {
                        mw.mm_target = mw.drag.noop;
                        mw.$mm_target = $(mw.drag.noop);
                        mw.dropable.hide();
                        return false;
                    }

                    if (mw.$mm_target.hasClass("empty-element")) {
                        $(window).trigger("onDragHoverOnEmpty", mw.mm_target);
                    }
                    else if ($(mw.mm_target.parentNode).hasClass("empty-element")) {
                        $(window).trigger("onDragHoverOnEmpty", mw.mm_target.parentNode);
                    }
                    else if ($(mw.mm_target.parentNode).hasClass("mw-empty")) {

                        $(window).trigger("onDragHoverOnEmpty", mw.mm_target.parentNode);
                    }
                    else if ($(mw.mm_target).hasClass("mw-empty")) {

                        $(window).trigger("onDragHoverOnEmpty", mw.mm_target.parentNode);
                    }


                    if (!mw.tools.hasParentsWithClass(mw.mm_target, 'edit') && !mw.tools.hasClass(mw.mm_target.className, 'edit')) {
                        mw.mm_target = mw.drag.noop;
                        mw.$mm_target = $(mw.drag.noop);

                        mw.dropable.removeClass("mw_dropable_onleaveedit");
                        mw.dropable.hide();
                    }
                    else {
                        var order = mw.tools.parentsOrder(mw.mm_target, ['edit', 'module']);

                        if ((order.module > -1 && order.edit > order.module)) {


                            /*
                             mw.mm_target = mw.drag.noop;
                             mw.$mm_target = $(mw.drag.noop);   */
                        }
                    }


                    if (mw.tools.hasParentsWithClass(mw.mm_target, 'module') && mw.tools.hasParentsWithClass(mw.mm_target, 'edit')) {
                        if(mw.tools.hasParentsWithClass(mw.mm_target, 'allow-drop')){
                            mw.currentDragMouseOver = mw.mm_target;

                        } else {
                            mw.currentDragMouseOver = mw.tools.lastParentWithClass(mw.mm_target, 'module');

                        }


                    }
                    else if (mw.tools.hasClass(mw.mm_target.className, 'module')) {
                        mw.currentDragMouseOver = mw.mm_target;


                    } else {

                        if (
                            mw.$mm_target.hasClass("element")
                            || mw.$mm_target.hasClass("empty-element")
                            || mw.$mm_target.hasClass("mw-empty")
                            || mw.$mm_target.hasClass("mw-row")
                            || mw.$mm_target.hasClass("module")
                            || mw.tools.hasParentsWithClass(mw.mm_target, "element")
                            || mw.tools.hasParentsWithClass(mw.mm_target, "module")
                            || mw.isDragItem(mw.mm_target)
                            || mw.mm_target.tagName == 'IMG') {


                            //  mw.currentDragMouseOver = mw.mm_target;


                            if (mw.$mm_target.hasClass("module")) {
                                mw.currentDragMouseOver = mw.mm_target;

                            }
                            else if (mw.tools.hasParentsWithClass(mw.mm_target, 'module')) {
                                mw.currentDragMouseOver = mw.tools.firstParentWithClass(mw.mm_target, 'module');

                            }

                            else if (!mw.mm_target.className.contains("ui-") && !mw.tools.hasParentsWithClass(mw.mm_target, "ui-draggable-dragging")) {
                                if (mw.tools.hasParentsWithClass(mw.mm_target, 'edit') && !mw.tools.hasParentsWithClass(mw.mm_target, 'nodrop') && !mw.$mm_target.hasClass('nodrop')) {
                                    var noelements = mw.drag.external_grids_col_classes;
                                    if (mw.tools.hasAnyOfClasses(mw.mm_target, noelements)) {
                                        mw.currentDragMouseOver = mw.mm_target;

                                    } else if (mw.tools.hasClass(mw.mm_target.className, 'mw-col') || mw.tools.hasClass(mw.mm_target.className, 'mw-col-container')) {
                                        mw.currentDragMouseOver = mw.tools.firstParentWithClass(mw.mm_target, 'mw-row');
                                    }
                                    else {
                                        mw.currentDragMouseOver = mw.mm_target;
                                    }

                                    if (mw.$mm_target.hasClass("empty-element") || mw.$mm_target.hasClass("mw-empty")) {
                                        mw.dropable.removeClass("mw_dropable_onleaveedit");
                                    }
                                }
                                else {
                                    if (mw.tools.hasClass(mw.mm_target.className, 'edit')) {
                                        mw.currentDragMouseOver = mw.mm_target;
                                        if (mw.tools.hasClass(mw.mm_target.className, 'nodrop-around')) {
                                            mw.currentDragMouseOver = null;
                                        }
                                    }
                                    else {
                                        mw.currentDragMouseOver = null;
                                    }
                                }
                            }
                        }
                    }

                    if (mw.tools.hasClass(mw.mm_target, 'mw-col-container')) {
                        mw.currentDragMouseOver = mw.mm_target;

                    }

                }

                if (mw.isDrag && mw.currentDragMouseOver != null  /*&& !mw.tools.hasParentsWithClass(mw.currentDragMouseOver, 'module') && !mw.tools.hasClass(mw.currentDragMouseOver.className, 'module')*/) {

                    if (mw.tools.hasParentsWithClass(mw.mm_target, 'nodrop')) {
                        mw.dropable.hide();
                        return false;
                    }
                    if (mw.tools.hasClass('nodrop', mw.currentDragMouseOver.className) || mw.tools.hasParentsWithClass(mw.currentDragMouseOver, 'nodrop') || mw.currentDragMouseOver.getAttribute('field') === 'title') {
                        mw.currentDragMouseOver = mw.drag.noop;
                        //return false;
                    }
                    mw.drop_regions.init(mw.currentDragMouseOver, event, function (region) {
                    });


                    var el = $(mw.currentDragMouseOver);
                    $(".ui-draggable-dragging").show();
                    if (el.hasClass("ui-draggable-dragging") || mw.tools.hasParentsWithClass(mw.currentDragMouseOver, "ui-draggable-dragging")) {
                        // check if mouse is over the dragging element
                        return false;
                    }

                    var body = $(this);

                    var offset = el.offset();
                    var height = el.outerHeight();
                    var width = el.width();


                    if (mw.drop_regions.global_drop_is_in_region /* && !$(mw.dragCurrent).hasClass("mw-row")&& $(mw.dragCurrent).hasClass("element-image")*/) {

                        mw.dropable.addClass("mw_dropable_vertical");
                        if (mw.drop_regions.which == 'left') {
                            mw.dropables.set('left', offset, height);
                        }
                        else {
                            mw.dropables.set('right', offset, height, width);
                        }
                    }
                    else {
                        mw.dropable.removeClass("mw_dropable_vertical");
                        mw.dropable.removeClass("mw_dropable_arr_rigt");
                        if (event.pageY > offset.top + (height / 2)) {  //is on the bottom part
                            mw.dropables.set('bottom', offset, height, width);
                        }
                        else {
                            mw.dropables.set('top', offset, height, width);
                        }
                    }


                    var noelements = mw.drag.external_grids_col_classes;


                    if (el.hasClass("element") ||
                        mw.tools.hasParentsWithClass(mw.currentDragMouseOver, 'mw-row') ||
                        mw.tools.hasClass(mw.currentDragMouseOver.className, 'module') ||
                        mw.tools.hasParentsWithClass(mw.currentDragMouseOver, 'module') || mw.tools.hasParentsWithClass(mw.currentDragMouseOver, 'element')) {
                        if (el.hasClass("empty-element") || el.hasClass("mw-empty")) {
                            mw.dropable.hide();

                        }
                        else {
                            mw.dropable.show();

                        }
                    }
                    else {

                        mw.dropable.hide();

                    }
                }
            }

            $(".currentDragMouseOver").removeClass("currentDragMouseOver");
            $(mw.currentDragMouseOver).addClass("currentDragMouseOver");
        });


        mw.dropables.prepare();

        mw.drag.fix_placeholders(true);
        mw.drag.fixes()

        mw.drag.init();

        mw.resizable_columns();

        $(mwd.body).mouseup(function (event) {

            mw.mouseDownStarted = false;
            if (mw.isDrag && mw.dropable.is(":hidden")) {
                mw.$(".ui-draggable-dragging").css({top: 0, left: 0});
            }
            $(this).removeClass("not-allowed");


            if (mw.$(".toolbar_bnav_hover").length == 0 && $(".ts_main_ul").length != 0) {
                mw.$(".ts_main_ul .ts_action").invisible();
                mw.$(".ts_main_ul .ts_action").css({left: "100%", top: 0});
            }


            if (event.target.hasAttribute("field")) {
                /*
                 var attrs = mw.tools.getAttrs(event.target);
                 var tag = event.target.tagName.toLowerCase();
                 var input = mwd.createElement('input');
                 input.value = event.target.innerHTML;
                 input.style.fontSize = $(event.target).css('fontSize');
                 mw.log($(event.target).css('fontSize'))
                 input.onblur = function(){
                 var el = mwd.createElement(tag);
                 el.innerHTML = input.value;
                 for(var x in attrs){
                 el.setAttribute(x, attrs[x]);
                 }
                 $(input).replaceWith(el);
                 }
                 $(event.target).replaceWith(input);
                 input.focus();  */
            }


        });

        $(mwd.body).mousedown(function (event) {
            var target = event.target;

            if ($(target).hasClass("image_free_text")) {
                mw.image._dragcurrent = target;
                mw.image._dragparent = target.parentNode;
                mw.image._dragcursorAt.x = event.pageX - target.offsetLeft;
                mw.image._dragcursorAt.y = event.pageY - target.offsetTop;

                target.startedY = target.offsetTop - target.parentNode.offsetTop;
                target.startedX = target.offsetLeft - target.parentNode.offsetLeft;

            }

            if ($(".desc_area_hover").length == 0) {
                $(".desc_area").hide();
            }


            if (mw.tools.hasClass(event.target.className, 'mw-open-module-settings')) {
                mw.drag.module_settings()
                //var id = mwd.tools.firstParentWithClass(event.target, 'module').id;
            }

            if (!mw.tools.hasParentsWithTag(event.target, 'TABLE') && !mw.tools.hasParentsWithClass(event.target, 'mw-inline-bar')) {
                $(mw.inline.tableControl).hide();
                mw.$(".tc-activecell").removeClass('tc-activecell');
            }
            if (!mw.isDrag && mw.tools.hasClass(target, 'mw-empty')) {

            }
        });

        $(window).bind("onElementOver", function (a, element) {
            if (mw.tools.hasParentsWithClass(element, 'nodrop') || mw.tools.hasClass(element, 'nodrop')) {
                mw.$(".mw_edit_delete, .mw_edit_delete_element, .mw-sorthandle-moveit, .column_separator_title").hide();
                return false;
            }
            else {
                mw.$(".mw_edit_delete, .mw_edit_delete_element, .mw-sorthandle-moveit, .column_separator_title").show();
            }
            var el = $(element);
            if (element.textContent.length < 2 && element.nodeName !== 'IMG') {
                return false;
            }


            var o = el.offset();
            var width = el.width();

            var pleft = parseFloat(el.css("paddingLeft"));
            var left_spacing = o.left;
            var right_spacing = o.right;
            if (mw.tools.hasClass(element, 'jumbotron')) {
                left_spacing = left_spacing + pleft;
            }

            $(mw.handle_element).css({
                top: o.top - 17,
                left: left_spacing,
                width: width
            });
            $(mw.handle_element).data("curr", element);
            element.id == "" ? element.id = "element_" + mw.random() : "";
            mw.dropable.removeClass("mw_dropable_onleaveedit");
        });
        $(window).bind("onModuleOver", function (a, element) {


            if (mw.tools.hasParentsWithClass(element, 'nodrop') || mw.tools.hasClass(element, 'nodrop') || mw.tools.hasParentsWithClass(element, 'module')) {
                mw.$(".mw_edit_delete, .mw_edit_delete_element, #mw_handle_module .mw-sorthandle-moveit, .column_separator_title").hide();
                //return false;
            }
            else {
                mw.$(".mw_edit_delete, .mw_edit_delete_element, #mw_handle_module .mw-sorthandle-moveit, .column_separator_title").show();
                var order = mw.tools.parentsOrder(element, ['edit', 'module']);
                if (order.edit == -1 || (order.module > -1 && order.edit > order.module)) {
                    mw.$("#mw_handle_module .mw-sorthandle-moveit").hide();
                    mw.$("#mw_handle_module .mw_edit_delete").hide();
                }
                else {
                    mw.$("#mw_handle_module .mw-sorthandle-moveit").show();
                    mw.$("#mw_handle_module .mw_edit_delete").show();
                }
            }

            var el = $(element);
            //var title = el.dataset("filter");
            var title = el.dataset("mw-title");
            //$(mw.handle_module).find(".mw-element-name-handle").html(title);


            if (title != '') {
                mw.$(".mw-element-name-handle", mw.handle_module).html(title);
            }
            else {
                mw.$(".mw-element-name-handle", mw.handle_module).html(mw.msg.settings);
            }

            $(mw.handle_module).find(".mw_edit_delete").dataset("delete", element.id);
            var o = el.offset();
            var width = el.width();
            var pleft = parseFloat(el.css("paddingLeft"));
            var prev_has_float_left = el.prev();

            if (prev_has_float_left.lenght != 0) {
                var float_left = prev_has_float_left.css("float");
                if (float_left == 'none') {

                } else if (float_left == 'left') {
                    var float_left_width = prev_has_float_left.width();
                    pleft = pleft + float_left_width;
                }
            }


            $(mw.handle_module).css({
                top: o.top - 17,
                left: o.left + pleft,
                width: width
            });
            $(mw.handle_module).data("curr", element);
            element.id == "" ? element.id = "element_" + mw.random() : "";


        });
        $(window).bind("onRowOver", function (a, element) {
            var el = $(element);
            var o = el.offset();
            var width = el.width();
            var pleft = parseFloat(el.css("paddingLeft"));
            var top = o.top - 35;
            var left = o.left;

            if (top < 55 && mwd.getElementById('live_edit_toolbar') !== null) {
                var top = 55;
                var left = left - 100;
            }
            if (top < 0 && mwd.getElementById('live_edit_toolbar') === null) {
                var top = 0;
                //   var left = left-50;
            }

            $(mw.handle_row).css({
                top: top,
                left: left,
                width: width
            });
            $(mw.handle_row).data("curr", element);
            var size = $(element).children(".mw-col").length;
            mw.$("a.mw-make-cols").removeClass("active");
            mw.$("a.mw-make-cols").eq(size - 1).addClass("active");
            element.id == "" ? element.id = "element_" + mw.random() : "";

            if (mw.tools.hasParentsWithClass(element, 'nodrop') || mw.tools.hasClass(element, 'nodrop')) {
                mw.$("#mw_handle_row .mw_edit_delete, #mw_handle_row .mw_edit_delete_element, #mw_handle_row .mw-sorthandle-moveit, #mw_handle_row .column_separator_title").hide();
                return false;
            }
            else {
                mw.$("#mw_handle_row .mw_edit_delete, #mw_handle_row .mw_edit_delete_element, #mw_handle_row .mw-sorthandle-moveit, #mw_handle_row .column_separator_title").show();
            }
        });

        mw.$("#mw_handle_row,#mw_handle_module,#mw_handle_element,#items_handle").hover(function () {
            var active = $(this).data("curr");
            $(active).addClass("element-active");
            $(this).addClass(this.id + 'hover');
        }, function () {
            var active = $(this).data("curr");
            $(active).removeClass("element-active");
            $(this).removeClass(this.id + 'hover');
            $(this).css({top: '', left: ''});
        });
        $(window).bind("onAllLeave", function (e, target) {
            $("#mw_handle_row,#mw_handle_module,#mw_handle_element").css({
                top: "",
                left: ""
            });
        });
        $(window).bind("onElementLeave", function (e, target) {
            $(mw.handle_element).css({
                top: "",
                left: ""
            });
        });
        $(window).bind("onModuleLeave", function (e, target) {
            $(mw.handle_module).css({
                top: "",
                left: ""
            });
        });
        $(window).bind("onRowLeave", function (e, target) {
            setTimeout(function () {
                if (mw.$("#mw_handle_row").hasClass('mw_handle_row_hover')) {
                    $(mw.handle_row).css({
                        top: "",
                        left: ""
                    });
                }
            }, 222);
        });
        $(window).bind("onItemLeave", function (e, target) {
            $(mw.handle_item).css({
                top: "",
                left: ""
            });
        });
    },
    init: function (selector, callback) {
        if (!mw.handle_item) {
            $(mwd.body).append(mw.settings.handles.module);
            $(mwd.body).append(mw.settings.handles.row);
            $(mwd.body).append(mw.settings.handles.element);
            $(mwd.body).append(mw.settings.handles.item);
            mw.handle_module = mwd.getElementById('mw_handle_module');
            mw.handle_row = mwd.getElementById('mw_handle_row');
            mw.handle_element = mwd.getElementById('mw_handle_element');
            mw.handle_item = '';

            $(mw.handle_element).mouseenter(function () {
                var curr = $(this).data("curr");
                $(this).draggable("option", "helper", function () {
                    var clone = $(curr).clone(true);
                    clone.css({
                        width: $(curr).width(),
                        height: $(curr).height()
                    });
                    return clone;
                });
            }).click(function () {
                var curr = $(this).data("curr");
                if (!$(curr).hasClass("element-current")) {
                    $(".element-current").removeClass("element-current");
                    if (curr.tagName == 'IMG') {
                        $(window).trigger("onImageClick", curr);
                    }
                    else {
                        $(window).trigger("onElementClick", curr);
                    }
                }
                if (!$(curr).hasClass('module')) {
                    mw.wysiwyg.select_element($(curr)[0]);
                }
            });
            $(mw.handle_module).mouseenter(function () {
                var curr = $(this).data("curr");
                $(this).draggable("option", "helper", function () {
                    var clone = $(curr).clone(true);
                    clone.css({
                        width: $(curr).width(),
                        height: $(curr).height()
                    });
                    return clone;
                });
            }).click(function () {
                var curr = $(this).data("curr");
                if (!$(curr).hasClass("element-current")) {
                    $(window).trigger("onElementClick", curr);
                }
            });
            $(mw.handle_row).mouseenter(function () {
                var curr = $(this).data("curr");
                $(this).draggable("option", "helper", function () {
                    var clone = $(curr).clone(true);
                    clone.css({
                        width: $(curr).width(),
                        height: $(curr).height()
                    });
                    return clone;
                });
            }).click(function () {
                var curr = $(this).data("curr");
                if (!$(curr).hasClass("element-current")) {
                    $(window).trigger("onElementClick", curr);
                }
            });
            $(mw.handle_item).mouseenter(function () {
                var el = $(this);
                var curr = el.data("curr");
                curr.id = 'item_' + mw.random();
                el.draggable("option", "helper", function () {
                    var clone = $(curr).clone(true);
                    clone.css({
                        width: $(curr).width(),
                        height: $(curr).height()
                    });
                    return clone;
                });
            }).click(function () {
                var curr = $(this).data("curr");
                if (!$(curr).hasClass("element-current")) {
                    $(window).trigger("onItemClick", curr);
                }
            });
            $(mw.handle_element).draggable({
                handle: ".mw-sorthandle-moveit",
                cursorAt: {
                    top: -30
                },
                start: function () {
                    mw.isDrag = true;
                    var curr = $(mw.handle_element).data("curr");
                    mw.dragCurrent = curr;
                    mw.dragCurrent.id == "" ? mw.dragCurrent.id = 'element_' + mw.random() : '';
                    $(mw.dragCurrent).invisible().addClass("mw_drag_current");
                    $(window).trigger("onAllLeave");
                    mw.drag.fix_placeholders();
                    $(mwd.body).addClass("dragStart");
                    $(mw.image_resizer).removeClass("active");
                    mw.wysiwyg.change(mw.dragCurrent);
                    mw.smallEditor.css("visibility", "hidden");
                    mw.smallEditorCanceled = true;
                },
                stop: function () {
                    $(mwd.body).removeClass("dragStart");
                }
            });
            $(mw.handle_module).draggable({
                handle: ".mw-sorthandle-moveit",
                cursorAt: {
                    top: -30
                },
                start: function () {
                    mw.isDrag = true;
                    var curr = $(mw.handle_module).data("curr");
                    mw.dragCurrent = curr;
                    mw.dragCurrent.id == "" ? mw.dragCurrent.id = 'module_' + mw.random() : '';
                    $(mw.dragCurrent).invisible().addClass("mw_drag_current");
                    $(window).trigger("onAllLeave");
                    mw.drag.fix_placeholders();
                    $(mwd.body).addClass("dragStart");
                    $(mw.image_resizer).removeClass("active");
                    mw.wysiwyg.change(mw.dragCurrent);

                    mw.smallEditor.css("visibility", "hidden");
                    mw.smallEditorCanceled = true;
                },
                stop: function () {
                    $(mwd.body).removeClass("dragStart");
                }
            });
            $(mw.handle_row).draggable({
                handle: ".column_separator_title",
                cursorAt: {
                    top: -30
                },
                start: function () {
                    mw.isDrag = true;
                    var curr = $(mw.handle_row).data("curr");
                    mw.dragCurrent = curr;
                    mw.dragCurrent.id == "" ? mw.dragCurrent.id = 'element_' + mw.random() : '';
                    $(mw.dragCurrent).invisible().addClass("mw_drag_current");
                    $(window).trigger("onAllLeave");
                    mw.drag.fix_placeholders();
                    $(mwd.body).addClass("dragStart");
                    $(mw.image_resizer).removeClass("active");
                    mw.wysiwyg.change(mw.dragCurrent);
                    mw.smallEditor.css("visibility", "hidden");
                    mw.smallEditorCanceled = true;
                },
                stop: function () {
                    $(mwd.body).removeClass("dragStart");
                }
            });
            $(mw.handle_item).draggable({
                cursorAt: {
                    top: -30
                },
                start: function () {
                    mw.isDrag = true;
                    var curr = $(mw.handle_item).data("curr");
                    mw.dragCurrent = curr;
                    $(mw.dragCurrent).invisible().addClass("mw_drag_current");
                    $(window).trigger("onAllLeave");
                    mw.drag.fix_placeholders();
                    $(mwd.body).addClass("dragStart");
                    $(mw.image_resizer).removeClass("active");
                    mw.wysiwyg.change(mw.dragCurrent);
                },
                stop: function () {
                    $(mwd.body).removeClass("dragStart");
                }
            });
            mw.drag.toolbar_modules();
        }
        mw.drag.the_drop();
    },
    properFocus: function (event) {
        if (mw.tools.hasClass(event.target, 'mw-row') || mw.tools.hasClass(event.target, 'mw-col')) {
            if (mw.tools.hasClass(event.target, 'mw-col')) {
                var tofocus = event.target.querySelector('.mw-col-container');
            }
            else {
                var i = 0,
                    cols = event.target.children,
                    l = cols.length;
                for (; i < l; i++) {
                    var _cleft = $(cols[i]).offset().left;
                    if (_cleft < event.pageX && (_cleft + cols[i].clientWidth) > event.pageX) {
                        var tofocus = cols[i].querySelector('.mw-col-container');
                        if (tofocus === null) {
                            cols[i].innerHTML = '<div class="mw-col-container">' + cols[i].innerHTML + '</div>';
                        }
                        var tofocus = cols[i].querySelector('.mw-col-container');
                        break;
                    }
                }
            }
            if (!!tofocus && tofocus.querySelector('.element') !== null) {
                var arr = tofocus.querySelectorAll('.element'), l = arr.length;
                var tofocus = arr[l - 1];

            }
            if (!!tofocus) {
                var range = document.createRange();
                var sel = window.getSelection();
                range.selectNodeContents(tofocus);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);

            }
        }
    },
    toolbar_modules: function (selector) {
        var items = selector || ".modules-list li";
        mw.$(items).draggable({
            revert: true,
            cursorAt: {
                top: -30
            },
            revertDuration: 0,
            start: function (a, b) {
                mw.isDrag = true;
                mw.dragCurrent = mw.GlobalModuleListHelper;
                $(mwd.body).addClass("dragStart");
                $(mw.image_resizer).removeClass("active");
            },
            stop: function () {
                mw.isDrag = false;
                mw.pauseSave = true;
                var el = this;
                $(mwd.body).removeClass("dragStart");
                setTimeout(function () {
                    mw.drag.load_new_modules();
                    mw.recommend.increase($(mw.dragCurrent).attr("data-module-name"));
                    mw.drag.toolbar_modules(el);
                }, 200);
            }
        });
        mw.$(items).mouseenter(function () {
            $(this).draggable("option", "helper", function () {
                var clone = $(this).clone(true);
                clone.appendTo(mwd.body)
                mw.GlobalModuleListHelper = clone[0];
                return clone[0];
            });
        });
        mw.$(items).bind("click mousedown mouseup", function (e) {
            e.preventDefault();
            if (e.type == 'click') {
                return false;
            }
            if (e.type == 'mousedown') {
                this.mousedown = true;
            }
            if (e.type == 'mouseup' && e.which == 1 && !!this.mousedown) {
                mw.$(items).each(function () {
                    this.mousedown = false
                });
                if (!mw.isDrag && mww.getSelection().rangeCount > 0 && mwd.querySelector('.mw_modal') === null && mw.modulesClickInsert) {
                    var html = this.outerHTML;
                    mw.wysiwyg.insert_html(html);
                    mw.drag.load_new_modules();
                }
            }
        });
    },
    the_drop: function () {
        if (!$(mwd.body).hasClass("bup")) {
            $(mwd.body).addClass("bup");

            $(mwd.body).bind("mouseup", function (event) {
                mw.image._dragcurrent = null;
                mw.image._dragparent = null;
                var sliders = mwd.getElementsByClassName("canvas-slider"), len = sliders.length, i = 0;
                for (; i < len; i++) {
                    sliders[i].isDrag = false;
                }
                if (!mw.isDrag) {
                    var target = event.target;


                    if ((target.tagName == 'I' || target.tagName == 'SPAN') && mw.wysiwyg.elementHasFontIconClass(target) && mw.tools.hasParentsWithClass(target, 'edit') && !mw.tools.hasParentsWithClass(target, 'dropdown') && !mw.tools.hasParentsWithClass(target, 'module')) {
                        $(window).trigger("onIconElementClick", target);

                    } else if ($(target).hasClass("element")) {
                        $(window).trigger("onElementClick", target);
                    }
                    else if (mw.tools.hasParentsWithClass(target, 'element')) {
                        $(window).trigger("onElementClick", $(target).parents(".element")[0]);
                    }
                    if ($(target).hasClass("mw_item")) {
                        $(window).trigger("onItemClick", target);
                    }
                    else if (mw.tools.hasParentsWithClass(target, 'mw_item')) {
                        $(window).trigger("onItemClick", $(target).parents(".mw_item")[0]);
                    }
                    if (target.tagName == 'IMG' && mw.tools.hasParentsWithClass(target, 'edit')) {
                        var order = mw.tools.parentsOrder(mw.mm_target, ['edit', 'module']);
                        if ((order.module == -1) || (order.edit > -1 && order.edit < order.module)) {
                            if (!mw.tools.hasParentsWithClass(target, 'mw-defaults')) {
                                $(window).trigger("onImageClick", target);
                            }
                            mw.wysiwyg.select_element(target);
                        }
                    }
                    if (target.tagName == 'BODY') {
                        $(window).trigger("onBodyClick", target);
                    }
                    if (mw.tools.hasClass(target, 'mw-empty') || mw.tools.hasParentsWithClass(target, 'mw-empty')) {
                        // mw.$("#modules-and-layouts").addClass("hovered");
                    }
                    else {
                        if (!mw.tools.hasClass(target, 'modules-and-layouts-holder') && !mw.tools.hasParentsWithClass(target, 'modules-and-layouts-holder')) {
                            mw.$("#modules-and-layouts").removeClass("hovered");
                        }
                    }
                    if (mw.tools.hasClass(target, 'mw-empty')) {
                        target.className = 'element';
                    }
                }
                if (!mw.isDrag) {
                    mw.drag.properFocus(event);
                }
                if (mw.isDrag) {
                    mw.isDrag = false;

                    mw.wysiwyg.change(mw.currentDragMouseOver);
                    $(mw.currentDragMouseOver).removeClass("currentDragMouseOver");
                    /*  var history_id = 'history_'+mw.random();

                     $(mw.dragCurrent).before('<input type="hidden" id="'+history_id+'" />');

                     var story = {
                     pos:history_id,
                     who:mw.dragCurrent
                     }
                     mw.drag.stories.push(story);
                     mw.drag.story_active+=1;  */

                    mw.$(".mw_dropable").hide();

                    setTimeout(function () {


                        mw.$("#modules-and-layouts.hovered").removeClass("hovered");
                        $(mw.dragCurrent).visibilityDefault().removeClass("mw_drag_current");
                        if (mw.currentDragMouseOver === null) {
                            return false;
                        }
                        ;
                        var curr_prev = $(mw.dragCurrent).prev();
                        var curr_next = $(mw.dragCurrent).next();
                        var curr_parent = $(mw.dragCurrent).parent();

                        var position = mw.dropable.data("position");
                        mw.dropable.removeClass("mw_dropable_onleaveedit");

 
						   if (mw.tools.hasClass(mw.currentDragMouseOver, 'mw-row') || mw.tools.hasClass(mw.currentDragMouseOver, 'row')) {
							     $(mw.currentDragMouseOver).before(mw.dragCurrent);
 								 return false;
						   } else if (mw.tools.hasClass(mw.currentDragMouseOver, 'mw-col-container')) {
                            if (position == 'top') {
                                $(mw.currentDragMouseOver).prepend(mw.dragCurrent);
                            }
                            else {
                                mw.currentDragMouseOver.appendChild(mw.dragCurrent);
                            }
                            return false;
                        }


                        if ($(mw.currentDragMouseOver).hasClass("mw-empty")) {

                            $(mw.currentDragMouseOver).before(mw.dragCurrent);
                            return false;
                        }
                        if ($(mw.currentDragMouseOver).hasClass("empty-element")) {
                            if (mw.tools.hasChildrenWithClass(mw.currentDragMouseOver.parentNode, 'mw-col-container')) {
                                $(mw.currentDragMouseOver.parentNode).children('.mw-col-container:last').append(mw.dragCurrent);
                            }
                            else {
                                $(mw.currentDragMouseOver).before(mw.dragCurrent);
                            }
                            return false;
                        }

                        if ($(mw.currentDragMouseOver).hasClass("edit")) {

                            if (hasAbilityToDropElementsInside(mw.currentDragMouseOver)) {
                                if (position == 'top') {
                                    $(mw.currentDragMouseOver).prepend(mw.dragCurrent);
                                }
                                else if (position == 'bottom') {
                                    $(mw.currentDragMouseOver).append(mw.dragCurrent);
                                }
                            }
                            else {
                                if (position == 'top') {
                                    $(mw.currentDragMouseOver).before(mw.dragCurrent);
                                }
                                else if (position == 'bottom') {
                                    $(mw.currentDragMouseOver).after(mw.dragCurrent);
                                }
                            }

                            return false;
                        }

                        if ($(mw.currentDragMouseOver).hasClass("module")) {

                            if (position == 'top') {
                                $(mw.currentDragMouseOver).before(mw.dragCurrent);
                            }
                            else if (position == 'bottom') {
                                $(mw.currentDragMouseOver).after(mw.dragCurrent);
                            }

                            else if (position == 'left') {

                                __createRow(mw.currentDragMouseOver, mw.dragCurrent, position);
                            }

                            else if (position == 'right') {
                                __createRow(mw.currentDragMouseOver, mw.dragCurrent, position);
                            }

                            return false;
                        }

                        if ($(mw.currentDragMouseOver).hasClass("mw-free-element")) {
                            $(mw.currentDragMouseOver).append(mw.dragCurrent);
                            $(window).trigger("onFreeEnter", mw.currentDragMouseOver);
                            return false;
                        }
                        if (mw.currentDragMouseOver == null || (mw.currentDragMouseOver.id === mw.dragCurrent.id)) {
                            $(mw.dragCurrent).visibilityDefault().removeClass("mw_drag_current");
                        }
                        else {

                            var hovered = $(mw.currentDragMouseOver);

                            if (mw.dragCurrent.tagName.toLowerCase() == 'li') {
                                mw.dragCurrent = $(mw.dragCurrent).clone(true);
                                $(mw.dragCurrent).removeAttr("id");
                            }
                            if (hovered.hasClass("empty-element")) {


                            }
                            else {
                                if (mw.currentDragMouseOver.parentNode !== null && !hasAbilityToDropElementsInside(mw.currentDragMouseOver.parentNode.nodeName)) {
                                    mw.currentDragMouseOver = mw.currentDragMouseOver.parentNode;
                                    var hovered = $(mw.currentDragMouseOver);
                                }
                                if (position == 'top') {
                                    $(mw.dragCurrent).removeClass("mw_drag_float");
                                    $(mw.dragCurrent).removeClass("mw_drag_float_right");
                                    hovered.removeClass("mw_drag_float");
                                    if (hovered.hasClass("edit") || dropInside(mw.currentDragMouseOver)) {
                                        hovered.prepend(mw.dragCurrent);
                                    }
                                    else {
                                        hovered.before(mw.dragCurrent);
                                    }
                                }
                                else if (position == 'bottom') {
                                    $(mw.dragCurrent).removeClass("mw_drag_float");
                                    $(mw.dragCurrent).removeClass("mw_drag_float_right");
                                    hovered.removeClass("mw_drag_float");
                                    if (hovered.hasClass("edit") || dropInside(mw.currentDragMouseOver)) {
                                        hovered.append(mw.dragCurrent);
                                    }
                                    else {
                                        hovered.after(mw.dragCurrent);
                                    }
                                    $(mw.dragCurrent).addClass("clear");
                                }
                                else if (position == 'left') {
                                    $(mw.dragCurrent).removeClass("clear");
                                    __createRow(hovered, mw.dragCurrent, position);
                                }
                                else if (position == 'right') {
                                    __createRow(hovered, mw.dragCurrent, position);
                                }
                            }
                            if (curr_prev.length == 0 && curr_next.hasClass("empty-element") && curr_parent.hasClass("temp_column") && !hovered.hasClass("empty-element")) {
                                var row = curr_parent.parents(".mw-row").eq(0);
                                curr_parent.remove();
                                row.find(".empty-element").remove();
                                row.replaceWith(row.find(".mw-col").html());
                            }
                        }
                        if (mw.have_new_items == true) {
                            mw.drag.load_new_modules();
                        }
                        $(mw.dragCurrent).show();
                        mw.drag.fixes();
                        setTimeout(function () {
                            mw.drag.fix_placeholders();
                        }, 40)
                        mw.resizable_columns();
                        mw.dropable.hide();

                        if (!$(mw.dragCurrent).parent().hasClass("element")) {
                            $(mw.dragCurrent).addClass("element");
                        }

                        $(mw.dragCurrent).css({
                            width: "",
                            height: "",
                        });

                        event.stopPropagation();

                        $(".currentDragMouseOver").removeClass("currentDragMouseOver");
                        mw.currentDragMouseOver = null;

                        $(mw.currentDragMouseOver).removeClass("currentDragMouseOver");
                    }, 77);
                }
            });
        }//toremove
    },
    /**
     * Various fixes
     *
     * @example mw.drag.fixes()
     */
    fixes: function () {
        mw.$(".edit .mw-col, .edit .mw-row").height('auto');
        $(mw.dragCurrent).css({
            top: '',
            left: ''
        });


        var more_selectors = '';
        var a = mw.drag.external_grids_col_classes;
        var index;
        for (index = a.length - 1; index >= 0; --index) {
            more_selectors += ',.edit .row > .' + a[index];
        }


        setTimeout(function () {
            mw.$(".edit .mw-col" + more_selectors).each(function () {
                var el = $(this);
                if (el.children().length == 0 || (el.children('.empty-element').length > 0) || el.children('.ui-draggable-dragging').length > 0) {
                    el.height('auto');
                    if (el.height() < el.parent().height()) {
                        el.height(el.parent().height());
                    }
                    else {
                        el.height('auto');
                    }
                }
                else {
                    el.children('.empty-element').height('auto');
                    el.height('auto');
                    el.parents('.mw-row:first').height('auto')
                }

                el.height('auto');
                var mwr = mw.tools.firstParentWithClass(this, 'mw-row');
                if (!!mwr) {
                    mwr.style.height = 'auto';
                }
                mw.tools.fixDeniedParagraphHierarchy();

            });
        }, 222);

        var els = mwd.querySelectorAll('div.element'), l = els.length, i = 0;
        if (l > 0) {
            for (; i < l; i++) {
                if (els[i].querySelector('p,div,li,h1,h2,h3,h4,h5,h6') === null) {
                    if (!mw.tools.hasClass(els[i].className, 'nodrop') && !mw.tools.hasClass(els[i].className, 'mw-empty')) {
                        els[i].innerHTML = '<p class="element">' + els[i].innerHTML + '</p>';
                    }
                }
            }
        }
    },
    /**
     * fix_placeholders in the layout
     *
     * @example mw.drag.fix_placeholders(isHard , selector)
     */
    fix_placeholders: function (isHard, selector) {


        var selector = selector || '.edit .row';

        var more_selectors2 = 'div.col-md';
        var a = mw.drag.external_grids_col_classes;
        var index;
        for (index = a.length - 1; index >= 0; --index) {
            more_selectors2 += ',div.' + a[index];
        }
        $(selector).each(function () {
            var el = $(this);
            el.children(more_selectors2).each(function () {
                var empty_child = $(this).children('*');
                if (empty_child.size() == 0) {
                    $(this).append('<div class="element" id="mw-element-' + mw.random() + '">' + '</div>');
                    var empty_child = $(this).children("div.element");
                }
            });
        });


        return false;


        //WARNING DEPRECATED below
        // return false;

        //if(isHard) {
        //
        //    var more_selectors = '.edit .column';
        //    var more_selectors2 = 'div.col-md';
        //    var a = mw.drag.external_grids_col_classes;
        //    var index;
        //    for (index = a.length - 1; index >= 0; --index) {
        //        more_selectors += ',.edit .row > .' + a[index];
        //        more_selectors2 += ',div.' + a[index];
        //    }
        //
        //
        //        $(more_selectors).each(function(){
        //            var el = $(this);
        //            d(more_selectors);
        //            d(more_selectors2);
        //            el.children(more_selectors2).each(function(){
        //
        //                var empty_child = $(this).children("div.empty-element");
        //                if(empty_child.length==0){
        //                    $(this).append('<div contenteditable="false" class="empty-element" id="mw-placeholder-'+mw.random()+'">' + '</div>');
        //                    var empty_child = $(this).children("div.empty-element");
        //                }
        //            });
        //        });
        //
        //
        //
        //}

        return false;


        if ($(window).width() < 768) {
            return false;
        }
        var selector = selector || '.mw-row';
        if (isHard) { //append the empty elements
            $(selector).each(function () {
                var el = $(this);
                el.children("div.mw-col").each(function () {
                    var empty_child = $(this).children("div.empty-element");
                    if (empty_child.length == 0) {
                        $(this).append('<div contenteditable="false" class="empty-element" id="mw-placeholder-' + mw.random() + '"><a class="delete_column" href="javascript:;" onclick="mw.delete_column(this);">Delete</a></div>');
                        var empty_child = $(this).children("div.empty-element");
                    }
                });
            });


        }
        //scale the empty elements
        mw.$("div.empty-element").css({position: 'absolute'});
        mw.$("div.empty-element").parent().height('auto');
        mw.$("div.empty-element").each(function () {
            var el = $(this);
            var the_row_height = el.parents(".mw-row").eq(0).height();
            var the_column_height = el.parent().height();
            el.css({height: the_row_height - the_column_height, position: 'relative'});
        });
    },


    /**
     * Removes contentEditable for ALL elements
     *
     * @example mw.drag.edit_remove();
     */
    edit_remove: function () {

        //	   	mw.$('.edit [contenteditable]').removeAttr("contenteditable");

    },


    fancynateLoading: function (module) {
        mw.$(module).addClass("module_loading");
        setTimeout(function () {
            $(module).addClass("module_activated");
            setTimeout(function () {
                mw.$(module).removeClass("module_loading module_activated");
            }, 510);
        }, 150);
    },

    /**
     * Scans for new dropped modules and loads them
     *
     * @example mw.drag.load_new_modules()
     * @return void
     */
    load_new_modules: function (callback) {
        mw.pauseSave = true;
        var need_re_init = false;
        mw.$(".edit .module-item").each(function (c) {

            mw._({
                selector: this,
                done: function (module) {
                    mw.drag.fancynateLoading(module);
                    mw.pauseSave = false;
                }
            }, true);
            need_re_init = true;
        });

        if (mw.have_new_items == true) {
            need_re_init = true;
        }
        if (need_re_init == true) {
            if (!mw.isDrag) {
                if (typeof callback === 'function') {
                    callback.call(this);
                }
            }
        }
        mw.have_new_items = false;
    },

    module_view: function (view) {
        var modal = mw.drag.module_settings(false, view)
        return modal;
    },
    module_settings: function (a, view) {
        return mw.tools.module_settings(a, view);
    },
    ModuleSettingsPopupLoaded: function (id) {

        mw.$("#" + id + " .mw_option_field").bind("change blur", function () {

            var refresh_modules11 = $(this).attr('data-refresh');

            if (refresh_modules11 == undefined) {
                var refresh_modules11 = $(this).attr('data-reload');
            }

            if (refresh_modules11 == undefined) {
                var refresh_modules11 = $(this).parents('.mw_modal_container:first').attr('data-settings-for-module');
                var refresh_modules11 = '#' + refresh_modules11;
            }

            var mname = $(this).parents('.module:first').attr('data-type');


            var og = $(this).attr('data-module-id');
            if (og == undefined) {
                var og = $(this).parents('.mw_modal_container:first').attr('data-settings-for-module')
            }


            if (this.type === 'checkbox') {
                var val = '';
                var items = mw.$('input[name="' + this.name + '"]');
                for (var i = 0; i < items.length; i++) {
                    var _val = items[i].value;
                    var val = items[i].checked == true ? (val === '' ? _val : val + ", " + _val) : val;

                }
            }
            else {
                val = this.value
            }


            var o_data = {
                option_key: $(this).attr('name'),
                option_group: og,
                option_value: val
                // chkboxes:checkboxes_obj
            }
            if (mname != undefined) {
                o_data.module = mname;
            }


            $.ajax({

                type: "POST",
                url: mw.settings.site_url + "api/save_option",
                data: o_data,
                success: function () {
                    if (refresh_modules11 != undefined && refresh_modules11 != '') {
                        refresh_modules11 = refresh_modules11.toString()

                        if (window.mw != undefined) {
                            if (window.mw.reload_module != undefined) {
                                window.mw.reload_module(refresh_modules11);
                                window.mw.reload_module('#' + refresh_modules11);
                            }
                        }

                    }

                    //  $(this).addClass("done");
                }
            });
        });


    },


    /**
     * Loads the module in the given dom element by the $update_element selector .
     *
     * @example mw.drag.load_module('user_login', '#login_box')
     * @param $module_name
     * @param $update_element
     * @return void
     */
    load_module: function ($module_name, $update_element) {
        var attributes = {};
        attributes.module = $module_name;
        var url1 = mw.settings.site_url + 'api/module';
        $($update_element).load_modules(url1, attributes, function () {
            window.mw_sortables_created = false;
        });

    },


    /**
     * Deletes element by id or selector
     *
     * @method mw.edit.delete_element(idobj)
     * @param Element id or selector
     */
    delete_element: function (idobj) {
        var id = mw.is.obj(idobj) ? $(idobj).data("curr").id : idobj;
        mw.tools.confirm(mw.settings.sorthandle_delete_confirmation_text, function () {
            if (id == "") {
                id = mw.settings.element_id;
            }


            mw.wysiwyg.change(mw.$('#' + id)[0])

            mw.$('#' + id).addClass("mwfadeout");
            setTimeout(function () {
                mw.$('#' + id).remove();
                mw.$('#module-settings-' + id).remove();
                $(mw.handle_module).css({left: '', top: ''});
                mw.drag.fix_placeholders(true);
            }, 300);

        });
    },

    /**
     * Creates columns of given row id
     *
     * @method mw.edit.create_columns(selector, $numcols)
     * @param selector - the id of the row element
     * @param $numcols - number of columns required
     */

    create_columns: function (selector, $numcols) {

        if (!$(selector).hasClass("active")) {

            var id = $(mw.handle_row).data("curr").id;
            $(mw.handle_row).children(".mw-col").removeClass("temp_column");
            $(mw.handle_row).find("a").removeClass("active");
            $(selector).addClass("active")
            var $el_id = id != '' ? id : mw.settings.mw - row_id;

            mw.settings.sortables_created = false;
            var $exisintg_num = mw.$('#' + $el_id).children(".mw-col").length;

            if ($numcols == 0) {
                var $numcols = 1;
            }
            var $numcols = parseInt($numcols);
            if ($exisintg_num == 0) {
                $exisintg_num = 1;
            }
            if ($numcols != $exisintg_num) {
                if ($numcols > $exisintg_num) {  //more columns
                    var i = $exisintg_num;
                    for (; i < $numcols; i++) {
                        var new_col = mwd.createElement('div');
                        new_col.className = 'mw-col';
                        new_col.innerHTML = '<div class="mw-col-container"></div>';
                        mw.$('#' + $el_id).append(new_col);
                        mw.drag.fix_placeholders(true, '#' + $el_id);
                    }
                    mw.resizable_columns();
                }
                else {  //less columns
                    var $cols_to_remove = $exisintg_num - $numcols;
                    if ($cols_to_remove > 0) {

                        var fragment = document.createDocumentFragment(), last_after_remove;

                        mw.$('#' + $el_id).children(".mw-col").each(function (i) {
                            if (i == ($numcols - 1)) {
                                last_after_remove = $(this);

                            }
                            else {
                                if (i > ($numcols - 1)) {
                                    if (this.querySelector('.mw-col-container') !== null) {
                                        mw.tools.foreachChildren(this, function () {
                                            if (mw.tools.hasClass(this.className, 'mw-col-container')) {
                                                fragment.appendChild(this);
                                            }
                                        });
                                    }
                                    $(this).remove();
                                }
                            }
                        });


                        var last_container = last_after_remove.find(".mw-col-container");

                        var nodes = fragment.childNodes, i = 0, l = nodes.length;

                        for (; i < l; i++) {
                            var node = nodes[i];
                            mw.$('.empty-element, .ui-resizable-handle', node).remove();
                            last_container.append(node.innerHTML);
                        }

                        //last_after_remove.resizable("destroy");
                        mw.$('#' + $el_id).children(".empty-element").remove();
                        mw.drag.fix_placeholders(true, '#' + $el_id);

                    }
                }

                var $exisintg_num = mw.$('#' + $el_id).children(".mw-col").size();
                var $eq_w = 100 / $exisintg_num;
                var $eq_w1 = $eq_w;
                mw.$('#' + $el_id).children(".mw-col").width($eq_w1 + '%');
            }
        }
    },
    saving: false,
    coreSave: function (data) {
        if (!data) return false;

        mw.drag.saving = true;
        var xhr = $.ajax({
            type: 'POST',
            url: mw.settings.api_url + 'save_edit',
            data: data,
            dataType: "json"
        });
        xhr.always(function () {
            mw.drag.saving = false;
        });
        return xhr;
    },
    parseContent: function (root) {
        var root = root || mwd.body;
        var doc = mw.tools.parseHtml(root.innerHTML);
        mw.$('.element-current', doc).removeClass('element-current');
        mw.$('.element-active', doc).removeClass('element-active');
        mw.$('.disable-resize', doc).removeClass('disable-resize');
        mw.$('.empty-element', doc).remove();
        mw.$('.empty-element', doc).remove();
        mw.$('.edit .ui-resizable-handle', doc).remove();
        mw.tools.classNamespaceDelete('all', 'ui-', doc, 'starts');
        mw.$("[contenteditable]", doc).removeAttr("contenteditable");
        var all = doc.querySelectorAll('[contenteditable]'), l = all.length, i = 0;
        for (; i < l; i++) {
            all[i].removeAttribute('contenteditable');
        }
        var all = doc.querySelectorAll('.module'),
            l = all.length,
            i = 0;
        for (; i < l; i++) {
            if (all[i].querySelector('.edit') === null) {
                all[i].innerHTML = '';
            }
        }
        return doc;
    },
    collectData: function (edits) {
        var l = edits.length,
            i = 0,
            helper = {},
            master = {};
        if (l > 0) {
            for (; i < l; i++) {
                helper.item = edits[i];
                var rel = mw.tools.mwattr(helper.item, 'rel');
                if (!rel) {
                    mw.$(helper.item).removeClass('changed');
                    mw.tools.foreachParents(helper.item, function (loop) {
                        var cls = this.className;
                        var rel = mw.tools.mwattr(this, 'rel');
                        if (mw.tools.hasClass(cls, 'edit') && mw.tools.hasClass(cls, 'changed') && (!!rel)) {
                            helper.item = this;
                            mw.tools.stopLoop(loop);
                        }
                    });
                }
                var rel = mw.tools.mwattr(helper.item, 'rel');
                if (!rel) continue;
                $(helper.item).removeClass('changed orig_changed');
                var content = helper.item.innerHTML;
                var attr_obj = {};
                var attrs = helper.item.attributes;
                if (attrs.length > 0) {
                    var ai = 0, al = attrs.length
                    for (; ai < al; ai++) {
                        attr_obj[attrs[ai].nodeName] = attrs[ai].nodeValue;
                    }
                }
                var obj = {
                    attributes: attr_obj,
                    html: content
                }
                var objdata = "field_data_" + i;

                master[objdata] = obj;
            }
        }
        return master;
    },
    getData: function (root) {
        var body = mw.drag.parseContent(root).body,
            edits = body.querySelectorAll('.edit.changed'),
            data = mw.drag.collectData(edits);
        return data;
    },
    saveDisabled: false,
    draftDisabled: false,
    save: function () {

        if (typeof saveStaticElementsStyles === 'function') {
            saveStaticElementsStyles();
        }

        if (mw.drag.saveDisabled) return false;
        var body = mw.drag.parseContent().body,
            edits = body.querySelectorAll('.edit.changed'),
            data = mw.drag.collectData(edits);

        if (mw.tools.isEmptyObject(data)) return false;

        $(window).trigger('saveStart', data);

        var xhr = mw.drag.coreSave(data);
        xhr.success(function (sdata) {
            mw.$('.edit.changed').removeClass('changed');
            mw.$('.orig_changed').removeClass('orig_changed');
            if (mwd.querySelector('.edit.changed') !== null) {
                mw.drag.save();
            }
            else {
                mw.askusertostay = false;
                $(window).trigger('saveEnd', sdata);
            }
        });
        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            $(window).trigger('saveFailed', textStatus, errorThrown);
        });
        return xhr;
    },
    saveDraftOld: '',
    DraftSaving: false,
    initDraft: false,
    saveDraft: function () {
        if (mw.drag.draftDisabled) return false;
        if (mw.drag.DraftSaving) return false;
        if (!mw.drag.initDraft) return false;
        if (mwd.body.textContent != mw.drag.saveDraftOld) {
            mw.drag.saveDraftOld = mwd.body.textContent;
            var body = mw.drag.parseContent().body,
                edits = body.querySelectorAll('.edit.changed'),
                data = mw.drag.collectData(edits);
            if (mw.tools.isEmptyObject(data)) return false;
            data['is_draft'] = true;
            mw.drag.DraftSaving = true;
            var xhr = mw.drag.coreSave(data);
            xhr.always(function (msg) {
                mw.drag.DraftSaving = false;
                mw.drag.initDraft = false;
                $(window).trigger('saveDraftCompleted');

            });
        }
    }
}


mw.pcWidthExtend = function (selector, howMuch, cache, final, len) {


    if (final < 3) {

        selector.eq(len - 1).width((cache[len - 1] + final) + "%");
    }
    else {
        var final = 0;
        selector.each(function (i) {
            var el = $(this);
            cache[i] = cache[i] + howMuch;
            final += cache[i];
            el.width(cache[i] + "%");
        });
        if (final < 100) {
            mw.pcWidthExtend(selector, howMuch, cache, final, len);
        }
    }
}


mw.px2pc = function (row) {

    var cache = [];
    var row = $(row);
    var width = row.width();
    var cols = row.children(".mw-col");
    var len = cols.length;
    cols.each(function () {
        var el = $(this);
        var w = ((/*Math.floor*/(el.width() / width * 100)));
        cache.push(w);
        el.css({
            width: w + "%"
        });
    });
    //check them after
    mwcsum = 0;
    var x = 0;
    for (; x < len; x++) {
        mwcsum += cache[x];
    }
    var final = 100 - mwcsum;
    if (final != 0) {

        mw.pcWidthExtend(cols, final / len, cache, final, len);
    }
}


mw.delete_column = function (which) {
    if (confirm(mw.settings.sorthandle_delete_confirmation_text)) {
        var row = $(which).parents(".mw-row").eq(0);
        var col = $(which).parents(".mw-col").eq(0);
        if (col.next(".mw-col").length == 0) {
            col.prev(".mw-col").resizable("destroy");
        }
        col.remove();
        if (row.find(".mw-col").length == 0) {
            row.remove();
        }
        else {
            mw.px2pc(row[0]);
        }
    }
}


/**
 * Makes resizable columns
 *
 * @example mw.resizable_columns()
 */
mw.resizable_columns = function () {

    return false;

    if ($(window).width() < 768) {
        return false;
    }


    $(".mw-row").each(function () {
        mw.px2pc(this);
    });
    mw.$('.mw-col').each(function () {
        if (!mw.tools.hasClass(this.className, 'ui-resizable')) {

            $el_id_column = $(this).attr('id');
            if ($el_id_column == undefined || $el_id_column == 'undefined') {
                $el_id_column = 'mw-column-' + mw.random();
                $(this).attr('id', $el_id_column);
            }

            $is_done = $(this).hasClass('ui-resizable')
            $ds = mw.settings.drag_started;
            $is_done = false;
            if ($is_done == false) {

                $inner_column = $(this).children(".mw-col:first");
                $prow = $(this).parent('.mw-row').attr('id');
                $no_next = false;


                $also = $(this).next(".mw-col");
                $also_check_exist = $also.size();
                if ($also_check_exist == 0) {
                    $no_next = true;
                    $also = $(this).prev(".mw-col");
                }

                $also_el_id_column = $also.attr('id');
                if ($also_el_id_column == undefined || $also_el_id_column == 'undefined' || $also_el_id_column == '') {
                    $also_el_id_column = 'mw-column-' + mw.random();
                    $also.attr('id', $also_el_id_column);
                }
                $also_reverse_id = $also_el_id_column;

                $also_inner_items = $inner_column.attr('id');
                if ($no_next == false) {
                    $handles = 'e'
                }
                else {
                    $handles = 'none'
                }


                if ($no_next == false) {

                    $last_c_w = $(this).parent('.mw-row').children('.mw-col').last().width();
                    $row_max_w = $(this).parent('.mw-row').width();


                    $(this).attr("data-also-rezise-item", $also_reverse_id);
                    mw.global_resizes = {
                        next: '',
                        sum: 0
                    }


                    $(this).resizable({
                        handles: $handles,
                        ghost: false,
                        containment: "parent",
                        greedy: true,
                        cancel: ".mw-sorthandle",
                        minWidth: 33,

                        resize: function (event, ui) {

                            mw.global_resizes.next.width(Math.floor(mw.global_resizes.sum - ui.size.width - 10));
                            if (mw.global_resizes.next.width() < 33) {
                                $(this).resizable("option", "maxWidth", ui.size.width);
                            }
                            mw.settings.resize_started = true;
                            var w = $(this).width();


                            $(this).find("img").each(function () {

                                $(this).width() <= w ? this.style.height = 'auto' : '';
                            });
                            var nw = mw.global_resizes.next.width();
                            mw.global_resizes.next.find("img").each(function () {
                                $(this).width() <= w ? this.style.height = 'auto' : '';
                            });
                        },
                        create: function (event, ui) {
                            var el = $(this);
                            el.find(".ui-resizable-e:first").append('<span class="resize_arrows"></span>');
                            el.mousemove(function (event) {
                                el.children(".ui-resizable-e").find(".resize_arrows:first").css({
                                    "top": (event.pageY - el.offset().top) + "px"
                                });
                            });

                            mw.px2pc(mw.tools.firstParentWithClass(this, 'mw-row'));
                        },
                        start: function (event, ui) {
                            $(mwd.body).addClass('Resizing');
                            $(this).resizable("option", "maxWidth", 9999);
                            $(".mw-col", '.edit').each(function () {
                                $(this).removeClass('selected');
                            });

                            mw.global_resizes.next = $(this).next().length > 0 ? $(this).next() : $(this).prev();

                            mw.global_resizes.sum = ui.size.width + mw.global_resizes.next.width();

                            $r = $(this).parent('.mw-row');

                            $row_w = $r.width();
                            mw.resizable_row_width = $row_w;


                            ui.element.addClass('selected');
                            mw.settings.resize_started = true;
                            $(this).parent().addClass('mw_resizing');
                            $(mw.image_resizer).removeClass("active");

                        },
                        stop: function (event, ui) {
                            $(this).parent().removeClass('mw_resizing');
                            mw.settings.resize_started = false;
                            mw.drag.fixes();
                            mw.drag.fix_placeholders();

                            mw.px2pc($(this).parents(".mw-row")[0]);


                            mw.wysiwyg.change(this)

                            $(mwd.body).removeClass('Resizing');
                            //mw.scale_cols();
                        }
                    });
                }
            }
        }

    });
}


mw.drop_regions = {
    enabled: mw.settings.regions,
    ContainsDisabledSideClass: function (el) {
        var cls = ['edit', 'mw-col', 'mw-row', 'mw-col-container'], i = 0, l = cls.length;
        var elcls = el.className;
        if (elcls == '') {
            return true
        }
        for (; i < l; i++) {
            if (mw.tools.hasClass(elcls, cls[i])) {
                return true;
            }
        }
        return false;
    },
    dropTimeout: null,
    global_drop_is_in_region: false,
    which: 'none',
    create: function (element) {
        var el = $(element);
        var height = el.height();
        var width = el.width();
        var offset = el.offset();
        var region_left = {
            l: offset.left,
            r: offset.left + width * 0.1,
            t: offset.top,
            b: offset.top + height
        }
        var region_right = {
            l: offset.left + width - width * 0.1,
            r: offset.left + width,
            t: offset.top,
            b: offset.top + height
        }
        return {
            left: region_left,
            right: region_right
        }
    },
    is_in_region: function (regions, event) {

        var l = regions.left;
        var r = regions.right;
        var mx = event.pageX;
        var my = event.pageY;
        if (mx > l.l && mx < l.r && my > l.t && my < l.b) {
            return 'left';
        }
        else if (mx > r.l && mx < r.r && my > r.t && my < r.b) {
            return 'right';
        }
        else {
            return 'none'
        }
    },
    init: function (element, event, callback) {

        if (mw.drop_regions.dropTimeout == null) {
            mw.drop_regions.dropTimeout = setTimeout(function () {
                if (mw.drop_regions.enabled) {
                    var regions = mw.drop_regions.create(element);
                    var is_in_region = mw.drop_regions.is_in_region(regions, event);
                    if (is_in_region == 'left' && !mw.drop_regions.ContainsDisabledSideClass(element)) {

                        callback.call(this, 'left');
                        mw.drop_regions.global_drop_is_in_region = true;
                        mw.drop_regions.which = 'left';
                    }
                    else if (is_in_region == 'right' && !mw.drop_regions.ContainsDisabledSideClass(element)) {
                        callback.call(this, 'right');
                        mw.drop_regions.global_drop_is_in_region = true;
                        mw.drop_regions.which = 'right';
                    }
                    else {
                        mw.drop_regions.global_drop_is_in_region = false;
                        mw.drop_regions.which = 'none';
                    }
                }
                else {
                    mw.drop_regions.global_drop_is_in_region = false;
                    mw.drop_regions.which = 'none';
                }
                mw.drop_regions.dropTimeout = null;
            }, 37);
        }
    }
}


mw.history = {

    /**
     * Microweber history  class
     *
     * @class mw.history
     */

    /**
     * Loads the history module
     *
     * @method mw.history.init()
     */
    init: function () {
        data = {}
        data.module = 'admin/mics/edit_block_history';
        data.page_id = mw.settings.page_id;
        data.post_id = mw.settings.post_id;
        data.no_wrap = '1';
        data.category_id = mw.settings.category_id;
        data.for_url = document.location.href;
        mw.$('#mw-history-panel').load(mw.settings.site_url + 'api/module', data);
    },

    /**
     * Loads the history from file
     *
     * @method mw.history.load()
     */
    load: function ($id) {
        mw.on.DOMChangePause = true;
        if ($id != undefined) {
            $.ajax({
                type: 'POST',
                url: mw.settings.site_url + "api/get_content_field_draft",
                data: {
                    id: $id
                },
                dataType: "json",
                success: function (data) {
                    if (data.constructor !== [].constructor) {
                        return false;
                    }
                    var l = data.length, i = 0;
                    for (; i < l; i++) {
                        var data_field = data[i];
                        if (typeof data_field.field !== 'undefined' && typeof data_field.rel !== 'undefined') {
                            var field = data_field.field;
                            var rel = data_field.rel;
                            mw.$('.edit[rel="' + rel + '"][field="' + field + '"]').html(data_field.value);
                        } else if (typeof data_field.field !== 'undefined' && typeof data_field.rel_type !== 'undefined') {
                            var field = data_field.field;
                            var rel = data_field.rel_type;
                            mw.$('.edit[rel="' + rel + '"][field="' + field + '"]').html(data_field.value);
                        }
                    }
                    mw.$(".edit.changed").removeClass("changed");
                    setTimeout(function () {
                        mw.drag.fix_placeholders(true);
                        mw.resizable_columns();
                        mw.on.DOMChangePause = false;
                    }, 200);
                    mw.$(".hasdraft").remove();
                }
            })
        }
    }
}


__createRow = function (hovered, mw_drag_current, pos) {
    var hovered = $(hovered);
    var row = mwd.createElement('div');
    row.className = 'mw-row';
    row.id = "element_" + mw.random();
    row.innerHTML = "<div class='mw-col temp_column' style='width:50%'><div class='mw-col-container'></div></div><div class='mw-col' style='width:50%'><div class='mw-col-container'></div></div>";
    hovered.before(row);
    hovered.addClass("element");

    if (pos == 'left') {
        $(row).find(".mw-col-container").eq(0).append(mw_drag_current);
        $(row).find(".mw-col").eq(0).append('<div contenteditable="false" class="empty-element" id="mw-placeholder-' + mw.random() + '"><a class="delete_column" href="javascript:;" onclick="mw.delete_column(this);">Delete</a></div>');
        $(row).find(".mw-col-container").eq(1).append(hovered);
        $(row).find(".mw-col").eq(1).append('<div contenteditable="false" class="empty-element" id="mw-placeholder-' + mw.random() + '"><a class="delete_column" href="javascript:;" onclick="mw.delete_column(this);">Delete</a></div>');

    }
    else if (pos == 'right') {
        $(row).find(".mw-col-container").eq(0).append(hovered);
        $(row).find(".mw-col").eq(0).append('<div contenteditable="false" class="empty-element" id="mw-placeholder-' + mw.random() + '"><a class="delete_column" href="javascript:;" onclick="mw.delete_column(this);">Delete</a></div>');
        $(row).find(".mw-col-container").eq(1).append(mw_drag_current);
        $(row).find(".mw-col").eq(1).append('<div contenteditable="false" class="empty-element" id="mw-placeholder-' + mw.random() + '"><a class="delete_column" href="javascript:;" onclick="mw.delete_column(this);">Delete</a></div>');
    }


    setTimeout(function () {
        mw.drag.fix_placeholders(true);
        mw.resizable_columns();
    }, 200);
}


dropInside = function (el) {
    if (el.tagName == 'IMG') {
        return false;
    }
    if (!hasAbilityToDropElementsInside(el)) {
        return false;
    }

    var css = mw.CSSParser(el).get;
    var bg = css.background();
    var padding = css.padding(true);
    var radius = css.radius(true);
    var shadow = css.shadow(true);
    var border = css.border(true);

    if ((bg.color != 'transparent' && bg.color != 'rgba(0, 0, 0, 0)') || bg.image != 'none') {
        return true;
    }
    if (padding.top > 0 || padding.right > 0 || padding.bottom > 0 || padding.left > 0) {
        return true;
    }
    if (radius.tl > 0 || radius.tr > 0 || radius.br > 0 || radius.bl > 0) {
        return true;
    }
    if (shadow.color != 'none') {
        return true;
    }

    if (border.top.width > 0 || border.right.width > 0 || border.bottom.width > 0 || border.left.width > 0) {
        return true;
    }

    return false;
}


/* Toolbar */


mw.tools.addClass(mwd.body, 'mw-live-edit')


mw.designTool = {
    position: function (rel) {
        var rel = rel || mw.$("#design_bnav");

        if (rel.length == 0) {
            return false;

        }


        var ww = $(window).width();
        var wh = $(window).height();

        var off = rel.offset();
        var w = rel.width();
        var h = rel.height();

        var sumWidth = off.left + w;
        var sumHeight = off.top + h;

        sumWidth > ww ? rel.css('left', ww - w - 20) : '';
        sumHeight > wh ? rel.css('top', wh - h - 20) : '';
    }
}


$(window).bind("load", function () {


    mw.$(".mw-dropdown_type_navigation a").each(function () {
        var el = $(this);
        var li = el.parent();
        el.attr("href", "javascript:;");
        var val = li.dataset("category-id");
        li.attr("value", val);
    });

    mw.$("#module_category_selector").change(function () {
        var val = $(this).getDropdownValue();

        if (val == 'all') {
            mw.$(".list-modules li").show();
            return false;
        }
        (val != -1 && val != "-1") ? mw.tools.toolbar_sorter(Modules_List_modules, val) : '';
    });
    mw.$("#elements_category_selector").change(function () {
        var val = $(this).getDropdownValue();

        if (val == 'all') {
            mw.$(".list-elements li").show();
            return false;
        }
        (val != -1 && val != "-1") ? mw.tools.toolbar_sorter(Modules_List_elements, val) : '';
    });


    mw.$("#design_bnav, .mw_ex_tools").addClass(mw.cookie.ui("designtool"));


    var design_pos = mw.cookie.ui("designtool_position");

    if (design_pos != "") {
        var design_pos = design_pos.split("|");
        mw.$("#design_bnav").css({
            top: design_pos[0] + "px",
            left: design_pos[1] + "px"
        });
    }

    mw.designTool.position();


    mw.$(".mw_ex_tools").click(function () {

        var rel = mw.$($(this).attr("href"));

        rel.toggleClass('active');

        $(this).toggleClass('active');

        mw.cookie.ui("designtool", rel.hasClass("active") ? "active" : "");

        mw.designTool.position(rel);

        return false;
    });


    mw.$(".ts_main_li").mouseenter(function () {
        mw.session.checkPause = true;
        mw.pauseSave = true;
        var selected_el = mwd.querySelector('.element-current');
        var parentedit = mw.tools.firstParentWithClass(selected_el, 'edit');
        $(parentedit).addClass('changed');

        if (!mw.$("#design_bnav").hasClass('ui-draggable-dragging')) {
            $(this).addClass("hovered");
            mw.$(".ts_main_ul .ts_action").invisible();
            mw.$(".ts_main_ul .ts_action").css({left: "100%", top: 0});
            var toshow = mw.$(this.querySelector('.ts_action'));
            if (toshow.length === 0) return false;
            toshow.visible();
            toshow.css("top", 0);
            var offset = toshow.offset();
            var width = toshow.outerWidth();
            var height = toshow.outerHeight();
            var window_w = $(window).width();
            var window_h = $(window).height();
            var scroll = $(window).scrollTop();

            toshow.css({
                left: ((offset.left + width) < window_w) ? "100%" : -width,
                top: (offset.top + height - scroll) < window_h ? 0 : -(offset.top + height - scroll - window_h)
            });

        }

    });
    mw.$(".ts_main_li").mouseleave(function () {
        mw.pauseSave = false;
        $(this).removeClass("hovered");
        mw.session.checkPause = false;
    });


    mw.$(".ts_main_li .ts_action_item").mouseenter(function () {
        $(this).parent().find(".ts_action").invisible();
        $(this).parent().find(".ts_action").css("left", "100%");
        var toshow = $(this).find(".ts_action:first");
        var offset = toshow.offset();
        if (typeof offset === 'object' && offset !== null) {

            var width = toshow.outerWidth();
            var window_w = $(window).width();
            if ((offset.left + width) < window_w) {
                toshow.css({
                    left: "100%",
                    visibility: 'visible'
                });
            }
            else {
                toshow.css({
                    left: -width,
                    visibility: 'visible'
                });
            }
        }
    });
    mw.$(".toolbar_bnav").hover(function () {
        $(this).addClass("toolbar_bnav_hover");
    }, function () {
        $(this).removeClass("toolbar_bnav_hover");
    });

});

mw.$(".ts_action_item").mouseenter(function () {
    var toshow = $(this).find(".ts_action:first");

    toshow.css({
        left: "100%",
        visibility: 'visible'
    });
});


$.fn.notmouseenter = function () {
    return this.filter(function () {
        var el = $(el);
        var events = el.data("events");
        return (events == undefined || events.mouseover == undefined || events.mouseover[0].origType != 'mouseenter');
    });
};

$.fn.notclick = function () {
    return this.filter(function () {
        var el = $(el);
        var events = el.data("events");
        return (events == undefined || events.click == undefined);
    });
};


$.expr[':'].isHidden = function (obj, index, meta, stack) {
    return mw.is.invisible(obj);
};
$.expr[':'].isVisible = function (obj, index, meta, stack) {
    return window.getComputedStyle(obj, null).visibility === 'visible';
};


PagesFrameSRCSet = false;


$(document).ready(function () {
    mw.wysiwyg.prepare();
    mw.wysiwyg.init();
    mw.$(".edit a, #mw-toolbar-right a").click(function () {
        var el = this;
        if (!el.isContentEditable) {
            if (el.onclick === null) {
                if (!(el.href.indexOf("javascript:") === 0 || el.href == '#' || $(el).attr("href").indexOf('#') == 0 || typeof el.attributes['href'] == 'undefined')) {
                    return mw.beforeleave(this.href);
                }
            }
        }
    });


    $(window).scroll(function () {
        if ($(window).scrollTop() > 10) {
            mw.tools.addClass(mwd.getElementById('live_edit_toolbar'), 'scrolling');
        }
        else {
            mw.tools.removeClass(mwd.getElementById('live_edit_toolbar'), 'scrolling');
        }

    });


    mw.$("#live_edit_toolbar").hover(function () {
        $(mwd.body).addClass("toolbar-hover");
    }, function () {
        $(mwd.body).removeClass("toolbar-hover");
    });


    mw.$("#modules-and-layouts").click(function (e) {
        if (e.target === this) {
            $(this).addClass("hovered");
        }
    });
    mw.wysiwyg.init_editables();

});

mw.toolbar = {
    fixPad: function () {
        mwd.body.style.paddingTop = mw.toolbar.minTop + mw.$("#live_edit_toolbar").height() /*+ mw.$("#modules-and-layouts").height()*/ + 'px';
    },
    setComponents: function (a) {
        mw.$("#modules-and-layouts, .tst-modules").addClass("active");
        modules_switcher.value = '';
        mw.$("#modules-and-layouts .module-item").show();
        mw.$(".modules_bar_slide_left").hide();
        mw.$(".modules_bar").scrollLeft(0);
        mw.cookie.ui("#modules-and-layouts,#tab_modules,.tst-modules", "true");
        mw.$(".modules-layouts-menu .create-content-dropdown-list").hide();
        if (a == 'layouts') {
            mw.$(modules_switcher).dataset("for", "layouts");
            mw.$(modules_switcher).attr("placeholder", "Layouts");
            $(modules_switcher).focus();
            modules_switcher.searchIn = 'Modules_List_elements';
            mw.tools.addClass(tab_layouts, 'active');
            mw.tools.removeClass(tab_modules, 'active');
        }
        else if (a == 'modules') {
            mw.$(modules_switcher).dataset("for", "modules");
            mw.$(modules_switcher).attr("placeholder", "Modules");
            $(modules_switcher).focus();
            modules_switcher.searchIn = 'Modules_List_modules';
            mw.tools.addClass(tab_modules, 'active');
            mw.tools.removeClass(tab_layouts, 'active');
        }
    },
    ComponentsShow: function (what) {
        mw.toolbar.setComponents(what);
        var mod_switch = mwd.getElementById('mod_switch');
        if (what == 'layouts') {
            mod_switch.innerHTML = mw.msg.switch_to_modules;
            $(mod_switch).dataset("action", 'modules');
        }
        else {
            mod_switch.innerHTML = mw.msg.switch_to_layouts;
            $(mod_switch).dataset("action", 'layouts');
        }
        $(mwd.getElementById('modules-and-layouts')).addClass('hovered');

    },
    toolbar_searh: function (obj, value) {
        var value = value.toLowerCase();
        mw.$(".modules_bar").scrollLeft(0);
        for (var item in obj) {
            var child_object = obj[item];
            var id = child_object.id;
            var title = child_object.title.toLowerCase();
            var description = child_object.description || false;
            var item = $(document.getElementById(id));
            if (title.contains(value) || (!!description && description.toLowerCase().contains(value))) {
                item.show();
            }
            else {
                item.hide();
            }
        }
    },
    tip: function (el, txt) {
        if (!mw.toolbar.tooltip) {
            mw.toolbar.tooltip = mw.tooltip({});
        }
    }
}


mw.setLiveEditor = function () {
    $(mwd.querySelector('.editor_wrapper_tabled')).css({
        marginLeft: $(mwd.querySelector('.toolbar-sections-tabs')).outerWidth(true),
        marginRight: $(mwd.querySelector('#mw-toolbar-right')).outerWidth(true),
        left: 0,
        width: $(window).width() - $(mwd.querySelector('.toolbar-sections-tabs')).outerWidth(true) - $(mwd.querySelector('#mw-toolbar-right')).outerWidth(true)
    })
}


$(window).bind("load", function () {

    mw.wysiwyg.prepareContentEditable();
    mw.setLiveEditor();

    mw.$("#history_dd").hover(function () {
        $(this).addClass("hover");
    }, function () {
        $(this).removeClass("hover");
    });


    mw.image.resize.init(".element-image");
    $(mwd.body).mousedown(function (event) {

        if (mw.$(".editor_hover").length === 0) {
            $(mw.wysiwyg.external).empty().css("top", "-9999px");
            $(mwd.body).removeClass('hide_selection');
        }
        if (!mw.$("#history_dd").hasClass("hover")) {
            $("#historycontainer").hide();
        }
        if (mw.$(".toolbars-search.active").length === 0) {
            mw.$(".mw-autocomplete-cats").hide();
        }
        else {
            mw.$(".mw-autocomplete-cats").show();
        }
        if (!mw.tools.hasClass(event.target, 'mw_handle_row')
            && !mw.tools.hasParentsWithClass(event.target, 'mw_handle_row')
            && !mw.tools.hasClass(event.target, 'mw-row')
            && !mw.tools.hasParentsWithClass(event.target, 'mw-row')) {
            $(mw.handle_row).css({
                top: "",
                left: ""
            });
            mw.$(".mw-row").each(function () {
                this.clicked = false;
            });
        }
        if (mw.tools.hasClass(event.target, 'mw-row')) {
            mw.$(".mw-row").each(function () {
                if (this !== event.target) {
                    this.clicked = false;
                }
            });
            event.target.clicked = true;
        }
        else if (mw.tools.hasParentsWithClass(event.target, 'mw-row')) {
            var row = mw.tools.firstParentWithClass(event.target, 'mw-row');
            mw.$(".mw-row").each(function () {
                if (this !== row) {
                    this.clicked = false;
                }
            });
            row.clicked = true;
        }
    });

    mw.$("#liveedit_wysiwyg").mousedown(function () {
        if (mw.$(".mw_editor_btn_hover").length == 0) {
            mw.mouseDownOnEditor = true;
            $(this).addClass("hover");
        }
    });
    mw.$("#liveedit_wysiwyg").mouseup(function () {
        mw.mouseDownOnEditor = false;
        $(this).removeClass("hover");
    });

    $(document.body).mouseup(function (event) {
        mw.target.item = event.target;
        mw.target.tag = event.target.tagName.toLowerCase();
        mw.mouseDownOnEditor = false;
        mw.SmallEditorIsDragging = false;
        if (!mw.image.isResizing &&
            mw.target.tag != 'img' &&
            event.target !== mw.image_resizer && !mw.tools.hasClass(mw.target.item.className, 'image_change') && !mw.tools.hasClass(mw.target.item.parentNode.className, 'image_change') && $(mw.image_resizer).hasClass("active")) {
            $(mw.image_resizer).removeClass("active");
        }
    });

    mw.tools.sidebar();

    if (typeof mw.hasDraft === 'object') {
        var html = ""
            + "<div class='hasdraft'>"
            + "<p>Load last Draft?</p>"
            + "<span class='mw-ui-btn mw-ui-btn-small mw-ui-btn-green' onclick='mw.history.load(\"" + mw.hasDraft.draft + "\")'>Yes</span>"
            + "<span class='mw-ui-btn mw-ui-btn-small mw-ui-btn-red' onclick='$(this.parentNode).remove();'>No</span>"
            + "</div>";

        mw.$("#mw_tabs_small").after(html);

        setTimeout(function () {
            mw.$(".hasdraft").addClass("active");
        }, 10000);

    }


    mw.toolbar.fixPad();


    /*  WYSIWYG */


    $(window).bind("mouseup", function (e) {

        var sel = window.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0),
                common = mw.wysiwyg.validateCommonAncestorContainer(range.commonAncestorContainer);

            if (mw.tools.hasClass(common, 'edit') || mw.tools.hasParentsWithClass(common, 'edit')) {
                var nodrop_state = !mw.tools.hasClass(common, 'nodrop') && !mw.tools.hasParentsWithClass(common, 'nodrop');
                if (nodrop_state) {
                    mw.wysiwyg.enableEditors();
                }
                else {
                    mw.wysiwyg.disableEditors();
                }
            }
            else {
                mw.wysiwyg.disableEditors();
            }
        }

        /* if(mw.tools.hasClass(e.target, 'mw_editor') || mw.tools.hasParentsWithClass(e.target, 'mw_editor')){
         if(mw.tools.hasClass(e.target, 'mw-editor-disabled') || mw.tools.hasParentsWithClass(e.target, 'mw-editor-disabled')){
         mw.wysiwyg.disableEditors();
         }
         else{
         var common = mw.wysiwyg.validateCommonAncestorContainer(window.getSelection().getRangeAt(0).commonAncestorContainer);
         if(mw.tools.hasClass(common, 'nodrop') || mw.tools.hasParentsWithClass(common, 'nodrop')){
         mw.wysiwyg.disableEditors();
         return false;
         }
         }
         } */

        var sel = window.getSelection();
        if (sel.rangeCount > 0) {


            var r = sel.getRangeAt(0);

            var cac = mw.wysiwyg.validateCommonAncestorContainer(r.commonAncestorContainer);
        }

        // if((mw.tools.hasParentsWithClass(e.target, 'edit') || mw.tools.hasClass(e.target, 'edit') ||  mw.tools.hasParentsWithClass(e.target, 'mw-admin-editor-area')) && (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed)){
        if ((sel.rangeCount > 0 ) && ((mw.tools.hasParentsWithClass(cac, 'edit') || mw.tools.hasClass(cac, 'edit') || mw.tools.hasParentsWithClass(cac, 'mw-admin-editor-area')) && (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed))) {

            if (sel.rangeCount > 0 && ($.contains(e.target, cac) || $.contains(cac, e.target) || cac === e.target)) {


                setTimeout(function () {

                    if (cac.isContentEditable && !sel.isCollapsed) {


                        if (typeof(window.getSelection().getRangeAt(0).getClientRects()[0]) == 'undefined') {
                            return;
                        }


                        mw.smallEditorCanceled = false;
                        var top = e.pageY - mw.smallEditor.height() - window.getSelection().getRangeAt(0).getClientRects()[0].height;
                        mw.smallEditor.css({
                            visibility: "visible",
                            opacity: 0.7,
                            top: (top > 10 ? top : 10),
                            left: e.pageX + mw.smallEditor.width() < $(window).width() ? e.pageX : ($(window).width() - mw.smallEditor.width() - 5 )
                        });

                    }
                    else {
                        mw.smallEditorCanceled = true;
                        mw.smallEditor.css({
                            visibility: "hidden"
                        });
                    }

                }, 33);

            }
        }
        else {
            if (!mw.tools.hasParentsWithClass(e.target, 'mw_small_editor')) {

                if (typeof(mw.smallEditor) != 'undefined') {

                    mw.smallEditorCanceled = true;
                    mw.smallEditor.css({
                        visibility: "hidden"
                    });
                }


            }
        }
        setTimeout(function () {
            if (window.getSelection().rangecount > 0 && window.getSelection().getRangeAt(0).collapsed) {
                if (typeof(mw.smallEditor) != 'undefined') {
                    mw.smallEditorCanceled = true;
                    mw.smallEditor.css({
                        visibility: "hidden"
                    });
                }
            }
        }, 39);
    });


    mw.smallEditorOff = 150;

    $(window).bind("mousemove", function (e) {
        var isCollapsed = window.get
        if (!!mw.smallEditor && !mw.isDrag && !mw.smallEditorCanceled && !mw.smallEditor.hasClass("editor_hover")) {
            var off = mw.smallEditor.offset();
            if (typeof off !== 'undefined') {
                if (((e.pageX - mw.smallEditorOff) > (off.left + mw.smallEditor.width())) || ((e.pageY - mw.smallEditorOff) > (off.top + mw.smallEditor.height())) || ((e.pageX + mw.smallEditorOff) < (off.left)) || ((e.pageY + mw.smallEditorOff) < (off.top))) {
                    mw.smallEditor.css("visibility", "hidden");
                    mw.smallEditorCanceled = true;
                }
                else {
                    //mw.smallEditor.css("visibility", "visible");
                }
            }
        }
    });
    $(window).bind("scroll", function (e) {
		if(typeof(mw.smallEditor) != "undefined"){
			
			mw.smallEditor.css("visibility", "hidden");
			mw.smallEditorCanceled = true;
		}
    });
    mw.$("#live_edit_toolbar,#mw_small_editor").bind("mousedown", function (e) {


        if (e.target.nodeName != 'INPUT' && e.target.nodeName != 'SELECT' && e.target.nodeName != 'OPTION' && e.target.nodeName != 'CHECKBOX') {
            e.preventDefault();
        }
        if (!mw.tools.hasParentsWithClass(e.target, 'mw_small_editor')) {
            mw.smallEditor.css("visibility", "hidden");
            mw.smallEditorCanceled = true;
        }
    });


    /*  /WYSIWYG */


});

$(window).resize(function () {
    mw.tools.module_slider.scale();
    mw.tools.toolbar_slider.ctrl_show_hide();
    mw.designTool.position();
    mw.setLiveEditor();
});

mw.preview = function () {
    var url = mw.url.removeHash(window.location.href);
    var url = mw.url.set_param('preview', true, url);
    window.open(url, '_blank');
    window.focus();
}

mw.iphonePreview = function () {
    var url = mw.url.removeHash(window.location.href);
    var url = mw.url.set_param('preview', true, url);
    mw.tools.modal.frame({
        url: url,
        width: 320,
        height: 592,
        template: 'modal-iphone'
    });
    mw.tools.modal.overlay();
}


mw.quick = {
    w: '80%',
    h: '90%',
    page: function () {
        var modal = mw.tools.modal.frame({
            url: mw.settings.api_url + "module/?type=content/edit_page&live_edit=true&quick_edit=false&id=mw-quick-page&recommended_parent=" + mw.settings.page_id,
            width: mw.quick.w,
            height: mw.quick.h,
            name: 'quick_page',
            overlay: true,
            title: 'New Page'
        });
        $(modal.main).addClass('mw-add-content-modal');
        modal.overlay.style.backgroundColor = "white";
    },
    category: function () {
        var modal = mw.tools.modal.frame({
            url: mw.settings.api_url + "module/?type=categories/edit_category&live_edit=true&quick_edit=false&id=mw-quick-category&recommended_parent=" + mw.settings.page_id,
            width: mw.quick.w,
            height: mw.quick.h,
            name: 'quick_page',
            overlay: true,
            title: 'New Category'
        });
        $(modal.main).addClass('mw-add-content-modal');
        modal.overlay.style.backgroundColor = "white";
    },
    edit: function (id, content_type, subtype, parent, category) {
		var str = "";
		
		if(typeof(parent) != 'undefined'){
			 var str = "&recommended_parent=" + parent;
		}
       
        if (content_type != undefined && content_type != '') {
            str = str + '&content_type=' + content_type;
        }
		
		if(typeof(category) != 'undefined'){
            str = str + '&category=' + category;
		}

        if (subtype != undefined && subtype != '') {
            str = str + '&subtype=' + subtype;
        }
        var modal = mw.tools.modal.frame({
            url: mw.settings.api_url + "module/?type=content/edit&live_edit=true&quick_edit=false&is-current=true&id=mw-quick-page&content-id=" + id + str,
            width: mw.quick.w,
            height: mw.quick.h,
            name: 'quick_page',
            overlay: true,
            title: 'Edit content'
        });
        $(modal.main).addClass('mw-add-content-modal');
        modal.overlay.style.backgroundColor = "white";
    },
    page_2: function () {
        var modal = mw.tools.modal.frame({
            url: mw.settings.api_url + "module/?type=content/quick_add&live_edit=true&id=mw-new-content-add-ifame",
            width: mw.quick.w,
            height: mw.quick.h,
            name: 'quick_page',
            overlay: true,
            title: 'New Page'
        });
        $(modal.main).addClass('mw-add-content-modal');
        modal.overlay.style.backgroundColor = "white";
    },
    post: function () {
        var modal = mw.tools.modal.frame({
            url: mw.settings.api_url + "module/?type=content/edit_page&live_edit=true&quick_edit=false&id=mw-quick-post&subtype=post&parent-page-id=" + mw.settings.page_id + "&parent-category-id=" + mw.settings.category_id,
            width: mw.quick.w,
            height: mw.quick.h,
            name: 'quick_post',
            overlay: true,
            title: 'New Post'
        });
        $(modal.main).addClass('mw-add-content-modal');
        modal.overlay.style.backgroundColor = "white";
    },
    product: function () {
        var modal = mw.tools.modal.frame({
            url: mw.settings.api_url + "module/?type=content/edit_page&live_edit=true&quick_edit=false&id=mw-quick-product&subtype=product&parent-page-id=" + mw.settings.page_id + "&parent-category-id=" + mw.settings.category_id,
            width: mw.quick.w,
            height: mw.quick.h,
            name: 'quick_product',
            overlay: true,
            title: 'New Product'
        });
        $(modal.main).addClass('mw-add-content-modal');
        modal.overlay.style.backgroundColor = "white";


    }
}


mw.beforeleave_html = ""
+ "<div class='mw-before-leave-container'>"
+ "<p>Leave page by choosing an option</p>"
+ "<span class='mw-ui-btn mw-ui-btn-important'>" + mw.msg.before_leave + "</span>"
+ "<span class='mw-ui-btn mw-ui-btn-notification' >" + mw.msg.save_and_continue + "</span>"
+ "<span class='mw-ui-btn' onclick='mw.tools.modal.remove(\"modal_beforeleave\")'>" + mw.msg.cancel + "</span>"
+ "</div>";

mw.beforeleave = function (url) {
    if (mw.askusertostay && mw.$(".edit.orig_changed").length > 0) {
        if (mwd.getElementById('modal_beforeleave') === null) {
            var modal = mw.tools.modal.init({
                html: mw.beforeleave_html,
                name: 'modal_beforeleave',
                width: 470,
                height: 230,
                template: 'mw_modal_basic'
            });

            var save = modal.container.querySelector('.mw-ui-btn-notification');
            var go = modal.container.querySelector('.mw-ui-btn-important');

            $(save).click(function () {
                $(mwd.body).addClass("loading");
                mw.tools.modal.remove(modal);
                mw.drag.save(undefined, function () {
                    mw.askusertostay = false;
                    window.location.href = url;
                });
            });
            $(go).click(function () {
                mw.askusertostay = false;
                window.location.href = url;
            });
        }

        return false;
    }
}



