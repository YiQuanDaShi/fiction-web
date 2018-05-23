var sc_height=$(window).height();
var sc_width=$(window).width();


var app = new Vue({
    el:"#app",
    data:{
        isFold:true,
        scroll_height:sc_height-46,
        book_name:null,
        book_cover:null,
        book_author:null,
        book_score:null,
        book_score_count:null,
        book_price:null,
        book_word_count:null,
        book_finish:false,
        book_summary:null,
        book_latest:null,
        book_categories:null,
        book_author_books:null,
        book_rights:null,
        book_fiction_id:null
    },
    methods:{
        book_summary_fold:function(){
            this.isFold = !this.isFold;
        },
        random_color:function(){
            var colors = ['#fbebe8','#fcedda','#e8f9db','#cceff2','#cff9d9','#f6fbd8','#fbf0db','#fbe1db','#fbd8f6'];
            return colors[Math.floor(Math.random() * 9)];
        }
    },
    computed:{
        isFinish:function(){
            if(this.book_finish){
                return '已完结';
            }else{
                return '连载中';
            }
        },
        get_star_pos:function(){
            let pos = 0;
            let scroe = this.book_score;
            if(scroe >0 && scroe <= 1){
                pos = 17;
                return pos;
            }else if(scroe > 1 && scroe <= 2){
                pos = 33;
                return pos;
            }else if(scroe > 2 && scroe <=3){
                pos = 49;
                return pos;
            }else if(scroe > 3 && scroe <= 4){
                pos = 65;
                return pos;
            }else if(scroe > 4 && scroe <= 5){
                pos = 82;
                return pos;
            }else if(scroe > 5 && scroe <= 6){
                pos = 99;
                return pos;
            }else if(scroe > 6 && scroe <= 7){
                pos = 115;
                return pos;
            }else if(scroe > 7 && scroe <= 8){
                pos = 131;
                return pos;
            }else if(scroe > 8 && scroe <= 9){
                pos = 148;
                return pos;
            }else if(scroe > 9 && scroe <= 10){
                pos = 164;
                return pos;
            }
        }
    }
});


var id = location.href.split('?id=').pop();

$.getJSON('./ajax/book?id=' + id,function(data){
    app.book_name = data.item.title;
    app.book_cover = data.item.cover;
    app.book_author = data.item.authors;
    app.book_score = data.item.score;
    app.book_score_count = data.item.score_count;
    app.book_price = data.item.price;
    app.book_word_count = data.item.word_count;
    app.book_finish = data.item.finish;
    app.book_summary = data.item.summary;
    app.book_latest = data.item.latest;
    app.book_categories = data.item.categories;
    app.book_author_books = data.author_books;
    app.book_rights = data.item.rights;
    app.book_fiction_id = data.item.fiction_id;
})
