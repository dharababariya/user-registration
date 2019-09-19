//import  module

const express = require('express');
const router = express.Router();
const knex = require('../helper/knex');
const moment = require('moment-timezone');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('process.env.SETAPIKEY');

const Joi = require('joi');

const otp_generate = async (req, res, next) => {

    try {

        const result = await knex('public.send_otp')
            .where('username', req.body.username); 
            
            const data = req.body;

            Joi.validate(data, schema, async (err, value) => {

                if (err) {
                    // send a 422 error response if validation fails
                    res.status(422).json({
        
        
                        meta: {
                            status:'0',
                            message: `Enter Valid Username ${err.message}`
                        },
                        data: {
            
                        }
                        
                    });
                 

                 } 
                })
                 
                  if (result.length === 0) {
                        

                            await register_user(req.body.username);

                            const otp = await generateOTP();

                            const add_otp_in_db = await knex('public.send_otp')
                                .update("otp", otp)
                                .update('updated_at', moment())
                                .where("username", "=", req.body.username)
                                .returning("*")

                            await send_sms(otp);

                            await send_mail(otp);

                            res
                                .status(201)
                                .json({   
                                    meta: 
                                    {
                                            status:'1',
                                            message: 'Successfully Crated User And Send Otp'
                                },
                                data: {
                    
                                } })

                    } else {

                        const otp = await generateOTP();

                        const result = await knex("public.send_otp")
                            .update("otp", otp)
                            .update('updated_at', moment())
                            .where("username", "=", req.body.username)
                            .returning("*")
                        
                        
                        await send_sms(otp);

                        await send_mail(otp);

                        res
                            .status(200)
                            .json({ 
                                meta: 
                                    {
                                            status:'2',
                                            message: 'Successfully Send Otp'
                                    },
                                data: {
                    
                                }
                             })
                    }
               

    } catch (error) {
        // console.error(error)
        
        return res.status(424).json({
            meta: {
                    status:'3',
                    message: `Failed ${error.message}`
            },
            data: {

            }
        })
    }
}

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


const register_user = async (username) => {
    //create new user

    const data = {
        username: username,
        otp: '',
        created_at : moment(),
        updated_at: moment(),
    }

    const result = await knex('public.send_otp')
        .insert(data)

    return result;
}

// create new contact
const send_sms = async (otp) => {

    try {
        const accountSid = 'process.env.ACCOUNTSID';
        const authToken = 'process.env.AUTHTOKEN';
        const client = require('twilio')(accountSid, authToken);
        let resMsg = '';

       //  console.log(otp);
        await client
            .messages
            .create({ body: otp, from: '+8894397229822', to: '+914456324532' })
            .then(message => {
                resMsg = message.sid;
                console.log(JSON.stringify(message, 5));
            })
            .done();
        // res.json(resMsg);

    } catch (error) {
       // throw error;

       return res.status(424).json({
        meta: {
            status:'3',
            message: `Failed ${error.message}`
        },
        data: {

        }
    })

    }
}

const send_mail = async (otp) => {

    try {

        //    Prepare payload for send email
    const msg = {
        to: 'demo@grr.la',
        from: 'nmd@gmail.com',
        subject: 'Sending with Twilio SendGrid is Fun',
        text: 'send otp',
        html: `<strong>Thank You for registered with us. This is your otp ${otp}</strong>`
    };

    //    Send email
    sgMail.send(msg);
        
    } catch (error) {

        return res.status(424).json({
            meta: {
                status:'3',
                message: `Failed ${error.message}`
            },
            data: {
    
            }
        })
        
    }
    
}
const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(16).required(),
})
// otp generate api
router.put('/api/otp/generate_otp', otp_generate);

module.exports = router;
