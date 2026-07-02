import { jsPDF } from 'jspdf';

/**
 * Generates a PDF of the contract content and triggers a download.
 */
function drawStampPaperHeader(doc: jsPDF) {
  // Draw gold border at the top
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 55); // Outer border for the stamp header
  
  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 51); // Inner border
  
  // Stamp Content Background
  doc.setFillColor(252, 249, 240); // Faint warm tint
  doc.rect(13, 13, 184, 49, 'F');
  
  // Header texts — top row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  doc.text('GOVERNMENT OF INDIA', 18, 20);
  doc.text('SPECIAL LEGAL AGREEMENT', 192, 20, { align: 'right' });
  
  // Center title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(140, 115, 35);
  doc.text('DEALDOST LEGAL AGREEMENT', 105, 20, { align: 'center' });
  
  // Draw geometric seal circle
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.circle(105, 40, 13);
  doc.setLineWidth(0.2);
  doc.circle(105, 40, 11); // Inner ring
  
  // Seal text inside the circle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(140, 115, 35);
  doc.text('DEALDOST', 105, 38, { align: 'center' });
  doc.text('LEGAL SEAL', 105, 42, { align: 'center' });
  
  // Bottom label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('DealDost Legal Seal', 105, 58, { align: 'center' });
  
  // Serial number row
  doc.setFont('courier', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(150, 150, 150);
  doc.text('SEC: DD-2026-AI', 18, 62);
  doc.text(`REF: ${Date.now().toString(16).toUpperCase()}`, 192, 62, { align: 'right' });
  
  // Reset fonts
  doc.setFont('helvetica', 'normal');
}

function drawCorporateLetterhead(doc: jsPDF, pageNum: number) {
  // Draw minimalist gold header line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.line(10, 15, 200, 15);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text('DEALDOST AI', 10, 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Legal Agreement', 200, 12, { align: 'right' });
  
  // Footer
  doc.line(10, 282, 200, 282);
  doc.text(`Page ${pageNum}`, 105, 287, { align: 'center' });
}

/**
 * Generates a PDF of the contract content and triggers a download.
 */
export const downloadContractPDF = (contractInput: any, fileName: string = 'DealDost_Contract.pdf') => {
  try {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    
    let y = 75; // Page 1 starts text below the Stamp Paper Header
    let pageNum = 1;
    
    // Draw page 1 header
    drawStampPaperHeader(doc);
    
    // Check if contractInput is a structured object
    if (contractInput && typeof contractInput === 'object' && contractInput.content?.sections) {
      const { title } = contractInput;
      const sections = contractInput.content.sections;
      
      // Draw Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      const titleLines = doc.splitTextToSize(title || 'LEGAL CONTRACT', maxWidth);
      titleLines.forEach((line: string) => {
        if (y > 270) {
          pageNum++;
          doc.addPage();
          drawCorporateLetterhead(doc, pageNum);
          y = 25; // Subsequent pages start text higher
        }
        doc.text(line, margin, y);
        y += 8;
      });
      y += 4; // spacing after title

      // Draw Sections
      sections.forEach((sec: any) => {
        // Draw Section Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(26, 26, 26);
        
        const secTitleLines = doc.splitTextToSize(sec.title, maxWidth);
        secTitleLines.forEach((line: string) => {
          if (y > 270) {
            pageNum++;
            doc.addPage();
            drawCorporateLetterhead(doc, pageNum);
            y = 25;
          }
          doc.text(line, margin, y);
          y += 6;
        });
        y += 2; // spacing after section title
        
        // Draw Section Content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);
        
        const contentLines = doc.splitTextToSize(sec.content, maxWidth);
        contentLines.forEach((line: string) => {
          if (y > 270) {
            pageNum++;
            doc.addPage();
            drawCorporateLetterhead(doc, pageNum);
            y = 25;
          }
          doc.text(line, margin, y);
          y += 5.5; // Line spacing
        });
        y += 6; // spacing between sections
      });
    } else {
      // Legacy text-only string fallback
      const textStr = typeof contractInput === 'string' ? contractInput : JSON.stringify(contractInput);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      
      const lines = doc.splitTextToSize(textStr, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          pageNum++;
          doc.addPage();
          drawCorporateLetterhead(doc, pageNum);
          y = 25;
        }
        doc.text(line, margin, y);
        y += 5.5;
      });
    }

    doc.save(fileName);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Something went wrong during PDF generation.');
  }
};

/**
 * Copies the contract text to the clipboard.
 */
export const copyContractToClipboard = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Copy Error:', error);
    return false;
  }
};
