var sc_height=$(window).height();
var sc_width=$(window).width();



function refresh_index(){
    var app = new Vue({
        el:'#app',
        data:{
            top:null,
            hot:null,
            recommend:null,
            female:null,
            male:null,
            free:null,
            topic:null,
            position:0,
            header_postion:0,
            tab_1_class_off:false,
            tab_1_class_on:true,
            tab_2_class_on:false,
            header_left:((sc_width-180)-56)/4+56+32,
            swipe_tab_width:sc_width - 88,
            screen_width:sc_width,
            screen_height:sc_height,
            shelf_height:(sc_height-45)
        },
        methods:{
            tabSwitch:function(pos){
                if(pos == 2){
                    this.tab_1_class_on = false;
                    this.tab_1_class_off = true;
                    this.tab_2_class_on = true;
                    this.position = -sc_width;
                    this.header_postion = ((sc_width-180)-56)/2 + 28;

                }else{
                    this.tab_1_class_on = true;
                    this.tab_1_class_off = false;
                    this.tab_2_class_on = false;
                    this.position = 0;
                    this.header_postion = 0;
                }
            },
            getPageData:function(pagename,bookId){
                console.log('hi');
                var path = '/book?name='+ pagename + '&id=' + bookId;
                axios.get(path).then(function(response){
                    console.log(response.data);
                })
            }
        }
    })

axios.get('/ajax/index')
.then(function (response) {

    app.top = response.data.items[0].data.data;
    app.hot = response.data.items[1].data.data;
    app.recommend = response.data.items[2].data.data;
    app.female = response.data.items[3].data.data;
    app.male = response.data.items[4].data.data;
    app.free = response.data.items[5].data.data;
    app.topic = response.data.items[6].data.data;
        
})
.catch(function (error) {
    console.log(error);
});
}

refresh_index();

