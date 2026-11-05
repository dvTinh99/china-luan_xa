import type {
  PinyinAttemptAnswer,
  PinyinAttemptResult,
  PinyinLocalizedText,
  PinyinStageContent,
  PinyinStageId,
} from '@linguaworld/api-contracts';

type QuestionDefinition = PinyinStageContent['questions'][number] & {
  answerId: string;
  explanation: PinyinLocalizedText;
};

interface StageDefinition extends Omit<PinyinStageContent, 'questions'> {
  questions: QuestionDefinition[];
}

const text = (vi: string, en: string): PinyinLocalizedText => ({ vi, en });
const example = (hanzi: string, pinyin: string, vi: string, en: string) => ({
  hanzi,
  pinyin,
  meaning: text(vi, en),
});
const choice = (id: string, vi: string, en = vi) => ({ id, label: text(vi, en) });
const question = (
  id: string,
  vi: string,
  en: string,
  answerId: string,
  explanationVi: string,
  explanationEn: string,
  choices: QuestionDefinition['choices'],
): QuestionDefinition => ({
  id,
  prompt: text(vi, en),
  answerId,
  explanation: text(explanationVi, explanationEn),
  choices,
});

export const PINYIN_PASS_SCORE = 80;
export const PINYIN_QUESTION_COUNT = 10;

