<template>
  <div class="relative overflow-hidden rounded-3xl bg-wood-950 border-2 border-wood-750 p-4 sm:p-7 shadow-rpg-panel chakra-journey-container">
    <!-- Ambient Space Nebula Glow Background -->
    <div
      class="absolute -right-32 -top-32 w-96 h-96 rounded-full blur-[100px] opacity-25 pointer-events-none transition-all duration-1000"
      :style="{ backgroundColor: selectedChakra?.colorHex || '#EF4444' }"
    />
    <div
      class="absolute -left-32 -bottom-32 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-1000"
      :style="{ backgroundColor: activeChakra?.colorHex || '#EF4444' }"
    />

    <!-- Header: Title & Integration Philosophy -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wood-800 pb-5 mb-6 relative z-10">
      <div>
        <div class="flex items-center gap-2.5 mb-1">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
            <div class="w-full h-full bg-wood-950 rounded-[14px] flex items-center justify-center text-amber-300">
              <Sparkles :size="17" />
            </div>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-black font-heading text-white tracking-tight flex items-center gap-2">
              <span>Hành Trình Khai Mở 7 Luân Xa</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 font-sans font-bold">
                HSK 3.0 Chuẩn Mới
              </span>
            </h2>
          </div>
        </div>
        <p class="text-xs sm:text-sm text-amber-200/60 leading-relaxed">
          Từng nấc Luân Xa chính là một cảnh giới tu luyện. Khai mở căn cơ ngôn ngữ thực tế (FSRS) qua từng trạm ải.
        </p>
      </div>

      <!-- Active Aura & Realm Pill -->
      <div class="flex items-center gap-3 shrink-0 self-start sm:self-auto">
        <div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-wood-900 border border-wood-750 text-xs shadow-sm">
          <span
            class="w-3.5 h-3.5 rounded-full animate-ping"
            :style="{ backgroundColor: activeChakra?.colorHex || '#EF4444' }"
          />
          <div class="flex flex-col">
            <span class="text-[10px] text-amber-200/50 uppercase font-bold tracking-wider">Khí Tức Hiện Tại</span>
            <span class="font-bold text-white flex items-center gap-1">
              <span>{{ activeChakra?.nameVi?.split('(')[0]?.trim() || 'Muladhara' }}</span>
              <span class="text-xs font-mono text-gold-300">({{ activeChakra?.progressPercent || 49.3 }}%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- 1. THE GRAND COSMIC STAGE (Natural Landscape Ratio 1024x572)           -->
    <!-- ===================================================================== -->
    <div class="relative w-full rounded-3xl bg-black border-2 border-wood-750 shadow-2xl overflow-hidden select-none mb-8 cosmic-stage-wrapper">
      
      <!-- Ambient Radial Tint of Selected Chakra -->
      <div
        class="absolute inset-0 opacity-25 pointer-events-none transition-all duration-700"
        :style="{
          background: `radial-gradient(circle at 50% 50%, ${selectedChakra?.colorHex || '#EF4444'} 0%, transparent 70%)`
        }"
      />

      <!-- Floating Top Instruction -->
      <div class="absolute top-3 left-3 sm:left-5 z-30 pointer-events-none">
        <div class="px-3.5 py-1.5 rounded-full bg-wood-950/85 backdrop-blur-md border border-wood-800 text-xs font-bold text-amber-200/90 shadow-sm flex items-center gap-2 pointer-events-auto">
          <Compass :size="14" class="text-gold-400" />
          <span class="hidden sm:inline">Nhấp vào từng Luân Xa để khám phá hành trình bài học</span>
          <span class="sm:hidden">Chạm vào Luân Xa để chọn</span>
        </div>
      </div>

      <!-- Master SVG Canvas Layered Over Uploaded Cosmic Background -->
      <svg
        viewBox="0 0 1024 572"
        class="w-full h-auto block relative z-10"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <!-- Text Backdrop Shadow for Crystal-Clear Readability -->
          <filter id="text-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.95" />
          </filter>

          <!-- Ethereal Glow Filter -->
          <filter id="chakra-glow-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Central Shushumna Meridian Gradient -->
          <linearGradient id="shushumna-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#EF4444" stop-opacity="0.9" />
            <stop offset="16%" stop-color="#F97316" stop-opacity="0.9" />
            <stop offset="33%" stop-color="#EAB308" stop-opacity="0.9" />
            <stop offset="50%" stop-color="#10B981" stop-opacity="0.9" />
            <stop offset="66%" stop-color="#06B6D4" stop-opacity="0.9" />
            <stop offset="83%" stop-color="#6366F1" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#A855F7" stop-opacity="0.95" />
          </linearGradient>

          <!-- Stream Linear Gradients -->
          <linearGradient id="stream-red-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#EF4444" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#EF4444" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="stream-red-left" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#EF4444" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#EF4444" stop-opacity="0.0" />
          </linearGradient>

          <linearGradient id="stream-orange-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#F97316" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#F97316" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="stream-orange-left" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#F97316" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#F97316" stop-opacity="0.0" />
          </linearGradient>

          <linearGradient id="stream-yellow-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#EAB308" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#EAB308" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="stream-yellow-left" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#EAB308" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#EAB308" stop-opacity="0.0" />
          </linearGradient>

          <linearGradient id="stream-green-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#10B981" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="stream-green-left" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#10B981" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
          </linearGradient>

          <linearGradient id="stream-cyan-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="stream-cyan-left" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.0" />
          </linearGradient>

          <linearGradient id="stream-indigo-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#6366F1" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#6366F1" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="stream-indigo-left" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#6366F1" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#6366F1" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- 1. BASE BACKGROUND IMAGE (The User's Pristine Cosmic Meditation Artwork) -->
        <image
          href="/assets/chakra/meditation_cosmic_bg.jpg"
          x="0"
          y="0"
          width="1024"
          height="572"
          preserveAspectRatio="xMidYMid slice"
        />

        <!-- 2. CENTRAL MERIDIAN SHUSHUMNA AXIS -->
        <line
          x1="512"
          y1="485"
          x2="512"
          y2="65"
          stroke="url(#shushumna-grad)"
          stroke-width="5"
          stroke-linecap="round"
          filter="url(#chakra-glow-blur)"
        />
        <line
          x1="512"
          y1="485"
          x2="512"
          y2="65"
          stroke="#ffffff"
          stroke-width="2"
          stroke-dasharray="8 6"
          class="central-pulse-line opacity-80"
        />

        <!-- 3. WAVING ENERGY STREAMS (Ribbons of Qi from Chakras) -->
        <!-- Stream 1 (Muladhara - Red) -->
        <path d="M 512 485 C 410 480, 290 530, 140 515" fill="none" stroke="url(#stream-red-left)" stroke-width="3" stroke-dasharray="8 6" class="energy-ribbon" />
        <path d="M 512 485 C 610 495, 750 520, 900 500" fill="none" stroke="url(#stream-red-right)" stroke-width="3" stroke-dasharray="8 6" class="energy-ribbon" />

        <!-- Stream 2 (Svadhisthana - Orange) -->
        <path d="M 512 420 C 420 400, 280 460, 110 430" fill="none" stroke="url(#stream-orange-left)" stroke-width="3.5" stroke-dasharray="8 6" class="energy-ribbon" />
        <path d="M 512 420 C 630 430, 780 470, 960 440" fill="none" stroke="url(#stream-orange-right)" stroke-width="3.5" stroke-dasharray="8 6" class="energy-ribbon" />

        <!-- Stream 3 (Manipura - Yellow) -->
        <path d="M 512 355 C 410 340, 300 390, 120 360" fill="none" stroke="url(#stream-yellow-left)" stroke-width="3.5" stroke-dasharray="8 6" class="energy-ribbon" />
        <path d="M 512 355 C 630 320, 800 400, 980 350" fill="none" stroke="url(#stream-yellow-right)" stroke-width="4" stroke-dasharray="8 6" class="energy-ribbon" />

        <!-- Stream 4 (Anahata - Green) -->
        <path d="M 512 285 C 380 260, 240 330, 80 280" fill="none" stroke="url(#stream-green-left)" stroke-width="4" stroke-dasharray="8 6" class="energy-ribbon" />
        <path d="M 512 285 C 620 280, 780 320, 950 290" fill="none" stroke="url(#stream-green-right)" stroke-width="3.5" stroke-dasharray="8 6" class="energy-ribbon" />

        <!-- Stream 5 (Vishuddha - Cyan) -->
        <path d="M 512 215 C 420 205, 300 240, 120 215" fill="none" stroke="url(#stream-cyan-left)" stroke-width="3.5" stroke-dasharray="8 6" class="energy-ribbon" />
        <path d="M 512 215 C 620 180, 780 250, 970 200" fill="none" stroke="url(#stream-cyan-right)" stroke-width="4" stroke-dasharray="8 6" class="energy-ribbon" />

        <!-- Stream 6 (Ajna - Indigo) -->
        <path d="M 512 130 C 430 100, 290 160, 110 140" fill="none" stroke="url(#stream-indigo-left)" stroke-width="3.5" stroke-dasharray="8 6" class="energy-ribbon" />
        <path d="M 512 130 C 590 120, 720 160, 900 140" fill="none" stroke="url(#stream-indigo-right)" stroke-width="3" stroke-dasharray="8 6" class="energy-ribbon" />

        <!-- 4. RADIATING BLOOMING CROWN LOTUS (Sahasrara Petals) -->
        <g class="crown-lotus pointer-events-none" transform="translate(512, 58)">
          <circle cx="0" cy="0" r="28" fill="#A855F7" opacity="0.35" filter="url(#chakra-glow-blur)" />
          <!-- Center Petals -->
          <path d="M 0 -38 C -10 -20, -6 0, 0 0 C 6 0, 10 -20, 0 -38 Z" fill="#E9D5FF" opacity="0.95" />
          <path d="M -16 -32 C -20 -15, -12 0, 0 0 C -4 -4, -12 -18, -16 -32 Z" fill="#C084FC" opacity="0.9" />
          <path d="M 16 -32 C 20 -15, 12 0, 0 0 C 4 -4, 12 -18, 16 -32 Z" fill="#C084FC" opacity="0.9" />
          <path d="M -30 -20 C -26 -8, -14 0, 0 0 C -6 2, -20 -8, -30 -20 Z" fill="#A855F7" opacity="0.85" />
          <path d="M 30 -20 C 26 -8, 14 0, 0 0 C 6 2, 20 -8, 30 -20 Z" fill="#A855F7" opacity="0.85" />
          <path d="M -38 -4 C -28 0, -14 2, 0 0 C -10 6, -26 6, -38 -4 Z" fill="#9333EA" opacity="0.8" />
          <path d="M 38 -4 C 28 0, 14 2, 0 0 C 10 6, 26 6, 38 -4 Z" fill="#9333EA" opacity="0.8" />
        </g>

        <!-- 5. THE 7 SACRED CHAKRA NODES & INFOGRAPHIC LABELS -->
        
        <!-- 7. Sahasrara (Crown - Violet) -->
        <g class="chakra-node cursor-pointer group" @click="selectTier(7)" transform="translate(512, 65)">
          <circle cx="0" cy="0" r="34" fill="transparent" class="hit-target" />
          <g class="node-content pointer-events-none">
            <circle cx="0" cy="0" r="22" :fill="selectedTier === 7 ? '#A855F755' : '#1a1030cc'" stroke="#A855F7" stroke-width="2.5" class="transition-all" />
            <circle cx="0" cy="0" r="10" fill="#C084FC" />
            <circle cx="0" cy="0" r="4" fill="#ffffff" />
          </g>
        </g>
        <!-- Label 7 (Right) -->
        <g class="chakra-label cursor-pointer select-none group" @click="selectTier(7)">
          <line x1="538" y1="65" x2="635" y2="52" stroke="#C084FC" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" class="leader-line pointer-events-none" />
          <rect x="632" y="32" width="180" height="40" fill="transparent" />
          <text x="642" y="48" fill="#F3E8FF" font-size="13" font-weight="800" font-family="sans-serif" filter="url(#text-shadow)" class="transition-colors group-hover:fill-gold-300">Luân xa Vương miện</text>
          <text x="642" y="64" fill="#C084FC" font-size="11" font-weight="600" font-family="sans-serif" opacity="0.95" filter="url(#text-shadow)">(Sahasrara)</text>
        </g>

        <!-- 6. Ajna (Third Eye - Indigo) -->
        <g class="chakra-node cursor-pointer group" @click="selectTier(6)" transform="translate(512, 130)">
          <circle cx="0" cy="0" r="32" fill="transparent" class="hit-target" />
          <g class="node-content pointer-events-none">
            <circle cx="0" cy="0" r="20" :fill="selectedTier === 6 ? '#6366F155' : '#15132dcc'" stroke="#6366F1" stroke-width="2.5" class="transition-all" />
            <ellipse cx="0" cy="0" rx="10" ry="5.5" fill="#818CF8" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </g>
        <!-- Label 6 (Left) -->
        <g class="chakra-label cursor-pointer select-none group" @click="selectTier(6)">
          <line x1="486" y1="130" x2="415" y2="138" stroke="#818CF8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" class="leader-line pointer-events-none" />
          <rect x="210" y="118" width="200" height="40" fill="transparent" />
          <text x="405" y="134" fill="#EEF2FF" font-size="13" font-weight="800" font-family="sans-serif" text-anchor="end" filter="url(#text-shadow)" class="transition-colors group-hover:fill-gold-300">Luân xa Con mắt thứ ba</text>
          <text x="405" y="150" fill="#818CF8" font-size="11" font-weight="600" font-family="sans-serif" opacity="0.95" text-anchor="end" filter="url(#text-shadow)">(Ajna)</text>
        </g>

        <!-- 5. Vishuddha (Throat - Cyan) -->
        <g class="chakra-node cursor-pointer group" @click="selectTier(5)" transform="translate(512, 215)">
          <circle cx="0" cy="0" r="32" fill="transparent" class="hit-target" />
          <g class="node-content pointer-events-none">
            <circle cx="0" cy="0" r="21" :fill="selectedTier === 5 ? '#06B6D455' : '#0c1a24cc'" stroke="#06B6D4" stroke-width="2.5" class="transition-all" />
            <circle cx="0" cy="0" r="8" fill="#22D3EE" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </g>
        <!-- Label 5 (Right) -->
        <g class="chakra-label cursor-pointer select-none group" @click="selectTier(5)">
          <line x1="536" y1="215" x2="650" y2="208" stroke="#22D3EE" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" class="leader-line pointer-events-none" />
          <rect x="650" y="188" width="180" height="40" fill="transparent" />
          <text x="658" y="204" fill="#ECFEFF" font-size="13" font-weight="800" font-family="sans-serif" filter="url(#text-shadow)" class="transition-colors group-hover:fill-gold-300">Luân xa Cổ họng</text>
          <text x="658" y="220" fill="#22D3EE" font-size="11" font-weight="600" font-family="sans-serif" opacity="0.95" filter="url(#text-shadow)">(Vishuddha)</text>
        </g>

        <!-- 4. Anahata (Heart - Green) -->
        <g class="chakra-node cursor-pointer group" @click="selectTier(4)" transform="translate(512, 285)">
          <circle cx="0" cy="0" r="34" fill="transparent" class="hit-target" />
          <g class="node-content pointer-events-none">
            <circle cx="0" cy="0" r="22" :fill="selectedTier === 4 ? '#10B98155' : '#0b1d16cc'" stroke="#10B981" stroke-width="2.5" class="transition-all" />
            <polygon points="0,-8 7,5 -7,5" fill="none" stroke="#34D399" stroke-width="1.8" />
            <polygon points="0,8 7,-5 -7,-5" fill="none" stroke="#34D399" stroke-width="1.8" />
          </g>
        </g>
        <!-- Label 4 (Left) -->
        <g class="chakra-label cursor-pointer select-none group" @click="selectTier(4)">
          <line x1="486" y1="285" x2="400" y2="280" stroke="#34D399" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" class="leader-line pointer-events-none" />
          <rect x="210" y="260" width="190" height="40" fill="transparent" />
          <text x="390" y="276" fill="#ECFDF5" font-size="13" font-weight="800" font-family="sans-serif" text-anchor="end" filter="url(#text-shadow)" class="transition-colors group-hover:fill-gold-300">Luân xa Tim</text>
          <text x="390" y="292" fill="#34D399" font-size="11" font-weight="600" font-family="sans-serif" opacity="0.95" text-anchor="end" filter="url(#text-shadow)">(Anahata)</text>
        </g>

        <!-- 3. Manipura (Solar Plexus - Yellow) -->
        <g class="chakra-node cursor-pointer group" @click="selectTier(3)" transform="translate(512, 355)">
          <circle cx="0" cy="0" r="32" fill="transparent" class="hit-target" />
          <g class="node-content pointer-events-none">
            <circle cx="0" cy="0" r="21" :fill="selectedTier === 3 ? '#EAB30855' : '#1f1a0bcc'" stroke="#EAB308" stroke-width="2.5" class="transition-all" />
            <polygon points="0,8 8,-5 -8,-5" fill="#FACC15" />
          </g>
        </g>
        <!-- Label 3 (Right) -->
        <g class="chakra-label cursor-pointer select-none group" @click="selectTier(3)">
          <line x1="536" y1="355" x2="650" y2="350" stroke="#FACC15" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" class="leader-line pointer-events-none" />
          <rect x="650" y="330" width="210" height="40" fill="transparent" />
          <text x="658" y="346" fill="#FEFCE8" font-size="13" font-weight="800" font-family="sans-serif" filter="url(#text-shadow)" class="transition-colors group-hover:fill-gold-300">Luân xa Đám rối Mặt trời</text>
          <text x="658" y="362" fill="#FACC15" font-size="11" font-weight="600" font-family="sans-serif" opacity="0.95" filter="url(#text-shadow)">(Manipura)</text>
        </g>

        <!-- 2. Svadhisthana (Sacral - Orange) -->
        <g class="chakra-node cursor-pointer group" @click="selectTier(2)" transform="translate(512, 420)">
          <circle cx="0" cy="0" r="32" fill="transparent" class="hit-target" />
          <g class="node-content pointer-events-none">
            <circle cx="0" cy="0" r="21" :fill="selectedTier === 2 ? '#F9731655' : '#211208cc'" stroke="#F97316" stroke-width="2.5" class="transition-all" />
            <circle cx="0" cy="0" r="8" fill="#FB923C" />
          </g>
        </g>
        <!-- Label 2 (Right) -->
        <g class="chakra-label cursor-pointer select-none group" @click="selectTier(2)">
          <line x1="536" y1="420" x2="665" y2="425" stroke="#FB923C" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" class="leader-line pointer-events-none" />
          <rect x="664" y="405" width="190" height="40" fill="transparent" />
          <text x="672" y="421" fill="#FFF7ED" font-size="13" font-weight="800" font-family="sans-serif" filter="url(#text-shadow)" class="transition-colors group-hover:fill-gold-300">Luân xa Xương cùng</text>
          <text x="672" y="437" fill="#FB923C" font-size="11" font-weight="600" font-family="sans-serif" opacity="0.95" filter="url(#text-shadow)">(Svadhisthana)</text>
        </g>

        <!-- 1. Muladhara (Root - Red) - Active Focus -->
        <g class="chakra-node cursor-pointer group" @click="selectTier(1)" transform="translate(512, 485)">
          <circle cx="0" cy="0" r="36" fill="transparent" class="hit-target" />
          <g class="node-content pointer-events-none">
            <circle cx="0" cy="0" r="25" :fill="selectedTier === 1 ? '#EF444466' : '#240b0bcc'" stroke="#EF4444" stroke-width="3" filter="url(#chakra-glow-blur)" class="transition-all" />
            <rect x="-9" y="-9" width="18" height="18" fill="#F87171" transform="rotate(45)" />
          </g>
        </g>
        <!-- Label 1 (Right) -->
        <g class="chakra-label cursor-pointer select-none group" @click="selectTier(1)">
          <line x1="540" y1="485" x2="665" y2="495" stroke="#F87171" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" class="leader-line pointer-events-none" />
          <rect x="664" y="475" width="180" height="40" fill="transparent" />
          <text x="672" y="491" fill="#FEF2F2" font-size="13" font-weight="800" font-family="sans-serif" filter="url(#text-shadow)" class="transition-colors group-hover:fill-gold-300">Luân xa Gốc</text>
          <text x="672" y="507" fill="#F87171" font-size="11" font-weight="600" font-family="sans-serif" opacity="0.95" filter="url(#text-shadow)">(Muladhara)</text>
        </g>

        <!-- 6. FLOATING CALLIGRAPHIC HANZI (Levitating in Qi Streams) -->
        <g class="floating-hanzi-group select-none pointer-events-none">
          <text x="200" y="90" fill="#E9D5FF" font-size="20" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">通</text>
          <text x="780" y="80" fill="#E9D5FF" font-size="22" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">天</text>
          <text x="290" y="140" fill="#C7D2FE" font-size="19" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">慧</text>
          <text x="160" y="190" fill="#A7F3D0" font-size="26" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">生</text>
          <text x="720" y="165" fill="#A5F3FC" font-size="20" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">言</text>
          <text x="820" y="190" fill="#A5F3FC" font-size="24" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">見</text>
          <text x="870" y="235" fill="#BAE6FD" font-size="22" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">意</text>
          <text x="180" y="290" fill="#6EE7B7" font-size="28" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">爱</text>
          <text x="750" y="330" fill="#FDE047" font-size="34" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">力</text>
          <text x="910" y="360" fill="#FDBA74" font-size="26" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">力</text>
          <text x="720" y="475" fill="#FCA5A5" font-size="24" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">严</text>
          <text x="220" y="490" fill="#FCA5A5" font-size="22" font-weight="900" font-family="serif" filter="url(#chakra-glow-blur)" class="floating-hanzi">根</text>
        </g>
      </svg>

    </div>

    <!-- Tier Quick Jump Pills (Outside the canvas for zero visual blockage) -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
      <button
        v-for="c in chakraList"
        :key="c.tier"
        type="button"
        @click="selectTier(c.tier)"
        class="px-3.5 py-1.5 rounded-2xl text-xs font-bold border backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
        :class="selectedTier === c.tier
          ? 'bg-wood-850 text-white scale-[1.03] shadow-md border-gold-400'
          : 'bg-wood-950/80 text-amber-200/60 hover:text-white border-wood-800'"
        :style="{ borderColor: selectedTier === c.tier ? c.colorHex : undefined }"
      >
        <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: c.colorHex }" />
        <span>T{{ c.tier }}: {{ c.nameVi.split('(')[0].trim() }}</span>
        <span class="text-[10px] opacity-75 font-mono">({{ c.progressPercent }}%)</span>
      </button>
    </div>

    <!-- ===================================================================== -->
    <!-- 2. THE CHAKRA REALM JOURNEY STATIONS & LESSON PATH                    -->
    <!-- ===================================================================== -->
    <div v-if="selectedChakra" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
      
      <!-- Left Column: Chakra Realm Overview & FSRS Diagnostics (4 Cols) -->
      <div
        class="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-wood-900 border-2 shadow-rpg-panel relative overflow-hidden transition-all duration-500 space-y-4"
        :style="{ borderColor: `${selectedChakra.colorHex}66` }"
      >
        <!-- Background Ambient Gradient -->
        <div
          class="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          :style="{ backgroundColor: selectedChakra.colorHex }"
        />

        <!-- Title & Status -->
        <div class="border-b border-wood-800 pb-3">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <span
                class="w-3.5 h-3.5 rounded-full shadow-sm"
                :style="{ backgroundColor: selectedChakra.colorHex }"
              />
              <h3 class="text-lg font-black font-heading text-white">
                Tầng {{ selectedChakra.tier }}: {{ selectedChakra.nameVi }}
              </h3>
            </div>
            <span
              v-if="selectedChakra.isUnlocked"
              class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold shrink-0"
            >
              Đã Khai Mở
            </span>
            <span
              v-else-if="selectedChakra.tier === activeTier"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse shrink-0"
              :style="{
                backgroundColor: `${selectedChakra.colorHex}22`,
                borderColor: `${selectedChakra.colorHex}66`,
                color: selectedChakra.colorHex
              }"
            >
              Đang Tu Luyện
            </span>
            <span
              v-else
              class="px-2.5 py-0.5 rounded-full bg-wood-850 text-slate-400 border border-wood-750 text-[10px] font-medium shrink-0"
            >
              Phong Ấn
            </span>
          </div>

          <p class="text-xs text-amber-200/70 leading-relaxed">
            {{ selectedChakra.descriptionVi }}
          </p>
        </div>

        <!-- Metrics Cards -->
        <div class="space-y-3">
          <!-- Metric 1: Progress % -->
          <div class="p-3.5 rounded-2xl bg-wood-950 border border-wood-800">
            <div class="flex items-center justify-between text-xs font-bold mb-1">
              <span class="text-amber-200/60 uppercase text-[10px]">Tiến Độ Khai Mở</span>
              <span class="font-mono" :style="{ color: selectedChakra.colorHex }">
                {{ selectedChakra.progressPercent }}%
              </span>
            </div>
            <div class="w-full h-2 bg-wood-900 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{
                  width: `${selectedChakra.progressPercent}%`,
                  backgroundColor: selectedChakra.colorHex
                }"
              />
            </div>
          </div>

          <!-- Metric 2: FSRS Retention & Stability -->
          <div class="p-3.5 rounded-2xl bg-wood-950 border border-wood-800 space-y-1">
            <div class="text-[10px] text-amber-200/60 uppercase font-bold">Từ Vựng Bền Vững (FSRS)</div>
            <div class="text-base font-black font-heading text-gold-300">
              {{ selectedChakra.retainedVocabCount }} / {{ selectedChakra.targetVocabCount }} từ đạt chuẩn
            </div>
            <div class="text-[11px] text-amber-200/50">
              Độ bền ký ức yêu cầu: ≥ {{ selectedChakra.requiredStabilityDays }} ngày
            </div>
          </div>

          <!-- Metric 3: Reward Item -->
          <div class="p-3.5 rounded-2xl bg-wood-950 border border-wood-800 space-y-1">
            <div class="text-[10px] text-amber-200/60 uppercase font-bold">Vật Phẩm Hào Quang 2D</div>
            <div class="text-xs font-bold text-white truncate">
              {{ selectedChakra.rewardItemName }}
            </div>
            <div class="text-[10px] font-bold" :class="selectedChakra.rewardClaimed ? 'text-emerald-400' : 'text-amber-200/50'">
              {{ selectedChakra.rewardClaimed ? '✓ Đã kích hoạt dưới chân nhân vật' : 'Khóa (Cần đạt 100%)' }}
            </div>
          </div>
        </div>

        <!-- Non-punitive Diagnostic Unblocking Bar -->
        <div
          class="p-3.5 rounded-2xl border space-y-2"
          :class="selectedChakra.bottleneckSkill ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'"
        >
          <div
            class="flex items-center gap-1.5 text-xs font-bold"
            :class="selectedChakra.bottleneckSkill ? 'text-amber-300' : 'text-emerald-300'"
          >
            <AlertCircle v-if="selectedChakra.bottleneckSkill" :size="14" />
            <Sparkles v-else :size="14" />
            <span>Chẩn Đoán Khai Thông Dòng Chảy</span>
          </div>
          <p class="text-xs text-amber-100/80 leading-relaxed">
            {{ getBottleneckText(selectedChakra.bottleneckSkill) }}
          </p>

          <NuxtLink
            :to="getRemedyLink(selectedChakra.bottleneckSkill)"
            class="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            :class="selectedChakra.bottleneckSkill
              ? 'bg-amber-500 hover:bg-amber-400 text-wood-950 shadow-rpg-glow-gold'
              : 'bg-wood-850 hover:bg-wood-800 text-white border border-wood-750'"
          >
            <span>{{ getRemedyActionLabel(selectedChakra.bottleneckSkill) }}</span>
            <ArrowRight :size="13" />
          </NuxtLink>
        </div>
      </div>

      <!-- Right Column: Lesson Stations & Milestone Boss (8 Cols) -->
      <div class="lg:col-span-8 space-y-4">
        
        <div class="flex items-center justify-between px-1">
          <h4 class="text-sm font-black font-heading text-white uppercase tracking-wider flex items-center gap-2">
            <Compass :size="15" class="text-gold-400" />
            <span>Hành Trình Bài Học • Tầng {{ selectedChakra.tier }}: {{ selectedChakra.nameVi.split('(')[0].trim() }}</span>
          </h4>
          <span class="text-xs text-amber-200/50">
            {{ currentChakraLessons.length }} Trạm Tu Luyện
          </span>
        </div>

        <!-- Station Cards List -->
        <div class="space-y-3.5">
          <div
            v-for="(lesson, lIdx) in currentChakraLessons"
            :key="lesson.id"
            class="p-4 sm:p-5 rounded-2xl bg-wood-900 border-2 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group chakra-station-card relative overflow-hidden"
            :class="[
              isNextLesson(lesson)
                ? 'border-gold-400 bg-wood-900 shadow-rpg-card-lift'
                : lesson.isCompleted
                  ? 'border-wood-750 bg-wood-900/90'
                  : 'border-wood-800/80 bg-wood-950/60'
            ]"
          >
            <!-- Left: Station Order & Details -->
            <div class="flex items-start gap-3.5 min-w-0">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 font-heading font-black text-xs transition-transform group-hover:scale-105"
                :class="[
                  lesson.isCompleted
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : isNextLesson(lesson)
                      ? 'bg-gold-500 text-wood-950 border-gold-300 shadow-rpg-glow-gold'
                      : 'bg-wood-950 text-amber-200/60 border-wood-800'
                ]"
              >
                <span v-if="lesson.isCompleted">✓</span>
                <span v-else>{{ lIdx + 1 }}</span>
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] uppercase font-bold text-amber-200/50">Trạm {{ selectedChakra.tier }}.{{ lIdx + 1 }}</span>
                  <span
                    v-if="isNextLesson(lesson)"
                    class="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-[9px] font-bold"
                  >
                    Mục Tiêu Hiện Tại
                  </span>
                </div>

                <h5 class="text-sm font-bold font-heading text-white group-hover:text-gold-300 transition-colors truncate">
                  {{ lesson.title }}
                </h5>
                <p class="text-xs text-amber-200/60 line-clamp-1 mt-0.5">
                  {{ lesson.description }}
                </p>

                <!-- Hanzi Preview Chips -->
                <div v-if="lesson.hanziPreview?.length" class="flex items-center gap-1.5 flex-wrap mt-2">
                  <span
                    v-for="(hz, hIdx) in lesson.hanziPreview"
                    :key="hIdx"
                    class="px-2 py-0.5 rounded-lg bg-wood-950 border border-wood-800 font-hanzi text-xs text-gold-300 font-bold shadow-sm"
                  >
                    {{ hz }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Rewards & Action CTA -->
            <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-wood-800/80">
              <div class="flex items-center gap-2 text-xs">
                <span class="text-purple-300 font-bold">+{{ lesson.expReward }} EXP</span>
                <span class="text-gold-300 font-bold flex items-center gap-1">
                  <Coins :size="12" />
                  <span>+{{ lesson.goldReward }}</span>
                </span>
              </div>

              <NuxtLink
                :to="`/learn/lesson/${lesson.id}`"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm min-h-[38px]"
                :class="[
                  lesson.isCompleted
                    ? 'bg-wood-800 hover:bg-wood-750 text-slate-200 border border-wood-700'
                    : isNextLesson(lesson)
                      ? 'bg-gold-500 hover:bg-gold-400 text-wood-950 font-black shadow-rpg-glow-gold'
                      : 'bg-wood-850 hover:bg-wood-800 text-amber-200/80 border border-wood-750'
                ]"
              >
                <Play v-if="!lesson.isCompleted" :size="12" class="fill-current" />
                <span>{{ lesson.isCompleted ? 'Ôn Lại' : 'Bắt Đầu' }}</span>
                <ArrowRight v-if="lesson.isCompleted" :size="12" />
              </NuxtLink>
            </div>
          </div>

          <!-- CHAKRA BREAKTHROUGH BOSS MILESTONE -->
          <div class="p-5 rounded-2xl bg-gradient-to-r from-wood-950 via-wood-900 to-wood-950 border-2 border-gold-500/50 shadow-rpg-glow-gold flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0">
                <Trophy :size="24" />
              </div>
              <div>
                <div class="text-xs font-black text-gold-300 font-heading">
                  Bí Cảnh Khảo Hạch Đột Phá: {{ selectedChakra.nameVi }}
                </div>
                <div class="text-[11px] text-amber-200/60 mt-0.5">
                  Đạt 100% để lĩnh hội <strong class="text-white">{{ selectedChakra.rewardItemName }}</strong> và mở khóa vùng đất tiếp theo!
                </div>
              </div>
            </div>

            <NuxtLink
              :to="`/learn/lesson/${currentChakraLessons[0]?.id || '1'}`"
              class="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-black text-xs shadow-rpg-glow-gold shrink-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles :size="14" />
              <span>Khiêu Chiến Đột Phá</span>
            </NuxtLink>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Coins,
  Compass,
  Play,
  ArrowRight,
  Trophy,
} from 'lucide-vue-next';
import { gsap } from 'gsap';

