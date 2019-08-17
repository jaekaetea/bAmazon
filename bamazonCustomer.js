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
    console.log("Customer provided id: " + connection.threadId); 
    console.log("\n\nWelcome to bAmazon!\n\n");
    start();
});

showTable = () => {
    connection.query("SELECT * from products",  
    function(err, res) {
        results = res;
        if (err) throw err;
        console.table(res);
        console.log("\n\n");

        inquirer
        .prompt([
            {
                name: "want",
                type: "number",
                message: "What is the item_id of the product you would like to buy?",
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
            var quantity = parseInt(res[want].stock_quantity);
            if (quantity === 0) {
                console.log("\n\nWe are sorry, but we are out of stock of the item you requested.\n\n");
                start();
            } else {
                console.log("\n");

                inquirer
                .prompt([
                    {
                        name: "amount",
                        type: "number",
                        message: "How many would you like to buy?",
                        validate: function(input) {
                            if (input > 0 && input <= quantity) {
                                return true; 
                            } else if (input > quantity) {
                                console.log("\n\nInsufficient quantity!\n");
                                return false;
                            } else {
                                console.log("\n\nPlease enter a valid amount.\n");
                                return false;
                            }
                        }
                    }
                ])
                .then(function(input) {
                    var amount = parseInt(input.amount);
                    var newStock = (res[want].stock_quantity - amount);
                    //console.log(newStock);
                    //console.log(want);

                    connection.query("UPDATE products SET ? WHERE ?", [
                        {stock_quantity: newStock},
                        {item_id: want + 1}
                    ], function(err, response) {
                        if (err) throw err;
                        console.log("\nItem(s): " + res[want].product_name);
                        console.log("Price: $" + res[want].price);
                        console.log("Item Count: " + amount);
                        console.log("-----------------------------------");
                        var total = (input.amount * parseFloat(res[want].price)).toFixed(2);
                        console.log("Your total is: $" + total);
                        console.log("Thank you for making your purchase!\n\n");
                        
                        //Updating Department
                        connection.query("SELECT * FROM departments", function(err, results) {
                            if (err) throw err;
                            var index;
                            //console.table(results);
                            for (var i = 0; i < results.length; i++) {
                                if (results[i].department_name === res[want].department_name) {
                                    index = i;
                                    //console.log(i);
                                }
                            }
                            connection.query("UPDATE departments SET ? WHERE ?", [
                                {product_sales: results[index].product_sales + total},
                                {department_name: results[index].department_name}
                            ], function(err, res) {
                                if (err) throw err;
                                start();
                            });
                        });
                        /////////
                    });
                });
            }
        });
    });
};

start = () => {
    inquirer
    .prompt([
        {
            name: "confirm",
            type: "confirm",
            message: "Would you like to make a purchase?",
        }
    ])
    .then(function(input) {
        if (input.confirm) {
            showTable();
        } else {
            console.log("\n\nThank you!  Please come again!\n");
            connection.end();
        }
    });
}

