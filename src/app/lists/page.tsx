'use client';

import {
  Box, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Tabs, Tab, Autocomplete,
  Button
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postStatusLabel, inquiryTypeLabel, categoryLabel } from '../enums'; 
import Layout from '../../components/Layout'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs"

type FilterKey = 'number' | 'date' | 'responder' | 'status' | 'inquiryType' | 'category'| 'message';

type Post = {
  id: string;
  date: string;
  status: string;
  inquiryType: string;
  category: string;
  message: string;
  responder: string | null; // ← user.name をここに格納
};

type ApiPost = {
  id: string;
  startTime: string;
  status: string;
  inquiryType: string;
  category: string;
  message: string;
  user: {
    name: string;
  } | null;
};

export default function ResponseListPage() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    number: '',
    dateMonth: '',  
    dateDay: '',  
    responder: '',
    status: '',
    inquiryType: '',
    category: '',
    message:'',
  });
  const [activeTab, setActiveTab] = useState<FilterKey>('date');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newTab: FilterKey) => {
    setActiveTab(newTab);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/lists'); 
        const data = await res.json();
        if (!res.ok) {
          console.error('APIエラー:', data.error);
          setLoading(false);
          return;
        }

        console.log(data)

        const normalized = data.map((post: ApiPost): Post => ({
          id: post.id,
          date: post.startTime.replace('T', ' '),
          status: post.status,
          inquiryType: post.inquiryType,
          category: post.category,
          message: post.message,
          responder: post.user?.name || null,
        }));
        setPosts(normalized);
      } catch (e) {
        console.error('通信エラー:', e);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const labelToKey = (label: string, key: keyof Post): string => {
  if (key === 'status') {
    const foundKey = Object.entries(postStatusLabel).find(([, v]) => v === label)?.[0];
    return foundKey ?? label;
  }
  if (key === 'inquiryType') {
    const foundKey = Object.entries(inquiryTypeLabel).find(([, v]) => v === label)?.[0];
    return foundKey ?? label;
  }
  if (key === 'category') {
    const foundKey = Object.entries(categoryLabel).find(([, v]) => v === label)?.[0];
    return foundKey ?? label;
  }
  return label;
};

const sortedPosts = [...posts].sort((a, b) => {
  const numA = Number(a.id);
  const numB = Number(b.id);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.id.localeCompare(b.id);
});

  const filteredData =sortedPosts.filter((row) => {
  const dateObj = dayjs(row.date); 
  const month = dateObj.format('MM');
  const day = dateObj.format('DD');

  return (
    (filters.number === '' || row.id.includes(filters.number)) &&
    (filters.dateMonth === '' || month === filters.dateMonth) &&
    (filters.dateDay === '' || day === filters.dateDay) &&
    (filters.responder === '' || (row.responder ?? '').includes(filters.responder)) &&
    (filters.status === '' || row.status === labelToKey(filters.status, 'status')) &&
    (filters.inquiryType === '' || row.inquiryType === labelToKey(filters.inquiryType, 'inquiryType')) &&
    (filters.category === '' || row.category === labelToKey(filters.category, 'category')) &&
    (filters.message === '' || row.message.includes(filters.message))
  );
});

  const getUniqueOptions = (key: keyof Post): string[] => {
  const uniqueKeys = [...new Set(posts.map((item) => item[key] ?? '').filter(Boolean))];
  
  // keyごとに日本語変換する
  if (key === 'status') {
    return uniqueKeys.map(k => postStatusLabel[k as keyof typeof postStatusLabel] ?? k);
  }
  if (key === 'inquiryType') {
    return uniqueKeys.map(k => inquiryTypeLabel[k as keyof typeof inquiryTypeLabel] ?? k);
  }
  if (key === 'category') {
    return uniqueKeys.map(k => categoryLabel[k as keyof typeof categoryLabel] ?? k);
  }
  // その他はそのまま返す
  return uniqueKeys;
};

  

  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();
  const todayDataCount = filteredData.filter((row) => row.date.includes(todayDate)).length;

  const handleDelete = async (id: string) => {
  if (!confirm('本当に削除しますか？')) return;
  try {
    const res = await fetch(`/api/lists/${id}`,
     { method: 'DELETE' });
    if (!res.ok) {
      alert('削除に失敗しました');
      return;
    }
    setPosts((prev) => prev.filter((post) => post.id !== id));
  } catch (error) {
    console.error('削除エラー:', error);
    alert('削除に失敗しました');
  }
};

   const selectedDate: Date | null =
    filters.dateMonth && filters.dateDay
      ? dayjs(`2025-${filters.dateMonth}-${filters.dateDay}`).toDate()
      : null;

  if (loading) {
    return <Box sx={{ p: 5 }}><Typography>読み込み中...</Typography></Box>;
  }

  return (
      <Layout title="対応履歴一覧">
      <Box component="main" sx={{ flexGrow: 1}}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button variant="contained" color="primary" sx={{
            mt: 3,
            alignSelf: 'flex-start', 
            backgroundColor: '#4caf50', 
            color: '#fff', 
            fontSize: '1.1rem',   
            px: 4,                       
            py: 2,   
            '&:hover': {
              backgroundColor: '#43a047', // ホバー色調整
            },
          }}onClick={() => router.push('/create')}>新規作成</Button>
          <Box sx={{ border: '1px solid #ccc', borderRadius: 1, padding: 1.5, ml: 3 ,display: 'flex',justifyContent: 'center' ,alignItems: 'center',}}>
            <Typography variant="h6"sx={{ mb: 0 }}>今日の件数: {todayDataCount}件</Typography>
          </Box>
        </Box>

        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>フィルター</Typography>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="登録番号" value="number" />
            <Tab label="対応開始日" value="date" />
            <Tab label="対応者" value="responder" />
            <Tab label="ステータス" value="status" />
            <Tab label="受架電" value="inquiryType" />
            <Tab label="カテゴリー" value="category" />
          </Tabs>
          {activeTab === 'number' && (
            <Autocomplete
              freeSolo
              options={getUniqueOptions('id')}
              inputValue={filters.number}
              onInputChange={(_, value) => handleFilterChange('number', value)}
              renderInput={(params) => <TextField {...params} label="登録番号" size="small" fullWidth sx={{ mt: 2, mb: 1 }} />}
            />
          )}
            {activeTab === 'date' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="対応開始日"
                value={selectedDate}
                onChange={(date) => {
                  if (date) {
                     const d = dayjs.isDayjs(date) ? date.toDate() : date;
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    handleFilterChange('dateMonth', month);
                    handleFilterChange('dateDay', day);
                  } else {
                    handleFilterChange('dateMonth', '');
                    handleFilterChange('dateDay', '');
                  }
              }}
                slotProps={{
                  textField: { size: 'small', fullWidth: true, sx: { mt: 2, mb: 1 } }
                }}
                    />
                  </LocalizationProvider>
                )}

          {activeTab === 'responder' && (
            <Autocomplete
              freeSolo
              options={getUniqueOptions('responder')}
              inputValue={filters.responder}
              onInputChange={(_, value) => handleFilterChange('responder', value)}
              renderInput={(params) => <TextField {...params} label="対応者" size="small" fullWidth sx={{ mt: 2, mb: 1 }} />}
            />
          )}
          {activeTab === 'status' && (
            <Autocomplete
              freeSolo
              options={getUniqueOptions('status')}
              inputValue={filters.status}
              onInputChange={(_, value) => handleFilterChange('status', value)}
              renderInput={(params) => <TextField {...params} label="ステータス" size="small" fullWidth sx={{ mt: 2, mb: 1 }} />}
            />
          )}
          {activeTab === 'inquiryType' && (
            <Autocomplete
              freeSolo
              options={getUniqueOptions('inquiryType')}
              inputValue={filters.inquiryType}
              onInputChange={(_, value) => handleFilterChange('inquiryType', value)}
              renderInput={(params) => <TextField {...params} label="受架電" size="small" fullWidth sx={{ mt: 2, mb: 1 }} />}
            />
          )}
          {activeTab === 'category' && (
            <Autocomplete
              freeSolo
              options={getUniqueOptions('category')}
              inputValue={filters.category}
              onInputChange={(_, value) => handleFilterChange('category', value)}
              renderInput={(params) => <TextField {...params} label="カテゴリー" size="small" fullWidth sx={{ mt: 2, mb: 1 }} />}
            />
          )}
          <Button
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            onClick={() =>
              setFilters({
                number: '',
                dateMonth: '',
                dateDay: '',
                responder: '',
                status: '',
                inquiryType: '',
                category: '',
                message: '',
              })
            }
          >
            フィルターリセット
          </Button> 
        </Box>


        <Typography variant="h5" gutterBottom>対応履歴一覧</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>登録番号</TableCell>
                <TableCell>対応開始日時</TableCell>
                <TableCell>対応者名</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>受架電</TableCell>
                <TableCell>カテゴリー</TableCell>
                <TableCell>入電内容</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.responder ?? '-'}</TableCell>
                  <TableCell>{postStatusLabel[row.status  as keyof typeof postStatusLabel] ?? row.status}</TableCell>
                  <TableCell>{inquiryTypeLabel[row.inquiryType as keyof typeof inquiryTypeLabel] ?? row.inquiryType}</TableCell>
                  <TableCell>{categoryLabel[row.category as keyof typeof categoryLabel] ?? row.category}</TableCell>
                  <TableCell>{row.message.length > 15 ? `${row.message.slice(0, 15)}...` : row.message}</TableCell>
                  <TableCell>
                    <Button 
                    size="small" 
                    variant="outlined" 
                    sx={{ mr: 1 }}
                    onClick={() => router.push(`/lists/${row.id}`)}>詳細・編集</Button>
                    <Button 
                    size="small" 
                    color="error" 
                    variant="outlined"
                    onClick={() => handleDelete(row.id)}>
                    削除</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
}
