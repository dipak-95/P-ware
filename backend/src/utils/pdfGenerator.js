const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a professional B2B quotation PDF
 * @param {Object} quotation - Quotation object
 * @param {Object} traderProfile - Mapped Trader profile details
 * @param {Array} itemsDetails - List of items with specifications
 * @param {String} outputPath - Output file path
 */
const generateQuotationPDF = (quotation, traderProfile, itemsDetails, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      // Pipe to output file stream
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // --- HEADER SECTION ---
      doc
        .fillColor('#111827') // Slate dark
        .fontSize(24)
        .text('P-WARE SANITARYWARE', 50, 50, { align: 'left', bold: true });
      
      doc
        .fontSize(10)
        .fillColor('#6B7280') // Gray
        .text('Premium Wash Basins & Sanitary Ware Manufacturer', 50, 80);
      
      doc
        .text('Email: sales@pware.com | Website: www.pware.com', 50, 95)
        .text('Factory: GIDC Morbi, Gujarat, India', 50, 110);

      // --- RIGHT SIDE HEADER: QUOTE INFO ---
      doc
        .fillColor('#111827')
        .fontSize(14)
        .text('QUOTATION', 400, 50, { align: 'right' });
      
      doc
        .fontSize(9)
        .fillColor('#374151')
        .text(`Quote No: ${quotation.quotationNumber}`, 400, 75, { align: 'right' })
        .text(`Date: ${new Date(quotation.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 400, 90, { align: 'right' })
        .text(`Inquiry No: #${quotation.inquiryId.inquiryNumber || quotation.inquiryId}`, 400, 105, { align: 'right' });

      // Horizontal line divider
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, 135)
        .lineTo(545, 135)
        .stroke();

      // --- CLIENT DETAILS (TRADER PROFILE) ---
      doc
        .fontSize(11)
        .fillColor('#111827')
        .text('Authorized Trader Details:', 50, 150, { bold: true });
      
      doc
        .fontSize(10)
        .fillColor('#374151')
        .text(`Company Name: ${traderProfile.companyName}`, 50, 170)
        .text(`Owner Name: ${traderProfile.ownerName}`, 50, 185)
        .text(`Trader Code: ${traderProfile.traderCode}`, 50, 200)
        .text(`GSTIN: ${traderProfile.gstNumber}`, 50, 215);

      // Address block
      const addr = traderProfile.address;
      doc
        .text(`Address: ${addr.street},`, 300, 170)
        .text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 300, 185);

      // --- TABLE SECTION ---
      let currentHeight = 250;

      // Table Header Background
      doc
        .rect(50, currentHeight, 495, 20)
        .fill('#1F2937'); // Dark gray

      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .text('Product Name & Code', 55, currentHeight + 6)
        .text('Specs', 230, currentHeight + 6)
        .text('Qty', 380, currentHeight + 6, { align: 'right', width: 30 })
        .text('Rate', 420, currentHeight + 6, { align: 'right', width: 50 })
        .text('Total', 485, currentHeight + 6, { align: 'right', width: 50 });

      currentHeight += 20;

      // Table Rows
      doc.fillColor('#374151');
      itemsDetails.forEach((item, index) => {
        // Alternating row background
        if (index % 2 === 1) {
          doc
            .rect(50, currentHeight, 495, 22)
            .fill('#F9FAFB');
        }

        // Draw text
        doc
          .fillColor('#111827')
          .fontSize(9)
          .text(`${item.name} (${item.code})`, 55, currentHeight + 6, { width: 170, height: 12, ellipsis: true })
          .fillColor('#4B5563')
          .text(item.specSummary || 'Standard', 230, currentHeight + 6, { width: 140, height: 12, ellipsis: true })
          .fillColor('#111827')
          .text(item.quantity.toString(), 380, currentHeight + 6, { align: 'right', width: 30 })
          .text(`Rs. ${item.rate.toFixed(2)}`, 420, currentHeight + 6, { align: 'right', width: 50 })
          .text(`Rs. ${item.total.toFixed(2)}`, 485, currentHeight + 6, { align: 'right', width: 50 });

        currentHeight += 22;
      });

      // Bottom line of the table
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, currentHeight)
        .lineTo(545, currentHeight)
        .stroke();

      currentHeight += 15;

      // --- CALCULATIONS / TOTALS PANEL ---
      const totalPanelX = 350;
      doc
        .fontSize(9)
        .fillColor('#4B5563')
        .text('Subtotal:', totalPanelX, currentHeight)
        .text('GST (18%):', totalPanelX, currentHeight + 15)
        .fillColor('#111827')
        .text('Grand Total:', totalPanelX, currentHeight + 35, { bold: true });

      doc
        .fillColor('#4B5563')
        .text(`Rs. ${quotation.subTotal.toFixed(2)}`, 460, currentHeight, { align: 'right', width: 75 })
        .text(`Rs. ${quotation.gstAmount.toFixed(2)}`, 460, currentHeight + 15, { align: 'right', width: 75 })
        .fillColor('#111827')
        .text(`Rs. ${quotation.totalAmount.toFixed(2)}`, 460, currentHeight + 35, { align: 'right', width: 75, bold: true });

      // Box around Grand Total
      doc
        .strokeColor('#1F2937')
        .lineWidth(1.5)
        .rect(totalPanelX - 10, currentHeight - 5, 215, 55)
        .stroke();

      currentHeight += 80;

      // --- TERMS & SIGNATURE ---
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text('Terms & Conditions:', 50, currentHeight)
        .text('1. Prices are ex-factory, Morbi.', 50, currentHeight + 12)
        .text('2. Payments are to be settled directly as per trader agreement.', 50, currentHeight + 22)
        .text('3. Goods once sold will not be taken back.', 50, currentHeight + 32);

      // Signature line
      doc
        .strokeColor('#9CA3AF')
        .lineWidth(1)
        .moveTo(400, currentHeight + 40)
        .lineTo(520, currentHeight + 40)
        .stroke();

      doc
        .fontSize(9)
        .fillColor('#374151')
        .text('Authorized Signature', 410, currentHeight + 45)
        .fontSize(7)
        .fillColor('#9CA3AF')
        .text('P-Ware Manufacturing Unit', 412, currentHeight + 57);

      // End document
      doc.end();

      writeStream.on('finish', () => {
        resolve();
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateQuotationPDF;
