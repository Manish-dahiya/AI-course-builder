import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function getEmbedUrl(url) {
  const urlObj = new URL(url);
  const videoId = urlObj.searchParams.get("v");
  return `https://www.youtube.com/embed/${videoId}`;
}

export async function downloadPDF(pdfRef, chapterTitle) {
  const input = pdfRef.current;

  // Create canvas with higher quality
  const canvas = await html2canvas(input, {
    scale: 3, // Even sharper text
    useCORS: true,
    logging: false,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Page dimensions with margins
  const pageWidth = 210;
  const pageHeight = 297;
  const margins = {
    top: 20,
    bottom: 20,
    left: 15,
    right: 15
  };
  
  const contentWidth = pageWidth - margins.left - margins.right;
  const contentHeight = pageHeight - margins.top - margins.bottom;
  
  // Calculate scaling
  const canvasAspectRatio = canvas.height / canvas.width;
  const imgWidth = contentWidth;
  const imgHeight = imgWidth * canvasAspectRatio;
  
  // If content fits in one page
  if (imgHeight <= contentHeight) {
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      margins.left,
      margins.top,
      imgWidth,
      imgHeight
    );
  } else {
    // Multi-page handling
    const totalPages = Math.ceil(imgHeight / contentHeight);
    let currentY = 0;
    
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
      // Calculate the portion of the image for this page
      const sourceY = (currentY / imgHeight) * canvas.height;
      const sourceHeight = Math.min(
        (contentHeight / imgHeight) * canvas.height,
        canvas.height - sourceY
      );
      
      // Create a temporary canvas for this page portion
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeight;
      
      // Fill with white background
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw the portion of the original canvas
      tempCtx.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight,
        0, 0, tempCanvas.width, tempCanvas.height
      );
      
      // Add to PDF with margins
      const pageImgHeight = Math.min(contentHeight, imgHeight - currentY);
      pdf.addImage(
        tempCanvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        margins.left,
        margins.top,
        imgWidth,
        pageImgHeight
      );
      
      currentY += contentHeight;
    }
  }

  console.log("PDF created successfully with proper margins");
  pdf.save(`${chapterTitle || "lesson"}.pdf`);
}


export const API_BASE_URL = "http://localhost:5000";
// export const API_BASE_URL = "http://backend:5000"; //for docker.

