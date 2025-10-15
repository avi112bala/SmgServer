const Invoice = require("../modals/InvoiceModal");
const PDFDocument = require("pdfkit");
const {Resend}=require("resend")


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

// function generateInvoicePDF(invoice, includePrice) {
//   const doc = new PDFDocument();
//   let buffers = [];

//   doc.on("data", buffers.push.bind(buffers));
//   doc.on("end", () => {});

//   doc.fontSize(18).text(`Invoice ${invoice.invoiceId}`, { align: "left" });
//   doc
//     .fontSize(12)
//     .text(`Invoice Date: ${invoice.createdAt.toLocaleDateString("en-GB")}`);

//   doc.moveDown();
//   doc.text(`From:${invoice?.senderDetails?.sendername}`);
//   doc.text(`${invoice?.senderDetails?.senderStreet}`);
//   doc.text(`${invoice?.senderDetails?.sendercity}`);
//   doc.text(`${invoice?.senderDetails?.senderzipcode}`);
//   doc.text(`Phone No: ${invoice?.senderDetails?.senderphone}`);
//   doc.text(`Emil: ${invoice?.senderDetails?.senderEmail}`);

//   doc.moveDown();
//   doc.text(`Bill To:${invoice?.receiverDetails?.receivername}`);
//   doc.text(`${invoice?.receiverDetails?.receiverStreet}`);
//   doc.text(`${invoice?.receiverDetails?.receivercity}`);
//   doc.text(`${invoice?.receiverDetails?.receiverzipcode}`);
//   doc.text(`Phone No: ${invoice?.receiverDetails?.receiverphone}`);
//   doc.text(`Emil: ${invoice?.receiverDetails?.receiverEmail}`);


//     doc.moveDown();
//     doc.text(`Pickup`);
//     doc.text(`${invoice?.senderDetails?.senderStreet}`);
//     doc.text(`${invoice?.senderDetails?.sendercity}`);
//     doc.text(`${invoice?.senderDetails?.senderzipcode}`);

//     doc.moveDown();
//     doc.text(`Delivery`);
//     doc.text(`${invoice?.receiverDetails?.receiverStreet}`);
//     doc.text(`${invoice?.receiverDetails?.receivercity}`);
//     doc.text(`${invoice?.receiverDetails?.receiverzipcode}`);

//   doc.moveDown();
//   doc.text("Item Details:");
//   doc.text(`Service: ${invoice.ServiceData?.title}`);
//   doc.text(
//     `Type: ${invoice.loadingitem} / ${invoice.secondoption} / ${invoice.secondoptionref}`
//   );
//   doc.text(`Qty: 1`);
//   if (includePrice) {
//     doc.text(`Amount: $${invoice.totalAmount}`);
//   }

