const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://12260590:admin123@cluster0.kkepkjp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Global for general use
var userCollection;
var orderCollection;

async function connectDB() {
  
	try {

	  await client.connect();
	  console.log("Connected to MongoDB Atlas\n");
	  
	  const db = client.db("giftdelivery"); 
	  userCollection = db.collection("users"); 
	  orderCollection = db.collection("orders");

    } catch (error) {
    
	  console.error("MongoDB connection error:", error + "\n");
    }
}

connectDB();


app.get('/', (req, res) => {

  	res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})


app.get('/getUserDataTest', async (req, res) => {
	
	try {
		
		const docs = await userCollection.find({}).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 

	} catch (err) {

		res.status(500).json({ message: "Server error", error: err });
	}
});
  

app.get('/getOrderDataTest', async (req, res) => {
	
	try {

		const docs = await orderCollection.find({}).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 

	} catch (err) {

		res.status(500).json({ message: "Server error", error: err });
	}
});



app.post('/verifyUserCredential', async (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	const loginData = req.body;

	try {  

		const doc = await userCollection.findOne({email:loginData.email, password:loginData.password}, {projection:{_id:0}});
		console.log( JSON.stringify(doc) + " have been retrieved\n");
		res.status(200).send(doc); 
  
	} catch (err) {
  
		res.status(500).json({ message: "Server error", error: err });
	}
});

app.get('/findUser', async (req, res) => {

	console.log("GET request received : " + JSON.stringify(req.query.email) + "\n");

	const userEmail = req.query.email;

	try {
		const user = await userCollection.findOne({email: userEmail});
		res.status(200).send(user || {});
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err });
	}
	
})

app.post('/createNewUser', async (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n");
	
	const signupData = req.body;

	try {
		const reply = await userCollection.insertOne(signupData);
		res.status(200).send(reply);

	} catch (err) {
		res.status(500).json({ message: "Server error", error: err });
	}
})

app.get('/getOrderList', async (req, res) => {

	const email = req.query.email;

	console.log("GET request received -- Email:", email);

    if (!email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

	try {
		const ordersList = await orderCollection.find({customerEmail: email}).toArray();

        res.status(200).json(ordersList);

	} catch (err) {
		res.status(500).json({ message: "Server error", error: err })
	}
})


app.post('/insertOrderData', async (req, res) => {
    
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	const orderData = req.body; 	

	try {

		const result = await orderCollection.insertOne(orderData);
		console.log("Order record with ID "+ result.insertedId + " have been inserted\n");
		res.status(200).send(result);

	} catch (err) {
		res.status(500).json({ message: "Server error", error: err });
	}
    
});

app.delete('/deleteOrders', async (req, res) => {

	const email = req.query.email;

	console.log("DELETE: " + email);
	
	try {
		const result = await orderCollection.deleteMany({customerEmail: email});

		res.status(200).json({ message: 'Successfully deleted past orders.', deletedOrdersCount: result.deletedCount });
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err });
	}
})

  
app.listen(port, () => {

  	console.log(`Gift Delivery server app listening at http://localhost:${port}`) 
});
