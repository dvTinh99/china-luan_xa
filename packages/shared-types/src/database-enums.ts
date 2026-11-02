// ============================================================================
// Database Model Types & Enums (SQLite / Application Layer Compatibility)
// ============================================================================

export type ItemType = 'EQUIPMENT' | 'CONSUMABLE' | 'COSMETIC';

export type EquipmentSlot = 'HEAD' | 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'AURA';

export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type QuestCategory = 'DAILY' | 'ACHIEVEMENT';

export type QuestTargetType =
  | 'COMPLETE_LESSON'
  | 'REVIEW_FLASHCARDS'
  | 'EARN_EXP'
  | 'PERFECT_QUIZ';

export type AudioContentType =
  | 'VOCABULARY'
  | 'EXAMPLE_SENTENCE'
  | 'CONVERSATION_LINE'
  | 'NPC_DIALOGUE'
  | 'SYSTEM_UI';

export type AudioReviewStatus =
  | 'PENDING'
  | 'NEEDS_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type AudioPublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type AudioJobStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export type CombatState = 'IN_PROGRESS' | 'VICTORY' | 'DEFEAT' | 'FLED';
