import { Client } from 'minio'

// Parse MinIO endpoint
function parseMinioEndpoint(endpoint: string | undefined) {
  if (!endpoint) {
    return { endPoint: 'localhost', port: 9000, useSSL: false };
  }

  const useSSL = endpoint.startsWith('https');
  const cleanEndpoint = endpoint.replace('http://', '').replace('https://', '');

  // Split host and port
  const [endPoint, portStr] = cleanEndpoint.split(':');
  const port = portStr ? parseInt(portStr, 10) : 9000;

  return { endPoint, port, useSSL };
}

// MinIO client - initialized lazily
let minioClient: Client | null = null;

function getMinioClient(): Client {
  if (!minioClient) {
    const { endPoint, port, useSSL } = parseMinioEndpoint(process.env.MINIO_ENDPOINT);

    console.log('🔧 Initializing MinIO client with:', {
      endPoint,
      port,
      useSSL,
      accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
      region: process.env.MINIO_REGION || 'us-east-1',
    });

    minioClient = new Client({
      endPoint,
      port,
      useSSL,
      accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
      region: process.env.MINIO_REGION || 'us-east-1',
    });
  }

  return minioClient;
}

// Default bucket name
export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'arcraiders-uploads'

/**
 * Initialize MinIO by creating the default bucket if it doesn't exist
 */
export async function initializeMinio() {
  try {
    const client = getMinioClient();
    const bucketExists = await client.bucketExists(BUCKET_NAME)

    if (!bucketExists) {
      await client.makeBucket(BUCKET_NAME, process.env.MINIO_REGION || 'us-east-1')
      console.log(`✅ MinIO bucket '${BUCKET_NAME}' created successfully`)

      // Set bucket policy to allow public read access (optional)
      // Uncomment if you want uploaded files to be publicly accessible
      // const policy = {
      //   Version: '2012-10-17',
      //   Statement: [
      //     {
      //       Effect: 'Allow',
      //       Principal: { AWS: ['*'] },
      //       Action: ['s3:GetObject'],
      //       Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
      //     },
      //   ],
      // }
      // await client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy))
    } else {
      console.log(`✅ MinIO bucket '${BUCKET_NAME}' already exists`)
    }
  } catch (error) {
    console.error('❌ Error initializing MinIO:', error)
    throw error
  }
}

/**
 * Upload a file to MinIO
 * @param fileName - Name of the file in the bucket
 * @param fileBuffer - File buffer or stream
 * @param metadata - Optional metadata for the file
 * @returns Object URL of the uploaded file
 */
export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  metadata?: Record<string, string>
) {
  try {
    const client = getMinioClient();

    // Ensure bucket exists before uploading
    const bucketExists = await client.bucketExists(BUCKET_NAME)
    if (!bucketExists) {
      console.log(`Creating bucket '${BUCKET_NAME}'...`)
      await client.makeBucket(BUCKET_NAME, process.env.MINIO_REGION || 'us-east-1')
      console.log(`✅ MinIO bucket '${BUCKET_NAME}' created successfully`)
    }

    await client.putObject(
      BUCKET_NAME,
      fileName,
      fileBuffer,
      fileBuffer.length,
      metadata
    )

    // Generate presigned URL for the uploaded file (valid for 7 days)
    const url = await client.presignedGetObject(BUCKET_NAME, fileName, 24 * 60 * 60 * 7)

    return { success: true, url, fileName }
  } catch (error: any) {
    console.error('❌ Error uploading file to MinIO:', error)
    console.error('MinIO Error Details:', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    })
    throw error
  }
}

/**
 * Get a presigned URL for a file
 * @param fileName - Name of the file in the bucket
 * @param expirySeconds - URL expiry time in seconds (default: 7 days)
 * @returns Presigned URL
 */
export async function getFileUrl(fileName: string, expirySeconds: number = 24 * 60 * 60 * 7) {
  try {
    const client = getMinioClient();
    const url = await client.presignedGetObject(BUCKET_NAME, fileName, expirySeconds)
    return url
  } catch (error) {
    console.error('❌ Error getting file URL from MinIO:', error)
    throw error
  }
}

/**
 * Delete a file from MinIO
 * @param fileName - Name of the file to delete
 */
export async function deleteFile(fileName: string) {
  try {
    const client = getMinioClient();
    await client.removeObject(BUCKET_NAME, fileName)
    return { success: true, fileName }
  } catch (error) {
    console.error('❌ Error deleting file from MinIO:', error)
    throw error
  }
}

/**
 * List all files in the bucket
 * @param prefix - Optional prefix to filter files
 */
export async function listFiles(prefix?: string) {
  try {
    const client = getMinioClient();
    const objectsStream = client.listObjects(BUCKET_NAME, prefix, true)
    const files: Array<{ name: string; size: number; lastModified: Date }> = []

    return new Promise((resolve, reject) => {
      objectsStream.on('data', (obj) => {
        if (obj.name && obj.size !== undefined && obj.lastModified) {
          files.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
          })
        }
      })
      objectsStream.on('end', () => resolve(files))
      objectsStream.on('error', (err) => reject(err))
    })
  } catch (error) {
    console.error('❌ Error listing files from MinIO:', error)
    throw error
  }
}

/**
 * Extract MinIO filename from presigned URL
 * @param url - Presigned URL from MinIO
 * @returns filename or null
 * @example
 * extractFilenameFromUrl('http://localhost:9000/arcraiders-uploads/profiles/user.gif?X-Amz-Algorithm...')
 * // Returns: 'profiles/user.gif'
 */
export function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Presigned URLs have filename in pathname
    // Example: /arcraiders-uploads/profiles/user123.jpg -> profiles/user123.jpg
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      // Skip bucket name (first part), return rest
      return parts.slice(1).join('/');
    }
    return null;
  } catch {
    return null;
  }
}

export default getMinioClient
