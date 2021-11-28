const express = require('express');
const cors = require('cors');
const app = express();
const axios = require("axios");
const port = process.env.PORT || 5000;
const mysql = require('./mysql.config');
const mongoose = require('mongoose');
// const { connectDb, getDb } = require('./mongo.config');
var moment = require("moment");

// mongoose.connect('mongodb://localhost:27017/productratings')

// var db // store db object in this object
// connectDb(() => ( db = getDb("productratings") ))

const myconnection = mysql;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

//login for all roles
app.use('/login', (req, res) => {
	var uname = req.body.username;
	var psw = req.body.password;
	var role = req.body.role;

	myconnection.query(
		'SELECT * FROM `users` WHERE `username` = ? AND `password` = ? AND `role` = ? ',
		[ uname, psw, role ],
		function(err, results, fields) {
			if (err) {
				console.log('error');
				res.status(404).json({ err: '404 error' });
			} else if (JSON.stringify(results).length >2) {
				results[0].authorized=true
				
				res.send(results[0]);
			} else {
				res.status(200).send({
					authorized:false
				});
			}
		}
	);
});

//update profile for all roles
app.post('/updateprofile', (req, res) => {
	var uname = req.body.username;
	var fn = req.body.firstname;
	var ln = req.body.lastname;
	var zip = req.body.zipcode;
	var contact = req.body.contact;
	var ct = req.body.city;
	var st = req.body.state;
	var ad1 = req.body.ad1;
	var ad2 = req.body.ad2;

	myconnection.query(
		'update `users` set firtname=?, lastname=?, zipcode=?, contact=?, city=?, state=?, ad1=?, ad2=? WHERE `username` = ? ',
		[fn,ln,zip,contact,ct,st,ad1,ad2, uname ],
		function(err, results, fields) {
			if (err) {
				console.log('error');
				res.status(404).json({ err: '404 error' });
			} else if (JSON.stringify(results).length >2) {
				results[0].authorized=true
				
				res.send({"msg":"Profile updated successfully"});
			} else {
				res.send({"msg":"Profile update failed"});
			}
		}
	);
});

//signup for all roles
app.use('/signup', (req, res) => {
	var uname = req.body.username;
	var psw = req.body.password;
	var role = req.body.role;
	var fn = req.body.firstname;
	var ln = req.body.lastname;
	var zip = req.body.zipcode;
	var contact = req.body.contact;
	var ct = req.body.city;
	var st = req.body.state;
	var ad1 = req.body.ad1;
	var ad2 = req.body.ad2;

	

	myconnection.query('SELECT * FROM `users` WHERE `username` = ?', [ uname ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			//User Already Exists
			res.status(200).send('authorized..');
		} else {
			//insert query
			var post = { username: uname, password: psw,role: role, firstname: fn, lastname: ln,zipcode:zip,city:ct,state:st,ad1:ad1,ad2:ad2,contact:contact };
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

			res.status(200).json({data:'created cm'});

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
				res.send(results);
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
				res.send(results);
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
			res.send(results);
		}
	});
});

//TODO: Product autoserach api

//count items in user's cart
app.post('/cartcount', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT count (*) AS itemcount FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
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
app.post('/subtotal', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT SUM(total) as subtotal from cart where username=? group by username;', [ username ], function(
		err,
		results,
		fields
	) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			results.push({subtotal:0})
			res.send(results);
		}
	});
});

