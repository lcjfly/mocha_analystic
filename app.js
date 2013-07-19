/**
 * Module dependencies.
 */

var express = require('express')
    routes = require('./routes')
    require('./date');

var app = module.exports = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var port = process.env.PORT || 4000;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// data in memory
var uv = {},
    pv = {},
    realtime_activity = [],
    sockets = [];

// Routes
/*
    window.location
    属性                  描述
    hash                设置或获取 href 属性中在井号“#”后面的分段。
    host                 设置或获取 location 或 URL 的 hostname 和 port 号码。
    hostname      设置或获取 location 或 URL 的主机名称部分。
    href                  设置或获取整个 URL 为字符串。
    pathname      设置或获取对象指定的文件名或路径。
    port                  设置或获取与 URL 关联的端口号码。
    protocol          设置或获取 URL 的协议部分。
    search            设置或获取 href 属性中跟在问号后面的部分。
*/

app.get('/a', function(req, res) {
  var host = req.host,
      protocal = req.protocol,
      url = protocal + '://' + host +':'+ port +'/',
      href = 'window.location.href',
      // host = 'window.location.host',
      data = '{href:'+ href +'}',
      success = 'function(data) {}';

  var res_js = "$.post('"+ url +"', "+ data +","+ success +");"
  res.send(res_js);
});

app.post('/', function(req, res) {
  var ip = req.ip,
      now = new Date().Format('yyyy-MM-dd hh:mm:ss.S'),
      url = req.body.href;

  // realtime_activity
  var activity = {'url': url, 'ip': ip, 'timestamp': now}
  if(realtime_activity.length >= 10) {
      realtime_activity.pop();
  }
  realtime_activity.unshift(activity);
  // socket.io
  broadcast('activity', activity);

  // uv
  if(uv[ip] === undefined) {
      uv[ip] = {
        timestamp: now
      };

      // socket.io
      broadcast('uv', {ip: ip, timestamp: now});
  }

  // pv
  if(pv[url] === undefined) {
      pv[url] = {
        count: 1
      }

      // socket.io
      broadcast('pvs', pv);
  } else {
    if(pv[url].count === undefined) {
      pv[url].count = 0;
    }

    pv[url].count ++;

    // socket.io
    broadcast('pvs', pv);
  }

  res.end();
  
});

app.get('/admin', function(req, res) {
  res.render('admin.ejs', {locals: {
    title: 'Mocha Analystic',
    activities: realtime_activity,
    uvs: uv,
    pvs: pv
  }});
});

app.get('/admin/rt', function(req, res) {
  res.render('admin_rt.ejs', {locals: {
    title: 'Mocha Analystic - Realtime',
    activities: realtime_activity,
    uvs: uv,
    pvs: pv
  }});
});

server.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});

// socket.io 
io.sockets.on('connection', function(socket) {
    sockets.push(socket);
});

function broadcast(event_name, data) {
  sockets.forEach(function(socket) {
    socket.emit(event_name, data);
  });
}
