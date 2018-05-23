
const Koa = require('koa')
const Router = require('koa-router');
const views = require('koa-views');
const path = require('path');
const static = require('koa-static');
const service = require('./service/webAppService.js');

const app = new Koa();
const router = new Router();

//模板配置
app.use(views(path.join(__dirname,'/view'),{
	extension:'ejs'
}))

//静态文件配置
const staticPath = './static';
app.use(static(path.join(__dirname,staticPath)));

//路由
router
	.get('/route_test',(ctx,next)=>{
		
		ctx.body = 'hello koa!';
	})
	.get('/ejs_test',async (ctx,next)=>{
		
		let title = 'hello koa-views';
		await ctx.render('test',{title});
	})
	.get('/api_test',async (ctx,next)=>{
		ctx.body = await service.get_test_data();
	})
	.get('/ajax/search',async (ctx,next)=>{
		//var querystring = require('querystring');
		//将URL查询字符串解析为对象
		var params = ctx.query;
		var start = params.start;
		var end = params.end;
		var keyword = params.keyword;

		ctx.body = await service.get_search_data(start,end,keyword);
	})
	.get('/ajax/index',async (ctx,next)=>{
		ctx.set('Cache-Control','no-cache');
		ctx.body = await service.get_index_data();
	})
	.get('/ajax/rank',async (ctx,next)=>{
		ctx.set('Cache-Control','no-cache');
		ctx.body = await service.get_rank_data();
	})
	.get('/ajax/book',async (ctx,next)=>{
		ctx.set('Cache-Control','no-cache');
		var params = ctx.query;
		var id = params.id;
		if(!id){
			id = "";
		}
		ctx.body = await service.get_book_data(id);
	})
	.get('/',async (ctx,next)=>{
		ctx.set('Cache-Control','no-cache');
		await ctx.render('index');
	})
	.get('/book',async (ctx,next)=>{
		ctx.set('Cache-Control','no-cache');
		var pagename = ctx.query.name;
		var bookId = ctx.query.id;
		await ctx.render('book',{bookId});
		//ctx.body = await service.get_pages_data(pagename,bookId);
	})
	.get('/reader',async (ctx,next)=>{
		ctx.set('Cache-Control','no-cache');
		await ctx.render('reader');
		
	})
	.get('/ajax/chapter',async (ctx,net)=>{
		ctx.set('Cache-Control', 'no-cache');
		var chapter_id = ctx.query.id;
		ctx.body = await service.get_chapter();
	})
	.get('/ajax/chapter_data',async (ctx,net)=>{
		var chapter_id = ctx.query.id;
		ctx.body = await service.get_chapter_data(chapter_id);
	})
	.get('/search',async (ctx,next)=>{
		ctx.set('Cache-Control','no-cache');
		await ctx.render('search');
		
	})

//装载路由
app.use(router.routes(),router.allowedMethods());

//在3000端口监听
app.listen(3000);
console.log('app started at port 3000...');