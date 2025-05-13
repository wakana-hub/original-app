'use client'

import {
  Box, Typography, CssBaseline, AppBar, Toolbar, IconButton, Drawer,
  Button, ListItem, ListItemButton, ListItemText,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper,
  TextField,
  Tabs,
  Tab,
  Autocomplete,
  List
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
type FilterKey = 'number' | 'date' | 'responder' | 'status' | 'type' | 'category';

export default function ResponseListPage() {
  const drawerWidth = 240;
  const navItems = [
  { label: 'ホーム', path: 'dashboard' },
  { label: '対応履歴一覧', path: '/list' },
  { label: 'ユーザー設定', path: '/settings' },];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const [filters, setFilters] = useState({
    number: '',
    date: '',
    responder: '',
    status: '',
    type: '',
    category: '',
    content: '',
  });
  const [activeTab, setActiveTab] = useState<FilterKey>('date');

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>メニュー</Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
           <ListItem key={item.label} disablePadding>
      <ListItemButton
        sx={{ textAlign: 'center' }}
        onClick={() => router.push(item.path)}
      >
        <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newTab: FilterKey) => {
    setActiveTab(newTab);
  };

  const dummyData = [
    {
      id: '001',
      date: '2025-05-12 10:00',
      person: '田中太郎',
      status: '未完了',
      direction: 'インバウンド',
      category: '問い合わせ',
      content: '商品の納期についての問い合わせです。'
    },
    {
      id: '002',
      date: '2025-05-11 14:30',
      person: '山田花子',
      status: '完了',
      direction: 'アウトバウンド',
      category: 'クレーム対応',
      content: '不良品についての対応を行いました。'
    },
  ];

  const filteredData = dummyData.filter((row) => {
    return (
      row.id.includes(filters.number) &&
      row.date.includes(filters.date) &&
      row.person.includes(filters.responder) &&
      row.status.includes(filters.status) &&
      row.direction.includes(filters.type) &&
      row.category.includes(filters.category) &&
      row.content.includes(filters.content)
    );
  });

  const getUniqueOptions = (key: keyof typeof dummyData[0]) => {
    return [...new Set(dummyData.map((item) => item[key]))];
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ m: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            対応履歴一覧
          </Typography>
          {userName && <Typography sx={{ mr: 2 }}>ようこそ, {userName}</Typography>}
          <Button color="inherit" onClick={handleLogout}>ログアウト</Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => router.push('/create')}　sx={{ width: 'auto' }}>
            新規作成
          </Button>
          <Box
            sx={{
              border: '1px solid #ccc',  // 枠線の色
              borderRadius: 1,           // 角を丸くする
              padding: 2,                // 内側の余白
              mb: 2,                     // 下の余白
              ml: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
          <Typography variant="h6" sx={{ alignSelf: 'center' }}>
          今日の件数: {todayDataCount}件
        </Typography>
        </Box>
        </Box>  
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>フィルター</Typography>

        <Tabs value={activeTab} onChange={handleTabChange} aria-label="フィルタタブ">
          <Tab label="登録番号" value="number" />
          <Tab label="対応開始日" value="date" />
          <Tab label="対応者" value="responder" />
          <Tab label="ステータス" value="status" />
          <Tab label="ステート" value="type" />
          <Tab label="カテゴリー" value="category" />
        </Tabs>
        {activeTab === 'number' && (
          <Autocomplete
          freeSolo
          options={getUniqueOptions('id')} // 'number' を 'id' に変更
          inputValue={filters.number}
          onInputChange={(_, value) => handleFilterChange('number', value)}
          renderInput={(params) => <TextField {...params} label="登録番号" size="small" fullWidth sx={{ mt: 2, mb: 1 }} />}
        />
        )}
        {activeTab === 'date' && (
          <Autocomplete
            freeSolo
            options={getUniqueOptions('date')}
            inputValue={filters.date}
            onInputChange={(_, value) => handleFilterChange('date', value)}
            renderInput={(params) => <TextField {...params} label="対応開始日" size="small" fullWidth sx={{ mt: 2 , mb: 1 }} />}
          />
        )}
        {activeTab === 'responder' && (
          <Autocomplete
            freeSolo
            options={getUniqueOptions('person')}
            inputValue={filters.responder}
            onInputChange={(_, value) => handleFilterChange('responder', value)}
            renderInput={(params) => <TextField {...params} label="対応者" size="small" fullWidth sx={{ mt: 2 , mb: 1 }} />}
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
        {activeTab === 'type' && (
          <Autocomplete
            freeSolo
            options={getUniqueOptions('direction')}
            inputValue={filters.type}
            onInputChange={(_, value) => handleFilterChange('type', value)}
            renderInput={(params) => <TextField {...params} label="ステート" size="small" fullWidth sx={{ mt: 2 , mb: 1 }} />}
          />
        )}
        {activeTab === 'category' && (
          <Autocomplete
            freeSolo
            options={getUniqueOptions('category')}
            inputValue={filters.category}
            onInputChange={(_, value) => handleFilterChange('category', value)}
            renderInput={(params) => <TextField {...params} label="カテゴリー" size="small" fullWidth sx={{ mt: 2 , mb: 1 }} />}
          />
        )}
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
                <TableCell>ステート</TableCell>
                <TableCell>カテゴリー</TableCell>
                <TableCell>入電内容</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.person}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.direction}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.content}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" sx={{ mr: 1 }}>詳細・編集</Button>
                    <Button size="small" color="error" variant="outlined">削除</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
