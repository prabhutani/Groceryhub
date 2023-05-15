const mysql = require('mysql');


// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'ashish',
    database: 'groceryhub'
});


connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);
  });



module.exports = connection;
    

