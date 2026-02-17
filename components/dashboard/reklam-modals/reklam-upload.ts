export async function uploadVideoToBunny(
  file: File,
  onProgress: (p: number) => void,
) {
  const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME; // ← Add this

  if (!LIBRARY_ID || !API_KEY) throw new Error("Bunny credentials missing");

  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: { AccessKey: API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ title: file.name }),
    },
  );

  const { guid: videoId } = await createRes.json();
  onProgress(20);

  await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    {
      method: "PUT",
      headers: { AccessKey: API_KEY },
      body: file,
    },
  );

  onProgress(100);

  // Use your ACTUAL CDN hostname
  const hlsUrl = CDN_HOSTNAME
    ? `https://${CDN_HOSTNAME}/${videoId}/playlist.m3u8`
    : `https://vz-${LIBRARY_ID}.b-cdn.net/${videoId}/playlist.m3u8`; // fallback

  return {
    iframeUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`,
    hlsUrl,
  };
}