interface ChakraItem {
  tier: number;
  code: string;
  nameVi: string;
  sanskritName: string;
  hskBand: string;
  elementVi: string;
  colorHex: string;
  bgGradient: string;
  targetVocabCount: number;
  requiredStabilityDays: number;
  rewardItemCode: string;
  rewardItemName: string;
  regionCode: string;
  regionNameVi: string;
  descriptionVi: string;
  progressPercent: number;
  retainedVocabCount: number;
  avgStability: number;
  listeningAccuracy: number;
  readingAccuracy: number;
  writingAccuracy: number;
  characterAccuracy: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  rewardClaimed: boolean;
  bottleneckSkill: string | null;
}

const chakraList = ref<ChakraItem[]>([]);
const activeTier = ref<number>(1);
const selectedTier = ref<number>(1);

const activeChakra = computed(() => {
  return chakraList.value.find((c) => c.tier === activeTier.value) || chakraList.value[0];
});

const selectedChakra = computed(() => {
  return chakraList.value.find((c) => c.tier === selectedTier.value) || chakraList.value[0];
});

function selectTier(tier: number) {
  selectedTier.value = tier;
  nextTick(() => {
    // Stagger animate station cards when switching chakras
    gsap.from('.chakra-station-card', {
      y: 16,
      opacity: 0,
      duration: 0.35,
      stagger: 0.06,
      ease: 'power2.out',
    });
  });
}

