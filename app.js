require("dotenv").config()
const express= require("express");
const bodyParser=require("body-parser")
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const nodemailer=require("nodemailer");
const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const app=express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());


const mongoURI="mongodb://0.0.0.0:27017/CustomerDB"

mongoose.connect(mongoURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
  console.log("Successfully connected to database");
}).catch((e)=>{
  console.log(e);
})

const productSchema= new mongoose.Schema({
    id: String,
    name: String,
    time: String
})

const customerSchema= new mongoose.Schema({
    name: String,
    email: String,
    id: String,
    number: Number,
    products: [productSchema]
  });
  
const Customer= mongoose.model("Customer",customerSchema);

let foundLogin=1;
let message="";

let foundLoginSignup=1;
let messageSignup="";

let foundLoginForgot=1;
let messageForgot="";

let foundLoginChange=1;
let messageChange="";

let foundLoginCollection=1;
let messageCollection="";

let foundLoginProduct=1;
let messageProduct="";


app.get("/",(req,res)=>{
    Customer.find().then((foundItem)=>{
        res.render("collection",{Items: foundItem});
    }).catch((e)=>{
        console.log(e)
    })

})

app.get("/create-Customer",(req,res)=>{
    res.render("createCollection",{found:foundLoginCollection,alertMessage:messageCollection});
    foundLoginCollection=1;
    messageCollection="";
})

app.post("/create-Customer",(req,res)=>{
    Customer.findOne({id: req.body.cid}).then((found)=>{
     if(!found){
        const customer= new Customer({
            id: req.body.cid,
            name: req.body.cname,
            email: req.body.cemail,
            number: req.body.cnumber,
            products: []
        })
        customer.save();
        res.redirect("/");
     }
     else{
        foundLoginCollection=0;
        messageCollection="Customer is already exist";
        res.redirect("/create-Customer");
     }
   }).catch((e)=>{
    console.log(e);
   })
})

app.get("/:customer/delete",(req,res)=>{
    Customer.findOneAndRemove({id: req.params.customer}).then(()=>{
        res.redirect("/");
    }).catch((e)=>{
        console.log(e);
    });
})


app.get("/:customer/update-customer",(req,res)=>{
    Customer.findOne({id: req.params.customer}).then((found)=>{
        res.render("updateCollections",{Customer_id: found.id,name: found.name,email:found.email,number:found.number});
    }).catch((e)=>{
        console.log(e);
    })
})

app.post("/:customer/update-customer",(req,res)=>{
    Customer.findOneAndUpdate({id: req.params.customer},{$set: {name: req.body.name,email: req.body.email,number: req.body.number}}).then((found)=>{
        res.redirect("/");
    }).catch((e)=>{
        console.log(e);
    })
})

app.get("/:customer/product",(req,res)=>{
    Customer.findOne({id: req.params.customer}).then((found)=>{
        res.render("Products",{Items: found.products,collection: req.params.customer});
    }).catch((e)=>{
        console.log(e);
    })
})

app.get("/create-product",(req,res)=>{
    res.render("createProduct",{found:foundLoginProduct,alertMessage:messageProduct});
    foundLoginProduct=1;
    messageProduct="";
})

app.post("/create-product",(req,res)=>{
    Customer.findOne({id: req.body.cid}).then((found)=>{
        if(!found){
            foundLoginProduct=0;
            messageProduct="Customer does not exist";
            res.redirect("/create-product");
        }
        else{
            let count=0;
            found.products.forEach(Element =>{
                if(Element.id === req.body.bid){
                    count=1;
                }
            })
            if(count === 0){
                const product= {
                    id: req.body.bid,
                    name: req.body.dsname,
                    time: req.body.time
                }
                found.products.push(product);
                found.save();
                res.redirect("/");
            }
            else{
                foundLoginProduct=0;
                messageProduct="Booking is already done";
                res.redirect(`/create-product`);
            }
        }
      }).catch((e)=>{
       console.log(e);
      })
})





app.get("/:collection/:product/delete",(req,res)=>{
    Customer.findOneAndUpdate({id: req.params.collection},{$pull: {products: {id: req.params.product}}}).then(()=>{
        res.redirect(`/${req.params.collection}/product`);
    }).catch((e)=>{
        console.log(e);
    });
})



app.get("/:collection/:product/update",(req,res)=>{
    Customer.findOne({id: req.params.collection}).then((found)=>{
        found.products.forEach(element=>{
            if(element.id===req.params.product){
             res.render("updateProduct",{Booking_id: element.id,Time: element.time,DSN: element.name, collection: req.params.collection});
            }
        })
    }).catch((e)=>{
        console.log(e);
    })
})

app.post("/:collection/:product/update",(req,res)=>{
    Customer.findOneAndUpdate({id: req.params.collection},{$pull: {products: {id: req.params.product}}}).then((found)=>{
        const product= {
            id: req.body.bid,
            name: req.body.dsname,
            time: req.body.time
        }
        found.products.push(product);
        found.save().then(()=>{
            res.redirect("/");
        });
    }).catch((e)=>{
        console.log(e);
    });
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("Server has started");
})








