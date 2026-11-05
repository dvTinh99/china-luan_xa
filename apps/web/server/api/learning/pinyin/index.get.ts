import { defineEventHandler } from 'h3';
import { sendApiSuccess } from '../../../utils/response';
import { getPublicPinyinStages, PINYIN_PASS_SCORE } from '../../../utils/pinyin-curriculum';

export default defineEventHandler((event) => sendApiSuccess(event, {
  passScore: PINYIN_PASS_SCORE,
  stages: getPublicPinyinStages(),
}));