function updateStock(quantity,pid,action){

	switch(action){
		case "dec":
			var q = myconnection.query('update  `productdetails` set stock = stock - ?  WHERE `Id` = ?', [quantity,pid], function(error, results, fields) {
				if (error) throw error;
			});
			break;
			case "inc":
				var q = myconnection.query('update  `productdetails` set stock = stock + ?  WHERE `Id` = ?', [quantity,pid], function(error, results, fields) {
					if (error) throw error;
				});
				break;
				default:
					console.log("Incorrect update action on stock");
					break;
	}

}

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
  var total=Price;

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
		 total=quantity*Price;
      var q = myconnection.query('update  `cart` set quantity = ?, total =?  WHERE `username` = ? AND `productid` = ?', [quantity,total,username,productid], function(error, results, fields) {
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


//decrease quantity of item in user's cart
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


//Update quantity of item in user's cart
app.post('/updatequantityincart', (req, res) => {
	var username = req.body.username;
  var productid = req.body.productid;
  var quantity = req.body.quantity;
  var total=0;
  myconnection.query('SELECT * FROM `cart` WHERE `username` = ? AND `productid` = ?', [ username,productid], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			//res.send(results);
      //already exist hence decrement quantity
     
        total = results[0].Price*quantity;
      var q = myconnection.query('update  `cart` set quantity = ?, total = ?  WHERE `username` = ? AND `productid` = ?', [quantity,total,username,productid], function(error, results, fields) {
				if (error) throw error;
			});
      res.send({"status":"ok"});
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
	var q = myconnection.query('delete from `cart` where `username`= ?', [ username ], function(
		error,
		results,
		fields
	) {
		if (error) throw error;
	});
	res.send('cart emptied');
});

//Checkout user's cart
app.post('/checkout', (req, res) => {
	var username = req.body.username;
	var customername = req.body.customername;
	var deliverytype= req.body.deliverytype;
	var payment= req.body.payment;
	var deliveryzip= req.body.deliveryzip;
	var selectedUser=req.body.selectedUser;
	var storeaddr = null;
	var storename= null;

	console.log("from checkout body",req.body)
	switch(deliverytype){
		case"pickup":
		var storeaddr = req.body.storeaddr;
		var storename= req.body.storename;
		break;

	}

	var cart = [];
	var purchasedate = new Date();
	var arriveby = new Date();
	arriveby.setDate(arriveby.getDate()+14);
	var status ="placed";
	var orderid=null;

	myconnection.query('SELECT * FROM `cart` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			cart = results;
			//console.log("within select",cart);
			//initialize order id
	myconnection.query('SELECT max(orderid) AS `orderidmax` FROM `customerorder`', function(err, results, fields) {
		//console.log("within ordermax select",cart);
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			if(results[0].orderidmax==null||results[0].orderidmax==undefined){
				orderid=1;
				//console.log("initialized orderid", orderid);
			}
			else{
					orderid=results[0].orderidmax+1;
				//	console.log("updated orderid", orderid);
			}
			
			cart.map(item=>{
				
				if(selectedUser!=undefined&&selectedUser!=null){
					item.username=selectedUser;
				}
				item.orderid=orderid;
				item.purchasedate=purchasedate;
					item.arriveby=arriveby;
					item.status=status;
					item.payment=payment;
					item.pid=item.productid;
					delete item.productid;
					item.storename=storename;
					item.storeaddr=storeaddr;
					item.deliveryzip = deliveryzip;
					item.deliverytype =deliverytype;
					item.customername=customername;
					updateStock(item.quantity,item.pid,"dec");
					//update product stock (decrease)
			});

			//console.log("item",cart);
			myconnection.query(
				'INSERT INTO customerorder (orderid, username,customername, pid, product, Category, quantity, Price, MRP, total, purchasedate, arriveby, status, storename, storeaddr, payment, image_small,deliveryzip,deliverytype) VALUES ?',
				[cart.map(item => [item.orderid, item.username,item.customername, item.pid, item.product,item.Category, item.quantity, item.Price, item.MRP, item.total, item.purchasedate, item.arriveby, item.status,item.storename,item.storeaddr, item.payment, item.image_small,item.deliveryzip,item.deliverytype])],
				(error, results, fields) => {
					console.log("in insert");
					if (error) throw error;
					
						//empty out the cart and update the inventory
			var q = myconnection.query('delete from `cart` where `username`= ? ', [ username ], function(
				error,
				results,
				fields
			) {
				
				if (error) throw error;
				//console.log("cart emptied successfully");
			});
					res.status(200).json({"orderid":orderid});
		
				}	
			);

		} 
	});


		
		} else {
			//doesn't exist hence runtime error
			res.status(401).send('cart is empty');
		}
	});

});

