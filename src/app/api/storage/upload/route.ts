import { uploadFile } from '@/storage';
import { StorageError } from '@/storage/types';
import { type NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE_MB = 12;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const FILE_TOO_LARGE_MESSAGE = `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit`;
const NO_FILE_PROVIDED_MESSAGE = 'No file provided';
const FILE_TYPE_NOT_SUPPORTED_MESSAGE = 'File type not supported';
const GENERIC_UPLOAD_ERROR_MESSAGE =
  'Something went wrong while uploading the file';
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const jsonError = (message: string, status = 400) =>
  NextResponse.json({ error: message, message }, { status });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return jsonError(NO_FILE_PROVIDED_MESSAGE, 400);
    }

    // Validate file size (max 12MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return jsonError(FILE_TOO_LARGE_MESSAGE, 400);
    }

    // Validate file type (optional, based on your requirements)
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return jsonError(FILE_TYPE_NOT_SUPPORTED_MESSAGE, 400);
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to storage
    const result = await uploadFile(
      buffer,
      file.name,
      file.type,
      folder || undefined
    );

    console.log('uploadFile, result', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading file:', error);

    if (error instanceof StorageError) {
      return jsonError(error.message, 500);
    }

    const message =
      error instanceof Error ? error.message : GENERIC_UPLOAD_ERROR_MESSAGE;

    return jsonError(message || GENERIC_UPLOAD_ERROR_MESSAGE, 500);
  }
}

// Increase the body size limit for file uploads (default is 4MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};
