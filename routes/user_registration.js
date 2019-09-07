const express = require('express');
const router = express.Router();
const knex = require('../helper/knex');
const moment = require('moment-timezone');
const { validate } = require('../utils/validate');

const user_registrations = async (req, res, next) => {

    try {
        const input = {

            username: req.body.username,
            name: req.body.name,
            bio: req.body.bio,
            address: req.body.address,
            phone: req.body.phone,
            work_auth_status: req.body.work_auth_status,
            email: req.body.email,
            driver_licence_front: req.body.driver_licence_front,
            driver_licence_back: req.body.driver_licence_back,
            routing_number: req.body.routing_number,
            bank_name: req.body.bank_name,
            account_number: req.body.account_number,
            ssn: req.body.ssn,
            activity: req.body.activity,
            practical_exp: req.body.practical_exp,
            coached: req.body.coached,
            awards: JSON.stringify(req.body.awards),
            how_did_you_hear: req.body.how_did_you_hear
        }


        // await is_valid_body_schema(input);

        await save_details_in_db(input);

        await save_number_in_otp_verification_db_tabel(input.phone);

        return res.status(200).json({
            meta: {
                message: 'User registered successfullu'
            },
            data: {

            }
        })

    } catch (error) {

        // throw error;
        return next(error);

    }

}
const save_details_in_db = async (data) => {

    const result = await knex('public.user_registrations')
        .insert(data);

    return result;

}

const save_number_in_otp_verification_db_tabel = async (number) => {

    const data = {
        contact_no: number,
        created_at: moment(),
        updated_at: moment(),

    }

    console.log(number);
    const result = await knex('public.generate_otp')
        .insert(data);

    return result;
}

// user_registrations  api
router.post('/api/user_registrations', user_registrations);

module.exports = router;