//Cancel user's order provided with order id and user id
app.post('/cancelorder', (req, res) => {
	var username = req.body.username;
	var orderid = req.body.orderid;
	//check constraint based on role
	//update product stock (increase)
	myconnection.query('select pid, quantity  FROM `customerorder` WHERE `username` = ? and `orderid` = ?', [ username,orderid ], function(err, results, fields) {
		results.map(line=>{
			updateStock(line.quantity,line.pid,"inc")
		})
	})
	myconnection.query('delete  FROM `customerorder` WHERE `username` = ? and `orderid` = ?', [ username,orderid ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send("deleted the order");
		} else {
			res.status(401).send('order does not exist');
		}
	});
});

//fetch order ids given a username 
app.post('/getorderidbyuser', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT orderid FROM `customerorder` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('order does not exist');
		}
	});
});

//fetch order provided with username id
app.post('/getorderbyuser', (req, res) => {
	var username = req.body.username;
	myconnection.query('SELECT * FROM `customerorder` WHERE `username` = ?', [ username ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('order does not exist');
		}
	});
});

//fetch order provided with order id and username
app.post('/getorderbyidanduser', (req, res) => {
	var username = req.body.username;
	var orderid = req.body.orderid;
	myconnection.query('SELECT * FROM `customerorder` WHERE `username` = ? and `orderid` = ?', [ username,orderid ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('order does not exist');
		}
	});
});

//fetch order provided with order id 
app.post('/getorderbyid', (req, res) => {
	var orderid = req.body.orderid;
	myconnection.query('SELECT * FROM `customerorder` WHERE `orderid` = ?', [orderid ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('order does not exist');
		}
	});
});

//remove an item in order given with order id, username, product id 
app.post('/removeiteminorderbyuser', (req, res) => {
	var orderid = req.body.orderid;
	var username = req.body.username;
	var pid = req.body.pid;
	//check the constraints for removing order based on role.
	//update wallet of user with credit
	//update product stock (increase)
	myconnection.query('select pid, quantity  FROM `customerorder` WHERE `username` = ? and `pid` = ?  and `orderid` = ?', [ username,pid,orderid ], function(err, results, fields) {
		results.map(line=>{
			updateStock(line.quantity,line.pid,"inc")
		})
	})
	myconnection.query('delete  FROM `customerorder` WHERE `username` = ? and `pid` = ? and `orderid` = ?', [username,pid,orderid ], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('order does not exist');
		}
	});
});

//remove an item in order given with order id, username, product id 
app.post('/removeiteminorder', (req, res) => {
	var orderid = req.body.orderid;
	var pid = req.body.pid;
	//update wallet of user with credit
	//update product stock (increase)
	myconnection.query('select pid, quantity  FROM `customerorder` WHERE `pid` = ?  and `orderid` = ?', [pid,orderid], function(err, results, fields) {
		results.map(line=>{
			updateStock(line.quantity,line.pid,"inc")
		})
	})

	myconnection.query('delete  FROM `customerorder` WHERE  `pid` = ? and `orderid` = ?', [username,pid,orderid], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			res.send(results);
		} else {
			res.status(401).send('order does not exist');
		}
	});
});


