'use client'

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashBoard() {
  const drawerWidth = 240;
  const navItems = [
  { label: 'ホーム', path: 'dashboard' },
  { label: '対応履歴一覧', path: '/list' },
  { label: 'ユーザー設定', path: '/settings' },
];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // ユーザー名を追加
  const [loading, setLoading] = useState(true);
   const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs()); // 
   
   // 例: サーバーやSupabaseから取得した対応履歴のある日付リスト
  const activeDates = [
  '2025-05-11',
  '2025-05-12',
  ]
  const data = [
  { date: '2025-05-10', count: 2 },
  { date: '2025-05-11', count: 5 },
  { date: '2025-05-12', count: 3 },
];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

 const isDateEnabled = (date: Dayjs) => {
  const formatted = date.format('YYYY-MM-DD');
  return activeDates.includes(formatted);
};

  const handleDateChange = (date: Dayjs | null) => {
  if (!date || !isDateEnabled(date)) return; // 有効な日付以外は無視
  const isoDate = date.format('YYYY-MM-DD');
  router.push(`/list?date=${isoDate}`);
};

  const router = useRouter();

  const handleLogout = () => {
    // ログアウト処理（localStorageから情報を削除）
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/signin'); // ← ログイン画面に移動
  };

  useEffect(() => {
    // ログインしたユーザー情報をlocalStorageから取得
    const storedUser = localStorage.getItem('user');
    console.log("取得したユーザー情報:", storedUser); 

    if (!storedUser) {
      console.log("ユーザー情報がないためサインインページにリダイレクトします");
      router.push('/signin'); // ユーザー情報がない場合はサインインページへリダイレクト
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserName(user?.name || null);
      setLoading(false); // ロード完了
    } catch (error) {
      console.error("ユーザー情報の読み込みエラー:", error);
      setUserName(null); // セッション情報が不正な場合、ユーザー名をnullに設定
     setLoading(false); // ローディング完了
      router.push('/signin'); // エラーがあればサインインページにリダイレクト
    }
  }, [router]);
  
  if (loading) {
  return null;
}

   const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        メニュー
      </Typography>
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ m: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            DashBoard
          </Typography>
          {/* ユーザー名を表示 */}
          {userName && <Typography color="inherit" sx={{ marginRight: 2 }}>ようこそ, {userName}</Typography>}
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

      <Box component="main" sx={{ flexGrow: 1, p: 3, }}>
        <Toolbar />

        {/* 対応履歴一覧への遷移ボタン */}
         <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/list')} // クリック時に「対応履歴一覧」ページへ遷移
           sx={{
            mt: 3,
            alignSelf: 'flex-start',     // 左寄せ
            backgroundColor: '#4caf50',  // 好みの色（緑系例：AppBarと差別化）
            color: '#fff',               // テキスト白
            fontSize: '1.1rem',          // フォント大きめ
            px: 4,                       // 横パディング多め
            py: 2,                       // 縦パディング多め
            '&:hover': {
              backgroundColor: '#43a047', // ホバー色調整
            },
          }}
        >
          対応履歴一覧
        </Button>
      </Box>
      
        {/* カレンダー */}
      <Box sx={{ mt: 4}}>
        <Typography variant="h6" gutterBottom>対応履歴カレンダー</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            shouldDisableDate={(date) => !isDateEnabled(date)}
            sx={{
        display: 'flex', 
        justifyContent: 'flex-start'  ,
        marginLeft: 0, // 左側のマージンを無くす
        width: '100%', // 幅を100%に設定
        maxWidth: '600px', // 最大幅を設定
        height: 'auto', // 高さも自動で調整
        '& .MuiDayPicker-root': {
          fontSize: '1.5rem', // 日付のフォントサイズを大きく
        }
        }}
          />
        </LocalizationProvider>
      </Box>
            <Box sx={{flex: 1, minWidth: 300,height: 'auto' }}>
      <Typography variant="h6" gutterBottom>対応履歴の件数</Typography>
      <ResponsiveContainer width="60%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
      </Box>
      </Box>
      </Box>
  );
}
