let mysql = require("mysql");
let inquirer = require("inquirer");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Manager provided id: " + connection.threadId); 
    console.log("\n\nWelcome to bAmazon!\n\n");
    start();
});


start = () => {
    inquirer
    .prompt([
        {
            name: "task",
            type: "list",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add a New Product", "Exit"]
        }
    ])
    .then(function(input) {
        if (input.task == "View Products for Sale") {
            showTable();
        } else if (input.task == "View Low Inventory") {
            low();
        } else if (input.task == "Add to Inventory") {
            add();
        } else if (input.task == "Add a New Product") {
            addNew();
        } else {
            console.log("\n\nThank you for being a part of bAmazon and hope you have a wonderful day!");
            connection.end();
        }
    });
};

showTable = () => {
    console.log("\n\nViewing Products for Sale.");
    connection.query("SELECT * from products",  
    function(err, res) {
        if (err) throw err;
        console.table(res);
        console.log("\n\n");
        start();
    });
};

low = () => {
    console.log("\n\nViewing Low Inventory (Quantity Less than 25).");
    connection.query("SELECT * from products WHERE stock_quantity < 25",  
    function(err, res) {
        if (err) throw err;
        console.table(res);
        console.log("\n\n");
        start();
    });
}

add = () => {
    console.log("\n\nAdding to low inventory.");
    connection.query("SELECT * from products",  
    function(err, res) {
        if (err) throw err;
        console.table(res);
        console.log("\n\n");

        inquirer
        .prompt([
            {
                name: "want",
                type: "number",
                message: "What is the item_id of the product you wish to add to?",
                validate: function(input) {
                    if (input > 0 && input <= res.length) {
                        return true;
                    } else {
                        console.log("\n\nPlease enter a valid item_id.\n");
                        return false;
                    }
                }
            }
        ])
        .then(function(input) {
            var want = parseInt(input.want) - 1;
            console.log("\n");
            inquirer
            .prompt([
                {
                    name: "amount",
                    type: "number",
                    message: "How much stock are you adding?",
                    validate: function(input) {
                        if (isNaN(input)) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }
            ])
            .then(function(input) {
                var amount = parseInt(input.amount);
                var newStock = (res[want].stock_quantity + amount);
                //console.log(newStock);
                //console.log(want);

                connection.query("UPDATE products SET ? WHERE ?", [
                    {stock_quantity: newStock},
                    {item_id: want + 1}
                ], function(err, response) {
                    if (err) throw err;
                    console.log("\nItem(s): " + res[want].product_name);
                    console.log("Item Count: " + amount);
                    console.log("-----------------------------------");
                    console.log("Items have been added to inventory!\n\n");
                    start();
                });
            });
        });
    });
};

addNew = () => {
    console.log("\n\nAdding a new item.");
    var deptNames = [];

    connection.query("SELECT DISTINCT department_name FROM products", 
    function(err, res) {
        if (err) throw err;
        //console.log(res);
        for (var i = 0; i < res.length; i++) {
            deptNames.push(res[i].department_name);
        }
    });
    inquirer
    .prompt([
        {
            name: "item",
            type: "product",
            message: "What is the name of the item?",
            validate: function (value) {
                if (value) {
                    return true;
                } else {
                    console.log("\n\nPlease enter a valid item name.\n");
                    return false;
                }
            }
        }, {
            name: "price",
            type: "number",
            message: "What is the price of the item?",
            validate: function(value) {
                if (isNaN(value)) {
                    console.log("\n\nPlease enter a valid amount.\n");
                    return false;
                } else {
                    return true;
                }
            }
        }, {
            name: "amount",
            type: "number",
            message: "How many items are you adding?",
            validate: function(value) {
                if (value < 0 || isNaN(value)) {
                    console.log("\n\nPlease enter a valid amount.\n");
                    return false;
                } else {
                    return true;
                }
            }
        }, {
            name: "dept",
            type: "list",
            message: "Which department are you adding the new item to?",
            choices: deptNames
        }
    ])
    .then(function(input) {
        connection.query("INSERT INTO products SET ?", {
            product_name: input.item,
            department_name: input.dept,
            price: input.price,
            stock_quantity: input.amount
            //item, dept, price, amount
        }, function(err, res) {
            if (err) throw err;
            console.log("\n\nAdding item to inventory. . .");
            console.log("Item: " + input.item);
            console.log("Department: " + input.dept);
            console.log("Price: $" + input.price);
            console.log("Amount: " + input.amount);
            console.log("-----------------------------------");
            console.log("Item(s) has been added to the inventory.\n\n");
            start();
        })
    })
}

