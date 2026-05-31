import { GetObjectCommand, S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { BACKBLAZE_APPLICATION_KEY, BACKBLAZE_KEY_ID, S3_REGION, S3_ENDPOINT, S3_BUCKET_NAME } from '$env/static/private';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PUBLIC_S3_PUBLIC_URL } from '$env/static/public';

export const s3Client = new S3Client({
	region: S3_REGION,
	endpoint: S3_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: BACKBLAZE_KEY_ID,
		secretAccessKey: BACKBLAZE_APPLICATION_KEY
	}
});

export async function createPresignedDownloadURL(objectKey: string) {
	// const bucketName = 'photomap-louis';
	// const command = new GetObjectCommand({
	// 	Bucket: bucketName,
	// 	Key: objectKey
	// });
	// return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
	return `${PUBLIC_S3_PUBLIC_URL}/${objectKey}`;
}

export async function deleteObject(objectKey: string) {
	const bucketName = S3_BUCKET_NAME;
	const command = new DeleteObjectCommand({
		Bucket: bucketName,
		Key: objectKey
	});
	return await s3Client.send(command);
}

export async function createPresignedUploadURL(objectKey: string) {
	const bucketName = S3_BUCKET_NAME;

	let command = new PutObjectCommand({
		Bucket: bucketName,
		Key: objectKey
	});
	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
