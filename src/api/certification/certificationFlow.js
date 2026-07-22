const ALLOWED_CONTENT_TYPES_BY_EXTENSION = {
  jpg: new Set(['image/jpg', 'image/jpeg']),
  jpeg: new Set(['image/jpg', 'image/jpeg']),
  png: new Set(['image/png']),
  webp: new Set(['image/webp']),
};

const UNSUPPORTED_IMAGE_MESSAGE = 'JPG, JPEG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.';

export function getCertificationImageContentType(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase();
  const contentType = file?.type?.toLowerCase();
  const allowedContentTypes = ALLOWED_CONTENT_TYPES_BY_EXTENSION[extension];

  if (!allowedContentTypes?.has(contentType)) {
    throw new Error(UNSUPPORTED_IMAGE_MESSAGE);
  }

  return contentType;
}

export async function submitCertificationImage(file, dependencies) {
  const { getUploadUrl, uploadImage, certificate } = dependencies;
  const contentType = getCertificationImageContentType(file);
  const { uploadUrl, imageKey } = await getUploadUrl(file.name, contentType);

  await uploadImage(uploadUrl, file, contentType);
  await certificate(imageKey);

  return imageKey;
}
