const ytdl = require('ytdl-core');

exports.handler = async (event) => {
  try {
    // Parse and validate input
    const { videoId } = JSON.parse(event.body);
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid video ID. Must be an 11-character YouTube video ID.' }),
      };
    }

    // Fetch video info using ytdl-core
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl);

    // Filter and map video formats
    const formats = info.formats
      .filter((f) => f.container === 'mp4' && f.hasVideo && f.hasAudio) // Only MP4 with video and audio
      .map((f) => ({
        url: f.url,
        quality: f.qualityLabel || 'Unknown Quality', // e.g., "720p", "1080p"
        format: f.container || 'mp4', // Consistent with frontend expectations
      }));

    if (formats.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No suitable video formats found.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(formats),
    };
  } catch (error) {
    console.error('Error fetching video info:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to fetch download links: ${error.message}` }),
    };
  }
};