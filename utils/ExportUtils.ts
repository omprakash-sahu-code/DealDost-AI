import { jsPDF } from 'jspdf';

/**
 * Draws a faint diagonal watermark across the entire page.
 */
function drawWatermark(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.saveGraphicsState();
  // @ts-ignore — jsPDF GState constructor
  doc.setGState(new (doc as any).GState({ opacity: 0.04 }));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(48);
  doc.setTextColor(0, 0, 0);

  // Rotate and draw watermark text across the page center
  const text = 'SECURED BY DEALDOST AI';
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  doc.text(text, centerX, centerY, {
    align: 'center',
    angle: 35,
  });

  doc.restoreGraphicsState();
}

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
 * Draws professional signature blocks at the end of the contract.
 */
function drawSignatureBlock(doc: jsPDF, y: number, pageNum: number, parties?: any): number {
  // If not enough space, add a new page
  if (y > 220) {
    pageNum++;
    doc.addPage();
    drawCorporateLetterhead(doc, pageNum);
    drawWatermark(doc);
    y = 30;
  }

  const margin = 20;
  const midX = 105;

  // Divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 200 - margin, y);
  y += 12;

  // Section title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text('SIGNATURE & ACKNOWLEDGEMENT', midX, y, { align: 'center' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('By signing below, each party acknowledges and agrees to the terms stated above.', midX, y, { align: 'center' });
  y += 14;

  // Party A (Left)
  const partyAName = parties?.partyA || 'Party A (You)';
  const partyBName = parties?.partyB || 'Party B (Counterparty)';

  // Party A Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(26, 26, 26);
  doc.text(partyAName, margin, y);

  // Party B Block
  doc.text(partyBName, midX + 10, y);
  y += 8;

  // Signature lines
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.3);

  // Party A signature line
  doc.line(margin, y, margin + 70, y);
  // Party B signature line
  doc.line(midX + 10, y, midX + 80, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Signature', margin, y);
  doc.text('Signature', midX + 10, y);
  y += 10;

  // Date lines
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(26, 26, 26);
  doc.text('Date: ____________________', margin, y);
  doc.text('Date: ____________________', midX + 10, y);
  y += 10;

  // Print name lines
  doc.text('Print Name: ______________', margin, y);
  doc.text('Print Name: ______________', midX + 10, y);
  y += 14;

  // Seal stamp
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.circle(midX, y + 5, 8);
  doc.setLineWidth(0.15);
  doc.circle(midX, y + 5, 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(140, 115, 35);
  doc.text('DEALDOST', midX, y + 4, { align: 'center' });
  doc.text('VERIFIED', midX, y + 7, { align: 'center' });

  return pageNum;
}

/**
 * Logs a contract export action to the server.
 */
async function logExportAction(contractId: string, title: string) {
  try {
    await fetch('/api/history/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'contract_exported',
        resourceType: 'contract',
        resourceId: contractId,
        description: `Exported PDF: ${title}`,
      }),
    });
  } catch (err) {
    // Non-blocking — don't let logging failures break PDF downloads
    console.warn('[ExportUtils] Failed to log export action:', err);
  }
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
    
    // Draw page 1 header and watermark
    drawStampPaperHeader(doc);
    drawWatermark(doc);
    
    // Check if contractInput is a structured object
    if (contractInput && typeof contractInput === 'object' && contractInput.content?.sections) {
      const { title } = contractInput;
      const sections = contractInput.content.sections;
      
      // Draw Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      const titleLines = doc.splitTextToSize(String(title || 'LEGAL CONTRACT'), maxWidth);
      titleLines.forEach((line: string) => {
        if (y > 270) {
          pageNum++;
          doc.addPage();
          drawCorporateLetterhead(doc, pageNum);
          drawWatermark(doc);
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
        
        const secTitleLines = doc.splitTextToSize(String(sec.title || ''), maxWidth);
        secTitleLines.forEach((line: string) => {
          if (y > 270) {
            pageNum++;
            doc.addPage();
            drawCorporateLetterhead(doc, pageNum);
            drawWatermark(doc);
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
        
        const contentLines = doc.splitTextToSize(String(sec.content || ''), maxWidth);
        contentLines.forEach((line: string) => {
          if (y > 270) {
            pageNum++;
            doc.addPage();
            drawCorporateLetterhead(doc, pageNum);
            drawWatermark(doc);
            y = 25;
          }
          doc.text(line, margin, y);
          y += 5.5; // Line spacing
        });
        y += 6; // spacing between sections
      });

      // Draw Signature Block at the end
      let parties: any = undefined;
      if (contractInput.terms?.parties) {
        if (typeof contractInput.terms.parties === 'string') {
          parties = { 
            partyA: contractInput.terms.parties.split(/\s+and\s+/i)[0]?.trim(), 
            partyB: contractInput.terms.parties.split(/\s+and\s+/i)[1]?.trim() 
          };
        } else {
          parties = {
            partyA: contractInput.terms.parties.sideA || contractInput.terms.parties.partyA,
            partyB: contractInput.terms.parties.sideB || contractInput.terms.parties.partyB,
          };
        }
      }
      pageNum = drawSignatureBlock(doc, y, pageNum, parties);

      // Log export action (fire-and-forget)
      if (contractInput._id) {
        logExportAction(contractInput._id, title || 'Untitled Contract');
      }
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
          drawWatermark(doc);
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
