
const fs = require('fs');

exports.get_test_data = ()=>{
    var content = fs.readFileSync('./mock/home.json','utf-8');
    return content;
}

exports.get_index_data = ()=>{
    var content = fs.readFileSync('./mock/home.json','utf-8');
    return content;
}

exports.get_rank_data = ()=>{
    var content = fs.readFileSync('./mock/rank.json','utf-8');
    return content;
}

exports.get_bookbacket_data = ()=>{
    var content = fs.readFileSync('./mock/bookbacket.json','utf-8');
    return content;
}

exports.get_category_data = ()=>{
    var content = fs.readFileSync('./mock/category.json','utf-8');
    return content;
}

exports.get_female_data = ()=>{
    var content = fs.readFileSync('./mock/channel/female.json','utf-8');
    return content;
}


exports.get_male_data = ()=>{
    var content = fs.readFileSync('./mock/channel/male.json','utf-8');
    return content;
}

exports.get_chapter = function() {
	var content = fs.readFileSync('./mock/reader/chapter.json', 'utf-8');
	return content;
}

exports.get_chapter_data = function(chapter_id) {
	var content = fs.readFileSync('./mock/reader/data/data' + chapter_id + '.json', 'utf-8');
	return content;
}

//获取书籍数据接口
exports.get_book_data = (id)=>{
    if(!id){
        id = 18218;
    }
    var content = fs.readFileSync('./mock/book/' + id + '.json','utf-8');
    return content;
}

//搜索接口
exports.get_search_data = function(start, end, keyword) {
    
    return new Promise(function(resolve, reject) {
        try {
            const http = require('http');
            // 该模块的作用是把一个object对象，转换为URL查询字符串
            const qs = require('querystring');
            let data = {
                s: keyword,
                start: start,
                end: end
            };

            let query_str = qs.stringify(data);

            let options = {
                hostname: 'dushu.xiaomi.com',
                port: 80, 
                path: '/store/v0/lib/query/onebox?' + query_str,
                method: 'GET'
            };

            //http请求
            const req_obj = http.request(options, (_res) => {
                let content = '';

                _res.setEncoding('utf8'); //设置返回的数据格式
                _res.on('data', (chunk) => {
                    content += chunk;
                });
                _res.on('end', (e) => {
                    resolve(content);
                });
            });

            //请求错误处理
            req_obj.on('error', (e) => {
                console.error(`请求遇到问题: ${e.message}`);
            });

            // req_obj.write()
            // 使用 http.request() 必须总是调用 req.end() 来表明请求的结束，即使没有数据被写入请求主体。
            req_obj.end();
        } catch (e) {
            console.log(e);
        }
    });
 };

exports.get_pages_data = function(pagename,bookId){
    return new Promise(function(resolve, reject) {
        try {   
                var responseData = {};
                let page = './view/' + pagename + '.ejs'; 
                let pageData = fs.readFileSync(page,'utf-8');

                if(!bookId){
                    bookId = 18218;
                }
                var content = fs.readFileSync('./mock/book/' + bookId + '.json','utf-8');

                responseData.page = pageData;
                responseData.book = content;

                if(pageData){
                    resolve(responseData);
                }
            } catch (e) {
                console.log(e);
            }
    });
}