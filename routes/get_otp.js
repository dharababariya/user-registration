//import  module

const express = require('express');
const router = express.Router();
const knex = require('../helper/knex');
const moment = require('moment-timezone');
// const Joi = require('joi');

const otp_generate = async(req, res, next) => {
    
    

    try {


        const result = await knex("public.generate_otp")
            .select('contact_no')
            .where("contact_no", req.body.contact_no)
            // console.log(result)

        if (result == '') {
            res
                .status(401)
                .send({Success: "Failure", Message: "Enter valid contact number"})

        } else {

            // Function to generate OTP
            const generateOTP = () => {

                // Declare a digits variable which stores all digits
                const digits = '0123456789';
                let OTP = '';
                for (let i = 0; i < 6; i++) {
                        OTP += digits[Math.floor(Math.random() * 10)];
                    }
                    return OTP;
                }
            const otp = await generateOTP();

           // console.log(otp);
            const result = await knex("public.generate_otp")
                .update("otp", otp)
                .update('updated_at', moment())
                .where("contact_no", "=", req.body.contact_no)
                .returning("*")
            // console.log(result)

            await send_sms(otp);

            res
                .status(200)
                .send({Status: 'Successfully send otp'})      
        }

    } catch (error) {
        console.error(error);
    }
}

// create new contact
const send_sms = async(otp) => {

    try {
        const accountSid = '';
        const authToken = '';
        const client = require('twilio')(accountSid, authToken);
        let resMsg = '';
        
        console.log(otp);
        await client.messages
          .create({
             body: otp,
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
        
    }}

// otp generate api
router.put('/api/otp/generate_otp', otp_generate);

module.exports = router;