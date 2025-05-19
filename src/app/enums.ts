// enums.ts

export type InquiryType = 'INBOUND' | 'OUTBOUND';
export const inquiryTypeLabel = {
  INBOUND: '受電',
  OUTBOUND: '架電',
}

export const genderLabel = {
  MALE: '男性',
  FEMALE: '女性',
}

export const relationshipLabel = {
  SELF: '本人',
  FAMILY: '家族',
  OTHER: 'その他',
}
export type Category = 'PRODUCT' | 'PURCHASE' | 'APPLICATION'|
'COMPLAINT' | 'OTHER';
export const categoryLabel = {
  PRODUCT: '製品について',
  PURCHASE: '購入方法について',
  APPLICATION: '申し込みについて',
  COMPLAINT: 'クレーム',
  OTHER: 'その他',
}

export type Status = 'INCOMPLETE' | 'COMPLETE';
export const postStatusLabel = {
  INCOMPLETE: '未完了',
  COMPLETE: '完了',
}
