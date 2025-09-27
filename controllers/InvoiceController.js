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
  doc.text(`From:${invoice?.senderDetails?.sendername}`);
  doc.text(`${invoice?.senderDetails?.senderStreet}`);
  doc.text(`${invoice?.senderDetails?.sendercity}`);
  doc.text(`${invoice?.senderDetails?.senderzipcode}`);
  doc.text(`Phone No: ${invoice?.senderDetails?.senderphone}`);
  doc.text(`Emil: ${invoice?.senderDetails?.senderEmail}`);

  doc.moveDown();
  doc.text(`Bill To:${invoice?.receiverDetails?.receivername}`);
  doc.text(`${invoice?.receiverDetails?.receiverStreet}`);
  doc.text(`${invoice?.receiverDetails?.receivercity}`);
  doc.text(`${invoice?.receiverDetails?.receiverzipcode}`);
  doc.text(`Phone No: ${invoice?.receiverDetails?.receiverphone}`);
  doc.text(`Emil: ${invoice?.receiverDetails?.receiverEmail}`);


    doc.moveDown();
    doc.text(`Pickup`);
    doc.text(`${invoice?.senderDetails?.senderStreet}`);
    doc.text(`${invoice?.senderDetails?.sendercity}`);
    doc.text(`${invoice?.senderDetails?.senderzipcode}`);

    doc.moveDown();
    doc.text(`Delivery`);
    doc.text(`${invoice?.receiverDetails?.receiverStreet}`);
    doc.text(`${invoice?.receiverDetails?.receivercity}`);
    doc.text(`${invoice?.receiverDetails?.receiverzipcode}`);

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

// exports.confirmBooking = async (req, res) => {
//   try {
//     const { invoiceId, receiverEmail, senderEmail } = req.body;

//     const invoice = await Invoice.findOneAndUpdate(
//       { invoiceId },
//       { BookingStatus: true },
//       { new: true }
//     );

//     if (!invoice) {
//       return res
//         .status(404)
//         .json({ status: "fail", message: "Invoice not found" });
//     }

//     // Generate both PDFs
//     const pdfWithPrice = await generateInvoicePDF(invoice, true);
//     const pdfWithoutPrice = await generateInvoicePDF(invoice, false);

//     // Send email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "avinash20802bala@gmail.com",
//         pass: "tbin jwlh elaz keom",
//       },
//     });

//     await transporter.sendMail({
//       from: `${senderEmail}`,
//       to: `${receiverEmail}`,
//       subject: `Invoice ${invoice.invoiceId} Booking Confirmation`,
//       text: "Please find the attached invoices.",
//       attachments: [
//         {
//           filename: `Invoice_${invoice.invoiceId}.pdf`,
//           content: pdfWithPrice,
//         },
//         {
//           filename: `BOL_${invoice.invoiceId}.pdf`,
//           content: pdfWithoutPrice,
//         },
//       ],
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Booking confirmed and emails sent",
//       data: invoice,
//     });
//   } catch (error) {
//     res.status(500).json({ status: "fail", message: error.message });
//   }
// };
exports.confirmBooking = async (req, res) => {
  try {
    const { invoiceId, receiverEmail, senderEmail } = req.body;

    // 1. Update invoice booking status
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

    // 2. Respond immediately to the client
    res.status(200).json({
      status: "success",
      message: "Booking confirmed. Emails will be sent shortly.",
      data: invoice,
    });

    // 3. Generate PDFs in parallel and send email asynchronously
    (async () => {
      try {
        const [pdfWithPrice, pdfWithoutPrice] = await Promise.all([
          generateInvoicePDF(invoice, true),
          generateInvoicePDF(invoice, false),
        ]);

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "avinash20802bala@gmail.com",
            pass: "tbin jwlh elaz keom",
          },
        });

        await transporter.sendMail({
          from: `"Shield Motor Group" <avinash20802bala@gmail.com>"`,
          to: receiverEmail,
          cc: "Sheildmotorgroup@gmail.com",
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

        console.log(`Emails sent for invoice ${invoice.invoiceId}`);
      } catch (err) {
        console.error(
          `Failed to send emails for invoice ${invoice.invoiceId}:`,
          err
        );
      }
    })();
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};