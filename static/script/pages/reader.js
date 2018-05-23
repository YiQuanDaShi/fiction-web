
//用立即执行的匿名函数，创建一个命名空间
window.jQuery = $;
(function() {

    //TODO 封装一些使用频率较高的方法
    var Util = (function() {

        //TODO 封装localStorage方法
        //存储的key加个前缀，防止被误用
        var prefix = 'ficiton_reader_';
        var StorageSetter = function(key, val) {
            return localStorage.setItem(prefix + key, val);
        }
        var StorageGetter = function(key) {
            return localStorage.getItem(prefix + key);
        }

        // 将得到的跨域url传进来，然后用jsonp取得数据，
        // 并将其解析为json格式数据，再调用callback处理该json数据,这里可以使用promise处理
        function getBSONP(url, callback) {
            return $.jsonp({
                url : url,
                cache : true,
                callback : "duokan_fiction_chapter",
                success : function(result) {
                    var data = $.base64.decode(result);
                    var json = decodeURIComponent(escape(data));
                    callback(json);
                }
            });
        };
        
        //将方法暴露出去，调用Util函数者，就会得到一个包含这些方法的对象
        return {
            getBSONP : getBSONP,
            StorageGetter : StorageGetter,
            StorageSetter : StorageSetter
        }
    })();



    //接收一个小说id，一个章节id，一个回调函数
    //
    function ReaderModel (id_, cid_, onChange_) {
        //var Title = "";
        
        var Fiction_id = id_;

        var Chapter_id = cid_;

        //Util.StorageSetter(Fiction_id + 'last_chapter',1);

        //获取存储在本地的章节id，如果存在，就将Chapter_id替换为已存储的
        if (Util.StorageGetter(Fiction_id + 'last_chapter')) {
            Chapter_id = Util.StorageGetter(Fiction_id + 'last_chapter');
        }

        //如果Chapter_id不存在，则置为1，从第一章开始显示
        if (!Chapter_id) {
            Chapter_id = 1;
        }

        //用于存储通过接口获取到的所有的章节信息
        var Chapters = [];


        var init = function() {
            getFictionInfoPromise.then(function(d) {
                gotoChapter(Chapter_id);
            });
            /*
             getFictionInfo(function() {
             gotoChapter(Chapter_id);
             });
             */
        }

        //TODO 跳转到指定的章节
        var gotoChapter = function(chapter_id) {
            Chapter_id = chapter_id;
            getCurChapterContent();
        };

        //获得章节内容
        var getCurChapterContent = function() {
            $.get("/ajax/chapter_data",{
                id : Chapter_id
            }, function(data) {
                if (data.result == 0) {
                    var url = data.jsonp;
                    Util.getBSONP(url, function(data) {
                        $('#init_loading').hide();
                        onChange_ && onChange_(data);
                        //RenderBaseFrame(RootContainer)
                    });
                } else {

                }
            }, 'json');
            //return;
        };
        
        //通过AJAX获取该小说的章节信息，用于渲染目录
        var getFictionInfoPromise = new Promise(function(resolve, reject) {
            
            //data为返回的json数据
            $.get("/ajax/chapter", function(data) {
                if (data.result == 0) {
                    Title = data.title;
                    //$('#nav_title').html('返回书架');
                    //window.ChaptersData = data.chapters;
                    //window.chapter_data = data.chapters;
                    for (var i = 0; i < data.chapters.length; i++) {
                        //把章节id和章节标题集合为一个对象，存储在一个数组里
                        Chapters.push({
                            "chapter_id" : data.chapters[i].chapter_id,
                            "title" : data.chapters[i].title
                        })
                    }
                    //请求成功则通过resolve返回章节信息的数组
                    resolve(Chapters);
                } else {
                    //请求失败则返回获取到的data数据
                    reject(data);
                }
            }, 'json');
        });

        getFictionInfoPromise.then(function(d){
            var html = '';
            for(var i = 0;i<d.length;i++){
                html += '<p>' + d[i].title + '</p>';
            }
            $('.chapters_container').html(html);
        })

        /*
        var getFictionInfo = function(callback) {
        $.get("/data/chapter.json", function(data) {
        Title = data.title;
        $('#nav_title').html('返回书架');
        window.ChaptersData = data.chapters;
        window.chapter_data = data.chapters;
        for (var i = 0; i < data.chapters.length; i++) {
        Chapters.push({
        "chapter_id" : data.chapters[i].chapter_id,
        "title" : data.chapters[i].title
        })
        }

        callback && callback();
        }, 'json');
        };
        */
        
        //设置章节位置
        getFictionInfoPromise.then(function(d){
            $('.cur_chapter').html(Chapter_id);
            $('.total_chapters').html(d.length);
        })


        //获得上一章内容
        var prevChapter = function() {
            Chapter_id = parseInt(Chapter_id);
            if (Chapter_id == 1) {
                return
            }
            //var cid = Chapter_id - 1;
            Chapter_id -= 1;
            //gotoChapter(cid);
            gotoChapter(Chapter_id);
            $('.cur_chapter').html(Chapter_id);
            Util.StorageSetter(Fiction_id + 'last_chapter', Chapter_id);
        };

        //获得下一章内容
        var nextChapter = function() {
            Chapter_id = parseInt(Chapter_id);
            if (Chapter_id == Chapters.length - 1) {
                return
            }
            //var cid = Chapter_id + 1;
            Chapter_id += 1;
            //gotoChapter(cid);
            gotoChapter(Chapter_id);
            $('.cur_chapter').html(Chapter_id);
            Util.StorageSetter(Fiction_id + 'last_chapter', Chapter_id);
        };

        return {
            init : init,
            go : gotoChapter,
            prev : prevChapter,
            next : nextChapter,
            getChapter_id : function() {
                return Chapter_id;
            }
        };
    }

    //接收一个DOM节点作为参数
    //返回一个函数，这个函数接收一个data数据，并将处理好的DOM数据渲染到该DOM节点
    function RenderBaseFrame(container) {

        function parseChapterData(jsonData) {
            var jsonObj = JSON.parse(jsonData);
            var html = "<h4>" + jsonObj.t + "</h4>";
            for (var i = 0; i < jsonObj.p.length; i++) {
                html += "<p>" + jsonObj.p[i] + "</p>";
            }
            return html;
        }

        return function(data) {
            container.html(parseChapterData(data));
        };
    }

    //TODO 主方法
    function main() {

        

        // 获取显示章节内容的DOM节点
        var RootContainer = $('.fiction_container_chapter');

        //定义这本小说的id以及该章节的id
        var Fiction_id, Chapter_id;

        //Fiction_id = window.location.href.split('=').pop();

        //var ScrollLock = false;
        var Doc = document;
        var Screen = Doc.body;
        var Win = $(window);

        //是否是夜间模式
        var NightMode = false;

        //
        var InitFontSize;

        //缓存DOM节点，提高性能
        var Dom = {
            //bottom_tool_bar : $('#bottom_tool_bar'),
            nav_title : $('#nav_title'),
            bk_container : $('#bk-container'),
            night_button : $('#night-button'),
            next_button : $('#next_button'),
            prev_button : $('#prev_button'),
            back_button : $('#back_button'),
            top_nav : $('#top-nav'),
            bottom_nav : $('.bottom_nav'),
            bottom_chapter_change: $('#bottom_tool_bar_ul'),
            cur_chapter : $('.cur_chapter'),
            total_chapters : $('.total_chapters')
        }

        Util.StorageSetter(Fiction_id + 'last_chapter',1);

        //接收一个未处理的原始jsonp得到的data数据
        //并将该数据渲染到fiction_container节点
        var reader_dom_frame = RenderBaseFrame(RootContainer);


        //接收一个小说的Fiction_id、章节的id、一个回调处理函数
        //该回调函数，接收一个未处理的data数据，并调用reader_dom_frame
        var readerModel = ReaderModel(Fiction_id || 13359, Chapter_id, 
                function(data) {
                    reader_dom_frame(data);
                    //Dom.bottom_tool_bar.show();
                    //setTimeout(function() {
                    //	ScrollLock = false;
                    //	Screen.scrollTop = 0;
                    //}, 20);
        });
        //阅读器数据内容展示
        readerModel.init();
        console.log(readerModel);



        //从缓存中读取的信息进行展示
        var ModuleFontSwitch = (function() {
            //字体和背景的颜色表
            var colorArr = [{
                value : '#f7eee5',
                name : '米白',
                font : ''
            }, {
                value : '#e9dfc7',
                name : '纸张',
                font : '',
                id : "font_normal"
            }, {
                value : '#a4a4a4',
                name : '浅灰',
                font : ''
            }, {
                value : '#cdefce',
                name : '护眼',
                font : ''
            }, {
                value : '#283548',
                name : '灰蓝',
                font : '#7685a2',
                bottomcolor : '#fff'
            }, {
                value : '#0f1410',
                name : '夜间',
                font : '#4e534f',
                bottomcolor : 'rgba(255,255,255,0.7)',
                id : "font_night"
            }];

            var tool_bar = Util.StorageGetter('toolbar_background_color');
            var bottomcolor = Util.StorageGetter('bottom_color');
            var color = Util.StorageGetter('background_color');
            var font = Util.StorageGetter('font_color');
            var bkCurColor = Util.StorageGetter('background_color');
            var fontColor = Util.StorageGetter('font_color');

            for (var i = 0; i < colorArr.length; i++) {
                var display = 'none';
                if (bkCurColor == colorArr[i].value) {
                    display = '';
                }
                Dom.bk_container.append('<div class="bk-container" id="' + colorArr[i].id + '" data-font="' + colorArr[i].font + '"  data-bottomcolor="' + colorArr[i].bottomcolor + '" data-color="' + colorArr[i].value + '" style="background-color:' + colorArr[i].value + '"><div class="bk-container-current" style="display:' + display + '"></div><span style="display:none">' + colorArr[i].name + '</span></div>');
            }

            RootContainer.css('min-height', $(window).height() - 100);

            if (bottomcolor) {
                $('#bottom_tool_bar_ul').find('li').css('color', bottomcolor);
            }

            if (color) {
                $('body').css('background-color', color);
            }

            if (font) {
                $('.m-read-content').css('color', font);
            }

            //夜间模式
            if (fontColor == '#4e534f') {
                NightMode = true;
                $('#day_icon').show();
                $('#night_icon').hide();
                $('#bottom_tool_bar_ul').css('opacity', '0.6');
            }

            //字体设置信息
            InitFontSize = Util.StorageGetter('font_size');
            InitFontSize = parseInt(InitFontSize);
            if (!InitFontSize) {
                InitFontSize = 18;
            }

            RootContainer.css('font-size', InitFontSize);

        })();

        

        //页面中的零散交互事件处理，用立即执行函数封装
        var EventHandler = (function() {
            //夜间和白天模式的转化
            Dom.night_button.click(function() {
                if (NightMode) {
                    $('#day_icon').hide();
                    $('#night_icon').show();
                    $('#font_normal').trigger('click');
                    NightMode = false;
                } else {
                    $('#day_icon').show();
                    $('#night_icon').hide();
                    $('#font_night').trigger('click');
                    NightMode = true;
                }

            });

            //字体和背景颜色的信息设置
            Dom.bk_container.delegate('.bk-container', 'click', function() {
                var color = $(this).data('color');
                var font = $(this).data('font');
                var bottomcolor = $(this).data('bottomcolor');
                var tool_bar = font;
                Dom.bk_container.find('.bk-container-current').hide();
                $(this).find('.bk-container-current').show();
                if (!font) {
                    font = '#000';
                }
                if (!tool_bar) {
                    tool_bar = '#fbfcfc';
                }

                if (bottomcolor && bottomcolor != "undefined") {
                    $('#bottom_tool_bar_ul').find('li').css('color', bottomcolor);
                } else {
                    $('#bottom_tool_bar_ul').find('li').css('color', '#a9a9a9');
                }
                $('body').css('background-color', color);
                $('.m-read-content').css('color', font);

                Util.StorageSetter('toolbar_background_color', tool_bar);
                Util.StorageSetter('bottom_color', bottomcolor);
                Util.StorageSetter('background_color', color);
                Util.StorageSetter('font_color', font);

                var fontColor = Util.StorageGetter('font_color');
                //夜间模式
                if (fontColor == '#4e534f') {
                    NightMode = true;
                    $('#day_icon').show();
                    $('#night_icon').hide();
                    $('#bottom_tool_bar_ul').css('opacity', '0.6');
                } else {
                    NightMode = false;
                    $('#day_icon').hide();
                    $('#night_icon').show();
                    $('#bottom_tool_bar_ul').css('opacity', '0.9');
                }
            });

            //按钮的多态样式效果
            $('.spe-button').on('touchstart', function() {
                $(this).css('background', 'rgba(255,255,255,0.3)');
            }).on('touchmove', function() {
                $(this).css('background', 'none');
            }).on('touchend', function() {
                $(this).css('background', 'none');
            });

            //字体放大
            $('#large-font').click(function() {
                if (InitFontSize > 20) {
                    return;
                }
                InitFontSize += 1;
                Util.StorageSetter('font_size', InitFontSize);
                RootContainer.css('font-size', InitFontSize);
            });

            //字体缩小
            $('#small-font').click(function() {
                if (InitFontSize < 12) {
                    return;
                }
                InitFontSize -= 1;
                Util.StorageSetter('font_size', InitFontSize);
                RootContainer.css('font-size', InitFontSize);
            });

            var font_container = $('.font-container');
            var font_button = $('#font-button');
            var menu_container = $('#menu_container');

            font_button.click(function() {
                if (font_container.css('display') == 'none') {
                    font_container.show();
                    font_button.addClass('current');
                } else {
                    font_container.hide();
                    font_button.removeClass('current');

                }
            });

            RootContainer.click(function() {
                font_container.hide();
                font_button.removeClass('current');
            });

            //章节翻页
            Dom.next_button.click(function() {
                readerModel.next();
                window.scrollTo(0,0);
            });

            Dom.prev_button.click(function() {
                readerModel.prev();
                window.scrollTo(0,0);
            });

            /*
            //返回上级页面
            Dom.back_button.click(function() {
                if (Fiction_id) {
                    location.href = '/book/' + Fiction_id;
                }
            });*/

            //返回首页
            Dom.nav_title.click(function() {
                location.href = '/';
            });

            $('.icon-back').click(function() {
                //location.href = '/';
                window.history.back();
                //location.href = '/book?id=' + Fiction_id;
            });

            var container_width = $(window).width();
            $('#menu_button').click(function() {
                $('.root_container').css('transform','translateX(' + container_width + 'px');
            });
            $('.top-back').click(function(){
                $('.root_container').css('transform','translateX(0px)');
            })

            //屏幕中央点击事件，唤起或隐藏上下边栏
            $('#action_mid').click(function() {
                if (Dom.top_nav.css('display') == 'none') {
                    Dom.bottom_nav.show();
                    Dom.top_nav.show();
                    Dom.bottom_chapter_change.show();
                } else {
                    Dom.bottom_nav.hide();
                    Dom.top_nav.hide();
                    Dom.bottom_chapter_change.hide();
                    font_container.hide();
                    font_button.removeClass('current');
                }
            });
            
            //章节页滚动事件处理
            //$('.artical-action-mid').scroll(function(e){
            //	$('.fiction_container').addEventListener(e,function)
            //})
            

            //对屏幕的滚动监控,滚动时隐藏上下边栏
            $('.m-read-content').scroll(function() {
                Dom.top_nav.hide();
                Dom.bottom_nav.hide();
                font_container.hide();
                Dom.bottom_chapter_change.hide();
                font_button.removeClass('current');
            });
            
            //设置container的宽度
            
            var container_height = $(window).height();

            $('.container').css('width',container_width);
            $('.container').css('height',container_height);

            console.log(container_width);
            $('.menu_container').css('left',-container_width);
            $('.menu_container').css('width',container_width);
            $('.menu_container').css('height',container_height);

            $('body').css('height',container_height);

            $('.m-read-content').css('height',container_height-30);

            $('.chapters_container').css('height',container_height - 45);

        })();
    }

    return main();
})();