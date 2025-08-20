import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  Alert,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Close,
  Download,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  TableChart,
  Description,
  Code,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

interface FileData {
  id: number;
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  contentType: string;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
  tags: string;
  isPublic: boolean;
  status: string;
  validationStatus: string;
  validationMessage: string;
  metadata: string;
  checksum: string;
}

interface FileViewerProps {
  open: boolean;
  onClose: () => void;
  file: FileData | null;
  onDownload?: (fileId: number) => void;
}

interface ExcelSheet {
  name: string;
  data: any[][];
  headers: string[];
}

const FileViewer: React.FC<FileViewerProps> = ({ open, onClose, file, onDownload }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [excelSheets, setExcelSheets] = useState<ExcelSheet[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [textContent, setTextContent] = useState<string>('');
  const [jsonData, setJsonData] = useState<any>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);

  useEffect(() => {
    if (open && file) {
      loadFileForViewing();
    } else {
      // Clean up when dialog closes
      setViewUrl(null);
      setError(null);
      setZoom(100);
      setFullscreen(false);
      setExcelSheets([]);
      setActiveSheet(0);
      setTextContent('');
      setJsonData(null);
      setCsvData([]);
    }
  }, [open, file]);

  const loadFileForViewing = async () => {
    if (!file) return;

    console.log('Loading file for viewing:', file.originalFilename, 'ID:', file.id);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('jwtToken');
      const url = `http://localhost:12001/api/data/files/${file.id}/view`;
      
      console.log('View URL:', url);
      console.log('File type:', file.originalFilename);
      console.log('Is viewable:', isFileViewable(file.originalFilename));
      
      // Check if file type is viewable
      if (!isFileViewable(file.originalFilename)) {
        setError('This file type cannot be viewed online. Please download it to view.');
        setLoading(false);
        return;
      }

      // For viewable files, set the URL and load content based on type
      setViewUrl(url);
      
      // Load content based on file type
      if (token) {
        await loadFileContent(url, token, file.originalFilename);
      }
      
      setLoading(false);
      console.log('View URL set successfully');
    } catch (err: any) {
      console.error('Error loading file for viewing:', err);
      setError('Failed to load file for viewing. Please try again.');
      setLoading(false);
    }
  };

  const loadFileContent = async (url: string, token: string, filename: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

      if (isExcelFile(filename)) {
        await loadExcelContent(response);
      } else if (extension === 'csv') {
        await loadCsvContent(response);
      } else if (extension === 'json') {
        await loadJsonContent(response);
      } else if (extension === 'xml') {
        await loadXmlContent(response);
      } else if (isTextFile(filename)) {
        await loadTextContent(response);
      }
    } catch (err) {
      console.error('Error loading file content:', err);
      setError('Failed to load file content. Please try again.');
    }
  };

  const loadExcelContent = async (response: Response) => {
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheets: ExcelSheet[] = [];
    
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[];
        const data = jsonData.slice(1) as any[][];
        
        sheets.push({
          name: sheetName,
          data: data,
          headers: headers
        });
      }
    });
    
    setExcelSheets(sheets);
    console.log('Excel sheets loaded:', sheets.length);
  };

  const loadCsvContent = async (response: Response) => {
    const text = await response.text();
    const lines = text.split('\n');
    const csvData = lines.map(line => line.split(',').map(cell => cell.trim()));
    setCsvData(csvData);
  };

  const loadJsonContent = async (response: Response) => {
    const text = await response.text();
    const jsonData = JSON.parse(text);
    setJsonData(jsonData);
  };

  const loadXmlContent = async (response: Response) => {
    const text = await response.text();
    setTextContent(text);
  };

  const loadTextContent = async (response: Response) => {
    const text = await response.text();
    setTextContent(text);
  };

  const isFileViewable = (filename: string): boolean => {
    if (!filename) return false;
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    
    return [
      'txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'md',
      'pdf', 'doc', 'docx', 'ppt', 'pptx',
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',
      'mp4', 'webm', 'ogg', 'mp3', 'wav', 'm4a',
      'xlsx', 'xls'
    ].includes(extension);
  };

  const isExcelFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    return ['xlsx', 'xls'].includes(extension);
  };

  const isTextFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    return ['txt', 'md', 'html', 'htm', 'css', 'js', 'xml'].includes(extension);
  };

  const isImageFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension);
  };

  const isVideoFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    return ['mp4', 'webm', 'ogg'].includes(extension);
  };

  const isAudioFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    return ['mp3', 'wav', 'm4a'].includes(extension);
  };

  const isPdfFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    return extension === 'pdf';
  };

  const isDocumentFile = (filename: string): boolean => {
    if (!filename) return false;
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    return ['doc', 'docx', 'ppt', 'pptx'].includes(extension);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleFullscreen = () => setFullscreen(!fullscreen);

  const renderFileContent = () => {
    if (!file) return null;

    if (isExcelFile(file.originalFilename)) {
      return renderExcelContent();
    } else if (file.originalFilename.toLowerCase().endsWith('.csv')) {
      return renderCsvContent();
    } else if (file.originalFilename.toLowerCase().endsWith('.json')) {
      return renderJsonContent();
    } else if (isTextFile(file.originalFilename)) {
      return renderTextContent();
    } else if (isImageFile(file.originalFilename)) {
      return <AuthenticatedImage fileUrl={viewUrl!} filename={file.originalFilename} style={{ maxWidth: '100%', height: 'auto' }} />;
    } else if (isPdfFile(file.originalFilename)) {
      return <AuthenticatedIframe fileUrl={viewUrl!} filename={file.originalFilename} style={{ width: '100%', height: '600px' }} />;
    } else if (isDocumentFile(file.originalFilename)) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            <Typography variant="body1" paragraph>
              This document ({file.originalFilename}) cannot be previewed directly in the browser.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              DOCX, DOC, PPT, and PPTX files require Microsoft Office or compatible software to view properly.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onDownload && onDownload(file.id)}
                startIcon={<Download />}
                sx={{ mr: 2 }}
              >
                Download File
              </Button>
              <Button
                variant="outlined"
                onClick={onClose}
              >
                Close
              </Button>
            </Box>
          </Alert>
        </Box>
      );
    } else if (isVideoFile(file.originalFilename)) {
      return <AuthenticatedVideo controls={true} style={{ width: '100%', maxHeight: '600px' }} fileUrl={viewUrl!} contentType={file.contentType} />;
    } else if (isAudioFile(file.originalFilename)) {
      return <AuthenticatedAudio controls={true} style={{ width: '100%' }} fileUrl={viewUrl!} contentType={file.contentType} />;
    }

    return <Alert severity="info">File type not supported for viewing.</Alert>;
  };

  const renderExcelContent = () => {
    if (excelSheets.length === 0) {
      return <Skeleton variant="rectangular" width="100%" height={400} />;
    }

    const currentSheet = excelSheets[activeSheet];

    return (
      <Box sx={{ width: '100%' }}>
        {excelSheets.length > 1 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeSheet} onChange={(_, newValue) => setActiveSheet(newValue)}>
              {excelSheets.map((sheet, index) => (
                <Tab key={index} label={sheet.name} />
              ))}
            </Tabs>
          </Box>
        )}
        
        <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {currentSheet.headers.map((header, index) => (
                  <TableCell key={index} sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentSheet.data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {currentSheet.headers.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      {row[colIndex] || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Sheet: {currentSheet.name} | Rows: {currentSheet.data.length} | Columns: {currentSheet.headers.length}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderCsvContent = () => {
    if (csvData.length === 0) {
      return <Skeleton variant="rectangular" width="100%" height={400} />;
    }

    const headers = csvData[0] || [];
    const data = csvData.slice(1);

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {row[colIndex] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderJsonContent = () => {
    if (!jsonData) {
      return <Skeleton variant="rectangular" width="100%" height={400} />;
    }

    return (
      <Box sx={{ 
        backgroundColor: '#f5f5f5', 
        p: 2, 
        borderRadius: 1, 
        maxHeight: 600, 
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px',
        whiteSpace: 'pre-wrap'
      }}>
        {JSON.stringify(jsonData, null, 2)}
      </Box>
    );
  };

  const renderTextContent = () => {
    if (!textContent) {
      return <Skeleton variant="rectangular" width="100%" height={400} />;
    }

    return (
      <Box sx={{ 
        backgroundColor: '#f5f5f5', 
        p: 2, 
        borderRadius: 1, 
        maxHeight: 600, 
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px',
        whiteSpace: 'pre-wrap'
      }}>
        {textContent}
      </Box>
    );
  };

  if (!file) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          minHeight: fullscreen ? '100vh' : '80vh',
          maxHeight: fullscreen ? '100vh' : '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isExcelFile(file.originalFilename) && <TableChart />}
          {isTextFile(file.originalFilename) && <Description />}
          {(file.originalFilename.toLowerCase().endsWith('.json') || file.originalFilename.toLowerCase().endsWith('.xml')) && <Code />}
          <Typography variant="h6">{file.originalFilename}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={`${(file.fileSize / 1024 / 1024).toFixed(2)} MB`} 
            size="small" 
            variant="outlined" 
            sx={{ color: 'white', borderColor: 'white' }}
          />
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small" sx={{ color: 'white' }}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small" sx={{ color: 'white' }}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton onClick={handleFullscreen} size="small" sx={{ color: 'white' }}>
              {fullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <Box sx={{ 
            p: 2, 
            flex: 1, 
            overflow: 'auto',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left'
          }}>
            {renderFileContent()}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Uploaded by {file.uploadedBy} on {new Date(file.uploadedAt).toLocaleDateString()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onDownload && (
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => onDownload(file.id)}
              >
                Download
              </Button>
            )}
            <Button variant="contained" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Authenticated components for media files
const AuthenticatedImage: React.FC<{ fileUrl: string; filename: string; style?: React.CSSProperties }> = ({ fileUrl, filename, style }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
        } else {
          setError('Failed to load image');
        }
      } catch (err) {
        setError('Error loading image');
      }
    };

    loadImage();
  }, [fileUrl]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!imageSrc) {
    return <Skeleton variant="rectangular" width="100%" height={400} />;
  }

  return <img src={imageSrc} alt={filename} style={style} />;
};

const AuthenticatedIframe: React.FC<{ fileUrl: string; filename: string; style?: React.CSSProperties }> = ({ fileUrl, filename, style }) => {
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadIframe = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setIframeSrc(url);
        } else {
          setError('Failed to load document');
        }
      } catch (err) {
        setError('Error loading document');
      }
    };

    loadIframe();
  }, [fileUrl]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!iframeSrc) {
    return <Skeleton variant="rectangular" width="100%" height={400} />;
  }

  return <iframe src={iframeSrc} style={style} title={filename} />;
};

