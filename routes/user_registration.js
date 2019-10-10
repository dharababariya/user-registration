
const express = require('express');
const router = express.Router();
const knex = require('../helper/knex');
const moment = require('moment-timezone');


const Joi = require('joi');

var AWS = require("aws-sdk");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const S3FS = require('s3fs');
const jwt = require('jsonwebtoken');
const my_secret = 'Thanks4help';

const s3fsImpl = new S3FS('license-img/images', {
    secretAccessKey: 'cYsoaYuPNcP5Z5Gu93dlj6D8R4qLY8G4rXTc4jkD',
    accessKeyId: 'AKIAICRY6INC5Z2S75FQ',
    region: 'ap-south-1',
})


const user_registrations = async (req, res, next) => {

    try {
        const input = {
            username: req.body.username,
            full_name: req.body.full_name,
            bio: req.body.bio,
            address: req.body.address,
            work_auth_status: req.body.work_auth_status,
            files: req.files,
            routing_number: req.body.routing_number,
            bank_name: req.body.bank_name,
            account_number: req.body.account_number,
            ssn: req.body.ssn,
            activity: req.body.activity,
            practical_exp: req.body.practical_exp,
            coached: req.body.coached,
            awards: JSON.stringify(req.body.awards),
            how_did_you_hear: req.body.how_did_you_hear,
        }


        const data = req.body


        Joi.validate(data, schema, async (err, value) => {

            const new_user = await knex('public.user_registrations')
                .where('username', input.username)
                .select('*');


            if (err) {
                // send a 422 error response if validation fails
                res.status(422).json({
                    meta: {
                        status: '0',
                        message: `⚠️ Enter ${err}`
                    },
                    data: {

                    }

                });


            } else if (new_user.length != 0) {

                return res.status(400).json({
                    meta: {
                        status: '1',
                        message: '⚠️ User Alredy Registered'
                    },
                    data: {

                    }
                })


            } else {


                const files = input.files;

                await save_details_in_db(input);

                const url = [];

                for (let index = 0; index < files.length; index++) {
                    const element = files[index];

                    const buffer = element.buffer

                    const file_name = `${Date.now().toString()}.png`;

                    s3ImageObj = await s3fsImpl.writeFile(file_name, buffer);

                    const obj = new Object();

                    url[index] = obj;

                    const s3_url = `https://license-img.s3.ap-south-1.amazonaws.com/images/${file_name}`;

                    obj.url = s3_url;

                    const s3_path = await s3fsImpl.getPath(file_name);

                    obj.path = `s3://${s3_path}`;
                }

                const add_urls_in_db = await knex('public.user_registrations')
                    .where('username', input.username)
                    .update('driver_licence_front_url', url[0].url)
                    .update('driver_licence_front_path', url[0].path)
                    .update('driver_licence_back_url', url[1].url)
                    .update('driver_licence_back_path', url[1].path)


                const get_token = await generate_token();

                const save_token_db = await knex('public.user_registrations')
                    .update('token', get_token)
                    .where('username', req.body.username)


                return res.status(201).json({
                    meta: {
                        status: '2',
                        message: 'User registered successfully ✅️'
                    },
                    data: {

                    }
                })

            }
        })


    } catch (error) {

        // throw error;

        return res.status(424).json({
            meta: {
                status: '3',
                message: `Failed ${error}`
            },
            data: {

            }
        })
        //  return next(error);
    }

}
const save_details_in_db = async (data) => {

    delete data.files;

    const result = await knex('public.user_registrations')
        .insert(data);

    return result;

}


const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    full_name: Joi.string().min(3).max(40).required(),
    address: Joi.string().min(3).max(200).required(),
    bio: Joi.string().max(200),
    work_auth_status: Joi.string(),
    routing_number: Joi.number(),
    bank_name: Joi.string(),
    account_number: Joi.string(),
    ssn: Joi.string(),
    activity: Joi.string(),
    practical_exp: Joi.string(),
    coached: Joi.string(),
    awards: Joi.array(),
    how_did_you_hear: Joi.string()
})

const generate_token = async (data) => {
    const token = jwt.sign({ data }, my_secret, {
        expiresIn: '24h' // expires in 24 hours
    });

    return token;
}

// user_registrations  api
router.post('/api/user_registrations', upload.array('files', 2), user_registrations);

module.exports = router;