function getBottleneckText(skill: string | null | undefined): string {
  if (skill === 'retention') {
    return 'Độ bền trí nhớ FSRS còn tích lũy chậm. Hãy ôn tập thẻ từ đến hạn để ổn định nền móng.';
  }
  if (skill === 'character') {
    return 'Tỷ lệ nhận diện chữ Hán & Bộ thủ chưa vững. Cần thiền định củng cố 214 bộ thủ.';
  }
  if (skill === 'listening') {
    return 'Phản xạ nhận diện ngữ âm Pinyin cần gia tăng. Hãy luyện nghe nhiều hơn với thẻ phát âm.';
  }
  if (skill === 'writing') {
    return 'Quy tắc nét viết Hán tự chưa đạt tối ưu. Hãy hoàn thành các bài luyện nét bút thuận.';
  }
  if (skill === 'reading') {
    return 'Kỹ năng ghép câu và đọc hiểu cần bồi dưỡng thêm qua các bài nối từ.';
  }
  return 'Dòng chảy năng lượng ngôn ngữ thông suốt hoàn hảo! Không phát hiện điểm nghẽn kỹ năng.';
}

function getRemedyActionLabel(skill: string | null | undefined): string {
  if (skill === 'retention') return 'Vào Đài Ôn Tập SRS';
  if (skill === 'character') return 'Luyện Chữ Hán & Bộ Thủ';
  if (skill === 'listening') return 'Luyện Nghe Pinyin';
  if (skill === 'writing') return 'Luyện Viết Nét';
  return 'Tiếp Tục Bài Học';
}

