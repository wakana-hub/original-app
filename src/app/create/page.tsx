'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TextField, Button, MenuItem, Box } from '@mui/material'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import Layout from '../../components/Layout'
import supabase from '../../utils/supabase/supabaseClient'
import {
  inquiryTypeLabel,
  genderLabel,
  relationshipLabel,
  categoryLabel,
  postStatusLabel,
} from '../enums'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function CreatePostPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    startTime: dayjs().tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm'),
    endTime: undefined,
    responder: '',
    status: '',
    inquiryType: '',
    category: '',
    message: '',
    inquirerName: '',
    inquirerGender: '',
    inquirerPhone: '',
    inquirerRelationship: '',
    inquirerRelationshipOther: '',
    remarks: '',
    auth_id: '',
  })

  useEffect(() => {
  const fetchResponder = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (user && !userError) {
      const { data, error } = await supabase
        .from('user')
        .select('name, auth_id')
        .eq('id', user.id)  
        .maybeSingle()  
        
        console.log(data)
       
      if (!error && data) {
        setFormData((prev) => ({
          ...prev,
          responder: data.name,
          auth_id: data.auth_id,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          auth_id: '',
        }))
        console.error('名前の取得に失敗:', error)
      }
    } else {
      console.error('ユーザー情報の取得に失敗:', userError)
      router.push('/signin')
    }
  }
  fetchResponder()
},  [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

   const renderSelectField = (
    label: string,
    name: string,
    value: string,
    options: Record<string, string>
  ) => (
    <TextField
      label={label}
      name={name}
      select
      fullWidth
      margin="normal"
      value={value}
      onChange={handleChange}
    >
      {Object.entries(options).map(([key, label]) => (
        <MenuItem key={key} value={key}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  )

  console.log('フォームデータ',formData)

  const handleSubmit = async () => {
  if (!formData.auth_id) {
    alert('ログイン情報が取得できていません。再ログインしてください。');
    router.push('/signin');
    return;
  }

   const startTimeJST = dayjs(formData.startTime).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
    const endTimeJST = formData.endTime
      ? dayjs(formData.endTime).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')
      : null;

    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        startTime: startTimeJST,
        endTime: endTimeJST,
      }),
    });
    
  const json = await res.json();
  if (!res.ok) {
    // サーバーから返ってきた error メッセージを表示
    console.error('投稿エラー:', json.error);
    alert('投稿に失敗しました: ${json.error}');
    return;
  }

  // 成功時のみ正しい一覧ページへ
  router.push('/lists');
}

  return (
    <Layout title="対応履歴作成">
      <Box component="form" noValidate autoComplete="off" sx={{ p: 4 }}>
        <TextField
          label="対応開始日時"
          name="startTime"
          type="datetime-local"
          fullWidth
          margin="normal"
          value={formData.startTime}
          onChange={handleChange}
          
        />
        <TextField
          label="対応終了日時"
          name="endTime"
          type="datetime-local"
          fullWidth
          margin="normal"
          value={formData.endTime || ''} 
          onChange={handleChange}
        />
        <TextField
          label="対応者"
          name="responder"
          fullWidth
          margin="normal"
          value={formData.responder}
          disabled
        />
          {renderSelectField('ステータス', 'status', formData.status, postStatusLabel)}
        {renderSelectField('受架電', 'inquiryType', formData.inquiryType, inquiryTypeLabel)}
        {renderSelectField('カテゴリー', 'category', formData.category, categoryLabel)}
        <TextField
          label="入電内容"
          name="message"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={formData.message}
          onChange={handleChange}
        />
        <TextField
          label="問い合わせ者名"
          name="inquirerName"
          fullWidth
          margin="normal"
          value={formData.inquirerName}
          onChange={handleChange}
        />

         {renderSelectField('性別', 'inquirerGender', formData.inquirerGender, genderLabel)}
        <TextField
          label="問い合わせ者連絡先"
          name="inquirerPhone"
          fullWidth
          margin="normal"
          value={formData.inquirerPhone}
          onChange={handleChange}
        />
          {renderSelectField(
          '問い合わせ者 続き柄',
          'inquirerRelationship',
          formData.inquirerRelationship,
          relationshipLabel
        )}
        {formData.inquirerRelationship === 'OTHER' && (
          <TextField
            label="その他の続き柄"
            name="inquirerRelationshipOther"
            fullWidth
            margin="normal"
            value={formData.inquirerRelationshipOther}
            onChange={handleChange}
          />
        )}
        <TextField
          label="備考"
          name="remarks"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={formData.remarks}
          onChange={handleChange}
        />
        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
          登録
        </Button>
        <Button
          variant="outlined"
          sx={{ mt: 2, ml: 2 }}
          onClick={() => router.push('/lists')}
        >
          キャンセル
        </Button>
      </Box>
    </Layout>
  )
}