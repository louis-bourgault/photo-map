import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { BACKBLAZE_APPLICATION_KEY, BACKBLAZE_KEY_ID } from '$env/static/private';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3Client = new S3Client({
	region: 'eu-central-003',
	endpoint: 'https://s3.eu-central-003.backblazeb2.com',
	forcePathStyle: true,
	credentials: {
		accessKeyId: BACKBLAZE_KEY_ID,
		secretAccessKey: BACKBLAZE_APPLICATION_KEY
	}
});

export async function createPresignedDownloadURL(objectKey: string) {
	const bucketName = 'photomap-louis';
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: objectKey
	});
	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function createPresignedUploadURL(objectKey: string) {
	const bucketName = 'photomap-louis';

	let command = new PutObjectCommand({
		Bucket: bucketName,
		Key: objectKey
	});
	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
