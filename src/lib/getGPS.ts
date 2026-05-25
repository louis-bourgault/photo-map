import * as ExifReader from 'exifreader';

export async function getGPSandExif(file: File): Promise<{ latitude: string; longitude: string; exif: any } | null> {
  const tags = await ExifReader.load(file, {
    expanded: true,
    computed: true,
  });
  console.log(tags);

  const latitude = tags.gps?.Latitude;
  const longitude = tags.gps?.Longitude;

  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return {
      latitude: String(latitude),
      longitude: String(longitude),
      exif: tags,
    };
  }

  return null;
}