function getRemedyLink(skill: string | null | undefined): string {
  if (skill === 'retention') return '/review';
  return '/learn';
}

// Curriculum Course Data
const { data: courseData } = await useFetch<any>('/api/learning/courses');
const courses = computed(() => courseData.value?.data?.courses || []);
const currentCourse = computed(() => courses.value[0] || null);
const currentUnits = computed(() => currentCourse.value?.units || []);

// All lessons flat list
const allLessons = computed(() => {
  return currentUnits.value.flatMap((u: any) => u.lessons);
});

// Map lessons to corresponding Chakra tier (Tier 1 Muladhara holds Band 1 lessons)
const currentChakraLessons = computed(() => {
  if (selectedTier.value === 1) {
    return allLessons.value.slice(0, 6);
  }
  const bandNum = selectedTier.value;
  return [
    {
      id: `lesson_tier_${bandNum}_1`,
      title: `Trạm ${bandNum}.1: Khảo Ngữ Căn Bản HSK Band ${bandNum}`,
      description: `Lĩnh hội từ vựng chuyên sâu và cú pháp đặc thù của cảnh giới Tầng ${bandNum}.`,
      expReward: 60 + bandNum * 15,
      goldReward: 25 + bandNum * 5,
      vocabularyCount: 15 + bandNum * 5,
      isCompleted: false,
      hanziPreview: ['道', '法', '术', '器', '势'],
    },
    {
      id: `lesson_tier_${bandNum}_2`,
      title: `Trạm ${bandNum}.2: Đàm Thoại & Ngữ Cảnh Xã Hội Band ${bandNum}`,
      description: `Rèn luyện phản xạ đối đáp và áp dụng ngữ pháp vào tình huống thực tế.`,
      expReward: 70 + bandNum * 15,
      goldReward: 30 + bandNum * 5,
      vocabularyCount: 20 + bandNum * 5,
      isCompleted: false,
      hanziPreview: ['意', '心', '通', '神', '理'],
    },
    {
      id: `lesson_tier_${bandNum}_3`,
      title: `Trạm ${bandNum}.3: Đọc Hiểu & Trực Giác Cổ Thư Band ${bandNum}`,
      description: `Đọc hiểu các trích đoạn văn bản và củng cố độ bền FSRS ổn định lâu dài.`,
      expReward: 80 + bandNum * 15,
      goldReward: 35 + bandNum * 5,
      vocabularyCount: 25 + bandNum * 5,
      isCompleted: false,
      hanziPreview: ['经', '典', '书', '章', '句'],
    },
  ];
});

