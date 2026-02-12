// const express = require('express');
// const cors = require('cors'); // Cross-Origin Resource Sharing
// const Stripe = require("stripe");
// const {v4:uuidv4} = require('uuid');


import express from "express";
import cors from "cors" // Cross-Origin Resource Sharing

import Stripe from "stripe";
import multer from "multer";

import {v4 as uuidv4} from "uuid"
import bodyParser from "body-parser";

import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";

const app = express();
const PORT = 5000;

// console.log("Directory Global Variables: ",__dirname);

const filepath = fileURLToPath(import.meta.url); 
const dirname = path.dirname(filepath);
// console.log(import.meta.url); // file:///D:/datalandcourses/reactjsbatch1/part23-bootstrapproject/expresapi/server.js
// console.log(filepath); // D:\datalandcourses\reactjsbatch1\part23-bootstrapproject\expresapi\server.js
// console.log(dirname); /// D:\datalandcourses\reactjsbatch1\part23-bootstrapproject\expresapi



app.use(cors());
app.use(express.json());

const stripe = Stripe('sk_test_51SIu70H9Bv5kOs06ajRZHudn7H0MDjmDH0iNIKaQzWLNvrXs9XMvN2Sy9fgPblusoYHWQ9AfT5MQdTZZo4HHCeJu008iNiD1LQ');

let aboutUsDatas = {
     whyChooseUs: [
          {icon: "fa-solid fa-bolt",title: "Fast Delivery",desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."},
          {icon: "fa-regular fa-lightbulb",title: "Creative Solution",desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."},
          {icon: "fa-regular fa-handshake",title: "Client Collaboration",desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."},
     ],
     coreValues: [
          {title: "Integrity",desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."},
          {title: "Inovation",desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."},
          {title: "Customer Focus",desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."},
          {title: "Excellence",desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."},
     ]
};

const ClientsSayDatas = [
     {
          name: "Myint Mho",
          role: "CEO, TechSolutions",
          feedback: "The support team was incredibly responseive....",
          rating: 3.2,
          gender: "female",
          avaterId: 30
     },
     {
          name: "Maung Oo",
          role: "Director, Blobal Innovations",
          feedback: "24/7 support the actually responds....",
          rating: 4.5,
          gender: "male",
          avaterId: 45
     },
     {
          name: "Cho Lae",
          role: "MD, Digital Ventures",
          feedback: "We've worked with many support teams....",
          rating: 5,
          gender: "female",
          avaterId: 65
     },
];

app.listen(PORT,()=>{
     console.log(`Express Server is runing on http://localhost:${PORT}`)
});

// All todos

app.get('/api/aboutus',(req,res)=>{
     res.json(aboutUsDatas);
});

// Contact Page
// http://localhost:5000/api/contacts/clientsays

app.get("/api/contacts/clientsays",(req,res)=>{
     res.json(ClientsSayDatas);
})

// http:// localhost:5000/api/contacts/formsubmit
app.post("/api/contacts/formsubmit",(req,res)=>{
     const {name,email,message} = req.body;

     if(!name || !email || !message){
          return res.status(400).json({error:"All fields are required."})
     }
     console.log("Form Datas: ",{name,email,message}); // servers.js terminal

     return res.status(200).json({success:true,message:"Message received."});
})

// stripe payment gateway integraiton
app.post('/create-payment-intent',async (req,res)=>{
     try{

          const { amount } = req.body;

          // check if amount exists and is valid amount
          if(!amount || amount <= 0){
                return res.status(400).json({error:"Ivalid payment amount"}) 
          }

          // create paymentIntent
          const paymentIntent = await stripe.paymentIntents.create({
               amount: Math.round(amount * 100), // amount in cents *****
               currency: 'usd',
               automatic_payment_methods: {
                    enabled: true,
               },
          });
          // Example:
          // if your grandtotal = $29.99 
          // Stripe expects 2999 (not 29)

          return res.json({
               clientSecret: paymentIntent.client_secret
          }) 

     }catch(err){
          return res.status(400).json({error:err.message})
     }
});

// Config Directory
const uploaddir = path.join(dirname,'uploads');
console.log(uploaddir); // D:\datalandcourses\reactjsbatch1\part23-bootstrapproject\expresapi\uploads
if(!fs.existsSync(uploaddir)) fs.mkdirSync(uploaddir);


// multer config
const storage = multer.diskStorage({
  destination:  (req, file, cb) => cb(null, uploaddir),
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
})

const upload = multer({ 
     storage: storage,
     fileFilter: (req, file, cb) =>{
          const allowed = ["image/jpg","image/jpeg","image/png", "application/pdf"];

          allowed.includes(file.mimetype) ? cb(null, true) :  cb(new Error('Invalid File Type'))
     }
     
})
// bank transfer
app.post("/api/payments/bank",upload.single('bankslip'),(req,res)=>{
     if(!req.file) return res.status(400).json({error:"Bank slip is required"});

     const orderData = {
          id: uuidv4(),

          fullname: req.body.fullname,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address,
          zip: req.body.zip,
          country: req.body.country,
          grandtotal: req.body.grandtotal,
          bankslip: `/uploads/${req.file.filename}`,

          paymentmethod: "bank",
          status:"Pending Verification",
          createdAt: new Date()
     }

     console.log(`New Bank Order`,orderData)
     res.json({message:"Slip uploaded successfully",orderData})
});

