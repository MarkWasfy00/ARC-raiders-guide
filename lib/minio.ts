import { Client } from 'minio'

// MinIO client configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT?.replace('http://', '').replace('https://', '') || 'localhost',
  port: 9000,
  useSSL: process.env.MINIO_ENDPOINT?.startsWith('https') || false,
  accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
  region: process.env.MINIO_REGION || 'us-east-1',
})

// Default bucket name
export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'arcraiders-uploads'

/**
 * Initialize MinIO by creating the default bucket if it doesn't exist
 */
export async function initializeMinio() {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME)

    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, process.env.MINIO_REGION || 'us-east-1')
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
      // await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy))
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
    await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      fileBuffer,
      fileBuffer.length,
      metadata
    )

    // Generate presigned URL for the uploaded file (valid for 7 days)
    const url = await minioClient.presignedGetObject(BUCKET_NAME, fileName, 24 * 60 * 60 * 7)

    return { success: true, url, fileName }
  } catch (error) {
    console.error('❌ Error uploading file to MinIO:', error)
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
    const url = await minioClient.presignedGetObject(BUCKET_NAME, fileName, expirySeconds)
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
    await minioClient.removeObject(BUCKET_NAME, fileName)
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
    const objectsStream = minioClient.listObjects(BUCKET_NAME, prefix, true)
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

export default minioClient