const AuthenticatedVideo: React.FC<{ controls: boolean; style?: React.CSSProperties; fileUrl: string; contentType: string }> = ({ controls, style, fileUrl, contentType }) => {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setVideoSrc(url);
        } else {
          setError('Failed to load video');
        }
      } catch (err) {
        setError('Error loading video');
      }
    };

    loadVideo();
  }, [fileUrl]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!videoSrc) {
    return <Skeleton variant="rectangular" width="100%" height={400} />;
  }

  return (
    <video controls={controls} style={style}>
      <source src={videoSrc} type={contentType} />
      Your browser does not support the video tag.
    </video>
  );
};

const AuthenticatedAudio: React.FC<{ controls: boolean; style?: React.CSSProperties; fileUrl: string; contentType: string }> = ({ controls, style, fileUrl, contentType }) => {
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAudioSrc(url);
        } else {
          setError('Failed to load audio');
        }
      } catch (err) {
        setError('Error loading audio');
      }
    };

    loadAudio();
  }, [fileUrl]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!audioSrc) {
    return <Skeleton variant="rectangular" width="100%" height={100} />;
  }

  return (
    <audio controls={controls} style={style}>
      <source src={audioSrc} type={contentType} />
      Your browser does not support the audio tag.
    </audio>
  );
};

export default FileViewer;
