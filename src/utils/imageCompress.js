// 관리자 사진 업로드 전에 브라우저에서 사진 용량을 자동으로 줄인다.
// 줄일 수 없거나 줄일 필요가 없는 파일은 원본을 그대로 돌려준다.

const MAX_SIDE = 2000; // 긴 쪽 최대 픽셀
const QUALITY = 0.85; // JPG 화질
const SKIP_UNDER_BYTES = 300 * 1024; // 이보다 작은 파일은 그대로 올림

// 변환 대상 형식 (GIF는 움직임이 사라져서, PDF 등은 사진이 아니라서 제외)
const CONVERTIBLE = ["image/jpeg", "image/png", "image/webp"];

async function decode(file) {
  if (window.createImageBitmap) {
    try {
      // 휴대폰 사진의 회전 정보(EXIF)를 반영해서 읽음
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // 아래 <img> 방식으로 다시 시도
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function hasTransparency(ctx, width, height) {
  const data = ctx.getImageData(0, 0, width, height).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function toJpgName(name) {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base || "image"}.jpg`;
}

export async function compressImage(file) {
  if (!file || !CONVERTIBLE.includes(file.type)) return file;

  let source;
  try {
    source = await decode(file);
  } catch {
    return file; // 브라우저가 읽지 못하는 사진(예: 크롬의 HEIC)은 원본 그대로
  }

  const srcW = source.width;
  const srcH = source.height;
  if (file.size <= SKIP_UNDER_BYTES && Math.max(srcW, srcH) <= MAX_SIDE) {
    source.close?.();
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(srcW, srcH));
  const width = Math.round(srcW * scale);
  const height = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  source.close?.();

  // 투명 배경 PNG/WebP는 JPG로 바꾸면 배경이 채워지므로 원본 유지
  if (file.type !== "image/jpeg" && hasTransparency(ctx, width, height)) return file;

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], toJpgName(file.name), { type: "image/jpeg", lastModified: Date.now() });
}

export function compressImages(files) {
  return Promise.all(Array.from(files).map(compressImage));
}
