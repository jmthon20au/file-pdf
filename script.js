const pdfForm = document.getElementById('pdfForm');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const restoreBtn = document.getElementById('restoreBtn');
const loadingIcon = document.getElementById('loadingIcon');
const fileInput = document.getElementById('pdfFile');
let fileNameInput = document.getElementById('fileName');
let fileObject = null;
let originalFile = null;
let originalSize = 0;
let originalPages = 0;

fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (file) {
        originalFile = file;
        originalSize = file.size;
        originalPages = await getPdfPageCount(file);

        document.getElementById('fileSize').textContent = formatBytes(originalSize);
        document.getElementById('filePages').textContent = originalPages;

        document.getElementById('fileInfo').style.display = 'block';
    }
});

document.getElementById('pageType').addEventListener('change', async () => {
    const pageType = document.getElementById('pageType').value;
    if (originalFile) {
        const pdfBytes = await originalFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();
        let startPage = pageType === 'front' ? 0 : 1;
        let endPage = pageType === 'front' ? totalPages : totalPages - 1;

        const newPdf = await PDFLib.PDFDocument.create();

        for (let i = startPage; i <= endPage; i += 2) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(copiedPage);
        }

        const newPdfBytes = await newPdf.save();
        const newSize = newPdfBytes.length;
        const newPages = newPdf.getPageCount();

        document.getElementById('afterSize').textContent = formatBytes(newSize);
        document.getElementById('afterPages').textContent = newPages;

        document.getElementById('afterSplitInfo').style.display = 'block';
    }
});

pdfForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = originalFile;
    const pageType = document.getElementById('pageType').value;
    const fileName = fileNameInput.value.trim();

    if (!file) {
        alert('يرجى اختيار ملف PDF أولاً.');
        return;
    }

    if (!fileName) {
        alert('يرجى إدخال اسم الملف.');
        return;
    }

    progressContainer.style.display = 'block';
    loadingIcon.style.display = 'block';
    progressFill.style.width = '0%';

    let progress = 0;
    const interval = setInterval(() => {
        progress += 25;
        progressFill.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 300);

    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    const newPdf = await PDFLib.PDFDocument.create();

    let startPage = pageType === 'front' ? 0 : 1;
    let endPage = pageType === 'front' ? totalPages : totalPages - 1;

    for (let i = startPage; i <= endPage; i += 2) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
    }

    const newPdfBytes = await newPdf.save();
    const newSize = newPdfBytes.length;
    const newPages = newPdf.getPageCount();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([newPdfBytes], { type: 'application/pdf' }));
    link.download = `${fileName}.pdf`;
    link.click();

    document.getElementById('beforeSize').querySelector('span').textContent = formatBytes(originalSize);
    document.getElementById('afterSizeFinal').querySelector('span').textContent = formatBytes(newSize);
    documentdocument.getElementById('beforePages').querySelector('span').textContent = originalPages;
    document.getElementById('afterPagesFinal').querySelector('span').textContent = newPages;

    document.getElementById('fileInfoAfter').style.display = 'block';

    // اختفاء شريط التقدم بعد التنزيل
    progressContainer.style.display = 'none';
    loadingIcon.style.display = 'none';
    progressFill.style.width = '0%';

    // إعادة تعيين العناصر بعد التنزيل
    restoreBtn.style.display = 'block';
});

restoreBtn.addEventListener('click', () => {
    // إعادة تعيين الحقول والواجهة
    fileInput.value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('fileInfoAfter').style.display = 'none';
    restoreBtn.style.display = 'none';
    document.getElementById('fileName').value = '';
    document.getElementById('pageType').value = 'front';
    document.getElementById('afterSplitInfo').style.display = 'none';
});
    
function formatBytes(bytes) {
    const units = ['بايت', 'كيلوبايت', 'ميغابايت', 'جيجابايت'];
    let size = bytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return size.toFixed(2) + ' ' + units[i];
}

async function getPdfPageCount(file) {
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
}