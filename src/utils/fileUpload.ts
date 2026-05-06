import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
import mammoth from 'mammoth';

export const handleAttachment = (
  file: File,
  onImageSuccess: (data: {base64: string, mimeType: string, dataUrl: string}) => void,
  onFileSuccess: (data: {name: string, content: string}) => void,
  onError: (fileName: string, err: any) => void
) => {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64String = dataUrl.split(',')[1];
        
        onImageSuccess({
          base64: base64String,
          mimeType: 'image/jpeg',
          dataUrl: dataUrl
        });
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  } else if (file.name.endsWith('.pdf')) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\\n';
        }
        onFileSuccess({ name: file.name, content: fullText });
      } catch (e) {
        onError(file.name, e);
        onFileSuccess({ name: file.name, content: 'Teks tidak dapat diekstrak dari PDF' });
      }
    };
    reader.readAsArrayBuffer(file);
  } else if (file.name.endsWith('.docx')) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        onFileSuccess({ name: file.name, content: result.value });
      } catch(e) {
         onError(file.name, e);
         onFileSuccess({ name: file.name, content: 'Teks tidak dapat diekstrak dari dokumen' });
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = (event) => {
      onFileSuccess({ name: file.name, content: event.target?.result as string });
    };
    reader.readAsText(file);
  }
};
