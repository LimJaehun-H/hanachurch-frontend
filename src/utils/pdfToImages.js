// 관리자가 올린 PDF 주보를 페이지별 JPG로 바꾼다.
// 휴대폰 브라우저는 PDF를 잘 못 보여주므로, 이미지로 올려 바로 보이게 하기 위함.
// pdf.js는 용량이 커서 PDF를 변환할 때만 불러온다 (교인용 화면에는 포함되지 않음).

const PDFJS_VERSION = "6.4.299"; // package.json의 pdfjs-dist 버전과 맞출 것
const PDFJS_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}`;

const TARGET_WIDTH = 2000; // 한 쪽 이미지의 가로 픽셀 (작은 글씨도 확대해서 읽히도록)
const QUALITY = 0.85; // JPG 화질

let pdfjsPromise = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
    pdfjsPromise.catch(() => {
      pdfjsPromise = null; // 네트워크 오류 등으로 실패하면 다음에 다시 시도
    });
  }
  return pdfjsPromise;
}

export function isPdf(file) {
  return file?.type === "application/pdf" || /\.pdf$/i.test(file?.name || "");
}

export async function pdfToImages(file) {
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    // 한글 글꼴이 PDF에 포함되지 않은 경우를 대비한 글꼴·문자표 자료
    cMapUrl: `${PDFJS_CDN}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDFJS_CDN}/standard_fonts/`,
    wasmUrl: `${PDFJS_CDN}/wasm/`,
    iccUrl: `${PDFJS_CDN}/iccs/`,
  });

  const base = file.name.replace(/\.[^.]+$/, "") || "bulletin";
  const images = [];

  try {
    const pdf = await loadingTask.promise;
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const baseViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: TARGET_WIDTH / baseViewport.width });

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d");
      // JPG는 투명을 지원하지 않으므로 흰 배경을 먼저 깐다
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      page.cleanup();

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
      if (!blob) throw new Error("이미지 변환에 실패했습니다.");
      images.push(new File([blob], `${base}-${pageNo}.jpg`, { type: "image/jpeg" }));

      canvas.width = canvas.height = 0; // 메모리 정리
    }
  } finally {
    loadingTask.destroy(); // 문서와 작업 스레드 정리
  }

  return images;
}
