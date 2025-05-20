'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TextField, MenuItem, Box, Button, Stack } from '@mui/material'
import Layout from '../../../components/Layout'
import {
  inquiryTypeLabel,
  genderLabel,
  relationshipLabel,
  categoryLabel,
  postStatusLabel,
} from '@/app/enums'

type User = {
  name: string
}

type Post = {
  id: string
  startTime: string
  endTime: string
  responder: string
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
  user?: User
}

export default function PostDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState<Post | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`/api/posts/${id}`)
      if (!res.ok) {
        alert('投稿が見つかりません')
        router.push('/lists')
        return
      }

      const data = await res.json()
      setFormData(data)
    }

    fetchPost()
  }, [id, router])

  if (!formData) return <div>読み込み中...</div>

  const renderReadOnlyField = (label: string, value: string | undefined) => (
    <TextField
      label={label}
      fullWidth
      margin="normal"
      value={value || ''}
      InputProps={{ readOnly: true }}
    />
  )

  const renderReadOnlySelect = (
    label: string,
    value: string,
    options: Record<string, string>
  ) => (
    <TextField
      label={label}
      select
      fullWidth
      margin="normal"
      value={value}
      inputProps={{ readOnly: true }}
    >
      {Object.entries(options).map(([key, label]) => (
        <MenuItem key={key} value={key}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  )

  return (
    <Layout title="投稿詳細">
      <Box sx={{ p: 4 }}>
        {renderReadOnlyField('対応開始日時', formData.startTime)}
        {renderReadOnlyField('対応終了日時', formData.endTime)}
        {renderReadOnlyField('対応者', formData.user?.name)}
        {renderReadOnlySelect('ステータス', formData.status, postStatusLabel)}
        {renderReadOnlySelect('受架電', formData.inquiryType, inquiryTypeLabel)}
        {renderReadOnlySelect('カテゴリー', formData.category, categoryLabel)}
        {renderReadOnlyField('入電内容', formData.message)}
        {renderReadOnlyField('問い合わせ者名', formData.inquirerName)}
        {renderReadOnlySelect('性別', formData.inquirerGender, genderLabel)}
        {renderReadOnlyField('問い合わせ者連絡先', formData.inquirerPhone)}
        {renderReadOnlySelect('問い合わせ者 続き柄', formData.inquirerRelationship, relationshipLabel)}
        {formData.inquirerRelationship === 'OTHER' &&
          renderReadOnlyField('その他の続き柄', formData.inquirerRelationshipOther)}
        {renderReadOnlyField('備考', formData.remarks)}

        {/* 編集・戻るボタン */}
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/posts/${id}/edit`)}
          >
            編集
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push('/lists')}
          >
            一覧へ戻る
          </Button>
        </Stack>
      </Box>
    </Layout>
  )
}
