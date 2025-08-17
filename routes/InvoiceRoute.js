const express = require('express');
const router = express.Router();
const InvoiceControl=require("../controllers/InvoiceController")

router.post("/createinvoice", InvoiceControl.createInvoice);
router.get("/getinvoice",InvoiceControl.getinvoice)
router.get("/getsingleinvoice/:id", InvoiceControl.getSingleinvoice);
router.post("/confirmbooking", InvoiceControl.confirmBooking);


module.exports=router