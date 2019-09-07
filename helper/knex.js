const  knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'postgres',
      database : 'user_registration'
    }
  });
  //expose knex connection object;
  module.exports = knex;