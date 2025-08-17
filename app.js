require('dotenv').config()
const express=require('express');
const bodyparser=require('body-parser')
const mongoose=require('mongoose')
const path=require('path')
const cors=require('cors')

const app=express();

// Add near the top with other requires
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authroute');
const authroute = require("./routes/authroute");
const invoiceroute = require("./routes/InvoiceRoute");
const connectDB = require("./config/db");
connectDB();


//cors middlewar 
app.use(
  cors({
    origin: "http://localhost:5173", // change to your frontend's port
    credentials: true,
  })
);


// Add after other middleware
app.use(cookieParser());

// Add after other route declarations


//Middleware
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
app.use(express.static(path.join(__dirname,'public')))

//Routes
app.use("/api", authRoutes);
app.use("/invoice",invoiceroute)

const PORT=process.env.PORT||5000

app.listen(PORT,()=>{
    console.log(`Server Running on port ${PORT}`);
    
})