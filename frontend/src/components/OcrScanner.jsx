import React, { useState } from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf'; 
import API from '../api/axios';

const Container = styled.div`
  background: ${(props) => props.theme.colors.cardBg};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  max-width: 800px;
  margin: 0 auto;
`;

const UploadArea = styled.div`
  border: 2px dashed ${(props) => props.theme.colors.primary};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background: #fffafa;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background 0.3s;
  &:hover { background: #ffeaea; }
`;

const FileInput = styled.input`display: none;`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  background: ${(props) => {
    if (props.variant === 'secondary') return '#2ecc71';
    if (props.variant === 'accent') return '#f39c12';
    return props.theme.colors.primary;
  }};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  min-width: 200px;
  opacity: ${(props) => props.disabled ? 0.6 : 1};
  transition: opacity 0.2s;
  &:hover { opacity: ${(props) => props.disabled ? 0.6 : 0.9}; }
`;

const ResultBox = styled.textarea`
  width: 100%;
  height: 250px;
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-family: monospace;
  font-size: 0.95rem;
  resize: vertical;
  background: #f8f9fa;
  line-height: 1.5;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const OcrScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setExtractedText(''); 
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return alert("Please select an image first!");
    setIsScanning(true);
    setExtractedText('Scanning image... This may take a few seconds...');

    const formData = new FormData();
    formData.append('noteImage', selectedFile);

    try {
      const { data } = await API.post('/ocr/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExtractedText(data.extractedText);
    } catch (error) {
      console.error(error);
      setExtractedText('Error extracting text. Please try a clearer image.');
    } finally {
      setIsScanning(false);
    }
  };

  // --- HELPER: GENERATE THE PDF OBJECT ---
  const generatePDFDocument = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CampusHub: Extracted Notes", margin, 20);
    doc.setLineWidth(0.5);
    doc.line(margin, 25, pageWidth - margin, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    let safeText = extractedText.replace(/→/g, '->').replace(/•/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/–|—/g, '-').replace(/[^\x00-\x7F]/g, ""); 
    const splitText = doc.splitTextToSize(safeText, maxLineWidth);
    
    let yPos = 35;
    for (let i = 0; i < splitText.length; i++) {
      if (yPos > pageHeight - margin) { doc.addPage(); yPos = margin + 10; }
      doc.text(splitText[i], margin, yPos);
      yPos += 7;
    }
    return doc;
  };

  // Action 1: User downloads PDF to computer
  const downloadPDF = () => {
    if (!extractedText) return;
    const doc = generatePDFDocument();
    doc.save("CampusHub-Notes.pdf");
  };

  // Action 2: Convert PDF to Base64 and upload to database
  const saveToProfile = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return alert("Please log in to save notes to your profile!");

    setIsSaving(true);
    try {
      // Create the PDF in memory and convert it to a data string
      const doc = generatePDFDocument();
      const pdfBase64String = doc.output('datauristring');

      // Send the PDF string to the database
      await API.post('/notes/save', {
        userId: userInfo._id,
        title: `Scanned Note - ${new Date().toLocaleDateString()}`,
        pdfBase64: pdfBase64String
      });
      
      alert("PDF File successfully saved to your profile!");
      
      // Clear scanner
      setSelectedFile(null);
      setPreviewUrl('');
      setExtractedText('');
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save PDF.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container>
      <h3 style={{ marginTop: 0, color: '#2d3436' }}>📄 AI Notes Scanner</h3>
      <p style={{ color: '#636e72', marginBottom: '1.5rem' }}>Upload a picture of your notes or textbook to extract the text instantly.</p>

      <label>
        <UploadArea>
          <span style={{ fontSize: '2rem' }}>📸</span>
          <h4>Click to Upload Image</h4>
          <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>Supports JPG, PNG, WEBP</p>
          <FileInput type="file" accept="image/*" onChange={handleFileChange} />
        </UploadArea>
      </label>

      {previewUrl && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <ImagePreview src={previewUrl} alt="Preview" />
        </div>
      )}

      <Button onClick={handleScan} disabled={isScanning || !selectedFile || extractedText}>
        {isScanning ? '⏳ Extracting Text...' : '🚀 Scan & Extract Text'}
      </Button>

      {extractedText && !isScanning && (
        <>
          <h4 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Extracted Text:</h4>
          <ResultBox value={extractedText} onChange={(e) => setExtractedText(e.target.value)} />
          
          <ButtonGroup>
            <Button variant="secondary" onClick={downloadPDF}>📥 Download PDF</Button>
            <Button variant="accent" onClick={saveToProfile} disabled={isSaving}>
              {isSaving ? '💾 Saving PDF...' : '💾 Save PDF to Profile'}
            </Button>
          </ButtonGroup>
        </>
      )}
    </Container>
  );
};

export default OcrScanner;