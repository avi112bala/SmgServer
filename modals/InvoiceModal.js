const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  ServiceData: {
    title: String,
    logo: String,
  },
  secondoptionref: String,
  loadingitem: String,
  secondoption: String,
  freezervalue:String,
  senderDetails: {
    sendername: String,
    senderphone: String,
    senderEmail: String,
    senderStreet: String,
    sendercity: String,
    senderzipcode: String,
  },
  receiverDetails: {
    receivername: String,
    receiverphone: String,
    receiverEmail: String,
    receiverStreet: String,
    receivercity: String,
    receiverzipcode: String,
  },
  invoiceId: {
    type: String,
    default: function () {
      return `INV${Math.floor(Math.random() * (999999 - 111111 + 1)) + 111}`;
    },
  },
  totalAmount:Number,
    BookingStatus: { type: Boolean, default: false },
     createdAt: {
    type: Date,
    default: Date.now, // ✅ auto set current date
  },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
