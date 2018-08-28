var express = require( 'express' );
var senderEmails = require( './sender-emails.js' );
var morgan = require( 'morgan' );
var bodyParser = require('body-parser');
var fallback = require( 'express-history-api-fallback' );

var apiRest = express();
//Logger execute middleware
apiRest.use( morgan('dev') );
// support json encoded bodies
apiRest.use( bodyParser.json() );
// support encoded bodies
apiRest.use( bodyParser.urlencoded({ extended: true }) ); 

var root = __dirname + '/public';

apiRest.use( express.static(root) );
apiRest.use( fallback('index.html', { root: root }) );


/**
 * @api
 * @method
 * @description
 * Main endpoint of bioclimatic big house Api!
 */
apiRest.get('/',function(req,res) {
  res.send('Bienvenido a Bioclimatic Big House');
});


/**
 * @api
 * @method
 * @description
 * This method send emails to bioclimatic big house company
 * from your clients with yours messages!
 */
apiRest.post('/contact/message',function(req, res) {
  var email = req.body.email;
  var message = req.body.message;
  var subscription = senderEmails.sendEmail(email, message).subscribe(function(sentEmail) {
    console.log("SEND EMAIL IS!!! " , sentEmail);
    var responseCode = ( sentEmail )? 200:500;
    res.sendStatus( responseCode );
    subscription.unsubscribe();
  });
});



/**
 * @api
 * @method
 * @param  {[type]} process  [description]
 * @param  {[type]} function [description]
 * @return {[type]}          [description]
 * @description
 * API RESTFUL listen port server, start point 
 * to bioclimatic big house Api!
 */
apiRest.listen( process.env.PORT || 5000,
  function(){
    console.log('\n     Bioclimatic House API listen\n'+
                  '     version: 1.0.0\n'+
                  '     context: dev\n'+
                  '     port:5000\n'
    );//Init-message
  console.log('log:');
});//ApiRest-listen