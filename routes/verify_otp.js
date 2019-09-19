//import  module

const express = require('express');
const router = express.Router();
const knex = require('../helper/knex');
const jwt = require('jsonwebtoken');
const my_secret = 'process.env.MY_SECRET';


//verify otp
const verify_otp = async (req, res, next) => {


    try {

        const verify_otp = await knex("public.send_otp")
            .where('username', req.body.username)
            .where('otp', req.body.otp)
            .select('updated_at');
   

        if (verify_otp.length === 0) {

            res.status(400).send({ 

                meta: {
                status:'0',
                message: 'Enter Valid Otp'
            },
            data: {

            }
             
        })

        } else {

            const opt_generation_time = verify_otp[0];

            const time = opt_generation_time.updated_at;

            const current_time = new Date();

            const current_time_in_unix_time = Math.floor(current_time / 1000);
            const otp_generation_time_in_unix_time = Math.floor(time / 1000);

            const time_diffrenece = current_time_in_unix_time - otp_generation_time_in_unix_time;

            if (time_diffrenece > 900) {

                res.status(401).send({

                    meta: {
                        status:'1',
                        message: 'Your otp is expired'
                    },
                    data: {
        
                    }
                    
                })
            }



            const get_token = await generate_token();

            const save_token_db = await knex('public.send_otp')
                .update('token', get_token)
                .where('username', req.body.username)

            res.status(200).send({
                
                meta: {
                    status:'2',
                    message: 'Otp verified successfully'
                },
                data: {
    
                }  
                
     })
        }



    } catch (error) {
        // console.error(error);
      //  return next(error);
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


const generate_token = async (data) => {
    const token = jwt.sign({ data }, my_secret, {
        expiresIn: '24h' // expires in 24 hours
    });

    return token;
}

router.post('/api/verify_otp', verify_otp);

module.exports = router;
