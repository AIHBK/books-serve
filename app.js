const express = require('express');
const cors = require('cors');
const adminRouter = require('./router/admin/index');
const db = require('./db/mysql');
const bodyParser = require('body-parser'); // 使用req.body获取参数
const app = express();
    // 解决跨域问题导入cors中间件
    app.use(cors());
    // 解析JSON、Raw、文本、URL-encoded格式的请求体
    app.use (bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json());

    // 解决表单解析问题
    // app.use(express.urlencoded({ extended: true })); 
    // app.use('/vue/admin', userRouter);
    app.use('/books/admin', adminRouter)
    // 公开静态资源文件夹 配置静态资源 img为虚拟路径必须加/   static真是路径
    app.use('/img/', express.static('./static'))
app.listen(3000, function(){
    console.log('Server is running on port 3000');
});
