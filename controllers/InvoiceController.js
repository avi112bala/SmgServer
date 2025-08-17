const Invoice = require("../modals/InvoiceModal");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");


exports.createInvoice = async (req, res) => {
  try {
    const newInvoice = await Invoice.create(req.body.Invoicedata);
    res.status(200).json({
      status: "success",
      data: {
        invoice: newInvoice,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getinvoice = async (req, res) => {
  try {
    const invoice = await Invoice.find();
    res.status(200).json({
      status: "success",
      totalcount: invoice.length,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getSingleinvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceId: req.params.id });
    if (!invoice) {
      return res
        .status(404)
        .json({ status: "fail", message: "Invoice not found" });
    }
    res.status(200).json({ status: "success", data: invoice });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

function generateInvoicePDF(invoice, includePrice) {
  const doc = new PDFDocument();
  let buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  doc.fontSize(18).text(`Invoice ${invoice.invoiceId}`, { align: "left" });
  doc
    .fontSize(12)
    .text(`Invoice Date: ${invoice.createdAt.toLocaleDateString("en-GB")}`);

  doc.moveDown();
  doc.text("From: Shield Motor Group Limited");
  doc.text("81 Taralake St. NE, Calgary, Alberta T3J 0E9");
  doc.text("Office: (437) 236-5653");

  doc.moveDown();
  doc.text("Bill To: SpeedX");
  doc.text("3333 New Hyde Park, Suite 316, New York, NY 11042");

  doc.moveDown();
  doc.text("Item Details:");
  doc.text(`Service: ${invoice.ServiceData?.title}`);
  doc.text(
    `Type: ${invoice.loadingitem} / ${invoice.secondoption} / ${invoice.secondoptionref}`
  );
  doc.text(`Qty: 1`);
  if (includePrice) {
    doc.text(`Amount: $${invoice.totalAmount}`);
  }

  doc.end();
  return new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers)); // Return as Buffer
    });
  });
}


exports.confirmBooking = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findOneAndUpdate(
      { invoiceId },
      { BookingStatus: true },
      { new: true }
    );

    if (!invoice) {
      return res
        .status(404)
        .json({ status: "fail", message: "Invoice not found" });
    }

    // Generate both PDFs
    const pdfWithPrice = await generateInvoicePDF(invoice, true);
    const pdfWithoutPrice = await generateInvoicePDF(invoice, false);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "avinash20802bala@gmail.com",
        pass: "tbin jwlh elaz keom",
      },
    });

    await transporter.sendMail({
      from: "avinash20802bala@gmail.com",
      to: "avi20802bala@gmail.com",
      subject: `Invoice ${invoice.invoiceId} Booking Confirmation`,
      text: "Please find the attached invoices.",
      attachments: [
        {
          filename: `Invoice_${invoice.invoiceId}.pdf`,
          content: pdfWithPrice,
        },
        {
          filename: `BOL_${invoice.invoiceId}.pdf`,
          content: pdfWithoutPrice,
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "Booking confirmed and emails sent",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};