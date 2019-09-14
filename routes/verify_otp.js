//import  module

const express = require('express');
const router = express.Router();
const knex = require('../helper/knex');
const jwt = require('jsonwebtoken');
const my_secret = 'Thanks4help';


//verify otp
const verify_otp = async (req, res, next) => {


    try {

        const input = {
            username: req.body.username,
            otp: req.body.otp
        }

        const get_user = await knex('public.send_otp')
            .where('username', input.username)
            .select('*')


        if (get_user.length === 0) {

            return res.status(400).send({
                meta: {
                    status: '0',
                    message: 'You are not registered with us'
                }
            })
        }


        const verify_otp = await knex("public.send_otp")
            .where('username', input.username)
            .where('otp', input.otp)
            .select('*')


        if (verify_otp.length === 0) {

            return res.status(400).send({

                meta: {
                    status: '1',
                    message: 'Enter Valid Otp'
                },
                data: {

                }

            })

        }

        const [{ verifaction_status: verification_flag }] = await knex('public.send_otp')
            .where('otp', input.otp)
            .select('verifaction_status')

        if (verification_flag === true) {

            return res.status(400).send({

                meta: {
                    status: '2',
                    message: 'Please generate new otp'
                },
                data: {

                }

            })
        }

        else {

            const opt_generation_time = verify_otp[0];

            const time = opt_generation_time.updated_at;

            const current_time = new Date();

            const current_time_in_unix_time = Math.floor(current_time / 1000);
            const otp_generation_time_in_unix_time = Math.floor(time / 1000);

            const time_diffrenece = current_time_in_unix_time - otp_generation_time_in_unix_time;

            if (time_diffrenece > 900) {

                return res.status(401).send({

                    meta: {
                        status: '3',
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

            const set_registartion_status_true_in_db = await knex('public.send_otp')
                .update('verifaction_status', true)
                .where('username', req.body.username)

            return res.status(200).send({

                meta: {
                    status: '4',
                    message: 'Otp verified successfully'
                },
                data: {
                    get_token
                }

            })
        }



    } catch (error) {
        // console.error(error);
        //  return next(error);
        return res.status(424).json({
            meta: {
                status: '3',
                message: error.message
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
