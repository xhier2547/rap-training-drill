# ⛩️ Rap Dojo Pro: The Ultimate Flow Trainer

![Rap Dojo Header](https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop)

**Rap Dojo Pro** is a high-performance web application designed for professional rap training and vocal mastery. Built with **Next.js 15**, **Web Audio API**, and **AI Speech Recognition**, it provides a "better than Smule" experience for artists focused on UK Drill, Grime, and complex flow patterns.

## 🔥 Key Features

*   **🎙️ Pro Studio FX Rack**: Real-time vocal processing chain including Dynamics Compression, EQ (Bass/Treble), and Algorithmic Studio Reverb.
*   **📡 AI Flow Analysis**: Instant syllable-by-syllable accuracy scoring using the Web Speech API.
*   **⚡ Kinetic Lyrics Engine**: Performance-timed, ultra-smooth lyric synchronization with support for complex slang and Thai language segmentation.
*   **🌊 Dynamic Waveform Control**: Interactive audio scrubbing and "Snap-to-Lyric" loop selection for practicing difficult bars.
*   **🏆 Mastery Reporting**: Detailed post-session analysis with XP progression, performance ranks, and session playback.
*   **🧪 Auto-Sync Engine**: Proprietary vocal-peak detection that automatically aligns LRC lyrics to any audio file.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router), React 19 |
| **Styling** | [Tailwind CSS 4.0](https://tailwindcss.com/), HSL Palettes |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Audio Engine** | Web Audio API (BiquadFilter, DelayNode, DynamicsCompressor) |
| **AI/ML** | Web Speech API (Recognition & Synthesis) |
| **State** | [Zustand](https://github.com/pmndrs/zustand) |
| **Icons** | Lucide React |

## 🚀 Getting Started

### Prerequisites
*   Node.js 20.x or higher
*   A modern browser (Chrome/Edge/Safari) with Microphone access

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rap-dojo-pro.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure
*   `app/`: Next.js App Router for pages and layouts.
*   `components/`: Modular UI components (Dashboard, Studio, Results).
*   `lib/utils/vocalProcessor.ts`: Core logic for the **VocalProcessor** and Web Audio graph.
*   `lib/store/`: Zustand state management for the Studio environment.
*   `data/`: Song library, slang dictionary, and sync metadata.

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with 🎵 and 🎤 by **Central QIER**
