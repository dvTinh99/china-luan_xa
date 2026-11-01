/**
 * Core radicals database & decomposition mapping for HSK 3.0 Band 1 vocabulary
 */

export interface RadicalDef {
  character: string;
  unicode: string;
  kangxiNo: number;
  strokeCount: number;
  pinyin: string;
  meaningEn: string;
  meaningVi: string;
  mnemonic: string;
  mnemonicVi: string;
  examples: string;
}

export const RADICALS_DATA: RadicalDef[] = [
  {
    character: '亻',
    unicode: 'U+4EBB',
    kangxiNo: 9,
    strokeCount: 2,
    pinyin: 'rén',
    meaningEn: 'person (standing)',
    meaningVi: 'nhân đứng (người)',
    mnemonic: 'Shape of a person standing upright, representing human activities and relationships',
    mnemonicVi: 'Hình người đứng thẳng, chỉ các từ liên quan đến con người, danh xưng và hành vi',
    examples: '你, 他, 们, 什, 仁, 休',
  },
  {
    character: '女',
    unicode: 'U+5973',
    kangxiNo: 38,
    strokeCount: 3,
    pinyin: 'nǚ',
    meaningEn: 'woman / female',
    meaningVi: 'nữ (phụ nữ)',
    mnemonic: 'Figure of a woman kneeling gracefully, denotes female gender, family and beauty',
    mnemonicVi: 'Hình dáng người phụ nữ thùy mị, biểu thị giới nữ, quan hệ mẹ con hoặc cái đẹp',
    examples: '她, 好, 妈, 姐, 妹, 奶',
  },
  {
    character: '子',
    unicode: 'U+5B50',
    kangxiNo: 39,
    strokeCount: 3,
    pinyin: 'zǐ',
    meaningEn: 'child / son',
    meaningVi: 'tử (con, đứa trẻ)',
    mnemonic: 'Swaddled baby with arms outstretched, represents children and small items',
    mnemonicVi: 'Hình đứa trẻ quấn tã vươn tay, chỉ con cái, học tập hoặc hậu tố danh từ',
    examples: '好, 字, 孩, 学, 孙',
  },
  {
    character: '口',
    unicode: 'U+53E3',
    kangxiNo: 30,
    strokeCount: 3,
    pinyin: 'kǒu',
    meaningEn: 'mouth / opening',
    meaningVi: 'khẩu (miệng, lời nói)',
    mnemonic: 'Open mouth, represents speaking, calling, eating and vocal expressions',
    mnemonicVi: 'Hình miệng mở to, biểu thị lời nói, tiếng kêu, ăn uống và hỏi han',
    examples: '叫, 喝, 吃, 吗, 呢, 听',
  },
  {
    character: '心',
    unicode: 'U+5FC3',
    kangxiNo: 61,
    strokeCount: 4,
    pinyin: 'xīn',
    meaningEn: 'heart / mind',
    meaningVi: 'tâm (tim, tấm lòng, suy nghĩ)',
    mnemonic: 'Chambers of the heart, denotes emotions, thoughts, respect and mindfulness',
    mnemonicVi: 'Hình trái tim, chỉ cảm xúc, sự kính trọng (như 您: bạn ở trên quả tim tôi)',
    examples: '您, 想, 意, 感, 态',
  },
  {
    character: '日',
    unicode: 'U+65E5',
    kangxiNo: 72,
    strokeCount: 4,
    pinyin: 'rì',
    meaningEn: 'sun / day',
    meaningVi: 'nhật (mặt trời, ngày)',
    mnemonic: 'The sun with sunspot in the center, denotes daylight, time, date and clarity',
    mnemonicVi: 'Hình mặt trời rực rỡ, biểu thị ban ngày, thời gian, sự sáng sủa và ngày tháng',
    examples: '是, 明, 时, 早, 晚, 星',
  },
  {
    character: '月',
    unicode: 'U+6708',
    kangxiNo: 74,
    strokeCount: 4,
    pinyin: 'yuè',
    meaningEn: 'moon / flesh (meat)',
    meaningVi: 'nguyệt (mặt trăng, cơ thể)',
    mnemonic: 'Crescent moon or muscle tissue, denotes lunar months, night and parts of the body',
    mnemonicVi: 'Vầng trăng khuyết hoặc thớ thịt nạc, biểu thị tháng, đêm và thân thể',
    examples: '明, 期, 服, 朋, 胖',
  },
  {
    character: '氵',
    unicode: 'U+6C35',
    kangxiNo: 85,
    strokeCount: 3,
    pinyin: 'shuǐ',
    meaningEn: 'water (three dots)',
    meaningVi: 'chấm thủy (nước, chất lỏng)',
    mnemonic: 'Three flowing drops of water, denotes liquids, oceans, rivers and cleansing',
    mnemonicVi: 'Ba giọt nước bắn ra, chỉ chất lỏng, sông suối, rửa ráy và trạng thái nước',
    examples: '汉, 没, 洗, 渴, 汤, 河',
  },
  {
    character: '讠',
    unicode: 'U+8BA0',
    kangxiNo: 149,
    strokeCount: 2,
    pinyin: 'yán',
    meaningEn: 'speech / words',
    meaningVi: 'ngôn (lời nói, ngôn ngữ)',
    mnemonic: 'Mouth speaking words upwards, denotes language, conversation, reading and recognizing',
    mnemonicVi: 'Lời nói thốt ra thành tiếng, biểu thị chữ nghĩa, giao tiếp, học tập và nhận biết',
    examples: '说, 话, 语, 识, 谁, 请',
  },
  {
    character: '饣',
    unicode: 'U+9963',
    kangxiNo: 184,
    strokeCount: 3,
    pinyin: 'shí',
    meaningEn: 'food / eat',
    meaningVi: 'thực (ăn, thức ăn)',
    mnemonic: 'Covered vessel of steaming food, denotes dining, cuisine and hunger',
    mnemonicVi: 'Thức ăn thơm ngon trong nồi, chỉ việc ăn uống, no đói và món ăn',
    examples: '饭, 饱, 馆, 饺',
  },
  {
    character: '辶',
    unicode: 'U+8FB6',
    kangxiNo: 162,
    strokeCount: 3,
    pinyin: 'chuò',
    meaningEn: 'walk / movement',
    meaningVi: 'quai xước (bước đi, chuyển động)',
    mnemonic: 'Foot on a winding path, denotes walking, distance, traveling and encountering',
    mnemonicVi: 'Bàn chân bước trên con đường quanh co, chỉ hành trình di chuyển và đón rước',
    examples: '这, 进, 远, 近, 迎',
  },
  {
    character: '宀',
    unicode: 'U+5B80',
    kangxiNo: 40,
    strokeCount: 3,
    pinyin: 'mián',
    meaningEn: 'roof with chimney',
    meaningVi: 'miên (mái nhà)',
    mnemonic: 'A sheltered house with pitched roof and eaves, denotes dwelling, home and safety',
    mnemonicVi: 'Mái nhà che chở mưa nắng, chỉ nơi chốn sinh sống, gia đình và sự ấm cúng',
    examples: '字, 家, 安, 宿, 定',
  },
  {
    character: '木',
    unicode: 'U+6728',
    kangxiNo: 75,
    strokeCount: 4,
    pinyin: 'mù',
    meaningEn: 'tree / wood',
    meaningVi: 'mộc (cây, gỗ)',
    mnemonic: 'Trunk with spreading branches and deep roots, denotes plants, nature and timber',
    mnemonicVi: 'Cây có cành lá và rễ cắm sâu, chỉ gỗ, thực vật, rừng cây và vật dụng gỗ',
    examples: '本, 杯, 桌, 校, 林',
  },
  {
    character: '火',
    unicode: 'U+706B',
    kangxiNo: 86,
    strokeCount: 4,
    pinyin: 'huǒ',
    meaningEn: 'fire / flame',
    meaningVi: 'hỏa (lửa, nhiệt)',
    mnemonic: 'Rising flames flicking upwards, denotes fire, cooking, heat and enthusiasm',
    mnemonicVi: 'Ngọn lửa bốc lên bập bùng, chỉ sự ấm áp, nấu nướng và nhiệt lượng',
    examples: '点, 热, 烤, 灭',
  },
  {
    character: '手',
    unicode: 'U+624B',
    kangxiNo: 64,
    strokeCount: 4,
    pinyin: 'shǒu',
    meaningEn: 'hand (扌)',
    meaningVi: 'thủ (tay, hành động)',
    mnemonic: 'Open hand with five fingers, denotes physical manipulation and craftsmanship',
    mnemonicVi: 'Bàn tay với năm ngón, biểu thị các thao tác cầm nắm, vẫy chào và trợ giúp',
    examples: '打, 找, 拿, 拍, 提',
  },
  {
    character: '土',
    unicode: 'U+571F',
    kangxiNo: 32,
    strokeCount: 3,
    pinyin: 'tǔ',
    meaningEn: 'earth / soil / land',
    meaningVi: 'thổ (đất, lãnh thổ)',
    mnemonic: 'Sprout growing out of soil, denotes land, location and construction',
    mnemonicVi: 'Mầm cây vươn lên từ mặt đất, chỉ đất đai, địa điểm và vật liệu kiến trúc',
    examples: '在, 块, 地, 场',
  },
  {
    character: '人',
    unicode: 'U+4EBA',
    kangxiNo: 9,
    strokeCount: 2,
    pinyin: 'rén',
    meaningEn: 'person / human',
    meaningVi: 'nhân (người)',
    mnemonic: 'Two legs striding forward, the fundamental archetype of humankind',
    mnemonicVi: 'Đôi chân sải bước tiến về phía trước, cội nguồn biểu tượng con người',
    examples: '人, 从, 众, 大',
  },
  {
    character: '十',
    unicode: 'U+5341',
    kangxiNo: 24,
    strokeCount: 2,
    pinyin: 'shí',
    meaningEn: 'ten / complete',
    meaningVi: 'thập (mười, vẹn toàn)',
    mnemonic: 'Intersection of horizontal and vertical coordinates representing perfection and completeness',
    mnemonicVi: 'Dấu chữ thập đan ngang dọc, biểu tượng cho số 10 và sự viên mãn thập toàn',
    examples: '十, 什, 协, 博',
  },
  {
    character: '大',
    unicode: 'U+5927',
    kangxiNo: 37,
    strokeCount: 3,
    pinyin: 'dà',
    meaningEn: 'big / great',
    meaningVi: 'đại (to lớn)',
    mnemonic: 'Person stretching arms and legs out as wide as possible to show great size',
    mnemonicVi: 'Người dang rộng hai tay hai chân hết cỡ để diễn tả sự to lớn vĩ đại',
    examples: '大, 太, 天',
  },
];

