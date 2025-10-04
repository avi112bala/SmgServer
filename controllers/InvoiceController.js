const Invoice = require("../modals/InvoiceModal");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const Resend=require("resend")

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
//     const { invoiceId, receiverEmail } = req.body;
//     console.log(receiverEmail, "receiverEmail");

//     // 1. Update invoice booking status
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

//     // 2. Respond immediately to client
//     res.status(200).json({
//       status: "success",
//       message: "Booking confirmed. Emails will be sent shortly.",
//       data: invoice,
//     });

//     //resend Api---re_Lgn7RcEG_GygTXCwjMX2rv2sksT4RvwTW

//     // 3. Send email asynchronously
//     const resend = new Resend("re_Lgn7RcEG_GygTXCwjMX2rv2sksT4RvwTW");
//     (async () => {
//       try {
//         // Generate PDFs in parallel
//         const [pdfWithPrice, pdfWithoutPrice] = await Promise.all([
//           generateInvoicePDF(invoice, true),
//           generateInvoicePDF(invoice, false),
//         ]);

//         // Configure transporter
//         const transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             user: "avinash20802bala@gmail.com",
//             pass: "xyfe mbjo ijwo jafd", // Gmail App Password
//           },
//         });

//         // Verify transporter (throws if SMTP config is wrong)
//         await transporter.verify();
//         console.log("SMTP transporter verified successfully");

//         // Send email
//         await transporter.sendMail({
//           from: '"Shield Motor Group" <Sheildmotorgroup@gmail.com>', // must match Gmail account
//           to: "Sheildmotorgroup@gmail.com", // customer
//           subject: `Invoice ${invoice.invoiceId} Booking Confirmation`,
//           text: "Please find the attached invoices.",
//           attachments: [
//             {
//               filename: `Invoice_${invoice.invoiceId}.pdf`,
//               content: pdfWithPrice,
//             },
//             {
//               filename: `BOL_${invoice.invoiceId}.pdf`,
//               content: pdfWithoutPrice,
//             },
//           ],
//         });
//         console.log(
//           `Email successfully sent to ${receiverEmail} and ${"sender"}`
//         );
//       } catch (err) {
//         console.error(
//           `Failed to send emails for invoice ${invoice.invoiceId}:`,
//           err
//         );
//       }
//     })();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "fail", message: error.message });
//   }
// };


exports.confirmBooking = async (req, res) => {
  try {
    const { invoiceId, receiverEmail } = req.body;

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

    // 2. Respond immediately to client
    res.status(200).json({
      status: "success",
      message: "Booking confirmed. Emails will be sent shortly.",
      data: invoice,
    });

    // 3. Send email asynchronously via Resend
    const resend = new Resend("re_Lgn7RcEG_GygTXCwjMX2rv2sksT4RvwTW");

    (async () => {
      try {
        // Generate PDFs in parallel
        const [pdfWithPrice, pdfWithoutPrice] = await Promise.all([
          generateInvoicePDF(invoice, true),
          generateInvoicePDF(invoice, false),
        ]);

        // Resend requires base64 strings
        const attachments = [
          {
            name: `Invoice_${invoice.invoiceId}.pdf`,
            data: pdfWithPrice, // already base64 from your generateInvoicePDF
          },
          {
            name: `BOL_${invoice.invoiceId}.pdf`,
            data: pdfWithoutPrice,
          },
        ];

        // Send email via Resend
        await resend.emails.send({
          from: "Shield Motor Group <Sheildmotorgroup@gmail.com>",
          to: receiverEmail,
          subject: `Invoice ${invoice.invoiceId} Booking Confirmation`,
          html: `<p>Dear Customer,</p>
                 <p>Please find your invoices attached.</p>`,
          attachments,
        });

        console.log(
          `Emails successfully sent for invoice ${invoice.invoiceId} to ${receiverEmail}`
        );
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
