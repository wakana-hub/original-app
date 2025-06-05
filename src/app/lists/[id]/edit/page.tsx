'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TextField, MenuItem, Box, Button, Stack,CircularProgress } from '@mui/material'
import Layout from '../../../../components/Layout'
import {
  inquiryTypeLabel,
  genderLabel,
  relationshipLabel,
  categoryLabel,
  postStatusLabel,
} from '@/app/enums'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

type Post = {
  id: string
  startTime: string
  endTime: string
  status: string
  inquiryType: string
  category: string
  message: string
  inquirerName: string
  inquirerGender: string
  inquirerPhone: string
  inquirerRelationship: string
  inquirerRelationshipOther?: string
  remarks: string
  user?: {
    name: string
  }
}

export default function PostEditPage() {
  const { id } = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`/api/lists/${id}`)
      if (!res.ok) {
        alert('投稿が見つかりません')
        router.push('/lists')
        return
      }
      const data = await res.json()

      // JSTに変換して datetime-local に渡せる形式に
      data.startTime = dayjs.utc(data.startTime).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm')
      data.endTime = data.endTime
        ? dayjs.utc(data.endTime).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm')
        : ''
      console.log(data.startTime)
      console.log(data.endTime)
     

      setFormData(data)
      setLoading(false)
    }

    fetchPost()
  }, [id, router])

  if (loading || !formData) return <CircularProgress size={40} thickness={5} color="primary" />

  const handleChange = (key: keyof Post, value: string) => {
    setFormData((prev) => prev ? { ...prev, [key]: value } : null)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const postDataWithoutUser = { ...formData }
      delete postDataWithoutUser.user

      // JST → UTC 変換して ISO 文字列で送信
      postDataWithoutUser.startTime = dayjs.tz(formData.startTime, 'Asia/Tokyo').utc().toISOString()
      postDataWithoutUser.endTime = formData.endTime
        ? dayjs.tz(formData.endTime, 'Asia/Tokyo').utc().toISOString()
        : ''

      const res = await fetch(`/api/lists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postDataWithoutUser),
      })
      if (!res.ok) throw new Error('更新に失敗しました')

      alert('更新しました')
      router.push(`/lists/${id}`)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="投稿編集">
      <Box sx={{ p: 4}}>
        <TextField
          label="対応開始日時"
          type="datetime-local"
          fullWidth
          margin="normal"
          value={formData.startTime ?? ''}
          onChange={(e) => handleChange('startTime', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="対応終了日時"
          type="datetime-local"
          fullWidth
          margin="normal"
          value={formData.endTime ?? ''}
          onChange={(e) => handleChange('endTime', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="対応者"
          fullWidth
          margin="normal"
          value={formData.user?.name || ''}
          disabled
        />
        <TextField
          label="ステータス"
          select
          fullWidth
          margin="normal"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          {Object.entries(postStatusLabel).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="受架電"
          select
          fullWidth
          margin="normal"
          value={formData.inquiryType}
          onChange={(e) => handleChange('inquiryType', e.target.value)}
        >
          {Object.entries(inquiryTypeLabel).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="カテゴリー"
          select
          fullWidth
          margin="normal"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          {Object.entries(categoryLabel).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="入電内容"
          multiline
          rows={3}
          fullWidth
          margin="normal"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
        />
        <TextField
          label="問い合わせ者名"
          fullWidth
          margin="normal"
          value={formData.inquirerName}
          onChange={(e) => handleChange('inquirerName', e.target.value)}
        />
        <TextField
          label="性別"
          select
          fullWidth
          margin="normal"
          value={formData.inquirerGender}
          onChange={(e) => handleChange('inquirerGender', e.target.value)}
        >
          {Object.entries(genderLabel).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="問い合わせ者連絡先"
          fullWidth
          margin="normal"
          value={formData.inquirerPhone}
          onChange={(e) => handleChange('inquirerPhone', e.target.value)}
        />
        <TextField
          label="問い合わせ者 続柄"
          select
          fullWidth
          margin="normal"
          value={formData.inquirerRelationship}
          onChange={(e) => handleChange('inquirerRelationship', e.target.value)}
        >
          {Object.entries(relationshipLabel).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        {formData.inquirerRelationship === 'OTHER' && (
          <TextField
            label="その他の続柄"
            fullWidth
            margin="normal"
            value={formData.inquirerRelationshipOther || ''}
            onChange={(e) => handleChange('inquirerRelationshipOther', e.target.value)}
          />
        )}
        <TextField
          label="備考"
          multiline
          rows={2}
          fullWidth
          margin="normal"
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
        />
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => router.push(`/lists/${id}`)} disabled={saving}>
            キャンセル
          </Button>
        </Stack>
      </Box>
    </Layout>
  )
}
