const express = require("express");
const app = express();
const path = require("path");
const methodovrride = require("method-override");
const { v4: uuidv4 } = require('uuid');
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "System@123",
    database: "test"
});

app.set("view engine", "views");
app.set("views", path.join(__dirname, "views"));

app.use(express.static('public'));
app.use(methodovrride("_method"));
app.use(express.urlencoded({ extended: true }));

app.get("/home", (req, res) => {
    res.render("home.ejs");
})

// dashboard route
app.get("/home/dashboard", (req, res) => {
    let q = `SELECT sum(price) FROM product`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let total = result[0]['sum(price)'];
            res.render("dashbord.ejs", { total });
        })
    } catch (err) {
        console.log(err);
    }
})

app.get("/home/dashboard/addUser", (req, res) => {
    res.render("add.ejs");
})

// add route
app.post("/home", (req, res) => {
    let { name, email, mobile, gender } = req.body;
    let id = uuidv4();
    let q = `INSERT INTO customer (id, name, gender, contact, email) VALUES ('${id}', '${name}', '${gender}', ${mobile}, '${email}')`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.redirect("/home");
        })
    } catch (err) {
        console.log(err);
    }
})

// show rout
app.get("/home/show", (req, res) => {
    let q = `SELECT * FROM customer`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let users = result;
            res.render("show.ejs", { users });
        })
    } catch (err) {
        console.log(err);
    }
})

// product route
app.get("/home/product", (req, res) => {
    res.render("product.ejs");
})

app.get("/home/product/add", (req, res) => {
    res.render("addProduct.ejs");
})

// add product route
app.post("/home/product", (req, res) => {
    let { name, price, quality, supplier, stock, brand, category } = req.body;
    let id = uuidv4();

    let q = `INSERT INTO product (id, name, price, quality, supplier, stock, brand, category) VALUES ('${id}', '${name}', ${price}, '${quality}', '${supplier}', '${stock}', '${brand}', '${category}')`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.redirect("/home");
        })
    } catch (err) {
        console.log(err);
    }
})

// show product route
app.get("/home/showProduct", (req, res) => {
    let q = `SELECT * FROM product`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let products = result;
            res.render("showProduct.ejs", { products });
        })
    } catch (err) {
        console.log(err);
    }
})

// edit product route
app.get("/home/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM product WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let product = result[0];
            res.render("editProduct.ejs", { product });
        });
    } catch (err) {
        console.log(err);
    }
});

// patch request of product 
app.patch("/home/:id", (req, res) => {
    let { id } = req.params;
    let { name : newName, price : newPrice, quality : newQuality, supplier : newSupplier, stock : newStock, brand : newBrand, category : newCategory} = req.body;
    console.log(req.body);
    let q = `SELECT * FROM product WHERE id = '${id}'`;
    let q1 = `UPDATE product SET name = '${newName}', price = ${newPrice}, quality = '${newQuality}', supplier = '${newSupplier}', stock = '${newStock}', brand = '${newBrand}', category = '${newCategory}'  WHERE id = '${id}'`;
    try {
        connection.query(q1, (err, result) => {
            if (err) throw err;
            res.redirect("/home/showProduct");
        });
    } catch (err) {
        console.log(err);
    }
});

