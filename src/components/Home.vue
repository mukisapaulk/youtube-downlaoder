<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950 flex items-center justify-center p-6">
    <div class="relative bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-neon-cyan/40 overflow-hidden">
      <h1 class="text-4xl font-bold text-white text-center mb-6 tracking-tight font-orbitron">YouTube Downloader</h1>
      <p class="text-sm text-gray-300 text-center mb-8 font-roboto-mono">
        Downloading YouTube videos may violate YouTube's Terms of Service. Use responsibly for permitted content only.
      </p>
      <form @submit.prevent="fetchDownloadLinks" class="space-y-6">
        <label for="youtube-url" class="mb-2 text-gray-200 text-sm font-medium font-orbitron">Enter YouTube URL</label>
        <input
          id="youtube-url"
          v-model="youtubeUrl"
          type="text"
          placeholder="https://www.youtube.com/watch?v= ..."
          class="mt-3 w-full p-4 bg-gray-900/50 border border-neon-cyan/60 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan animate-pulse-glow transition-all duration-300 font-roboto-mono"
          required
        />
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-magenta text-white rounded-xl font-semibold font-orbitron hover:from-neon-cyan/80 hover:to-neon-magenta/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:animate-flicker"
        >
          {{ isLoading ? 'Fetching...' : 'Get Download Links' }}
        </button>
      </form>
      <div v-if="isLoading" class="mt-8 flex justify-center">
        <div class="w-10 h-10 border-4 border-t-neon-cyan border-gray-700 rounded-full animate-spin-neon"></div>
      </div>
      <div v-if="errorMessage" class="mt-8 p-4 bg-red-600/20 border border-red-500/60 rounded-xl text-red-300 text-center font-roboto-mono">
        {{ errorMessage }}
      </div>
      <div v-if="downloadLinks.length > 0" class="mt-8">
        <h2 class="text-2xl font-semibold text-white mb-6 font-orbitron">Available Downloads</h2>
        <ul class="space-y-4">
          <li v-for="(link, index) in downloadLinks" :key="index">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block p-4 bg-gradient-to-r from-gray-700/60 to-gray-600/60 rounded-xl text-neon-cyan hover:bg-gray-600/80 transition-all duration-300 transform hover:translate-x-2 hover:shadow-neon font-roboto-mono"
            >
              {{ link.quality || 'Unknown Quality' }} ({{ link.format || 'MP4' }})
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const youtubeUrl = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const downloadLinks = ref([]);

const extractVideoId = (url) => {
  const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const fetchDownloadLinks = async () => {
  errorMessage.value = '';
  downloadLinks.value = [];
  isLoading.value = true;

  const videoId = extractVideoId(youtubeUrl.value);
  if (!videoId) {
    errorMessage.value = 'Invalid YouTube URL. Please enter a valid link.';
    isLoading.value = false;
    return;
  }

  try {
    const response = await axios.post('/.netlify/functions/fetch-download-links', { videoId }, {
      timeout: 15000,
    });
    downloadLinks.value = response.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to fetch download links. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;500&display=swap');

@layer utilities {
  .border-neon-cyan {
    border-color: #00ffea;
  }
  .bg-neon-cyan {
    background-color: #00ffea;
  }
  .text-neon-cyan {
    color: #00ffea;
  }
  .focus\:ring-neon-cyan:focus {
    --tw-ring-color: #00ffea;
  }
  .border-neon-magenta {
    border-color: #ff00ff;
  }
  .bg-neon-magenta {
    background-color: #ff00ff;
  }
  .shadow-neon {
    box-shadow: 0 0 10px #00ffea, 0 0 20px #00ffea50;
  }
  .font-orbitron {
    font-family: 'Orbitron', sans-serif;
  }
  .font-roboto-mono {
    font-family: 'Roboto Mono', monospace;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px #00ffea50;
  }
  50% {
    box-shadow: 0 0 15px #00ffea80;
  }
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes holo {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes spin-neon {
  0% { transform: rotate(0deg); border-top-color: #00ffea; }
  50% { border-top-color: #ff00ff; }
  100% { transform: rotate(360deg); border-top-color: #00ffea; }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-flicker {
  animation: flicker 0.2s ease-in-out;
}

.animate-holo {
  animation: holo 5s linear infinite;
}

.animate-spin-neon {
  animation: spin-neon 1.5s linear infinite;
}
</style>