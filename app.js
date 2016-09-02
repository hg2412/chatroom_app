var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//connect to MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat_room_db');
//create schema and model for chat messages
var chatMsgSchema = mongoose.Schema({
    name: String,
    message: String,
    date: Date
});

var ChatMsg = mongoose.model("ChatMsg", chatMsgSchema);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('name:' + msg.name)
    console.log('message: ' + msg.message);
    insert_to_db(msg.name, msg.message);
  });
});


insert_to_db = function(name, message){
  if(!name || !message){
        console.log("Wrong name or message!");
    }else{
      var newChatMsg = new ChatMsg({
        name: name,
        message: message,
        date: Date.now()
      });
      newChatMsg.save(function(err, res){
        if(err)
          console.log('Error!');
        else{
          console.log('Inserted!');
          io.emit('message inserted', {name: newChatMsg.name, message: newChatMsg.message});
        }

      })
    }
}

http.listen(8080);
module.exports = app;