export const PINYIN_STAGES: StageDefinition[] = [
  {
    id: 'initials',
    title: text('Thanh mẫu (phụ âm đầu)', 'Initials (starting consonants)'),
    subtitle: text('Nhận diện âm mở đầu và cách bật hơi', 'Recognize starting sounds and aspiration'),
    sections: [
      {
        title: text('Pinyin ghép thành âm tiết', 'How a Pinyin syllable is built'),
        description: text(
          'Một âm tiết thường có thanh mẫu + vận mẫu + thanh điệu. Nếu âm tiết bắt đầu bằng nguyên âm, nó không có thanh mẫu; y và w trong một số cách viết là ký tự mở đầu theo quy tắc chính tả.',
          'A syllable commonly combines an initial, a final, and a tone. A syllable beginning with a vowel has no initial; y and w in some spellings are orthographic starting letters.',
        ),
        rows: [
          {
            label: 'bā · mā · ān',
            description: text('b/m là thanh mẫu; ān bắt đầu bằng vận mẫu nên không có thanh mẫu.', 'b/m are initials; ān starts with a final and has no initial.'),
            examples: [example('八', 'bā', 'tám', 'eight'), example('妈', 'mā', 'mẹ', 'mother'), example('安', 'ān', 'yên ổn', 'peaceful')],
          },
        ],
      },
      {
        title: text('Nhóm âm môi và đầu lưỡi', 'Lip and tongue-tip initials'),
        description: text('Đọc theo nhóm để phân biệt vị trí cấu âm. p, t, k, c, ch bật hơi mạnh hơn b, d, g, z, zh; đây là khác biệt về bật hơi, không đơn giản là hữu thanh/vô thanh.', 'Learn initials in place-of-articulation groups. p, t, k, c, and ch are more strongly aspirated than b, d, g, z, and zh; the contrast is aspiration, not simply voiced versus voiceless.'),
        rows: [
          { label: 'b · p · m · f', description: text('Hai môi hoặc răng môi; b/p là cặp không bật hơi/bật hơi.', 'Both lips or lip and teeth; b/p contrast unaspirated and aspirated sounds.'), examples: [example('八', 'bā', 'tám', 'eight'), example('怕', 'pà', 'sợ', 'afraid'), example('妈', 'mā', 'mẹ', 'mother'), example('发', 'fā', 'phát ra', 'send out')] },
          { label: 'd · t · n · l', description: text('Đầu lưỡi chạm vùng lợi; d/t là cặp không bật hơi/bật hơi.', 'The tongue tip touches the ridge behind the upper teeth; d/t contrast aspiration.'), examples: [example('大', 'dà', 'to, lớn', 'big'), example('他', 'tā', 'anh ấy', 'he'), example('你', 'nǐ', 'bạn', 'you'), example('来', 'lái', 'đến', 'come')] },
          { label: 'g · k · h', description: text('Âm phát ra ở phía sau khoang miệng; g/k là cặp không bật hơi/bật hơi.', 'These sounds are made toward the back of the mouth; g/k contrast aspiration.'), examples: [example('哥', 'gē', 'anh trai', 'older brother'), example('可', 'kě', 'có thể', 'can'), example('好', 'hǎo', 'tốt', 'good')] },
          { label: 'j · q · x', description: text('Đi với i hoặc ü và các dạng viết liên quan; q bật hơi hơn j.', 'These pair with i or ü and related spellings; q is aspirated while j is not.'), examples: [example('鸡', 'jī', 'gà', 'chicken'), example('七', 'qī', 'bảy', 'seven'), example('西', 'xī', 'phía tây', 'west')] },
          { label: 'zh · ch · sh · r', description: text('Nhóm quặt lưỡi; ch bật hơi hơn zh.', 'Retroflex initials; ch is aspirated while zh is not.'), examples: [example('知', 'zhī', 'biết', 'know'), example('吃', 'chī', 'ăn', 'eat'), example('是', 'shì', 'là', 'be'), example('日', 'rì', 'ngày, mặt trời', 'day; sun')] },
          { label: 'z · c · s', description: text('Nhóm đầu lưỡi; c bật hơi hơn z.', 'Dental/alveolar initials; c is aspirated while z is not.'), examples: [example('字', 'zì', 'chữ', 'character'), example('次', 'cì', 'lần', 'time; occurrence'), example('四', 'sì', 'bốn', 'four')] },
        ],
      },
    ],
    questions: [
      question('i1', 'Trong cặp b/p, âm nào bật hơi?', 'In the b/p pair, which sound is aspirated?', 'p', 'p bật hơi; b không bật hơi.', 'p is aspirated; b is unaspirated.', [choice('b', 'b'), choice('p', 'p'), choice('m', 'm')]),
      question('i2', 'Thanh mẫu đầu của 他 tā là gì?', 'What is the initial in 他 tā?', 't', '他 đọc tā, thanh mẫu là t.', '他 is tā; its initial is t.', [choice('d', 'd'), choice('t', 't'), choice('n', 'n')]),
      question('i3', 'Thanh mẫu đầu của 吃 chī là gì?', 'What is the initial in 吃 chī?', 'ch', '吃 đọc chī, dùng thanh mẫu ch.', '吃 is chī and uses the initial ch.', [choice('c', 'c'), choice('ch', 'ch'), choice('sh', 'sh')]),
      question('i4', 'Âm nào thuộc nhóm quặt lưỡi?', 'Which is a retroflex initial?', 'zh', 'zh thuộc nhóm quặt lưỡi zh/ch/sh/r.', 'zh belongs to the zh/ch/sh/r retroflex group.', [choice('z', 'z'), choice('zh', 'zh'), choice('j', 'j')]),
      question('i5', 'Thanh mẫu đầu của 西 xī là gì?', 'What is the initial in 西 xī?', 'x', '西 đọc xī, thanh mẫu là x.', '西 is xī; its initial is x.', [choice('x', 'x'), choice('s', 's'), choice('sh', 'sh')]),
      question('i6', 'Trong âm tiết ān (安), thanh mẫu là gì?', 'What is the initial in ān (安)?', 'zero', 'Ān bắt đầu bằng vận mẫu, nên đây là âm tiết không có thanh mẫu.', 'Ān begins with a final, so it has no initial.', [choice('zero', 'Không có thanh mẫu', 'No initial'), choice('y', 'y'), choice('w', 'w')]),
      question('i7', 'Thanh mẫu đầu của 日 rì là gì?', 'What is the initial in 日 rì?', 'r', '日 đọc rì, thanh mẫu là r.', '日 is rì; its initial is r.', [choice('l', 'l'), choice('r', 'r'), choice('zh', 'zh')]),
      question('i8', 'Trong cặp g/k, âm nào bật hơi?', 'In the g/k pair, which sound is aspirated?', 'k', 'k bật hơi; g không bật hơi.', 'k is aspirated; g is unaspirated.', [choice('g', 'g'), choice('k', 'k'), choice('h', 'h')]),
      question('i9', 'Pinyin chuẩn của 四 (bốn) là gì?', 'Which is the correct Pinyin for 四 (four)?', 'si', '四 đọc sì, bắt đầu bằng s chứ không phải sh.', '四 is sì, beginning with s rather than sh.', [choice('si', 'sì'), choice('shi', 'shì'), choice('xi', 'xī')]),
      question('i10', 'Thanh mẫu đầu của 家 jiā là gì?', 'What is the initial in 家 jiā?', 'j', '家 đọc jiā, thanh mẫu là j.', '家 is jiā; its initial is j.', [choice('j', 'j'), choice('q', 'q'), choice('g', 'g')]),
    ],
  },
  {
    id: 'finals',
    title: text('Vận mẫu (phần vần)', 'Finals (the vowel part)'),
    subtitle: text('Từ nguyên âm đơn tới vần kép và vần mũi', 'From simple vowels to compound and nasal finals'),
    sections: [
      {
        title: text('Vận mẫu đơn', 'Simple finals'),
        description: text('Sáu nguyên âm cơ bản là a, o, e, i, u, ü. Âm ü gần với âm “uy” nhưng môi tròn; sau j, q, x, y, dấu hai chấm thường được lược bỏ trong chính tả.', 'The six basic vowels are a, o, e, i, u, ü. ü is a front rounded vowel; after j, q, x, and y, the umlaut is normally omitted in spelling.'),
        rows: [
          { label: 'a · o · e', description: text('Ba vận mẫu đơn có khẩu hình mở, tròn vừa và mở giữa.', 'Three simple finals with open, rounded, and mid-open mouth shapes.'), examples: [example('阿', 'ā', 'tiếng đệm a', 'interjection'), example('哦', 'ó', 'ồ, à', 'oh'), example('饿', 'è', 'đói', 'hungry')] },
          { label: 'i · u · ü', description: text('i kéo môi ngang; u và ü đều tròn môi nhưng vị trí lưỡi khác nhau.', 'i spreads the lips; u and ü are rounded but use different tongue positions.'), examples: [example('衣', 'yī', 'quần áo', 'clothes'), example('乌', 'wū', 'đen', 'black'), example('鱼', 'yú', 'cá', 'fish')] },
        ],
      },
      {
        title: text('Vận mẫu kép và vận mẫu mũi', 'Compound and nasal finals'),
        description: text('Vận mẫu kép chuyển động giữa các nguyên âm; vận mẫu mũi kết thúc bằng -n hoặc -ng. Một số dạng như iu, ui, un là cách viết rút gọn theo quy tắc Pinyin.', 'Compound finals glide between vowel positions; nasal finals end in -n or -ng. Forms such as iu, ui, and un are standard Pinyin contractions.'),
        rows: [
          { label: 'ai · ei · ao · ou', description: text('Các tổ hợp nguyên âm thông dụng.', 'Common vowel combinations.'), examples: [example('爱', 'ài', 'yêu', 'love'), example('杯', 'bēi', 'cốc', 'cup'), example('好', 'hǎo', 'tốt', 'good'), example('口', 'kǒu', 'miệng', 'mouth')] },
          { label: 'ia · ie · iao · iu · ua · uo · uai · ui · üe', description: text('Vận mẫu kép có bán nguyên âm i/u/ü đứng trước hoặc sau; iu là dạng rút gọn của iou, ui của uei.', 'These compounds combine i/u/ü glides with another vowel; iu contracts iou and ui contracts uei.'), examples: [example('家', 'jiā', 'nhà', 'home'), example('谢', 'xiè', 'cảm ơn', 'thank'), example('小', 'xiǎo', 'nhỏ', 'small'), example('六', 'liù', 'sáu', 'six'), example('花', 'huā', 'hoa', 'flower'), example('多', 'duō', 'nhiều', 'many'), example('快', 'kuài', 'nhanh', 'fast'), example('水', 'shuǐ', 'nước', 'water'), example('月', 'yuè', 'mặt trăng/tháng', 'moon; month')] },
          { label: 'an · en · ang · eng · ong', description: text('Vần mũi cơ bản; -n kết thúc phía trước miệng, -ng kết thúc phía sau.', 'Basic nasal finals; -n closes at the front, while -ng closes toward the back.'), examples: [example('安', 'ān', 'yên ổn', 'peaceful'), example('人', 'rén', 'người', 'person'), example('忙', 'máng', 'bận', 'busy'), example('冷', 'lěng', 'lạnh', 'cold'), example('中', 'zhōng', 'giữa; Trung Quốc', 'middle; China')] },
          { label: 'ian · in · iang · ing · iong · uan · un · uang · ueng · üan · ün', description: text('Các vận mẫu mũi kết hợp với i/u/ü. un là dạng rút gọn của uen; üan/ün thường viết uan/un sau j, q, x, y.', 'Nasal finals combined with i/u/ü. un contracts uen; üan/ün are written uan/un after j, q, x, and y.'), examples: [example('天', 'tiān', 'trời', 'sky'), example('新', 'xīn', 'mới', 'new'), example('想', 'xiǎng', 'muốn; nghĩ', 'want; think'), example('明', 'míng', 'sáng', 'bright'), example('用', 'yòng', 'dùng', 'use'), example('关', 'guān', 'đóng; cửa ải', 'close; pass'), example('春', 'chūn', 'mùa xuân', 'spring'), example('光', 'guāng', 'ánh sáng', 'light'), example('翁', 'wēng', 'ông lão', 'old man'), example('远', 'yuǎn', 'xa', 'far'), example('云', 'yún', 'mây', 'cloud')] },
          { label: 'er', description: text('er là vận mẫu đặc biệt, xuất hiện độc lập hoặc trong một số âm tiết.', 'er is a special final that can occur on its own or in certain syllables.'), examples: [example('儿', 'ér', 'con; trẻ em', 'child')] },
        ],
      },
    ],
    questions: [
      question('f1', 'Vận mẫu đơn nào có trong 妈 mā?', 'Which simple final appears in 妈 mā?', 'a', 'mā gồm thanh mẫu m và vận mẫu đơn a.', 'mā has initial m and the simple final a.', [choice('a', 'a'), choice('ai', 'ai'), choice('an', 'an')]),
      question('f2', 'Vận mẫu trong 爱 ài là gì?', 'What is the final in 爱 ài?', 'ai', 'ài dùng vận mẫu kép ai.', 'ài uses the compound final ai.', [choice('ai', 'ai'), choice('a', 'a'), choice('ang', 'ang')]),
      question('f3', 'Vận mẫu của 中 zhōng kết thúc bằng âm mũi nào?', 'Which nasal ending appears in 中 zhōng?', 'ong', 'zhōng có vận mẫu ong, kết thúc bằng -ng.', 'zhōng has the final ong, ending in -ng.', [choice('ong', 'ong'), choice('on', 'on'), choice('eng', 'eng')]),
      question('f4', 'Vận mẫu thực sự trong 鱼 yú là gì?', 'What is the underlying final in 鱼 yú?', 'ü', 'Sau y, ü viết thành u; vận mẫu vẫn là ü.', 'After y, ü is written u; the final is still ü.', [choice('u', 'u'), choice('ü', 'ü'), choice('ou', 'ou')]),
      question('f5', 'Vận mẫu trong 花 huā là gì?', 'What is the final in 花 huā?', 'ua', 'huā có vận mẫu kép ua.', 'huā has the compound final ua.', [choice('ua', 'ua'), choice('uo', 'uo'), choice('uai', 'uai')]),
      question('f6', 'Vận mẫu trong 明 míng là gì?', 'What is the final in 明 míng?', 'ing', 'míng có vận mẫu ing.', 'míng has the final ing.', [choice('ing', 'ing'), choice('in', 'in'), choice('iang', 'iang')]),
      question('f7', 'iu trong 六 liù là dạng viết rút gọn của vận mẫu nào?', 'In 六 liù, iu is the contraction of which final?', 'iou', 'iu là cách viết rút gọn chuẩn của iou.', 'iu is the standard contraction of iou.', [choice('iou', 'iou'), choice('iu', 'iu'), choice('uei', 'uei')]),
      question('f8', 'Vận mẫu trong 月 yuè viết đầy đủ là gì?', 'What is the full final in 月 yuè?', 'üe', 'Sau y, üe viết thành yue; vận mẫu đầy đủ là üe.', 'After y, üe is spelled yue; the full final is üe.', [choice('üe', 'üe'), choice('ue', 'ue'), choice('üan', 'üan')]),
      question('f9', 'Vận mẫu của 宽 kuān là gì?', 'What is the final in 宽 kuān?', 'uan', 'kuān dùng vận mẫu uan.', 'kuān uses the final uan.', [choice('uan', 'uan'), choice('uang', 'uang'), choice('un', 'un')]),
      question('f10', 'Vận mẫu trong 耳 ěr là gì?', 'What is the final in 耳 ěr?', 'er', 'ěr dùng vận mẫu đặc biệt er.', 'ěr uses the special final er.', [choice('er', 'er'), choice('e', 'e'), choice('en', 'en')]),
    ],
  },
  {
    id: 'tones',
    title: text('Thanh điệu và biến điệu', 'Tones and tone changes'),
    subtitle: text('Nghe cao độ, ghi dấu thanh và dùng quy tắc trong lời nói', 'Hear pitch, place tone marks, and apply speech rules'),
    sections: [
      {
        title: text('Bốn thanh chính và thanh nhẹ', 'The four tones and the neutral tone'),
        description: text('Thanh điệu làm thay đổi nghĩa. Hãy nghe cùng một âm tiết mā, má, mǎ, mà và ma nhẹ: cao ngang, đi lên, xuống rồi lên, đi xuống, và nhẹ/không mang dấu.', 'Tone changes meaning. Hear mā, má, mǎ, mà, and neutral ma: high level, rising, dipping, falling, and light/unstressed.'),
        rows: [
          { label: 'mā · má · mǎ · mà · ma', description: text('Dấu lần lượt là ˉ ˊ ˇ ˋ; thanh nhẹ không có dấu. 妈妈 đọc māma, 吗 đọc ma nhẹ.', 'The marks are ˉ ˊ ˇ ˋ; the neutral tone has no mark. 妈妈 is māma; 吗 is neutral ma.'), examples: [example('妈', 'mā', 'mẹ · thanh 1', 'mother · 1st tone'), example('麻', 'má', 'cây gai dầu · thanh 2', 'hemp · 2nd tone'), example('马', 'mǎ', 'ngựa · thanh 3', 'horse · 3rd tone'), example('骂', 'mà', 'mắng · thanh 4', 'scold · 4th tone'), example('吗', 'ma', 'trợ từ hỏi · thanh nhẹ', 'question particle · neutral tone')] },
        ],
      },
      {
        title: text('Dấu thanh và biến điệu', 'Tone marks and tone sandhi'),
        description: text('Nếu có a thì đặt dấu trên a; nếu không, ưu tiên e/o; nếu không có thì đặt trên nguyên âm cuối. Trong lời nói, thanh 3 đổi trước thanh 3; 不 và 一 đổi thanh theo âm tiết theo sau.', 'Mark a first; otherwise prefer e/o; if neither occurs, mark the last vowel. In speech, a third tone changes before another third tone; 不 and 一 change tone according to what follows.'),
        rows: [
          { label: 'nǐ hǎo → ní hǎo (cách đọc)', description: text('Hai thanh 3 đứng cạnh nhau: âm tiết đầu thường đọc thành thanh 2. Khi viết Pinyin vẫn giữ dấu từ điển nǐ hǎo.', 'With two third tones together, the first is commonly pronounced as a second tone. Standard Pinyin spelling keeps dictionary tones: nǐ hǎo.'), examples: [example('你好', 'nǐ hǎo', 'xin chào', 'hello')] },
          { label: '不 bù → bú · 一 yī → yí / yì', description: text('不 đổi thành bú trước thanh 4. 一 thường đọc yí trước thanh 4, yì trước thanh 1/2/3; khi đọc riêng hoặc cuối câu thường giữ yī.', '不 becomes bú before a fourth tone. 一 is commonly yí before a fourth tone and yì before a first/second/third tone; alone or sentence-final it is usually yī.'), examples: [example('不要', 'bú yào', 'đừng; không muốn', 'do not; do not want'), example('一个', 'yí ge', 'một cái', 'one item'), example('一天', 'yì tiān', 'một ngày', 'one day')] },
          { label: 'liú · guǐ · hǎo', description: text('Đặt dấu trên nguyên âm: a trước; nếu không có a thì e/o; trong iu đặt trên u, trong ui đặt trên i.', 'Place marks on vowels: a takes priority; otherwise e/o; in iu mark u, and in ui mark i.'), examples: [example('流', 'liú', 'chảy', 'flow'), example('鬼', 'guǐ', 'ma', 'ghost'), example('好', 'hǎo', 'tốt', 'good')] },
        ],
      },
    ],
    questions: [
      question('t1', 'mā dùng thanh mấy?', 'Which tone is mā?', '1', 'Dấu ngang ˉ là thanh 1.', 'The macron ˉ marks the first tone.', [choice('1', 'Thanh 1', '1st tone'), choice('2', 'Thanh 2', '2nd tone'), choice('4', 'Thanh 4', '4th tone')]),
      question('t2', 'má dùng thanh mấy?', 'Which tone is má?', '2', 'Dấu sắc ˊ là thanh 2 đi lên.', 'The acute accent ˊ marks the rising second tone.', [choice('1', 'Thanh 1', '1st tone'), choice('2', 'Thanh 2', '2nd tone'), choice('3', 'Thanh 3', '3rd tone')]),
      question('t3', 'mǎ dùng thanh mấy?', 'Which tone is mǎ?', '3', 'Dấu ˇ là thanh 3.', 'The caron ˇ marks the third tone.', [choice('2', 'Thanh 2', '2nd tone'), choice('3', 'Thanh 3', '3rd tone'), choice('4', 'Thanh 4', '4th tone')]),
      question('t4', 'mà dùng thanh mấy?', 'Which tone is mà?', '4', 'Dấu huyền ˋ là thanh 4 đi xuống.', 'The grave accent ˋ marks the falling fourth tone.', [choice('1', 'Thanh 1', '1st tone'), choice('3', 'Thanh 3', '3rd tone'), choice('4', 'Thanh 4', '4th tone')]),
      question('t5', 'Âm ma nhẹ thường được ghi thế nào?', 'How is neutral ma usually written?', 'neutral', 'Thanh nhẹ không có dấu thanh: ma.', 'The neutral tone has no tone mark: ma.', [choice('1', 'mā'), choice('neutral', 'ma (không dấu)', 'ma (no mark)'), choice('4', 'mà')]),
      question('t6', '你好 nǐ hǎo thường được đọc thế nào khi nói liền?', 'How is 你好 nǐ hǎo commonly pronounced in connected speech?', 'third', 'Thanh 3 đầu đổi thành thanh 2 khi đứng trước một thanh 3 khác: ní hǎo.', 'The first third tone changes to a rising tone before another third tone: ní hǎo.', [choice('third', 'ní hǎo'), choice('both3', 'nǐ hǎo với cả hai thanh 3', 'nǐ hǎo with both third tones'), choice('fourth', 'nì hào')]),
      question('t7', '不去 bù qù thường đọc biến điệu thế nào?', 'How does 不去 bù qù change in speech?', 'bu2', '不 đổi thành bú trước âm tiết thanh 4: bú qù.', '不 changes to bú before a fourth tone: bú qù.', [choice('bu2', 'bú qù'), choice('bu4', 'bù qù'), choice('bu3', 'bǔ qù')]),
      question('t8', '一共 yī gòng thường đọc 一 thế nào?', 'How is 一 commonly pronounced in 一共 yī gòng?', 'yi2', '一 đổi thành yí trước thanh 4.', '一 changes to yí before a fourth tone.', [choice('yi1', 'yī'), choice('yi2', 'yí'), choice('yi4', 'yì')]),
      question('t9', 'Dấu thanh trong liú (iu) đặt trên chữ nào?', 'Which vowel gets the tone mark in liú (iu)?', 'u', 'Trong iu, dấu đặt trên u: liú.', 'In iu, the mark goes on u: liú.', [choice('i', 'i'), choice('u', 'u'), choice('both', 'cả i và u', 'both i and u')]),
      question('t10', 'Dấu thanh trong guǐ (ui) đặt trên chữ nào?', 'Which vowel gets the tone mark in guǐ (ui)?', 'i', 'Trong ui, dấu đặt trên i: guǐ.', 'In ui, the mark goes on i: guǐ.', [choice('u', 'u'), choice('i', 'i'), choice('both', 'cả u và i', 'both u and i')]),
    ],
  },
];

