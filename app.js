const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
const path = require('path');
const bcrypt = require('bcrypt');
const treeify = require('treeify');
const Compare = require('compare');
const defaultCompare = require('default-compare');


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
	constructor(key) {
	  this.key = key; 
	  this.left = null; 
	  this.right = null; 
	}
      }

// Binary Tree
class BST {
	constructor(compareFn = defaultCompare) {
		this.compareFn = compareFn; // used to compare node values
		this.root = null; // {1} root node of type Node
	}
	insert(key) {
		if (this.root == null) { // {1}
			this.root = new Node(key); // {2}
		} else {
			this.insertNode(this.root, key); // {3}
		}
	}
	insertNode(node, key) {
		if (this.compareFn(key, node.key) === Compare.LESS_THAN) { // {4}
			if (node.left == null) { // {5}
				node.left = new Node(key); // {6}
			} else {
				this.insertNode(node.left, key); // {7}
			}
		} else {
			if (node.right == null) { // {8}
				node.right = new Node(key); // {9}
			} else {
				this.insertNode(node.right, key); // {10}
			}
		}
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

// NODE BALANCING AVL TREE EXTENSION. EXTENDS THE BST CLASS
class AVLTree extends BST {
	constructor(compareFn = defaultCompare) {
		super(compareFn);
		this.compareFn = compareFn;
		this.root = null;
	}
	getNodeHeight(node) {
		if (node == null) {
			return -1;
		}
		return Math.max(
			this.getNodeHeight(node.left), this.getNodeHeight(node.right)
		) + 1;
	}
	getBalanceFactor(node) {
		const heightDifference = this.getNodeHeight(node.left) - this.getNodeHeight(node.right);
		switch (heightDifference) {
			case -2:
				return BalanceFactor.UNBALANCED_RIGHT;
			case -1:
				return BalanceFactor.SLIGHTLY_UNBALANCED_RIGHT;
			case 1:
				return BalanceFactor.SLIGHTLY_UNBALANCED_LEFT;
			case 2:
				return BalanceFactor.UNBALANCED_LEFT;
			default:
				return BalanceFactor.BALANCED;
		}
	}
	rotationLL(node) {
		const tmp = node.left; // {1}
		node.left = tmp.right; // {2}
		tmp.right = node; // {3}
		return tmp;
	}
	rotationRR(node) {
		const tmp = node.right; // {1}
		node.right = tmp.left; // {2}
		tmp.left = node; // {3}
		return tmp;
	}
	rotationLR(node) {
		node.left = this.rotationRR(node.left);
		return this.rotationLL(node);
	}
	rotationRL(node) {
		node.right = this.rotationLL(node.right);
		return this.rotationRR(node);
	}
	insert(key) {
		this.root = this.insertNode(this.root, key);
	}
	insertNode(node, key) {
		// insert node as in BST tree
		if (node == null) {
			return new Node(key);
		} else if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
			node.left = this.insertNode(node.left, key);
		} else if (this.compareFn(key, node.key) === Compare.BIGGER_THAN) {
			node.right = this.insertNode(node.right, key);
		} else {
			return node; // duplicated key
		}
		// balance the tree if needed
		const balanceFactor = this.getBalanceFactor(node); // {1}
		if (balanceFactor === BalanceFactor.UNBALANCED_LEFT) { // {2}
			if (this.compareFn(key, node.left.key) === Compare.LESS_THAN) { // {3}
				node = this.rotationLL(node); // {4}
			} else {
				return this.rotationLR(node); // {5}
			}
		}
		if (balanceFactor === BalanceFactor.UNBALANCED_RIGHT) { // {6}
			if (
				this.compareFn(key, node.right.key) === Compare.BIGGER_THAN
			) { // {7}
				node = this.rotationRR(node); // {8}
			} else {
				return this.rotationRL(node); // {9}
			}
		}
		return node;
	}
	removeNode(node, key) {
		node = super.removeNode(node, key); // {1}
		if (node == null) {
			return node; // null, no need to balance
		}
		// verify if tree is balanced
		const balanceFactor = this.getBalanceFactor(node); // {2}
		if (balanceFactor === BalanceFactor.UNBALANCED_LEFT) { // {3}
			const balanceFactorLeft = this.getBalanceFactor(node.left); // {4}
			if (
				balanceFactorLeft === BalanceFactor.BALANCED ||
				balanceFactorLeft === BalanceFactor.SLIGHTLY_UNBALANCED_LEFT
			) { // {5}
				return this.rotationLL(node); // {6}
			}
			if (
				balanceFactorLeft === BalanceFactor.SLIGHTLY_UNBALANCED_RIGHT
			) { // {7}
				return this.rotationLR(node.left); // {8}
			}
		}
		if (balanceFactor === BalanceFactor.UNBALANCED_RIGHT) { // {9}
			const balanceFactorRight = this.getBalanceFactor(node.right); // {10}
			if (
				balanceFactorRight === BalanceFactor.BALANCED ||
				balanceFactorRight === BalanceFactor.SLIGHTLY_UNBALANCED_RIGHT
			) { // {11}
				return this.rotationRR(node); // {12}
			}
			if (
				balanceFactorRight === BalanceFactor.SLIGHTLY_UNBALANCED_LEFT
			) { // {13}
				return this.rotationRL(node.right); // {14}
			}
		}
		return node;
	}
}

const BalanceFactor = {
	UNBALANCED_RIGHT: 1,
	SLIGHTLY_UNBALANCED_RIGHT: 2,
	BALANCED: 3,
	SLIGHTLY_UNBALANCED_LEFT: 4,
	UNBALANCED_LEFT: 5
};

const bst = new AVLTree();






const RouteVar = new Promise(function(resolve, reject) {
	return pool.query(`SELECT * FROM roles_and_their_routes WHERE role_name = 'Administrator'`, function (err, result){
		if (err) reject(err);
		resolve(result);
		
	});
});



const updateBST = async (routeVar) =>{
	const data = await routeVar;
	for ( let i = 0; i < data.rowCount;i++){
		bst.insert(data.rows[i]);
		
	}
	console.log(treeify.asTree(bst, false));
};

updateBST(RouteVar);


const bst2 = new BST();

const RouteVar2 = new Promise(function(resolve, reject) {
	return pool.query(`SELECT * FROM roles_and_their_routes WHERE role_name = 'Super User'`, function (err, result){
		if (err) reject(err);
		resolve(result);
	});
});

const updateBST2 = async (routeVar) =>{
	const data = await routeVar;
	for ( let i = 0; i < data.rowCount;i++){
		bst2.insert(data.rows[i]);
		
	}
	console.log(treeify.asTree(bst2, false));
};

updateBST2(RouteVar2);


const bst3 = new BST();

const RouteVar3 = new Promise(function(resolve, reject) {
	return pool.query(`SELECT * FROM roles_and_their_routes WHERE role_name = 'Customer'`, function (err, result){
		if (err) reject(err);
		resolve(result);
	});
});

const updateBST3 = async (routeVar) =>{
	const data = await routeVar;
	for ( let i = 0; i < data.rowCount;i++){
		bst3.insert(data.rows[i]);
	
	}
	console.log(treeify.asTree(bst3, false));
};


updateBST3(RouteVar3);


bst.insert(11);
bst.insert(5);
bst.insert(7);
bst.insert(15);
bst.insert(5);
bst.insert(3);
bst.insert(9);
bst.insert(8);
bst.insert(10);
bst.insert(13);
bst.insert(12);
bst.insert(14);
bst.insert(20);
bst.insert(18);
bst.insert(25);