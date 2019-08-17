let mysql = require("mysql");
let inquirer = require("inquirer");
//let cTable = require("console.table");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Supervisor provided id: " + connection.threadId);
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
            choices: ["View Product Sales by Department", "Create New Department", "Exit"]
        }
    ])
    .then(function(input) {
        if (input.task == "View Product Sales by Department") {
            showTable();
        } else if (input.task == "Create New Department") {
            addNew();
        } else {
            console.log("\n\nThank you for being a part of bAmazon and hope you have a wonderful day!");
            connection.end();
        }
    });
};

showTable = () => {
    console.log("\n\nViewing Products Sales by Department.");
    connection.query("SELECT * from departments", 
    function(err, res) {
        if (err) throw err;
        let total_profit = [];
        for (var i = 0; i < res.length; i++) {
            let profit = (res[i].product_sales - res[i].over_head_costs).toFixed(2);
            total_profit.push(profit);
        }
        console.table(res);
        console.log("\ntotal_profit");
        console.table(total_profit);
        console.log("\n\n");
        start();
    });
};

addNew = () => {
    console.log("\n\nAdding a new department.");
    inquirer
    .prompt([
        {
            name: "dept",
            type: "input",
            message: "What is the name of the new department?",
            validate: function(value) {
                if (value == "") {
                    console.log("\n\nPlease enter a valid name.\n");
                    return false;
                } else {
                    return true;
                }
            }
        }, {
            name: "ohc",
            type: "number",
            message: "What is the over head cost?",
            validate: function(value) {
                if (value < 0) {
                    console.log("\n\nPlease enter a valid amount.\n");
                    return false;
                } else {
                    return true;
                }
            }
        }, {
            name: "sales",
            type: "number",
            message: "What is the total sales?"
        }
    ])
    .then(function(input) {
        connection.query("INSERT INTO departments SET ?", {
            department_name : input.dept,
            over_head_costs : input.ohc,
            product_sales : input.sales 
        }, function(err, res) {
            if (err) throw err;
            console.log(input.dept + " was added as a new department.\n");
            start();
        });
    });
}
