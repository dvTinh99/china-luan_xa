// ============================================================================
// LinguaWorld — i18n Powered Origin Language (Native Tongue) Engine
// ============================================================================
// Standardized on @nuxtjs/i18n (vue-i18n):
// Pure Mandarin Chinese as Primary + Native Subtitle in Parentheses "()"
// Example: 学习 (Học bài) / 学习 (Study)
// ============================================================================

import { computed } from 'vue';
import { useI18n } from '#imports';

export type OriginLanguageCode = 'vi' | 'en';

export interface LanguageOption {
  code: OriginLanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt (Việt Nam)', nativeLabel: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English (US/UK)', nativeLabel: 'English', flag: '🇬🇧' },
];

export function useOriginLanguage() {
  const { t, locale, setLocale } = useI18n();

  const currentOrigin = computed<OriginLanguageCode>(() => (locale.value as OriginLanguageCode) || 'vi');

  const setOriginLanguage = async (code: OriginLanguageCode) => {
    await setLocale(code);
  };

  const isVietnamese = computed(() => currentOrigin.value === 'vi');
  const isEnglish = computed(() => currentOrigin.value === 'en');

  const currentOption = computed(() => {
    return AVAILABLE_LANGUAGES.find((l) => l.code === currentOrigin.value) || AVAILABLE_LANGUAGES[0];
  });

  /**
   * Formats text as: [Chinese] ([Origin Subtitle])
   */
  const dual = (zh: string, vi: string, en?: string): string => {
    const subtitle = currentOrigin.value === 'vi' ? vi : (en || vi);
    if (!subtitle) return zh;
    return `${zh} (${subtitle})`;
  };

  /**
   * Translates key from i18n dictionary and formats as: [Chinese] ([Translated Subtitle])
   */
  const tDual = (key: string, zh: string, named?: Record<string, any>): string => {
    const translation = t(key, named || {});
    return `${zh} (${translation})`;
  };

  /**
   * Returns just the origin language translation without Chinese
   */
  const sub = (vi: string, en?: string): string => {
    return currentOrigin.value === 'vi' ? vi : (en || vi);
  };

  /**
   * Reactive dictionary for global UI elements (Powered by i18n)
   */
  const ui = computed(() => ({
    // Navigation
    navLearn: tDual('nav.learn', '学习'),
    navReview: tDual('nav.review', '复习'),
    navWorld: tDual('nav.world', '大千世界'),
    navQuests: tDual('nav.quests', '宗门任务'),
    navInventory: tDual('nav.inventory', '角色与行囊'),
    navCharacterStats: tDual('nav.characterStats', '侠客属性'),
    navShop: tDual('nav.shop', '珍宝阁'),
    navGold: tDual('nav.gold', '金币'),

    // Hero Header
    heroTag: tDual('hero.tag', '新版 HSK 3.0 • 初级一级'),
    heroTagline: tDual('hero.tagline', '修仙历练'),
    heroTitle: tDual('hero.title', '汉语修仙之路'),
    companionName: tDual('hero.companionName', '伴读小仙 鹿玛'),
    nextGoalPrefix: tDual('hero.nextGoalPrefix', '下一个境界突破'),
    conquerLesson: tDual('hero.conquerLesson', '攻克'),
    rewardSuffix: t('hero.rewardSuffix'),
    btnContinueLesson: tDual('hero.continueLesson', '继续修仙'),
    expText: tDual('hero.exp', '经验'),
    vocabText: tDual('hero.vocab', '生词'),

    // SRS Station
    srsTitle: tDual('srs.title', '记忆殿堂'),
    srsBadge: tDual('srs.badge', '间隔重复'),
    srsDueSuffix: tDual('srs.dueSuffix', '张生词已到复习时刻'),
    srsEmpty: tDual('srs.empty', '心神宁静，已复习完毕！'),
    retentionRate: tDual('srs.retentionRate', '记忆留存率'),
    btnStartReview: tDual('srs.startReview', '立即进入复习'),
    btnViewDeck: tDual('srs.viewDeck', '查阅词库'),

    // Stats
    statTotalVocab: tDual('stats.totalVocab', 'HSK 3.0 词汇总览'),
    statStreak: tDual('stats.streak', '连续修习'),
    streakUnit: tDual('stats.streakDays', '天连续'),
    statLoot: tDual('stats.loot', '宗门战利品'),

    // Mode Switcher
    journeyTitle: tDual('journey.tagline', '七轮修仙图 • 七重境界升华'),
    tabJourney: tDual('journey.tabJourney', '七轮修行图'),
    tabCodex: tDual('journey.tabCodex', '藏经阁课程'),
  }));

  /**
   * Helper to format lesson titles in Chinese (Native Subtitle) via i18n
   */
  const dualLessonTitle = (rawTitle: string): string => {
    if (!rawTitle) return '';
    const clean = rawTitle.trim();
    if (clean.includes('Chào hỏi') || clean.includes('nhân xưng')) {
      return tDual('lessons.lesson_1', '基础问候与人称代词');
    }
    if (clean.includes('Hỏi tên') || clean.includes('quốc gia')) {
      return tDual('lessons.lesson_2', '询问姓名、国籍与致谢');
    }
    if (clean.includes('Số đếm') || clean.includes('Trăm')) {
      return tDual('lessons.lesson_3', '数字一到十与百千');
    }
    if (clean.includes('Ngày, Giờ') || clean.includes('giá tiền')) {
      return tDual('lessons.lesson_4', '日期、时间、星期与询价');
    }
    if (clean.includes('thành viên') || clean.includes('Gia đình')) {
      return tDual('lessons.lesson_5', '家庭成员与称谓');
    }
    if (clean.includes('Chỉ định từ') || clean.includes('Sách')) {
      return tDual('lessons.lesson_6', '指示代词与日常书物');
    }
    if (clean.includes('Món ăn') || clean.includes('Trái cây')) {
      return tDual('lessons.lesson_7', '饮食饮料与水果');
    }
    if (clean.includes('Mua bán') || clean.includes('Sở thích')) {
      return tDual('lessons.lesson_8', '买卖交易与个人喜好');
    }
    if (clean.includes('giác quan') || clean.includes('học tập')) {
      return tDual('lessons.lesson_9', '感官认知与学习技能');
    }
    if (clean.includes('Đi lại') || clean.includes('Địa điểm')) {
      return tDual('lessons.lesson_10', '出行地点与描述形容词');
    }
    return rawTitle;
  };

  /**
   * Helper to format unit titles in Chinese (Native Subtitle) via i18n
   */
  const dualUnitTitle = (rawTitle: string): string => {
    if (!rawTitle) return '';
    const clean = rawTitle.trim();
    if (clean.includes('Bài 1') || clean.includes('Greetings')) {
      return tDual('units.unit_1', '第一单元：问候与初识');
    }
    if (clean.includes('Bài 2') || clean.includes('Numbers')) {
      return tDual('units.unit_2', '第二单元：数字、时间与货币');
    }
    if (clean.includes('Bài 3') || clean.includes('Family')) {
      return tDual('units.unit_3', '第三单元：家庭与日常物品');
    }
    if (clean.includes('Bài 4') || clean.includes('Food')) {
      return tDual('units.unit_4', '第四单元：饮食与购物');
    }
    if (clean.includes('Bài 5') || clean.includes('Study')) {
      return tDual('units.unit_5', '第五单元：学习与地点');
    }
    return rawTitle;
  };

  return {
    t,
    locale,
    setLocale,
    originLanguage: currentOrigin,
    setOriginLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    currentOption,
    isVietnamese,
    isEnglish,
    dual,
    tDual,
    sub,
    ui,
    dualLessonTitle,
    dualUnitTitle,
  };
}
