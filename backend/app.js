const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const mysql = require('./mysql.config');
const mongo = require('mongodb');
const axios = require("axios");
const myconnection = mysql;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

//near me storelocator
app.post('/search',(req,res)=>{
	var location = req.body.location;
	var latitude = req.body.latitude;
	var longitude=req.body.longitude;
	var categories = "grocery,deptstores,ethicgrocery,intlgrocery";
	var radius =  3000;
	var term ='Walmart';
	var open_at = Math.floor(Date.now()/1000)
	var config={};
	
	console.log("location provided ", location);
	console.log("longitude provided", longitude);
	console.log("latitude provided", latitude);
  
	const bearerToken = "helGUeqNlXHSd-EZ2XLiQrMpQ25vAm2TNhsiJ5K2cP9XXaAeOw_Q7NvhG1TWLRvggiFQQOqK_8twVcxOqpcxpzdPTYN6Lad9l9Gu1etR4u6FO6ke7gHN6CaISkmHYHYx";
	const bearerToken2 = "ITrF-x3KyQGhcwu_KJ1UuNel0z3TmiC3icaP-2511-fMzR0eSap1qllS4OsPheTsLWYkr_T70kY1aInoIKHRB4ehHF3I7dGasIP9ZkkAccLLxewzaEoaJwKakH6EYHYx";
	const bearerToken1="eK56-qSrTKEY9waNsUaskzk7kvBlEKGMLnC8LQNDm4OCnybU67TtOGFYV8vqRLK9ejcIbMqARBXfYhV9JpUeAbCq90w8WA6vafzj6i0IeoflC7bLDG3UzczPZ7VWYHYx";
	
	if(location!=undefined||location!=null){
	  var config = {
		headers: {
			Authorization: `Bearer ${bearerToken}` 
		},
		params: {location: location,
				 limit:18,
				 categories: categories,
				 radius: radius,
				 term:term
				// open_at:open_at
				}
	  };
	}else if(longitude!=undefined&&latitude!=undefined||longitude!=null&&latitude!=null){
		var config = {
		headers: {
			Authorization: `Bearer ${bearerToken}` 
		},
		params: {
				 latitude:latitude,
				 longitude:longitude,
				 limit:18,
				 categories: categories,
				 radius: radius,
				 term:term
				// open_at:open_at
				}
	  };
	}
	axios.get( 
		'https://api.yelp.com/v3/businesses/search',
		config
	  ).then(response => {
		  res.send(response.data);
	  })
	  .catch(error => {
		res.status(500).send(error);
	  });
	
	})

//login for all roles
app.use('/login', (req, res) => {
	var uname = req.body.username;
	var psw = req.body.password;
	var role = req.body.role;
	console.log("request body ",uname);
	console.log("request body ",role);
	console.log("request body ",psw);
	myconnection.query(
		'SELECT * FROM `users` WHERE `username` = ? AND `password` = ? AND `role` = ? ',
		[ uname, psw, role ],
		function(err, results, fields) {
			if (err) {
				console.log('error');
				res.status(404).json({ err: '404 error' });
			} else if (JSON.stringify(results).length >2) {
				res.send({
					authorized:true,
					username: results[0].username,
					role: results[0].role,
					location: results[0].location,
					latitude: results[0].latitude,
					longitude: results[0].longitude
				});
			} else {
				res.status(200).send({
					authorized:false
				});
			}
		}
	);
});

//signup for all roles
app.use('/signup', (req, res) => {
	var uname = req.body.username;
	var psw = req.body.password;
	var lct = req.body.location;
	var long = req.body.longitude;
	var lat = req.body.latitude;
	var role = req.body.role;

	myconnection.query('SELECT * FROM `users` WHERE `username` = ?', [ uname ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			//User Already Exists
			res.status(200).send('authorized..');
		} else {
			//insert query
			var post = { username: uname, password: psw, location: lct, longitude: long, latitude: lat, role: role };
			var q = myconnection.query('insert into `users` set ?', post, function(error, results, fields) {
				if (error) throw error;
			});
			//recombee comes here after new user creates
			//    recombeeUserInfo ={}
			//    recombeeUserInfo.username = uname
			//    recombeeUserInfo.location = lct
			//    recombeeUserInfo.longitude = long
			//    recombeeUserInfo.latitude = lat
			//    clientRecombee.send(new rqs.SetUserValues(uname, recombeeUserInfo, {
			//     // optional parameters:
			//     'cascadeCreate': true
			//   }));
			switch (role) {
				case 'cust':
					res.status(200).json({data:'created cm'});
					break;
				case 'strmgr':
					res.status(200).json({data:'created cm'});
					break;
				case 'csr':
					res.status(200).json({data:'created cm'});
					break;
			}
		}
	});
});

