  //import  module
const express = require('express');
const router = express.Router();
const account_sid = '';
const auth_token = '';
const client = require('twilio')(account_sid,auth_token)


// create new contact
const send_sms = async(otp, req, res, next) => {

    try {
        const accountSid = '';
        const authToken = '';
        const client = require('twilio')(accountSid, authToken);
        let resMsg = '';
        
        console.log(otp);
        await client.messages
          .create({
             body: 'This is the test message for the Twillo testing!!?',
             from: '',
             to: ''
           })
          .then(message => {
                resMsg = message.sid;
                console.log( JSON.stringify(message , 5) );
            })
          .done();
          // res.json(resMsg);
        
    } catch (error) {
        throw error;
        
    }
}

//create new contact api
// router.post('/api/send_sms',  send_sms);

module.exports = send_sms;