//   doc.end();
//   return new Promise((resolve) => {
//     doc.on("end", () => {
//       resolve(Buffer.concat(buffers)); // Return as Buffer
//     });
//   });
// }




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

    // Update booking status
    const invoice = await Invoice.findOneAndUpdate(
      { invoiceId },
      { BookingStatus: true },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        status: "fail",
        message: "Invoice not found",
      });
    }

    // Respond immediately to client
    res.status(200).json({
      status: "success",
      message: "Booking confirmed. Email will be sent shortly.",
      data: invoice,
    });

    // Initialize Resend client
    // const resend = new Resend("re_Lgn7RcEG_GygTXCwjMX2rv2sksT4RvwTW");
    const resend = new Resend(process.env.RESEND_API_KEY);


    // 🔹 HTML Email Template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 25px;">
        <h2 style="color: #000; margin-bottom: 10px;">Invoice ${
          invoice.invoiceId
        }</h2>

        <p style="margin: 5px 0;"><strong>Invoice Date:</strong> ${new Date(
          invoice.createdAt
        ).toLocaleDateString("en-GB")}</p>
        <p style="margin: 5px 0;"><strong>Balance Due:</strong> ${
          invoice?.dueDate
            ? new Date(invoice.dueDate).toLocaleDateString("en-GB")
            : "N/A"
        }</p>
        <p style="margin: 5px 0 20px;"><strong>Total:</strong> $${invoice?.totalAmount?.toFixed(
          2
        )}</p>

        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <h3 style="color: #000;">From:</h3>
              <p style="margin: 2px 0;">${
                invoice?.senderDetails?.sendername
              }</p>
              <p style="margin: 2px 0;">${
                invoice?.senderDetails?.senderStreet
              }</p>
              <p style="margin: 2px 0;">${
                invoice?.senderDetails?.sendercity
              }, ${invoice?.senderDetails?.senderzipcode}</p>
              <p style="margin: 2px 0;"><strong>Phone:</strong> ${
                invoice?.senderDetails?.senderphone
              }</p>
              <p style="margin: 2px 0;"><strong>Email:</strong> ${
                invoice?.senderDetails?.senderEmail
              }</p>
            </td>

            <td style="vertical-align: top; width: 50%;">
              <h3 style="color: #000;">Bill To:</h3>
              <p style="margin: 2px 0;">${
                invoice?.receiverDetails?.receivername
              }</p>
              <p style="margin: 2px 0;">${
                invoice?.receiverDetails?.receiverStreet
              }</p>
              <p style="margin: 2px 0;">${
                invoice?.receiverDetails?.receivercity
              }, ${invoice?.receiverDetails?.receiverzipcode}</p>
              <p style="margin: 2px 0;"><strong>Phone:</strong> ${
                invoice?.receiverDetails?.receiverphone
              }</p>
              <p style="margin: 2px 0;"><strong>Email:</strong> ${
                invoice?.receiverDetails?.receiverEmail
              }</p>
            </td>
          </tr>
        </table>

        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <h3 style="color: #000;">Pickup:</h3>
              <p style="margin: 2px 0;">${
                invoice?.senderDetails?.senderStreet
              }</p>
              <p style="margin: 2px 0;">${
                invoice?.senderDetails?.sendercity
              }, ${invoice?.senderDetails?.senderzipcode}</p>
            </td>

            <td style="vertical-align: top; width: 50%;">
              <h3 style="color: #000;">Delivery:</h3>
              <p style="margin: 2px 0;">${
                invoice?.receiverDetails?.receiverStreet
              }</p>
              <p style="margin: 2px 0;">${
                invoice?.receiverDetails?.receivercity
              }, ${invoice?.receiverDetails?.receiverzipcode}</p>
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #0A66C2; color: #fff; text-align: left;">
              <th style="padding: 8px; border: 1px solid #ddd;">Item Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Type</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                invoice?.ServiceData?.title || "N/A"
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                invoice?.loadingitem
              } / ${invoice?.secondoption} / ${invoice?.secondoptionref}
              ${
                invoice?.secondoptionref === "cooler"
                  ? ""
                  : "/ " + invoice?.freezervalue
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd;">1</td>
              <td style="padding: 8px; border: 1px solid #ddd;">$${invoice?.totalAmount?.toFixed(
                2
              )}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin: 5px 0;"><strong>Terms:</strong> PAYMENT TERMS ARE 45 DAYS FROM RECEIPT OF ORIGINAL INVOICE.</p>
        <p style="margin: 5px 0;">Invoice and POD must be emailed to <a href="mailto:accounting@shieldmotorgroup.ca" style="color: #0A66C2;">accounting@shieldmotorgroup.ca</a>.</p>
      </div>
    `;

    // Send Email via Resend
    await resend.emails.send({
      from: "Shield Motor Group <onboarding@resend.dev>",
      to: "sheildmotorgroup@gmail.com",
      subject: `Invoice ${invoice.invoiceId} Booking Confirmation`,
      html: htmlContent,
    });

    console.log(
      `[Invoice ${invoice.invoiceId}] Email sent successfully to ${receiverEmail}`
    );
  } catch (error) {
    console.error("Error in confirmBooking:", error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};