//fetch all product's details based on category and handle if no category provided(shows all products) 
app.get('/products', (req, res) => {
	var category = req.params.category;
	if (category != undefined || category != null) {
		myconnection.query('SELECT * FROM `productdetails` WHERE `Category` = ?', [category], function(
			err,
			results,
			fields
		) {
			if (err) {
				console.log('error');
				res.status(404).json({ err: '404 error' });
			} else if (JSON.stringify(results).length > 2) {
				res.send(results.slice(0,50));
			} else {
				res.status(401).send('Category not present');
			}
		});
	} else {
		myconnection.query('SELECT * FROM `productdetails`', function(err, results, fields) {
			if (err) {
				console.log('error');
				res.status(404).json({ err: '404 error' });
			} else if (JSON.stringify(results).length > 2) {
				res.send(results.slice(0,50));
			} else {
				res.status(401).send('No product data');
			}
		});
	}
});

//fetchs cart details for mentioned username 
app.post('/cart', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT * FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('Cart is empty');
		}
	});
});


//count items in user's cart
app.post('/cartcount', (req, res) => {
	var username = req.body.username;
	console.log(req.body.username)
	myconnection.query('SELECT SUM(quantity) AS itemcount FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('Cart is empty');
		}
	});
});


//Adds an item to user's cart
app.post('/addtocart', (req, res) => {
	var username = req.body.productobj.username;
  var productid = req.body.productobj.Id;
  var product = req.body.productobj.Product;
  var image_small = req.body.productobj.image_small;
  var Category = req.body.productobj.Category;
  var Price = req.body.productobj.Price;
  var MRP = req.body.productobj.MRP;
  var quantity = 1;
  var total=req.body.productobj.total;

  var post = { username: username, 
                productid: productid, 
                  product: product,
                image_small: image_small, 
                Category: Category,
                 Price: Price,
                 MRP:MRP,
                 quantity:quantity,
                 total:total
              };

	myconnection.query('SELECT * FROM `cart` WHERE `username` = ? AND `productid` = ?', [ username,productid], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			//res.send(results);
      //already exist hence increment quantity
         quantity=results[0].quantity+1;
      var q = myconnection.query('update  `cart` set quantity = ?  WHERE `username` = ? AND `productid` = ?', [quantity,username,productid], function(error, results, fields) {
				if (error) throw error;
			});
      res.send("item added successfully");

		} else {
      //doesn't exist hence insert as it is
			//res.status(401).send('Cart is empty');
      var q = myconnection.query('insert into `cart` set ?', post, function(error, results, fields) {
				if (error) throw error;
			});
      res.send("item added successfully");
		}
	});
});

//Update quantity of item in user's cart
app.post('/decreasequantityincart', (req, res) => {
	var username = req.body.username;
  var productid = req.body.productid;
  myconnection.query('SELECT * FROM `cart` WHERE `username` = ? AND `productid` = ?', [ username,productid], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			//res.send(results);
      //already exist hence decrement quantity
      if(results[0].quantity>1){
        results[0].quantity=results[0].quantity-1;
      var q = myconnection.query('update  `cart` set quantity = ?  WHERE `username` = ? AND `productid` = ?', [results[0].quantity,results[0].username,results[0].productid], function(error, results, fields) {
				if (error) throw error;
			});
      res.send("item quantity updated");
      }
      else{
        res.status(401).send('use remove item instead');
      }

		} else {
      //doesn't exist hence runtime error
      res.status(401).send('item does not exist in cart');
		}
	});
});

//Delete item from user's cart
app.post('/removeitemincart', (req, res) => {
	var username = req.body.username;
  var productid = req.body.productid;
  myconnection.query('SELECT * FROM `cart` WHERE `username` = ? AND `productid` = ?', [ username,productid], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			//res.send(results);
      //already exist hence remove it
     
      var q = myconnection.query('delete from `cart` where `username`= ? and `productid`=?',[username,productid], function(error, results, fields) {
				if (error) throw error;
			});
      res.send("item removed");

		} else {
      //doesn't exist hence runtime error
      res.status(401).send('item does not exist in cart');
		}
	});
});

//Clear user's cart
app.post('/emptycart', (req, res) => {
	var username = req.body.username;
  var q = myconnection.query('delete from `cart` where `username`= ?',[username], function(error, results, fields) {
    if (error) throw error;
  });
  res.send("cart emptied");

});

//Checkout user's cart
app.post('/checkout', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT * FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('Cart is empty');
		}
	});
});


//Cancel user's order provided with order id and user id
app.post('/cancelorder', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT * FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('Cart is empty');
		}
	});
});

//fetch order provided with username id
app.post('/getorderbyuser', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT * FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('Cart is empty');
		}
	});
});

//fetch order provided with order id
app.post('/getorderbyid', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT * FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('Cart is empty');
		}
	});
});

//update user's order provided with order id
app.post('/updateorder', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT * FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('Cart is empty');
		}
	});
});

app.get('/', (req,res) => {
	if(req)
	res.json("Hey There!, we are at port 3000")
})

app.listen(port);
console.log("Hey There!, we are at port " + port)

