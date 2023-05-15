# Groceryhub
Grocery Shopping Application

/////////////////Project Final///////////////////////

/////////////////GROCERY HUB////////////////////////////

/////////////////////Group 15///////////////////////////////
 
Pathak, Vikas- A20460927 ( Team Leader ) Email: vpathak1@hawk.iit.edu  

Bhangale, Ashish Prakash  – A20467984 Email : abhangale@hawk.iit.edu

Bhutani, Prashant – A20488431 Email : pbhutani@hawk.iit.edu

		 
////////////////////////	//////////////////////////////////			   
 
The build and run instructions :


* To Fire up the backend server follow up these steps:
     # Go to project folder path : "GroceryHub\backend\" 
     # open cmd in folder path 
     # run "npm install" command
     # run "npm start" command 
     # keep this terminal open

* To Fire up frontend react server follow up these steps:     
     # Go to project folder path : "GroceryHub\frontend\" 
     # open cmd in folder path
     # run "npm install" command 
     # run "npm start" command 
     # keep this terminal open
     # If the browser does not open up automatically , copy paste the url given below in the browser address bar:
                http://localhost:3000/

# To create database 

	MySql
	# run the commands given in DML.txt in project folder 
	MongoDB
	# run use productratings in mongo shell
	
# For Knowledge graph 
	In project folder : backend-knowledge-graph 
	#run commands present in cypher.text
	#import the csv file provided in Neo4j


How many total lines of code written?

Frontend: 3422

Backend: 1239

Other Scripts: (Scraping/ SQL Dump): 200


Total Lines of Codes: 5361


#Required assignments features implemented and functional in our project:

	*Application has different types of grocery product and different categories of grocery for each type.

 #User Account/Profile/Transaction management & SQL/NoSQL DB
  	1.The CSR Agent can create new customer account.
	2.The Store Manager shall be able to Add/Delete/Update grocery products.
	3.The CSR Agent shall be able to Add/Delete/Update customer orders.
	4.The customer must be able to create an account online.
	5.The customer must be able to purchase an grocery product online, check the status of the order, or cancel the order.
	6.The customer shall pay using a credit card online in the checkout page.
	7.Some of the grocery products shall have retailer special-discounts.
	8.Some of the grocery products shall have rebates.
	9.Customer shall be able to shop online to Reserve one or multiple items in the same session from the grocery hub online site.
	10.In the same session, the customer must be able to add or remove items from the shopping cart.
	11.When the customer chooses to check out:
		a) The customer will have personal information fetched from profile for shipping details.
		b) The customer can change/update shipping information.
		c) The customer can opt for Delivery or Pickup. 
			a) In delivery he can choose his saved address
			b) In pickup he will be provided with store details and google map location using near me ( populated with help of yelp in realtime ) 

	12.The customer will be provided with a confirmation number and a Reserve date (2 weeks after the order date) that the customer can use to cancel an order using the order id.
	13.MySQL shall be used to store all accounts login information.
	14.MySQL shall be used to store All Customers transactions/orders.

#Reviews & MongoDB	
	1.All customers shall able to write, submit, view review for any grocery product online which is stored in MongoDB

 
#Analytics & Visual Reports    	
	1.Under the Inventory link, the store manager shall be able to:
		a) Generate a table of all grocery products and how many items of every product currently available in the Site.
		b) Generate a Bar Chart that shows the grocery product names and the total number of items available for every category.
		c) Generate a table of all grocery product currently on sale.
		d) Generate a table of all grocery product currently that have manufacturer rebates.
	2.Under the Sales Report link, the store manager shall be able to:
		a) Generate a table of all grocery products sold and how many items of every grocery products sold number of items sold, and total sales of every product sold.
		b) Generate a Bar Chart that shows the grocery product names and the total sales for every grocery products.
		c) Generate a table of total daily sales transactions; that is, you list the dates and total sales for every day-date.
	3.DATA ANALYTICS: for store manager to view category wise review count for past day, past week, past month, past year
			 ( used PIE-Chart for visualisation )

  
#Auto-Complete Search feature
	1.Usage of AutoComplete Feature for all the product in the Database. ( Present and Working Everywhere )   
  
#Google MAPS - Near ME search feature
	1.On home page in navbar section, user is provided with "Store Locator" feature with zipcode input , map and store details markers. 
	2.In Order pickup he will be provided with store details and google map location using near me ( populated with help of yelp in realtime ) 
  
#Knowledge Graph Searches & Neo4J     
	1. Get the number of transactions that were NOT delivered on time for
	   every Delivery Zip Code

	2. Get the number of disputed transactions and the list of customer
           names for these disputed transactions for Delivery Zip Code

	3. Get the number of disputed transactions for EVERY CUSTOMER that
           has more that one disputed transaction

	4. Get the top 3 customers that reported the maximum number of
           returned orders

	5. Get the number of returned orders and got review rating 1 for every
           product category in every Delivery Zip Code

#Twitter matches
	1.Usage of Node Script to connect to twitter API to retrieve data and match with any grocery product names in the DB to display on the Home screen for any Deals.

#Recommender
		1. Used Recombee Platform for recommeding products 
		2. Based on the history of the user purchases and after the user makes a purchase, your enterprise web application, shall make three product recommendations for the logged in user.

  
#Add-on features
	1.Scraping of products, other data of Bigbasket website through puppeteer.


#Not Implemented Features : 
	

	#Trending
		1.Trending link on the left navigation bar that the user can use to see trends for grocery products that is sold.
		2.Once the user clicks the Trending, the user must be presented with:
			1.Top five most liked products.
			2.Top five zip-codes where maximum number of products sold.
			3.Top five most sold products regardless of the rating.
  
  



