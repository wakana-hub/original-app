'use client';

import {
  Box, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField,  Autocomplete,
  Button,CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postStatusLabel, inquiryTypeLabel, categoryLabel } from '../enums'; 
import Layout from '../../components/Layout'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import AddIcon from '@mui/icons-material/Add';
import { useSearchParams } from 'next/navigation';
import supabase from '../../utils/supabase/supabaseClient'


dayjs.extend(utc)
dayjs.extend(timezone)

type FilterKey = 'number' | 'date' | 'responder' | 'status' | 'inquiryType' | 'category'| 'message';

type Post = {
  id: string;
  date: string;
  status: string;
  inquiryType: string;
  category: string;
  message: string;
  responder: string | null; 
  startTime: string;

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

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
  setActiveTab(event.target.value as FilterKey);
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
          startTime:post.startTime.replace('T', ' '),
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

const searchParams = useSearchParams();
const dateParam = searchParams.get('date');

useEffect(() => {
    if (!dateParam) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const fetchPostsByDate = async () => {
      setLoading(true);
      const startDate = dayjs(dateParam).startOf('day').toISOString();
      const endDate = dayjs(dateParam).endOf('day').toISOString();

      const { data, error } = await supabase
        .from('post')
        .select('*')
        .gte('startTime', startDate)
        .lte('startTime', endDate);

      if (error) {
        console.error(error);
        setPosts([]);
      } else {
        setPosts(data ?? []);
      }
      setLoading(false);
    };

  fetchPostsByDate();

  const month = dayjs(dateParam).format('MM');
  const day = dayjs(dateParam).format('DD');
  setFilters((prev) => ({
    ...prev,
    dateMonth: month,
    dateDay: day,
  }));
}, [dateParam]);

useEffect(() => {
  const urlMonth = searchParams.get('month');
  const urlDay = searchParams.get('day');
  if (urlMonth && urlDay) {
    setActiveTab('date');
    setFilters((prev) => ({
      ...prev,
      dateMonth: urlMonth,
      dateDay: urlDay,
    }));
  }
}, [searchParams]);


  const filteredData =sortedPosts.filter((row) => {
  console.log('row.date:', row.date);

  const dateObj = dayjs.utc(row.date).tz('Asia/Tokyo');

  
  const month = dateObj.format('MM');
  const day = dateObj.format('DD');

  return (
    (filters.number === '' || String(row.id).includes(filters.number)) &&
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
  const todayDataCount = posts.filter((row) => {
  if (!row?.startTime) return false;
  const rowDate = row.startTime.slice(0, 10);
  return rowDate === todayDate;
}).length;

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
    return <CircularProgress size={40} thickness={5} color="primary" />
;
  }

  

  return (
      <Layout title="対応履歴一覧">
      <Box component="main" sx={{ flexGrow: 1}}>
        <Box 
        display="flex" flexDirection="column" alignItems="flex-start" gap={1} mb={2}>
          <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          color="primary" 
          sx={{
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
          <Box sx={{ 
            border: '1px solid #ccc',
            borderRadius: 1, 
            padding: 1.5, 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap:"wrap" ,
            gap:2,
            }}>
            <Typography variant="h6"sx={{ m: 0 }}>今日の件数: {todayDataCount}件</Typography>
          </Box>
        </Box>

        <Box sx={{ 
          border: '1px solid #ccc', 
          borderRadius: 1, 
          p: 2, 
          mb: 2,
           width: {
      xs: '100%',    // スマホでは全幅
      sm: 'auto',    // タブレット以上では内容に合わせる
    },
          maxWidth: '100%',
          boxSizing: 'border-box',
          }}>
          <Stack spacing={2} > 
          <FormControl fullWidth size="small">
          <InputLabel id="filter-label">フィルター項目</InputLabel>
            <Select
              labelId="filter-label"
              value={activeTab}
              label="フィルター項目"
              onChange={handleSelectChange}
            >
              <MenuItem value="number">登録番号</MenuItem>
              <MenuItem value="date">対応開始日</MenuItem>
              <MenuItem value="responder">対応者</MenuItem>
              <MenuItem value="status">ステータス</MenuItem>
              <MenuItem value="inquiryType">受架電</MenuItem>
              <MenuItem value="category">カテゴリー</MenuItem>
            </Select>
          </FormControl>
          {activeTab === 'number' && (
            <Autocomplete
              freeSolo
              options={getUniqueOptions('id')}
              inputValue={filters.number}
              onInputChange={(_, value) => handleFilterChange('number', value)}
              renderInput={(params) => <TextField {...params} label="登録番号" size="small" fullWidth sx={{ mt: 2, mb: 1 ,maxWidth: '100%'}} />}
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
            color="secondary"
            sx={{ mt: 2}}
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
          </Stack> 
        </Box>


        <Typography variant="h5" gutterBottom>対応履歴一覧</Typography>
        <TableContainer component={Paper}sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>登録番号</TableCell>
                <TableCell>対応開始日時</TableCell>
                <TableCell>対応者名</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>受架電</TableCell>
                <TableCell>カテゴリー</TableCell>
                <TableCell>入電内容</TableCell>
                <TableCell>処理</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{dayjs.utc(row.date).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{row.responder ?? '-'}</TableCell>
                  <TableCell>{postStatusLabel[row.status  as keyof typeof postStatusLabel] ?? row.status}</TableCell>
                  <TableCell>{inquiryTypeLabel[row.inquiryType as keyof typeof inquiryTypeLabel] ?? row.inquiryType}</TableCell>
                   <TableCell>{categoryLabel[row.category as keyof typeof categoryLabel] ?? row.category}</TableCell>
                  <TableCell>
                     <Tooltip title={row.message}>
                     <span>{row.message.length > 15 ? `${row.message.slice(0, 15)}...` : row.message}</span>
                    </Tooltip>
                    </TableCell>
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
