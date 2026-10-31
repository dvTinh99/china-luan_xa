<template>
  <div class="min-h-screen bg-wood-950 text-amber-100 p-4 sm:p-8 font-sans">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Top RPG Navigation Bar -->
      <div class="flex items-center justify-between border-b border-wood-800 pb-4">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="px-3 py-1.5 rounded-xl bg-wood-900 border border-wood-750 text-xs font-bold text-amber-200/80 hover:text-gold-300 hover:border-gold-500/50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft :size="14" />
            <span>Trang chủ</span>
          </NuxtLink>
          <span class="text-xs font-bold text-gold-400/80 uppercase tracking-widest bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">
            Audio Infrastructure
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="refreshData"
            :disabled="isLoading"
            class="px-3.5 py-1.5 rounded-xl bg-wood-850 border border-wood-700 text-xs font-bold text-amber-200 hover:text-gold-300 hover:border-gold-500 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw :size="13" :class="{ 'animate-spin': isLoading }" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <!-- Header & Stats Overview -->
      <div class="rounded-3xl bg-wood-900/90 border border-wood-750 p-6 shadow-rpg-panel relative overflow-hidden">
        <div class="absolute -right-8 -top-8 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide flex items-center gap-2.5">
              <Volume2 :size="28" class="text-gold-400" />
              <span>LinguaWorld Audio Studio</span>
            </h1>
            <p class="text-amber-200/70 text-xs sm:text-sm mt-1 max-w-xl">
              Hệ thống quản trị hạ tầng âm thanh: sinh giọng đọc AI đa nhân vật, quy trình kiểm duyệt (Human Review), xuất bản đa phiên bản và tích hợp Godot Bridge.
            </p>
          </div>

          <!-- Quick Stats Pills -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="px-4 py-2.5 rounded-2xl bg-wood-950/80 border border-wood-800 text-center">
              <div class="text-2xl font-black font-heading text-emerald-400">{{ publishedCount }}</div>
              <div class="text-[11px] font-bold text-amber-200/60 uppercase">Đã xuất bản</div>
            </div>
            <div class="px-4 py-2.5 rounded-2xl bg-wood-950/80 border border-wood-800 text-center">
              <div class="text-2xl font-black font-heading text-amber-400">{{ needsReviewCount }}</div>
              <div class="text-[11px] font-bold text-amber-200/60 uppercase">Chờ duyệt</div>
            </div>
            <div class="px-4 py-2.5 rounded-2xl bg-wood-950/80 border border-wood-800 text-center">
              <div class="text-2xl font-black font-heading text-gold-400">{{ totalJobsCount }}</div>
              <div class="text-[11px] font-bold text-amber-200/60 uppercase">Tác vụ Jobs</div>
            </div>
            <div class="px-4 py-2.5 rounded-2xl bg-wood-950/80 border border-wood-800 text-center">
              <div class="text-2xl font-black font-heading text-purple-400">{{ voiceProfiles.length }}</div>
              <div class="text-[11px] font-bold text-amber-200/60 uppercase">Hồ sơ giọng</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-wood-800 pb-2 overflow-x-auto">
        <button
          type="button"
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          :class="[
            currentTab === tab.id
              ? 'bg-gold-500 text-wood-950 shadow-rpg-glow-gold'
              : 'bg-wood-900/60 hover:bg-wood-850 text-amber-200/70 hover:text-amber-100 border border-wood-800'
          ]"
        >
          <component :is="tab.icon" :size="15" />
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.badge"
            class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
            :class="currentTab === tab.id ? 'bg-wood-950 text-gold-400' : 'bg-gold-500/20 text-gold-300'"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- Tab 1: Audio Assets Review & Lifecycle -->
      <div v-if="currentTab === 'assets'" class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="text-sm font-bold text-amber-200">
            Danh sách file âm thanh ({{ filteredAssets.length }} assets)
          </div>
          <!-- Filter Buttons -->
          <div class="flex items-center gap-1.5 bg-wood-900/80 p-1 rounded-xl border border-wood-800 text-xs">
            <button
              v-for="f in assetFilters"
              :key="f.id"
              @click="assetFilter = f.id"
              class="px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
              :class="assetFilter === f.id ? 'bg-wood-750 text-gold-300' : 'text-amber-200/60 hover:text-amber-100'"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="text-center py-12 text-amber-200/50">
          <Loader2 :size="24" class="animate-spin mx-auto mb-2 text-gold-400" />
          <span>Đang tải dữ liệu âm thanh...</span>
        </div>

        <div v-else-if="filteredAssets.length === 0" class="text-center py-12 rounded-2xl bg-wood-900/40 border border-wood-800/60 text-amber-200/50">
          Không có tài nguyên âm thanh nào phù hợp với bộ lọc.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="asset in filteredAssets"
            :key="asset.id"
            class="p-4 rounded-2xl bg-wood-900/70 border border-wood-800 hover:border-gold-500/40 transition-all flex flex-col justify-between gap-3"
          >
            <div>
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-xl font-bold font-hanzi text-white">{{ asset.sourceText }}</span>
                  <span v-if="asset.pinyin" class="text-xs font-bold text-gold-400">({{ asset.pinyin }})</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    :class="[
                      asset.publicationStatus === 'PUBLISHED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    ]"
                  >
                    {{ asset.publicationStatus }}
                  </span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-wood-800 text-amber-200/70">
                    v{{ asset.version }}
                  </span>
                </div>
              </div>

              <div class="text-xs text-amber-200/60 mt-1 flex items-center gap-2">
                <span>{{ asset.voiceProfile?.name || 'Standard Voice' }}</span>
                <span>•</span>
                <span>{{ Math.round((asset.fileSizeBytes || 0) / 1024) }} KB</span>
                <span>•</span>
                <span class="font-mono text-[10px] text-amber-200/40 truncate max-w-[150px]">{{ asset.storageKey }}</span>
              </div>
            </div>

            <!-- Audio Player & Actions -->
            <div class="flex items-center justify-between border-t border-wood-800/70 pt-2.5 mt-1">
              <SpeakerButton :text="asset.sourceText" :audio-url="asset.url" size="sm" show-label />

              <div class="flex items-center gap-1.5">
                <!-- Approve Button -->
                <button
                  v-if="asset.reviewStatus === 'NEEDS_REVIEW'"
                  type="button"
                  @click="handleApprove(asset.id)"
                  class="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  title="Duyệt chất lượng âm thanh"
                >
                  <Check :size="12" />
                  <span>Duyệt</span>
                </button>

                <!-- Publish Button -->
                <button
                  v-if="asset.reviewStatus === 'APPROVED' && asset.publicationStatus !== 'PUBLISHED'"
                  type="button"
                  @click="handlePublish(asset.id)"
                  class="px-2.5 py-1 rounded-lg bg-gold-500 hover:bg-gold-400 text-wood-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  title="Xuất bản làm audio chính thức"
                >
                  <UploadCloud :size="12" />
                  <span>Xuất bản</span>
                </button>

                <!-- Regenerate Button -->
                <button
                  type="button"
                  @click="handleRegenerate(asset.id)"
                  class="px-2.5 py-1 rounded-lg bg-wood-800 hover:bg-wood-750 text-amber-200/80 hover:text-gold-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Tạo phiên bản mới (v+1) không gián đoạn bản cũ"
                >
                  <Sparkles :size="12" />
                  <span>Tái tạo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Generation Jobs -->
      <div v-if="currentTab === 'jobs'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="text-sm font-bold text-amber-200">
            Lịch sử tác vụ Audio Generation Jobs ({{ jobs.length }})
          </div>
        </div>

        <div v-if="jobs.length === 0" class="text-center py-12 rounded-2xl bg-wood-900/40 border border-wood-800/60 text-amber-200/50">
          Chưa có tác vụ sinh âm thanh nào.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="job in jobs"
            :key="job.id"
            class="p-3.5 rounded-2xl bg-wood-900/70 border border-wood-800 flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                :class="[
                  job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  job.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  job.status === 'PROCESSING' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30 animate-pulse' :
                  'bg-wood-800 text-amber-200/60'
                ]"
              >
                <Check v-if="job.status === 'COMPLETED'" :size="14" />
                <AlertCircle v-else-if="job.status === 'FAILED'" :size="14" />
                <Loader2 v-else-if="job.status === 'PROCESSING'" :size="14" class="animate-spin" />
                <Clock v-else :size="14" />
              </span>
              <div>
                <div class="text-sm font-bold text-white flex items-center gap-2">
                  <span>{{ job.sourceText }}</span>
                  <span class="text-xs text-gold-400 font-normal">({{ job.contentType }})</span>
                </div>
                <div class="text-[11px] text-amber-200/60 flex items-center gap-2 mt-0.5">
                  <span>Voice: {{ job.voiceProfile?.name }}</span>
                  <span>•</span>
                  <span>Thử: {{ job.attempts }}/{{ job.maxAttempts }}</span>
                  <span>•</span>
                  <span v-if="job.errorMessage" class="text-red-400 font-semibold">{{ job.errorMessage }}</span>
                  <span v-else class="text-amber-200/40">{{ new Date(job.createdAt).toLocaleTimeString() }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                v-if="job.status === 'FAILED'"
                type="button"
                @click="handleRetryJob(job.id)"
                class="px-3 py-1.5 rounded-xl bg-wood-800 hover:bg-wood-750 text-xs font-bold text-amber-200 hover:text-gold-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw :size="12" />
                <span>Thử lại</span>
              </button>
              <SpeakerButton
                v-if="job.resultAsset"
                :text="job.sourceText"
                :audio-url="job.resultAsset.url || `/audio/${job.resultAsset.storageKey}`"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Voice Profiles -->
      <div v-if="currentTab === 'voices'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="voice in voiceProfiles"
          :key="voice.id"
          class="p-5 rounded-3xl bg-wood-900/80 border border-wood-750 hover:border-gold-500/40 transition-all space-y-3"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="text-lg font-bold text-white flex items-center gap-2">
                <span>{{ voice.name }}</span>
              </div>
              <div class="text-xs font-mono text-gold-400/80 mt-0.5">{{ voice.code }}</div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-wood-800 text-amber-200/80 uppercase">
              {{ voice.role }}
            </span>
          </div>

          <p class="text-xs text-amber-200/70 leading-relaxed">{{ voice.description }}</p>

          <div class="grid grid-cols-3 gap-2 pt-2 border-t border-wood-800 text-center text-xs">
            <div class="p-2 rounded-xl bg-wood-950/60 border border-wood-800/80">
              <div class="text-amber-200/50 text-[10px] uppercase font-bold">Provider</div>
              <div class="font-bold text-white mt-0.5">{{ voice.provider }}</div>
            </div>
            <div class="p-2 rounded-xl bg-wood-950/60 border border-wood-800/80">
              <div class="text-amber-200/50 text-[10px] uppercase font-bold">Tốc độ</div>
              <div class="font-bold text-gold-400 mt-0.5">{{ voice.speed }}x</div>
            </div>
            <div class="p-2 rounded-xl bg-wood-950/60 border border-wood-800/80">
              <div class="text-amber-200/50 text-[10px] uppercase font-bold">Cao độ</div>
              <div class="font-bold text-emerald-400 mt-0.5">{{ voice.pitch }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 4: Manual Batch Audio Generator -->
      <div v-if="currentTab === 'generator'" class="rounded-3xl bg-wood-900/90 border border-wood-750 p-6 space-y-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles :size="18" class="text-gold-400" />
          <span>Sinh giọng đọc mới (TTS Generation Job)</span>
        </h3>
        <p class="text-xs text-amber-200/70">
          Tạo tác vụ sinh âm thanh qua Edge-TTS / CosyVoice. Tác vụ sẽ tự động ghi vào hàng đợi, sinh file MP3 và chuyển sang trạng thái Chờ duyệt (NEEDS_REVIEW).
        </p>

        <form @submit.prevent="handleCreateJob" class="space-y-4 max-w-xl">
          <div>
            <label class="block text-xs font-bold text-amber-200/80 mb-1">Văn bản tiếng Trung (Chữ Hán)*</label>
            <input
              v-model="newJob.sourceText"
              type="text"
              required
              placeholder="ví dụ: 欢迎来到灵界！"
              class="w-full px-4 py-2.5 rounded-xl bg-wood-950 border border-wood-750 text-white font-hanzi text-base focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-amber-200/80 mb-1">Phiên âm Pinyin (Tùy chọn)</label>
              <input
                v-model="newJob.pinyin"
                type="text"
                placeholder="ví dụ: Huānyíng lái dào língjiè!"
                class="w-full px-4 py-2 rounded-xl bg-wood-950 border border-wood-750 text-sm text-white focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-amber-200/80 mb-1">Mã định danh nội dung (Content ID)*</label>
              <input
                v-model="newJob.contentId"
                type="text"
                required
                placeholder="ví dụ: npc_storyteller_legend_1"
                class="w-full px-4 py-2 rounded-xl bg-wood-950 border border-wood-750 text-sm text-white focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-amber-200/80 mb-1">Loại nội dung</label>
              <select
                v-model="newJob.contentType"
                class="w-full px-3 py-2 rounded-xl bg-wood-950 border border-wood-750 text-sm text-white focus:border-gold-500 focus:outline-none"
              >
                <option value="VOCABULARY">VOCABULARY (Từ vựng HSK)</option>
                <option value="EXAMPLE_SENTENCE">EXAMPLE_SENTENCE (Câu ví dụ)</option>
                <option value="NPC_DIALOGUE">NPC_DIALOGUE (Đối thoại NPC)</option>
                <option value="CONVERSATION_LINE">CONVERSATION_LINE (Hội thoại)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-amber-200/80 mb-1">Hồ sơ giọng đọc</label>
              <select
                v-model="newJob.voiceProfileCode"
                class="w-full px-3 py-2 rounded-xl bg-wood-950 border border-wood-750 text-sm text-white focus:border-gold-500 focus:outline-none"
              >
                <option v-for="v in voiceProfiles" :key="v.id" :value="v.code">
                  {{ v.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoExecute"
              v-model="newJob.autoExecute"
              class="w-4 h-4 rounded text-gold-500 bg-wood-950 border-wood-700"
            />
            <label for="autoExecute" class="text-xs text-amber-200 font-bold select-none cursor-pointer">
              Xử lý và sinh audio ngay lập tức (Auto Execute Job)
            </label>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-sm shadow-rpg-glow-gold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles :size="15" />
            <span>{{ isSubmitting ? 'Đang khởi tạo...' : 'Tạo tác vụ sinh Audio' }}</span>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Volume2,
  RefreshCw,
  Sparkles,
  Check,
  RotateCcw,
  Clock,
  AlertCircle,
  UploadCloud,
  ArrowLeft,
  Loader2,
  FileAudio,
  ListOrdered,
  Users,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

const currentTab = ref<'assets' | 'jobs' | 'voices' | 'generator'>('assets');
const assetFilter = ref<'all' | 'needs_review' | 'published'>('all');
const isLoading = ref(false);
const isSubmitting = ref(false);

const assets = ref<any[]>([]);
const jobs = ref<any[]>([]);
const voiceProfiles = ref<any[]>([]);

const assetFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'needs_review', label: 'Chờ duyệt' },
  { id: 'published', label: 'Đã xuất bản' },
];

const tabs = computed(() => [
  { id: 'assets', label: 'Tài nguyên âm thanh', icon: FileAudio, badge: needsReviewCount.value > 0 ? `${needsReviewCount.value} mới` : null },
  { id: 'jobs', label: 'Tác vụ Jobs', icon: ListOrdered, badge: null },
  { id: 'voices', label: 'Hồ sơ giọng đọc', icon: Users, badge: `${voiceProfiles.value.length}` },
  { id: 'generator', label: 'Sinh Audio mới', icon: Sparkles, badge: null },
]);

const publishedCount = computed(() => assets.value.filter((a) => a.publicationStatus === 'PUBLISHED').length);
const needsReviewCount = computed(() => assets.value.filter((a) => a.reviewStatus === 'NEEDS_REVIEW').length);
const totalJobsCount = computed(() => jobs.value.length);

const filteredAssets = computed(() => {
  if (assetFilter.value === 'needs_review') {
    return assets.value.filter((a) => a.reviewStatus === 'NEEDS_REVIEW');
  }
  if (assetFilter.value === 'published') {
    return assets.value.filter((a) => a.publicationStatus === 'PUBLISHED');
  }
  return assets.value;
});

const newJob = ref({
  sourceText: '',
  pinyin: '',
  contentId: '',
  contentType: 'NPC_DIALOGUE',
  voiceProfileCode: 'vp_village_guide',
  autoExecute: true,
});

async function refreshData() {
  isLoading.value = true;
  try {
    const [assetsRes, jobsRes, voicesRes] = await Promise.all([
      $fetch<any>('/api/audio/assets?limit=100'),
      $fetch<any>('/api/audio/jobs?limit=50'),
      $fetch<any>('/api/audio/voices'),
    ]);

    assets.value = assetsRes?.data?.assets || [];
    jobs.value = jobsRes?.data?.jobs || [];
    voiceProfiles.value = voicesRes?.data?.voices || [];
  } catch (e) {
    console.error('[AudioAdmin] Failed to load data:', e);
  } finally {
    isLoading.value = false;
  }
}

async function handleApprove(assetId: string) {
  try {
    await $fetch(`/api/audio/assets/${assetId}/approve`, {
      method: 'POST',
      body: { reviewedBy: 'admin_reviewer' },
    });
    await refreshData();
  } catch (e: any) {
    alert(`Lỗi phê duyệt: ${e.message}`);
  }
}

async function handlePublish(assetId: string) {
  try {
    await $fetch(`/api/audio/assets/${assetId}/publish`, {
      method: 'POST',
    });
    await refreshData();
  } catch (e: any) {
    alert(`Lỗi xuất bản: ${e.message}`);
  }
}

async function handleRegenerate(assetId: string) {
  if (!confirm('Bạn có chắc muốn tái tạo phiên bản mới cho asset này?')) return;
  try {
    await $fetch(`/api/audio/assets/${assetId}/regenerate`, {
      method: 'POST',
      body: { autoExecute: true },
    });
    await refreshData();
  } catch (e: any) {
    alert(`Lỗi tái tạo: ${e.message}`);
  }
}

async function handleRetryJob(jobId: string) {
  try {
    await $fetch(`/api/audio/jobs/${jobId}/retry`, {
      method: 'POST',
    });
    await refreshData();
  } catch (e: any) {
    alert(`Lỗi thử lại: ${e.message}`);
  }
}

async function handleCreateJob() {
  isSubmitting.value = true;
  try {
    await $fetch('/api/audio/jobs', {
      method: 'POST',
      body: newJob.value,
    });
    newJob.value.sourceText = '';
    newJob.value.pinyin = '';
    newJob.value.contentId = '';
    currentTab.value = 'assets';
    await refreshData();
  } catch (e: any) {
    alert(`Lỗi tạo job: ${e.message}`);
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  refreshData();
});
</script>

