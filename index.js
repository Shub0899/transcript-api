import express from 'express';
import cors from 'cors';
import { YoutubeTranscript } from 'youtube-transcript';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/transcribe', async (req, res) => {
  const { url: youtubeUrl } = req.body;

  if (!youtubeUrl) return res.status(400).json({ error: 'Missing URL' });

  try {
    const videoId = youtubeUrl.includes('youtube.com/watch?v=') 
      ? new URL(youtubeUrl).searchParams.get('v')
      : youtubeUrl;

    const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);

    const timestamped = rawTranscript.map(item => ({
      text: item.text,
      start: item.offset,
      end: item.offset + item.duration,
    }));

    const transcript = timestamped.map(u => u.text).join(' ');

    return res.status(200).json({ timestamped, transcript });
  } catch (err: any) {
    console.error('Transcript error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch transcript' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
