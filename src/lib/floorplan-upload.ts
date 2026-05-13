import type { Floorplan } from '@/types/domain';

const imageTypes = ['image/jpeg', 'image/png'];
const pdfType = 'application/pdf';
const pdfJsVersion = '4.10.38';
const pdfJsUrls = [
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.min.mjs`,
  `https://unpkg.com/pdfjs-dist@${pdfJsVersion}/build/pdf.min.mjs`
];
const pdfWorkerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.worker.min.mjs`;

type LoadedFloorplan = Omit<Floorplan, 'id' | 'projectId'>;
type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (source: { data: ArrayBuffer }) => { promise: Promise<{ getPage: (pageNumber: number) => Promise<{ getViewport: (options: { scale: number }) => { width: number; height: number }; render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } }> }> };
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo renderizar la imagen seleccionada.'));
    image.src = src;
  });
}

async function getPdfJs(): Promise<PdfJs> {
  for (const url of pdfJsUrls) {
    try {
      const pdfjs = await import(/* webpackIgnore: true */ url) as PdfJs;
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      return pdfjs;
    } catch {
      // Try the next CDN before showing a user-facing error.
    }
  }

  throw new Error('No se pudo cargar el visor PDF. Revisa tu conexión e intenta de nuevo, o sube una imagen JPG/PNG.');
}

async function loadRasterFloorplan(file: File): Promise<LoadedFloorplan> {
  const fileUrl = await readFileAsDataUrl(file);
  const image = await loadImage(fileUrl);
  return {
    name: file.name,
    fileUrl,
    fileType: 'image',
    width: image.naturalWidth,
    height: image.naturalHeight
  };
}

async function loadPdfFloorplan(file: File): Promise<LoadedFloorplan> {
  const pdfjs = await getPdfJs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D no está disponible en este navegador.');

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;

  return {
    name: `${file.name} · página 1`,
    fileUrl: canvas.toDataURL('image/png'),
    fileType: 'image',
    width: canvas.width,
    height: canvas.height
  };
}

export async function loadFloorplanFile(file: File): Promise<Floorplan> {
  const lowerName = file.name.toLowerCase();
  const isPdf = file.type === pdfType || lowerName.endsWith('.pdf');
  const isImage = imageTypes.includes(file.type) || /\.(jpe?g|png)$/.test(lowerName);

  if (!isPdf && !isImage) {
    throw new Error('Formato no soportado. Sube PDF, JPG o PNG.');
  }

  const floorplan = isPdf ? await loadPdfFloorplan(file) : await loadRasterFloorplan(file);
  return {
    id: `floorplan-${crypto.randomUUID()}`,
    projectId: '',
    ...floorplan
  };
}
