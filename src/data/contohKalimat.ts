export interface ContohKalimat {
  kalimat: string;
  pinyin: string;
  arti: string;
}

export const CONTOH_KALIMAT: Record<string, ContohKalimat> = {
  '你好': { kalimat: '你好，我叫小明。', pinyin: 'Nǐ hǎo, wǒ jiào Xiǎomíng.', arti: 'Halo, nama saya Xiaoming.' },
  '谢谢': { kalimat: '谢谢你的帮助。', pinyin: 'Xièxie nǐ de bāngzhù.', arti: 'Terima kasih atas bantuanmu.' },
  '我': { kalimat: '我是印度尼西亚人。', pinyin: 'Wǒ shì Yìndùníxīyà rén.', arti: 'Saya orang Indonesia.' },
  '你': { kalimat: '你好吗？', pinyin: 'Nǐ hǎo ma?', arti: 'Apa kabar?' },
  '爱': { kalimat: '我爱学习中文。', pinyin: 'Wǒ ài xuéxí Zhōngwén.', arti: 'Saya suka belajar bahasa Mandarin.' },
  '学习': { kalimat: '我们每天学习汉语。', pinyin: 'Wǒmen měitiān xuéxí Hànyǔ.', arti: 'Kami belajar bahasa Mandarin setiap hari.' },
  '老师': { kalimat: '王老师很好。', pinyin: 'Wáng lǎoshī hěn hǎo.', arti: 'Guru Wang sangat baik.' },
  '朋友': { kalimat: '他是我的好朋友。', pinyin: 'Tā shì wǒ de hǎo péngyou.', arti: 'Dia adalah teman baik saya.' },
  '中国': { kalimat: '我想去中国旅游。', pinyin: 'Wǒ xiǎng qù Zhōngguó lǚyóu.', arti: 'Saya ingin pergi ke China.' },
  '吃': { kalimat: '我们一起吃饭吧。', pinyin: 'Wǒmen yìqǐ chīfàn ba.', arti: 'Ayo kita makan bersama.' },
  '喝': { kalimat: '你喝茶还是咖啡？', pinyin: 'Nǐ hē chá háishì kāfēi?', arti: 'Kamu minum teh atau kopi?' },
  '看': { kalimat: '我喜欢看电影。', pinyin: 'Wǒ xǐhuan kàn diànyǐng.', arti: 'Saya suka menonton film.' },
  '今天': { kalimat: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', arti: 'Hari ini cuacanya bagus.' },
  '明天': { kalimat: '明天我们去公园。', pinyin: 'Míngtiān wǒmen qù gōngyuán.', arti: 'Besok kita pergi ke taman.' },
  '学校': { kalimat: '我们的学校很大。', pinyin: 'Wǒmen de xuéxiào hěn dà.', arti: 'Sekolah kami sangat besar.' },
  '家': { kalimat: '我的家在北京。', pinyin: 'Wǒ de jiā zài Běijīng.', arti: 'Rumah saya di Beijing.' },
  '是': { kalimat: '他是我的老师。', pinyin: 'Tā shì wǒ de lǎoshī.', arti: 'Dia adalah guru saya.' },
  '不': { kalimat: '我不喜欢这个。', pinyin: 'Wǒ bù xǐhuan zhège.', arti: 'Saya tidak suka ini.' },
  '很': { kalimat: '这个苹果很好吃。', pinyin: 'Zhège píngguǒ hěn hǎochī.', arti: 'Apel ini sangat enak.' },
  '好': { kalimat: '你的汉语很好！', pinyin: 'Nǐ de Hànyǔ hěn hǎo!', arti: 'Bahasa Mandarin kamu bagus!' },
};

export function getContohKalimat(hanzi: string): ContohKalimat | null {
  return CONTOH_KALIMAT[hanzi] || null;
}