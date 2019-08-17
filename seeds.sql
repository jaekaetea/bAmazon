DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE departments (
department_id INT AUTO_INCREMENT NOT NULL,
department_name VARCHAR(100) NOT NULL,
over_head_costs INT NOT NULL
);


CREATE TABLE products (
item_id INT AUTO_INCREMENT NOT NULL,
product_name VARCHAR(100) NOT NULL,
department_name VARCHAR(100) NOT NULL,
price DECIMAL(6,2) NOT NULL,
stock_quantity INT NOT NULL,
PRIMARY KEY (item_id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES ("Banana", "Grocery", 0.89, 1000),
("Apple", "Grocery", 0.50, 1000),
("Grapes", "Grocery", 0.75, 1000),
("Left for Dead", "Electronics", 29.99, 100),
("Killing Floor", "Electronics", 29.99, 100),
("Mario Karts", "Electronics", 59.99, 100),
("Bedsheet", "Home", 20, 25),
("Pillow", "Home", 5, 25),
("Eyeliner", "Beauty", 15, 10),
("Mascara", "Beauty", 15, 10),
("Lipstick", "Beauty", 10, 10);

SELECT * FROM products;