// delete product route
app.delete("/home/:id", (req, res) => {
    let {id} = req.params;
    let q = `DELETE FROM product WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) =>{
            if(err) throw err;
            console.log("user deleted");
            res.redirect("/home/showProduct");
        })
    } catch (err) {
        console.log(err);
    }
});

// Route to Get Customers and Products for Billing
// app.get('/billing', (req, res) => {
//     let customerQuery = "SELECT id, name FROM customer";
//     let productQuery = "SELECT id, name, price FROM product";

//     connection.query(customerQuery, (err, customers) => {
//         if (err) throw err;
//         connection.query(productQuery, (err, products) => {
//             if (err) throw err;
//             res.render('billing_form.ejs', { customers, products });
//         });
//     });
// });

// // add billing route
// app.post('/billing', (req, res) => {
//     const { customer_id, products } = req.body; // products is an array with product_id and quantity

//     let totalAmount = 0;

//     totalAmount += products.price * products.quantity;

//     let billingQuery = "INSERT INTO billing (customer_id, total_amount) VALUES (?, ?)";
    
//     connection.query(billingQuery, [customer_id, totalAmount], (err, result) => {
//         if (err) throw err;
//         const billingId = result.insertId;

//         let billingDetailsQuery = "INSERT INTO billing_details (billing_id, product_id, quantity) VALUES ?";
//         let billingDetailsValues = products.map(products => [billingId, products.product_id, products.quantity]);

//         connection.query(billingDetailsQuery, [billingDetailsValues], (err) => {
//             if (err) throw err;
//             res.redirect('/billings');
//         });
//     });
// });

// // view billing route
// app.get('/billings', (req, res) => {
//     let billingsQuery = `
//         SELECT b.id, c.name as customer_name, b.total_amount, b.date
//         FROM billing b
//         JOIN customer c ON b.customer_id = c.id
//     `;
    
//     connection.query(billingsQuery, (err, billings) => {
//         if (err) throw err;
//         res.render('billings_view.ejs', { billings });
//     });
// });

// // edit billing route
// app.get('/billing/edit/:id', (req, res) => {
//     const billingId = req.params.id;

//     let billingQuery = `
//         SELECT b.id, c.name as customer_name, b.total_amount
//         FROM billing b
//         JOIN customer c ON b.customer_id = c.id
//         WHERE b.id = ?
//     `;
//     let billingDetailsQuery = `
//         SELECT bd.product_id, p.name, bd.quantity, p.price
//         FROM billing_details bd
//         JOIN product p ON bd.product_id = p.id
//         WHERE bd.billing_id = ?
//     `;
    
//     connection.query(billingQuery, [billingId], (err, billing) => {
//         if (err) throw err;
//         connection.query(billingDetailsQuery, [billingId], (err, billingDetails) => {
//             if (err) throw err;
//             res.render('billing_edit.ejs', { billing, billingDetails });
//         });
//     });
// });

// // update billing route
// app.post('/billing/update/:id', (req, res) => {
//     const billingId = req.params.id;
//     const { customer_id, products } = req.body;

//     let totalAmount = 0;
//     product.forEach(product => {
//         totalAmount += product.price * product.quantity;
//     });

//     let updateBillingQuery = "UPDATE billing SET customer_id = ?, total_amount = ? WHERE id = ?";
//     connection.query(updateBillingQuery, [customer_id, totalAmount, billingId], (err) => {
//         if (err) throw err;

//         let deleteOldDetailsQuery = "DELETE FROM billing_details WHERE billing_id = ?";
//         connection.query(deleteOldDetailsQuery, [billingId], (err) => {
//             if (err) throw err;

//             let billingDetailsQuery = "INSERT INTO billing_details (billing_id, product_id, quantity) VALUES ?";
//             let billingDetailsValues = products.map(product => [billingId, product.product_id, product.quantity]);

//             connection.query(billingDetailsQuery, [billingDetailsValues], (err) => {
//                 if (err) throw err;
//                 res.redirect('/billings');
//             });
//         });
//     });
// });

// // delete billing route
// app.delete('/billing/delete/:id', (req, res) => {
//     const billingId = req.params.id;

//     let deleteBillingQuery = "DELETE FROM billing WHERE id = ?";
//     let deleteBillingDetailsQuery = "DELETE FROM billing_details WHERE billing_id = ?";
    
//     connection.query(deleteBillingQuery, [billingId], (err) => {
//         if (err) throw err;
//         connection.query(deleteBillingDetailsQuery, [billingId], (err) => {
//             if (err) throw err;
//             res.redirect('/billings');
//         });
//     });
// });


app.listen("8081", () => {
    console.log(`app is listening on port 8081`);
})

