import { jsPDF } from 'jspdf';

/**
 * Generates a PDF of the contract content and triggers a download.
 */
export const downloadContractPDF = (content: string, fileName: string = 'DealDost_Contract.pdf') => {
  try {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Formatting
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Split text into lines that fit the page width
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    const lines = doc.splitTextToSize(content, maxWidth);
    
    // Top Margin
    let y = 20;
    
    // Render lines page by page if needed
    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 7; // Line spacing
    });

    doc.save(fileName);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Something went wrong during PDF generation. Please ensure jspdf is installed.');
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