//update user's order provided with order id,qty,total and pid
app.post('/updateorder', (req, res) => {
	var username = req.body.username;
	var orderid = req.body.orderid;
	var pid = req.body.pid;
	var quantity = req.body.quantity;
	//handle total
	var total = req.body.total;
	myconnection.query('UPDATE `customerorder` SET `quantity` = ?, `total` = ? WHERE `username` = ? and `orderid` = ? and `pid` = ?', [quantity,total,username,orderid,pid ], function(err, results, fields) {
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


//Reviews and Ratings
const ratingSchema = new mongoose.Schema({
	title: String,
	username:String,
	productName:String,
	price:mongoose.Types.Decimal128,
	pid:Number,
	category:String,
	zipcode:String,
	manufacturer:String,
	onsale:String,
	rebate:String,
	rating:Number,
	date: {
	   type: Date,
	   default: Date.now
   },
	reviewText: String
 });

 const Ratings = mongoose.model('Ratings', ratingSchema);

 app.post('/postreview',async(req, res) => {

	const record = req.body
	console.log("record from body", record)
	const response = await Ratings.create(record)
	console.log(response)
	res.json({status:'ok'})
 } );


 app.post('/selectreviewbyuser',async(req, res) => {

	const username = req.body.username
	console.log("username from body", username)
	const response = await Ratings.find({username:username}).sort({'date': -1})
	  console.log("Reviews for user "+username+" : ",response)
	res.json(response)
 } );

 
 app.post('/selectreviewbypid',async(req, res) => {

	const pid = req.body.pid
	console.log("pid from body", pid)
	const response = await Ratings.find({pid:pid}).sort({'date': -1})
	console.log(response)
	res.json(response)
 } );


  /////////////////////////////////////////////////////////////////////////////////////////////
 //                              Store Manager APIs                     					//
/////////////////////////////////////////////////////////////////////////////////////////////

//Category wise rating based on time and zipcode

app.post('/categoryanalytics',async(req, res) => {

	var datefilter = req.body.datefilter;
	var rateSelected = req.body.rateSelected;
	var rateOperator = req.body.rateOperator;
	var location = req.body.location;

	var filter={}

	var isDateFilter=true;
	var d = new Date()
	d.setDate(d.getDate())
	if(datefilter === 1){
	  d.setDate(d.getDate()-1);
	}else if(datefilter === 7){
	  d.setDate(d.getDate()-7);
	}else if(datefilter === 30){
	  d.setDate(d.getDate()-30);
	}else if(datefilter === 365){
	  d.setDate(d.getDate()-365);
	}else if(datefilter === "All"){
		isDateFilter= false;
	  }
	  var filter_span = moment(d).format('YYYY-MM-DD[T00:00:00.000Z]');
	
	if(isDateFilter){
		//add to filter
		filter.date={"$gt": (new Date(filter_span)) }
	}

	if(location!=null&&location!=undefined){
		//add location to filter
		filter.zipcode=location;

	}

	switch(rateOperator){
		case "gt":
			//greater than
			filter.rating={"$gte":rateSelected};
			break;
			case "eq":
				//equal
				filter.rating={"$eq":rateSelected};
				break;
				default:
					//all ratings
					filter.rating={"$gte":3};
					break;
	}

	//console.log("pid from body", req.body)
	
	const pipeline = await Ratings.aggregate().match(filter).group({ '_id': "$category", 'count': { '$sum': 1 } }).sort({'count': -1}).pipeline();
	//console.log("pid from body",pipeline)
	const analytics=await Ratings.aggregate(pipeline);
	//console.log(analytics)
	res.json(analytics)
 } );

 //Product rating analytics based on time, zipcode, price,rating
 app.post('/productanalytics',async(req, res) => {

	var datefilter = req.body.datefilter;
	var rateSelected = req.body.rateSelected;
	var rateOperator = req.body.rateOperator;
	var location = req.body.location;
	var product = req.body.product;
	var pricefilter = req.body.pricefilter;
	var groupSelected=req.body.groupSelected;

	var groupfilter = {};
	var filter={}

	switch(groupSelected){
		case "zip":
			groupfilter={ '_id': "$category", 'count': { '$sum': 1 } }
			break;
			case "prod":
				groupfilter={ '_id': "$productName", 'count': { '$sum': 1 } }
				break;
				default:
					break;

	}
	var isDateFilter=true;
	var d = new Date()
	d.setDate(d.getDate())
	if(datefilter === 1){
	  d.setDate(d.getDate()-1);
	}else if(datefilter === 7){
	  d.setDate(d.getDate()-7);
	}else if(datefilter === 30){
	  d.setDate(d.getDate()-30);
	}else if(datefilter === 365){
	  d.setDate(d.getDate()-365);
	}else if(datefilter === "All"){
		isDateFilter= false;
	  }
	  var filter_span = moment(d).format('YYYY-MM-DD[T00:00:00.000Z]');
	
	if(isDateFilter){
		//add to filter
		filter.date={"$gt": (new Date(filter_span)) }
	}

	if(location!=null&&location!=undefined){
		//add location to filter
		filter.zipcode=location;

	}

	switch(rateOperator){
		case "gt":
			//greater than
			filter.rating={"$gte":rateSelected};
			break;
			case "eq":
				//equal
				filter.rating={"$eq":rateSelected};
				break;
				default:
					//all ratings
					filter.rating={"$gte":3};
					break;
	}

	//console.log("pid from body", req.body)
	
	const pipeline = await Ratings.aggregate().match(filter).group(groupfilter).sort({'count': -1}).pipeline();
	//console.log("pid from body",pipeline)
	const analytics=await Ratings.aggregate(pipeline);
	//console.log(analytics)
	res.json(analytics)
 } );


 //Bestsellers products per location
 //Bestsellers

//Add new product
app.post('/addproduct', (req, res) => {
	var Id = null;
	//var stock = req.body.stock;
	var Brand = req.body.Brand;
	var Product = req.body.Product;
	var Quantity = req.body.Quantity;
	var Price = req.body.Price;
	var MRP = req.body.MRP;
	var Category = req.body.Category;
	var SubCategory = req.body.SubCategory;
	var image_small = req.body.image_small;

	myconnection.query('SELECT max(Id) AS `maxId` FROM `productdetails`', function(err, results, fields) {
		//console.log("within ordermax select",cart);
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			if(results[0].maxId==null||results[0].maxId==undefined){
				Id=1;
				console.log("initialized orderid", Id);
			}
			else{
				Id=results[0].maxId+1;
					console.log("updated orderid", Id);
			}
			myconnection.query(
				'INSERT INTO productdetails (Id, Brand, Product, Quantity, Price, MRP, Category, `Sub-Category`, image_small) VALUES ?',
				[[Id, Brand, Product, Quantity, Price, MRP, Category, SubCategory, image_small]],
				(error, results, fields) => {
					res.status(200).json({"productid":Id});
		
				}	
			);

		} 
	});
});

//Delete a Product
app.post('/deleteproduct', (req, res) => {
	var Id = req.body.Id;
	var Product = req.body.Product;

	if(Id!=undefined||Id!=null){

		myconnection.query('delete  FROM `productdetails` WHERE  `Id` = ?', [Id], function(err, results, fields) {
			if (err) {
				console.log('error');
				res.status(404).json({ err: '404 error' });
			} else if (JSON.stringify(results).length > 2) {
				res.send(results);
			} else {
				res.status(401).send('product does not exist');
			}
		});
		//delete from cart and customerorder

	} else if(Product!=undefined||Product!=null){

		myconnection.query('delete  FROM `productdetails` WHERE  `Product` = ?', [Product], function(err, results, fields) {
			if (err) {
				console.log('error');
				res.status(404).json({ err: '404 error' });
			} else if (JSON.stringify(results).length > 2) {
				res.send(results);
			} else {
				res.status(401).send('product does not exist');
			}
		});
		//delete from cart and customerorder

	}

});

//update product
app.post('/updateproduct', (req, res) => {
	var Id = req.body.Id;
	//var stock = req.body.stock;
	var Brand = req.body.Brand;
	var Product = req.body.Product;
	var Quantity = req.body.Quantity;
	var Price = req.body.Price;
	var MRP = req.body.MRP;
	var Category = req.body.Category;
	var SubCategory = req.body.SubCategory;
	var image_small = req.body.image_small;

	myconnection.query('delete FROM `productdetails` where Id = ?',[Id], function(err, results, fields) {
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			myconnection.query(
				'INSERT INTO productdetails (Id, Brand, Product, Quantity, Price, MRP, Category, `Sub-Category`, image_small) VALUES ?',
				[[Id, Brand, Product, Quantity, Price, MRP, Category, SubCategory, image_small]],
				(error, results, fields) => {
					res.status(200).json({"productid":Id});
		
				}	
			);

		} 
	});
});

//Inventory Report :: Inventory List, Sales list, Rebate list
//Inventory List
//input role
app.post('/getinventory',(req,res)=>{
		var role=req.body.role;
		if(role!=undefined&&role!=null&&role=="strmgr"){

				myconnection.query('SELECT Product,Price,stock FROM `productdetails`', function(err, results, fields) {
		//console.log("within ordermax select",cart);
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			 res.send(results);
		} 
	});
		}else{

			res.json({"authorized":false});
		}

});

//Inventory Report :: Inventory List, Sales list, Rebate list
//Rebate list
//input role
app.post('/getrebatelist',(req,res)=>{
		var role=req.body.role;
		if(role!=undefined&&role!=null&&role=="strmgr"){

				myconnection.query('select * from productdetails where  stock >0 && rebate > 0', function(err, results, fields) {
		//console.log("within ordermax select",cart);
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			 res.send(results);
		} 
	});
		}else{

			res.json({"authorized":false});
		}

});


