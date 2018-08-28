var fs = require('fs');
const { Observable } = require('rxjs');


// Read Bioclimatic Api settings
var bioclimaticSettings = new Observable(function(observer){
  fs.readFile('./api-settings.json', 'utf8', function (err, data) {
    
    if ( err ) { throw err; };
    console.log("Readed Api settings is ok!");
    var settings = JSON.parse( data );
    observer.next( settings );
     
  });
});



/**
 * @method
 * @description
 */
function createEmailAndShipping(emailTemplate, clientEmail, settings) {
  return new Observable(function(observer) {
    var sender = require('gmail-send')({

      user: settings['ACCOUNT_GMAIL_USERNAME'],   // Your GMail account used to send emails
      pass: settings['ACCOUNT_GMAIL_PASSWORD'],   // Application-specific password
      to:   settings['GMAIL_EMAIL_RECIPIENTS'],   // Send to yourself
                                                  // you also may set array of recipients:
                                                  // [ 'user1@gmail.com', 'user2@gmail.com' ]
      from:    clientEmail,                       // from: by default equals to user
      replyTo: clientEmail,               // replyTo: by default undefined
      // bcc: 'some-user@mail.com',              // almost any option of `nodemailer` will be passed to it
      subject: settings['EMAIL_TEMPLATE_SUBJECT'],
      html: emailTemplate, // HTML
      files: [                                    // Array of files to attach
        {
          filename: 'image1.png',
          path: './email-sender/bioh-logo.png',
          cid:'image1@biohclimatic.com'
        }
      ]
    }); // Sender

    // And now we shipping mail
    sender({ 
      // if we want override configurations options
      },
      function(err, res) {
        if (err) {
          // If Shipping has errors!
          console.warn("[ERROR][EMAIL SHIPPING]: ", err);
          throw err;
        }// If
        // If shipping is successful!
        observer.next( res );
    }); // send );

  }); // Observable
}// CreateEmailAndShipping



/**
 * @api
 * @method
 * @param {*} email 
 * @param {*} message 
 */
function createEmailTemplate(email, message) {
  var template = fs.readFileSync('./email-sender/template-email.html', 'utf8');
  template = template.replace('##-mail-##', email);
  template = template.replace('##-message-##', message);
  return template;
}// CreateEmailTemplate



module.exports = {

  /**
   * @method
   * @description
   * This method send emails
   */
  sendEmail: function(email, message) {
    return new Observable( function(observer) {
      var subscription = bioclimaticSettings.subscribe(function( settings ) {
        var emailTemplate = createEmailTemplate(email, message);
        createEmailAndShipping( emailTemplate, email, settings )
        .subscribe(function(response) {
          console.log("SEND EMAIL WITH THESE PARAMETERS: ", email, ' ---- ', message);
          console.log("HEMOS ENVIADO ESTO O NO!!!!!");
          observer.next( response );
          subscription.unsubscribe();
        });
        
      }); // Subscribe
    })// Observable
  }// SendEmail

};// Module.exports