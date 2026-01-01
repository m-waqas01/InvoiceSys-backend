// src/utils/generateInvoicePDF.js
const PDFDocument = require("pdfkit");
const streamBuffers = require("stream-buffers");

const PRIMARY = "#6B7C8F"; // blue-gray like template

const generateInvoicePDF = async (invoice, client, company) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffer = new streamBuffers.WritableStreamBuffer();

      doc.pipe(buffer);

      /* ================= HEADER ================= */

      // Invoice title (right)
      doc
        .fontSize(36)
        .fillColor("#555")
        .text("Invoice", 350, 40, { align: "right" });

      // Date box
      doc.rect(40, 40, 250, 30).fillAndStroke(PRIMARY, PRIMARY);
      doc.fillColor("white").fontSize(12).text("Date:", 50, 48);

      doc
        .fillColor("black")
        .rect(140, 40, 150, 30)
        .stroke()
        .text(new Date(invoice.issueDate).toLocaleDateString(), 150, 48);

      // Invoice #
      doc.rect(40, 80, 250, 30).fillAndStroke(PRIMARY, PRIMARY);
      doc.fillColor("white").fontSize(12).text("Invoice #:", 50, 88);

      doc
        .fillColor("black")
        .rect(140, 80, 150, 30)
        .stroke()
        .text(invoice.invoiceNumber, 150, 88);

      /* ================= FROM / BILL TO ================= */

      doc.moveDown(6);

      doc.fontSize(11).fillColor("black");

      // From
      doc.text("From:", 40, 140);
      doc.text(company.name, 40, 155);
      doc.text(company.address || "", 40, 170);

      // Bill To
      doc.text("Bill To:", 330, 140);
      doc.text(client.name, 330, 155);
      doc.text(client.address || "", 330, 170);

      /* ================= TABLE HEADER ================= */

      const tableTop = 220;

      doc.rect(40, tableTop, 520, 30).fill(PRIMARY);

      doc
        .fillColor("white")
        .fontSize(11)
        .text("Description", 50, tableTop + 8, { width: 200 });

      doc.text("Quantity", 270, tableTop + 8, { width: 70, align: "center" });
      doc.text("Unit Price", 350, tableTop + 8, { width: 80, align: "center" });
      doc.text("Total", 450, tableTop + 8, { width: 80, align: "right" });

      /* ================= TABLE ROWS ================= */

      let y = tableTop + 35;
      doc.fillColor("black").fontSize(10);

      invoice.items.forEach((item) => {
        const total = item.quantity * item.price;

        doc.rect(40, y - 5, 520, 28).stroke();

        doc.text(item.description, 50, y, { width: 200 });
        doc.text(item.quantity, 270, y, { width: 70, align: "center" });
        doc.text(item.price.toFixed(2), 350, y, {
          width: 80,
          align: "center",
        });
        doc.text(total.toFixed(2), 450, y, {
          width: 80,
          align: "right",
        });

        y += 28;
      });

      /* ================= PAYMENT TERMS ================= */

      y += 10;

      doc.fontSize(10).fillColor("#666").text("Payment Terms:  Net 30", 40, y);

      // Total amount bar
      doc.rect(300, y - 8, 260, 30).fill(PRIMARY);
      doc
        .fillColor("white")
        .fontSize(12)
        .text(`Total Amount Due: ${invoice.total.toFixed(2)}`, 310, y, {
          align: "left",
        });

      /* ================= FOOTER ================= */

      y += 50;

      // Terms
      doc.fillColor("black").fontSize(11).text("Terms and Conditions", 40, y);
      doc
        .fontSize(10)
        .text("Please complete payment within 30 days.", 40, y + 15)
        .text("Thank you for your business!", 40, y + 30);

      // Payment info
      doc
        .fontSize(11)
        .text("Send Payment To:", 330, y)
        .fontSize(10)
        .text(company.name, 330, y + 15)
        .text(company.bank || "Bank Name", 330, y + 30)
        .text(company.account || "Account Number", 330, y + 45);

      doc.end();

      buffer.on("finish", () => resolve(buffer.getContents()));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoicePDF;