/**
 * Tactical breakdown for common HSK 3.0 characters
 * Each entry details:
 * - primaryRadical: The defining radical
 * - components: List of radical/component characters that make up the character
 * - tacticalMnemonic: The battle/RPG memory strategy explaining how radicals combine
 */
export interface CharacterStrategy {
  simplified: string;
  primaryRadical: string;
  components: Array<{
    char: string;
    nameVi: string;
    role: string;
  }>;
  tacticalTip: string;
  tacticalStory: string;
}

export const VOCABULARY_RADICAL_STRATEGIES: Record<string, CharacterStrategy> = {
  你: {
    simplified: '你',
    primaryRadical: '亻',
    components: [
      { char: '亻', nameVi: 'Bộ Nhân đứng (người)', role: 'Người đối diện' },
      { char: '尔', nameVi: 'Bộ Nhĩ (mày, bạn)', role: 'Thành phần âm/nghĩa cổ' },
    ],
    tacticalTip: 'Người đứng (亻) trước mặt chính là "Bạn" (你)',
    tacticalStory: 'Chiến thuật: Trong giao tiếp hiệp sĩ, luôn hướng về người đứng (亻) diện kiến trước mắt mình để gọi là "Bạn/Ngươi" (你).',
  },
  好: {
    simplified: '好',
    primaryRadical: '女',
    components: [
      { char: '女', nameVi: 'Bộ Nữ (người phụ nữ/mẹ)', role: 'Người mẹ yêu thương' },
      { char: '子', nameVi: 'Bộ Tử (đứa con)', role: 'Đứa con ngoan' },
    ],
    tacticalTip: 'Mẹ (女) bên cạnh Con (子) là điều "Tốt đẹp" (好)',
    tacticalStory: 'Chiến thuật: Gia đình hòa hợp, người mẹ ôm đứa con thơ là biểu tượng tuyệt đối của sự An Lành & Tốt Đẹp (好 hǎo).',
  },
  您: {
    simplified: '您',
    primaryRadical: '心',
    components: [
      { char: '你', nameVi: 'Chữ Nhĩ (Bạn/Anh)', role: 'Người đối thoại' },
      { char: '心', nameVi: 'Bộ Tâm (Trái tim)', role: 'Đặt ở đáy lòng tôn kính' },
    ],
    tacticalTip: 'Đặt bạn (你) lên trên trái tim (心) là "Ngài/Quý vị" (您)',
    tacticalStory: 'Chiến thuật Kính ngữ: Khi xưng hô với bậc tiền bối sư phụ, hãy đặt hình ảnh của họ (你) lên trên cả trái tim (心) thành tâm của mình.',
  },
  他: {
    simplified: '他',
    primaryRadical: '亻',
    components: [
      { char: '亻', nameVi: 'Bộ Nhân đứng', role: 'Một người nam' },
      { char: '也', nameVi: 'Chữ Dã (cũng)', role: 'Phần trợ từ / thanh' },
    ],
    tacticalTip: 'Người đàn ông (亻) ngoài kia là "Anh ấy" (他)',
    tacticalStory: 'Chiến thuật: Nhân đứng (亻) đi kèm chữ "dã" (也) tạo thành đại từ chỉ người nam thứ ba.',
  },
  她: {
    simplified: '她',
    primaryRadical: '女',
    components: [
      { char: '女', nameVi: 'Bộ Nữ', role: 'Người phụ nữ' },
      { char: '也', nameVi: 'Chữ Dã (cũng)', role: 'Phần vần' },
    ],
    tacticalTip: 'Người phụ nữ (女) duyên dáng chính là "Cô ấy" (她)',
    tacticalStory: 'Chiến thuật: Thay bộ nhân đứng bằng bộ Nữ (女) lập tức biến đại từ thành "Cô ấy/Bà ấy" một cách chuẩn xác.',
  },
  叫: {
    simplified: '叫',
    primaryRadical: '口',
    components: [
      { char: '口', nameVi: 'Bộ Khẩu (miệng)', role: 'Cất tiếng gọi' },
      { char: '丩', nameVi: 'Chữ Cưu (xoắn xuýt/dây gai)', role: 'Thành phần âm thanh vang xa' },
    ],
    tacticalTip: 'Mở miệng (口) cất tiếng kêu là "Gọi là" (叫)',
    tacticalStory: 'Chiến thuật: Dùng miệng (口) phát âm định danh tên tuổi hiệp sĩ giữa giang hồ.',
  },
  什么: {
    simplified: '什',
    primaryRadical: '亻',
    components: [
      { char: '亻', nameVi: 'Bộ Nhân đứng', role: 'Con người' },
      { char: '十', nameVi: 'Bộ Thập (số 10)', role: 'Mười điều tò mò' },
    ],
    tacticalTip: 'Người (亻) thắc mắc đủ 10 (十) điều là "Cái gì" (什么)',
    tacticalStory: 'Chiến thuật: Một người (亻) đối mặt với 10 (十) vạn câu hỏi thắc mắc tìm tòi chân lý.',
  },
  名字: {
    simplified: '字',
    primaryRadical: '宀',
    components: [
      { char: '宀', nameVi: 'Bộ Miên (Mái nhà)', role: 'Dưới mái trường' },
      { char: '子', nameVi: 'Bộ Tử (Con trẻ)', role: 'Trẻ em tập viết' },
    ],
    tacticalTip: 'Đứa trẻ (子) dưới mái nhà (宀) rèn luyện "Chữ nghĩa" (字)',
    tacticalStory: 'Chiến thuật Văn đạo: Con trẻ (子) ngồi yên dưới mái gia trang (宀) trau dồi từng nét chữ Hán quý báu.',
  },
  是: {
    simplified: '是',
    primaryRadical: '日',
    components: [
      { char: '日', nameVi: 'Bộ Nhật (Mặt trời)', role: 'Ánh sáng chân lý' },
      { char: '疋/正', nameVi: 'Chính (ngay thẳng/bước chân)', role: 'Hành động ngay thẳng' },
    ],
    tacticalTip: 'Dưới ánh mặt trời (日) mọi điều đều "Đúng / Là" (是)',
    tacticalStory: 'Chiến thuật Chân lý: Dưới ánh sáng quang minh của mặt trời (日), điều chính trực luôn luôn là Đúng (是 shì).',
  },
  不: {
    simplified: '不',
    primaryRadical: '一',
    components: [
      { char: '一', nameVi: 'Nét Nhất (mặt trời/mặt đất)', role: 'Tấm khiên chắn' },
      { char: '𠂉/卜', nameVi: 'Cánh chim bay ngược', role: 'Từ chối' },
    ],
    tacticalTip: 'Cánh chim dừng trước vạch ngang thể hiện sự "Không" (不)',
    tacticalStory: 'Chiến thuật Phủ định: Nét cản ngang ngăn chặn hành vi, biểu thị chữ KHÔNG kiên quyết.',
  },
  学生: {
    simplified: '学',
    primaryRadical: '子',
    components: [
      { char: '⺌', nameVi: 'Ánh hào quang tri thức', role: 'Kiến thức' },
      { char: '冖', nameVi: 'Mái che trường viện', role: 'Lớp học' },
      { char: '子', nameVi: 'Đứa trẻ / Học trò', role: 'Người học' },
    ],
    tacticalTip: 'Đứa trẻ (子) thu nhận kiến thức nơi học đường chính là "Học" (学)',
    tacticalStory: 'Chiến thuật Tầm sư: Người đệ tử (子) dưới thư viện tiếp thu muôn vàn tinh hoa kiếm pháp học thuật.',
  },
  人: {
    simplified: '人',
    primaryRadical: '人',
    components: [
      { char: '丿', nameVi: 'Nét Phẩy', role: 'Chân trái vươn tới' },
      { char: '乀', nameVi: 'Nét Mác', role: 'Chân phải trụ vững' },
    ],
    tacticalTip: 'Hai chân đứng vững trên mặt đất là "Người" (人)',
    tacticalStory: 'Chiến thuật Cốt lõi: Hai nét tựa vào nhau, đứng hiên ngang giữa đất trời tạo thành chữ NHÂN.',
  },
};