export function getPinyinStage(stageId: string): StageDefinition | undefined {
  return PINYIN_STAGES.find((stage) => stage.id === stageId);
}

export function getPublicPinyinStages(): PinyinStageContent[] {
  return PINYIN_STAGES.map(({ id, title, subtitle, sections, questions }) => ({
    id,
    title,
    subtitle,
    sections,
    questions: questions.map(({ id: questionId, prompt, choices }) => ({
      id: questionId,
      prompt,
      choices,
    })),
  }));
}

export function isPinyinStageId(value: string): value is PinyinStageId {
  return PINYIN_STAGES.some((stage) => stage.id === value);
}

export function evaluatePinyinAttempt(stage: StageDefinition, answers: PinyinAttemptAnswer[]) {
  const submitted = new Map(answers.map((answer) => [answer.questionId, answer.optionId]));
  const feedback: PinyinAttemptResult['feedback'] = stage.questions.map((item) => {
    const selectedOptionId = submitted.get(item.id)!;
    return {
      questionId: item.id,
      selectedOptionId,
      correctOptionId: item.answerId,
      isCorrect: selectedOptionId === item.answerId,
      explanation: item.explanation,
    };
  });
  const correctCount = feedback.filter((item) => item.isCorrect).length;
  return {
    correctCount,
    score: Math.round((correctCount / stage.questions.length) * 100),
    feedback,
  };
}