const nextLesson = computed(() => {
  return allLessons.value.find((l: any) => !l.isCompleted) || allLessons.value[0];
});

function isNextLesson(lesson: any): boolean {
  return nextLesson.value?.id === lesson.id;
}

// Fetch Chakra status
async function loadChakraData() {
  try {
    const res = await $fetch<any>('/api/chakra/status');
    if (res?.data?.chakras) {
      chakraList.value = res.data.chakras;
      activeTier.value = res.data.activeChakraTier || 1;
      selectedTier.value = activeTier.value;
    }
  } catch (err) {
    console.warn('Failed to fetch chakra status:', err);
  }
}

onMounted(async () => {
  await loadChakraData();
  await nextTick();

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // 1. Endless Qi Stream Dashes Flow
  gsap.fromTo(
    '.energy-ribbon',
    { strokeDashoffset: 120 },
    {
      strokeDashoffset: 0,
      duration: 8,
      repeat: -1,
      ease: 'none',
    }
  );

  // 2. Central Meridian Light Pulse
  gsap.fromTo(
    '.central-pulse-line',
    { strokeDashoffset: 60 },
    {
      strokeDashoffset: 0,
      duration: 4,
      repeat: -1,
      ease: 'none',
    }
  );

  // 3. Floating Calligraphy Hanzi Levitating in Energy Stream
  const hanziEls = document.querySelectorAll('.floating-hanzi');
  hanziEls.forEach((el, index) => {
    gsap.to(el, {
      y: index % 2 === 0 ? -10 : 10,
      x: index % 3 === 0 ? 6 : -6,
      opacity: 0.95,
      duration: 2.8 + (index % 3) * 0.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: index * 0.15,
    });
  });

  // 4. Subtle Lotus Flower Radiation Breathing
  gsap.to('.crown-lotus', {
    scale: 1.08,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    transformOrigin: '512px 65px',
  });
});
</script>

<style scoped>
.floating-hanzi {
  will-change: transform, opacity;
  user-select: none;
}
.energy-ribbon,
.central-pulse-line,
.crown-lotus,
.floating-hanzi-group,
.leader-line {
  pointer-events: none;
}
.chakra-node {
  cursor: pointer;
}
.chakra-node .node-content {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.22s ease-out;
}
.chakra-node:hover .node-content {
  transform: scale(1.15);
}
.chakra-label {
  cursor: pointer;
}
.chakra-label text {
  transition: fill 0.2s ease, opacity 0.2s ease;
}
.chakra-label:hover text:first-of-type {
  fill: #fde047;
}
</style>
