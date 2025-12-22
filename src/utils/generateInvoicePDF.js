// src/utils/generateInvoicePDF.js
// Creates a PDF buffer for an invoice using pdfkit
const PDFDocument = require("pdfkit");
const streamBuffers = require("stream-buffers");

const generateInvoicePDF = async (
  invoice,
  client,
  company = { name: "My Company", address: "" }
) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({
        initialSize: 100 * 1024, // start at 100 kilobytes.
        incrementAmount: 10 * 1024, // grow by 10 kilobytes each time buffer overflows.
      });

      // Header
      doc.fontSize(20).text(company.name, { align: "left" });
      doc.fontSize(10).text(company.address, { align: "left" });
      doc.moveDown();

      // Invoice meta
      doc
        .fontSize(16)
        .text(`Invoice: ${invoice.invoiceNumber}`, { align: "right" });
      doc
        .fontSize(10)
        .text(
          `Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`,
          { align: "right" }
        );
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
        align: "right",
      });
      doc.moveDown();

      // Client
      doc.fontSize(12).text("Bill To:", { underline: true });
      doc.fontSize(10).text(client.name);
      if (client.email) doc.text(client.email);
      if (client.phone) doc.text(client.phone);
      if (client.address) doc.text(client.address);
      doc.moveDown();

      // Table header
      doc.fontSize(10);
      doc.text("Description", 50, doc.y, { width: 250, continued: true });
      doc.text("Qty", 300, doc.y, {
        width: 50,
        continued: true,
        align: "right",
      });
      doc.text("Price", 350, doc.y, {
        width: 70,
        continued: true,
        align: "right",
      });
      doc.text("Tax%", 420, doc.y, {
        width: 50,
        continued: true,
        align: "right",
      });
      doc.text("Total", 480, doc.y, { width: 70, align: "right" });
      doc.moveDown();

      // Items
      invoice.items.forEach((item) => {
        const lineTotal =
          item.quantity * item.price +
          item.quantity * item.price * (item.taxPercent / 100);
        doc.text(item.description, 50, doc.y, { width: 250, continued: true });
        doc.text(String(item.quantity), 300, doc.y, {
          width: 50,
          continued: true,
          align: "right",
        });
        doc.text(item.price.toFixed(2), 350, doc.y, {
          width: 70,
          continued: true,
          align: "right",
        });
        doc.text(`${item.taxPercent}%`, 420, doc.y, {
          width: 50,
          continued: true,
          align: "right",
        });
        doc.text(lineTotal.toFixed(2), 480, doc.y, {
          width: 70,
          align: "right",
        });
        doc.moveDown();
      });

      doc.moveDown();

      // Totals
      doc.text(`Subtotal: ${invoice.subTotal.toFixed(2)}`, { align: "right" });
      doc.text(`Tax: ${invoice.taxTotal.toFixed(2)}`, { align: "right" });
      doc
        .fontSize(12)
        .text(`Total: ${invoice.total.toFixed(2)}`, {
          align: "right",
          underline: true,
        });

      doc.moveDown();
      if (invoice.notes) {
        doc.fontSize(10).text("Notes:", { underline: true });
        doc.fontSize(9).text(invoice.notes);
      }

      doc.end();
      doc.pipe(writableStreamBuffer);

      writableStreamBuffer.on("finish", () => {
        const buffer = writableStreamBuffer.getContents();
        resolve(buffer);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoicePDF;
