//import  module

const express = require('express');
const router = express.Router();
const knex = require('../helper/knex');
const moment = require('moment-timezone');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR-API-KEY');

const Joi = require('joi');

const otp_generate = async (req, res, next) => {

    try {

        const input = {
            username: req.body.username,
        };

        const data = req.body;

        Joi.validate(data, schema, async (err, value) => {

            const result = await knex('public.send_otp')
                .where('username', input.username);

            if (err) {
                // send a 422 error response if validation fails
                res.status(422).json({


                    meta: {
                        status: '0',
                        message: `⚠️ Enter Valid Username ${err}`
                    },
                    data: {

                    }

                });


            }


            else if (result.length === 0) {

                await register_user(input.username);

                const otp = await generateOTP();

                const add_otp_in_db = await knex('public.send_otp')
                    .update("otp", otp)
                    .update('updated_at', moment())
                    .where("username", "=", req.body.username)
                    .returning("*")

                await send_sms(input, otp);

                await send_mail(otp);

                res
                    .status(201)
                    .json({
                        meta:
                        {
                            status: '1',
                            message: 'Successfully Crated User And Send Otp ✅️'
                        },
                        data: {

                        }
                    })

            } else {

                const otp = await generateOTP();

                const result = await knex("public.send_otp")
                    .update("otp", otp)
                    .update('updated_at', moment())
                    .where("username", "=", req.body.username)
                    .returning("*")


                await send_sms(input, otp);

                await send_mail(otp);

                res
                    .status(200)
                    .json({
                        meta:
                        {
                            status: '2',
                            message: 'Successfully Send Otp ✅️'
                        },
                        data: {

                        }
                    })
            }

        });
    } catch (error) {
        // console.error(error)

        return res.status(424).json({
            meta: {
                status: '3',
                message: `⚠️ Failed ${error}`
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
        created_at: moment(),
        updated_at: moment(),
    }

    const result = await knex('public.send_otp')
        .insert(data)

    return result;
}

// create new contact
const send_sms = async (data, otp) => {

    try {
        const accountSid = 'Account id';
        const authToken = 'Auth Token';
        const client = require('twilio')(accountSid, authToken);
        let resMsg = ''

        const mobile_number = `+91${data.username}`

        await client
            .messages
            .create({ body: otp, from: '+xxxxxxxxxx', to: mobile_number })
            .then(message => {
                resMsg = message.sid;
                console.log(`-----------------------------------------`);
                console.log('Message sent successfully to user');
                console.log(`-----------------------------`)
            })
            .done();
        // res.json(resMsg);

    } catch (error) {
        // throw error;

        return res.status(424).json({
            meta: {
                status: '3',
                message: `⚠️ Failed ${error}`
            },
            data: {

            }
        })

    }
}

const send_mail = async (data, otp) => {

    try {

        //    Prepare payload for send email
        const msg = {
            to: 'emaid id',
            from: 'email',
            subject: 'Sending with Twilio SendGrid is Fun',
            text: 'send otp',
            html: `<strong>Thank You for registered with us. This is your otp ${otp}</strong>`
        };

        //    Send email
        sgMail.send(msg);

    } catch (error) {

        return res.status(424).json({
            meta: {
                status: '3',
                message: `⚠️ Failed ${error}`
            },
            data: {

            }
        })

    }

}


const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
})



// otp generate api
router.put('/api/otp/generate_otp', otp_generate);

module.exports = router;
