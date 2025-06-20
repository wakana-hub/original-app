# 📞アプリ概要:コールセンター用日報管理アプリ

## ■コンセプト
  大人数のオペレーターが所属するコールセンター業務において、日々の対応履歴をリアルタイムかつ一元的に管理できるアプリ。Excelでの個別管理による非効率や手間を解消し、業務の見える化と効率化を実現。

## ■ターゲット
 + ユーザー属性
   + オペレーター（電話対応者）
   + 管理者　（オペレーターの対応状況を把握・管理）
 + ユーザーの業務環境
   + 多数のオペレーターが所属するチーム制の職場
   + 現在はオペレーター各自がExcelで対応履歴を管理し、日報を個別に提出
   + ファイル破損・集計作業の負担・リアルタイムでの共有不可など、多くの課題を抱えている

## ■ユーザーの課題とニーズ
| 課題 | 解決策 |
|------|--------|
| 📂 各自のExcelで履歴を管理し、確認に時間がかかる | ✅ アプリ上で対応履歴をリアルタイム共有・検索可能に |
| 🧾 管理者が全員分のExcelを手動で集計 | ✅ 一元管理により自動で集計可能。件数や状況も即時把握 |
| ☎ 電話対応しながらの入力が手間 | ✅ シンプルで直感的な入力フォームでスムーズに記録可能 |

### 📊ダッシュボード（対応履歴の登録のある日付表示/ログイン週（月～日）の対応件数グラフ）
![Image](https://github.com/user-attachments/assets/4047d89c-40b6-479a-9de7-e3b031ac4b26)

### 🧾対応履歴一覧（新規作成ページ・対応履歴詳細ページ・対応履歴編集ページへの遷移/対応履歴の削除）
![Image](https://github.com/user-attachments/assets/436876dc-cd83-425e-8c34-fca5034cf13d)

### 📝新規作成ページ
![Image](https://github.com/user-attachments/assets/d54c7961-5929-4f8e-ab2b-a114b534aa2d)

### 🔖対応履歴詳細ページ
![Image](https://github.com/user-attachments/assets/edb45471-8675-47ad-8371-54773bf5818c)

# 【アプリリリースURL」

## ■URL
https://original-app-j2hl.vercel.app/

## ■デモアカウント
 テスト用ID ： staff001  
 テスト用パスワード :  testtest1

# 【アプリ機能一覧】
| 機能カテゴリ       | 機能名                         | 概要・説明                                                                 |
|--------------------|----------------------------------|------------------------------------------------------------------------------|
| ダッシュボード     | カレンダー表示・日別件数グラフ（月～日） | カレンダー上で対応日を表示し、クリックで該当日の履歴に遷移・ログインした週（月～日）の日別件数を表示           |
| 対応履歴の管理     | 対応履歴の一覧・検索・絞り込み | 日付・担当者・ステータス（完了・未完了）などでフィルタリング可能                   |
| ステータス管理     | ステータス切り替え（未対応など） | 各対応履歴に対し、進捗状態（例：完了・未完了）を設定               |
| 対応履歴の詳細     | 対応履歴の詳細表示              | 各履歴の詳細内容を確認できるページ                                     |                    |
| 対応履歴の編集　　　| 対応履歴の編集・更新　　　　　　| 各履歴の詳細内容を編集できるページ　　                                    |                    |
| ユーザー管理       | ログイン・ログアウト             | オペレーター・管理者ごとにアカウント管理                                 |　　　　　　　　　|
| データ一元化       | Excel管理の代替                  | 全履歴をリアルタイムにWeb上で管理し、管理者の集計業務を軽減する           |

# 【利用するフレームワーク/ライブラリ】

## 🌐 フレームワーク / 開発環境
 + Next.js（v14.2.28）
 + React
 + TypeScript

## 🎨 UI / スタイリング
 + Material UI (MUI)
 + Tailwind CSS**

### 📅 日付ライブラリ
 + dayjs
 + date-fns + @date-io/date-fns

### 🔐 認証 / バックエンド
 + Supabase
 + Prisma
 + bcrypt / bcryptjs

### 🎯バリデーション
 + zod

### 📊 グラフ・カレンダー
 +  recharts
 +  react-calendar
 





