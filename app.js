const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
const path = require('path');
const bcrypt = require('bcrypt');
const treeify = require('treeify');

const Pool = require('pg').Pool;
const pool = new Pool({
    user:'sprint',
    host:'localhost',
    database:'sprint_2',
    password:'password',
    port:'5432'
});

app.use(session({secret:"Sem3Sprint2"}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.get("/", function(req, res) {
    if(req.session.count === undefined){
        req.session.count = 0;
    }
    const count = req.session.count;
    req.session.count = req.session.count + 1;
    res.send(`you've visited ${count} times!`);
});

app.listen(port, function(){
    console.log(`listening at http://localhost:${port}`);
});


//AUTHENTICATION

//Sign In
app.get("/signIn", function(req, res){
    res.sendFile(path.join(__dirname, 'signIn.html'));
});
app.post("/signIn", async function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    let results = await pool.query("SELECT * FROM users WHERE email =$1", [email]);
    if(results.rows < 1){
        res.send("Oh no! no account found.");
    }else if(results.rows > 1){
        console.warn("there are two accounts with the same email!");
    }else{
        if(bcrypt.compare(password, results.rows[0].password)){
            req.session.loggedIn = true;
            res.send("congrats! you've logged in");
        }else{
            res.send("invailid password please try again");
        }
    }
});

//Sign Up
app.get("/signUp", function(req, res){
    res.sendFile(path.join(__dirname, 'signUp.html'));
});

app.post("/signUp",  async function(req, res){
    let email = req.body.email;
    let password = req.body.password;
    let encrypted_password = await bcrypt.hash(password, 10);
    let results = await pool.query('SELECT * FROM users where email = $1', [email]);
    if(results.rows.length > 0){
        res.send("error! there is already an account with this email");
    }else{
        let insert_result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, encrypted_password]);
        res.send("created account!");
    }
});

app.get("/secret", async function (req, res){
    if (req.session.loggedIn === true) {
        res.send("Hey! You can see this!");
    } else {
        res.send("Hey! you must be logged in to view this!");
    }
});


//AUTHORIZATION






// Node Object
class Node {
	constructor(data, left = null, right = null) {
		this.data = data;
		this.left = left;
		this.right = right;
	}
}

// Binary Tree
class BST {
	constructor() {
		this.root = null;
	}
	add(data) {
		const node = this.root;
		if (node === null) {
			this.root = new Node(data);
			return;
		} else {
			const searchTree = function(node) {
				if (data < node.data) {
					if (node.left === null) {
						node.left = new Node(data);
						return;
					} else if (node.left !== null) {
						return searchTree(node.left);
					}
				} else if (data > node.data) {
					if (node.right === null) {
						node.right = new Node(data);
						return;
					} else if (node.right !== null) {
						return searchTree(node.right);
					}
				} else {
					return null;
				}
			};
			return searchTree(node);
		}
	}
	findMin() {
		let current = this.root;
		while (current.left !== null) {
			current = current.left;
		}
		return current.data;
	}
	findMax() {
		let current = this.root;
		while (current.right !== null) {
			current = current.right;
		}
		return current.data;
	}
	find(data) {
		let current = this.root;
		while (current.right !== null) {
			if (data < current.data) {
				current = current.left;
			} else {
				current = current.right;
			}
			if (current === null) {
				return null;
			}
		}
		return current;
	}
	isPresent(data) {
		let current = this.root;
		while (current) {
			if (data === current.data) {
				return true;
			}
			if (data < current.data) {
				current = current.left;
			} else {
				current = current.right;
			}
		}
		return false;
	}
	remove(data) {
		const removeNode = function(node, data) {
			if (node == null) {
				return null;
			}
			if (data == node.data) {
				if (node.left == null && node.right == null) {
					return null;
				}
				if (node.left == null) {
					return node.right;
				}
				if (node.right == null) {
					return node.left;
				}
				let tempNode = node.right;
				while (tempNode.left !== null) {
					tempNode = tempNode.left;
				}
				node.data = tempNode.data;
				node.right = removeNode(node.right, tempNode.data);
				return node;
			} else if ( data < node.data) {
				node.left = removeNode(node.left, data);
				return node;
			} else {
				node.right = removeNode(node.right, data);
				return node;
			}
		};
		this.root = removeNode(this.root, data);
	}

}



const bst = new BST();


/*
try{
	pool.query(`SELECT * FROM role_access_routes where role_id = 1`, async function (err, results) {
	if (err){
	console.log(err);
	} else {
	var i;
	for ( i = 0; i < results.rowCount;i++){
		routeVarArray.push(results.rows[i]);
		console.log(routeVarArray);
	}
	}
});
}catch(err){
	console.log(err);
}
*/

//console.log("RouteVarArray: ", routeVarArray);

const RouteVar = new Promise(function(resolve, reject) {
	return pool.query(`SELECT * FROM roles_and_their_routes WHERE role_name = 'Administrator'`, function (err, result){
		if (err) reject(err);
		//console.log(result);
		resolve(result);
		
	});
});



/*
RouteVar
.then(function(result){
	//console.log("RouteVarArray: ", result);
	bst.add(result);
	console.log(bst);
})
.catch(console.log);
*/

const updateBST = async (routeVar) =>{
	const data = await routeVar;
	//console.log("Updating BST with: ", data);
	for ( let i = 0; i < data.rowCount;i++){
		bst.add(data.rows[i]);
		console.log(data.rows[i]);
	}
	console.log(treeify.asTree(bst, true));
}
//(async function() {
	 updateBST(RouteVar);
//})();

const bst2 = new BST();

const RouteVar2 = new Promise(function(resolve, reject) {
	return pool.query(`SELECT * FROM roles_and_their_routes WHERE role_name = 'Super User'`, function (err, result){
		if (err) reject(err);
		//console.log(result);
		resolve(result);
	});
});

const updateBST2 = async (routeVar) =>{
	const data = await routeVar;
	//console.log("Updating BST with: ", data);
	for ( let i = 0; i < data.rowCount;i++){
		bst2.add(data.rows[i]);
		console.log(data.rows[i]);
	}
	console.log(treeify.asTree(bst2, true));
}
//(async function() {
	 updateBST2(RouteVar2);
//})();

const bst3 = new BST();

const RouteVar3 = new Promise(function(resolve, reject) {
	return pool.query(`SELECT * FROM roles_and_their_routes WHERE role_name = 'Customer'`, function (err, result){
		if (err) reject(err);
		//console.log(result);
		resolve(result);
	});
});

const updateBST3 = async (routeVar) =>{
	const data = await routeVar;
	//console.log("Updating BST with: ", data);
	for ( let i = 0; i < data.rowCount;i++){
		bst3.add(data.rows[i]);
		console.log(data.rows[i]);
	}
	console.log(treeify.asTree(bst3, true));
}
//(async function() {
	 updateBST3(RouteVar3);
//})();

//console.log(bst.isPresent(routeVarArray));
//console.log(bst);
//console.log(bst);
//console.log(data);
//console.log(bst.find.RouteVar);
//console.log(bst.data);
//console.log("BST: ", bst);
//console.log(bst.find(RouteVar));
//console.log(bst.isPresent(4));

//console.log(bst.root.Node);
//console.log(bst.isPresent(1));

/**
 *          Promise
 *             |
 *          Pending (undefined)
 *          /      \
 *     Resolved    Rejected ("throw" err)
 * (use returned data)
 *
**/