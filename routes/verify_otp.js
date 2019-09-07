//import  module

const express = require('express');
const router = express.Router();
const knex = require('../helper/knex');
// const Joi = require('joi');

const verify_otp = async(req, res, next) => {

    try {   

        const verify_otp = await knex("public.generate_otp")
            .where('contact_no', req.body.mobile_number)
            .where('otp', req.body.otp)
            .select('updated_at');

        console.log(verify_otp);    
        
        if ( verify_otp.length === 0 ) {

            console.log('not verified')
            res.status(400).send({Status: 'Invalid Otp'})      

        } else {

            const opt_generation_time = verify_otp[0];

            const time = opt_generation_time.updated_at;

            const current_time = new Date();

            const current_time_in_unix_time = Math.floor(current_time/1000);
            const otp_generation_time_in_unix_time = Math.floor(time/1000);

            const time_diffrenece = current_time_in_unix_time - otp_generation_time_in_unix_time;

            if(time_diffrenece > 900) {

                res.status(401).send({
                    message: 'Your otp is expired'
                })
            }

            res.status(200).send({Status: 'Otp verified successfully'})  
        }

        

    } catch (error) {
        // console.error(error);
        return next(error);
    }
}

router.post('/api/verify_otp', verify_otp);

module.exports = router;