//Inventory Report :: Inventory List, Sales list, Rebate list
//Sales list
//input role
app.post('/getsaleslist',(req,res)=>{
		var role=req.body.role;
		if(role!=undefined&&role!=null&&role=="strmgr"){

				myconnection.query('select * from productdetails where  stock >0 && Price!=MRP', function(err, results, fields) {
		//console.log("within ordermax select",cart);
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			 res.send(results);
		} 
	});
		}else{

			res.json({"authorized":false});
		}

});


//Sales Report :: daily sales, product total sales 
//product total sales
//Input role
app.post('/gettotalsales',(req,res)=>{
		var role=req.body.role;
		if(role!=undefined&&role!=null&&role=="strmgr"){

				myconnection.query('select DISTINCT(temp.Product),temp.salesquantity,customerorder.Price, temp.salesquantity*customerorder.Price as total from customerorder, (select Product, sum(quantity) as salesquantity from customerorder group by Product) as temp where customerorder.Product = temp.Product', function(err, results, fields) {
		//console.log("within ordermax select",cart);
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			 res.send(results);
		} 
	});
		}else{

			res.json({"authorized":false});
		}

});




//Sales Report :: daily sales, product total sales 
//daily sales
//Input role
app.post('/getdailysales',(req,res)=>{
		var role=req.body.role;
		if(role!=undefined&&role!=null&&role=="strmgr"){

				myconnection.query('SELECT sum(quantity) as soldquantity,sum(total) as totalsales, purchasedate from customerorder group by purchasedate', function(err, results, fields) {
		//console.log("within ordermax select",cart);
		if (err) {
			console.log('error');
			res.status(404).json({ err: '404 error' });
		} else if (JSON.stringify(results).length > 2) {
			 res.send(results);
		} 
	});
		}else{

			res.json({"authorized":false});
		}

});



//Trending
//Filter

//Write/read review


//manage address
//select store

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
				 limit:6,
				 categories: categories,
				 radius: radius,
				 term:term,
				 open_at:open_at
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
				 limit:6,
				 categories: categories,
				 radius: radius,
				 term:term,
				 open_at:open_at
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
	
	});

	//near me storelocator
app.post('/stores',(req,res)=>{
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
				 limit:6,
				 categories: categories,
				 radius: radius,
				 term:term,
				 open_at:open_at
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
				 limit:6,
				 categories: categories,
				 radius: radius,
				 term:term,
				 open_at:open_at
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
	
	});


app.listen(port, () => {
	console.log('Express server running on port ', port);
});
