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
import isoWeek from 'dayjs/plugin/isoWeek';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import supabase from '../../utils/supabase/supabaseClient'

dayjs.extend(isoWeek);

export default function DashBoard() {
  const drawerWidth = 240;
  const navItems = [
  { label: 'ホーム', path: '/dashboard' },
  { label: '対応履歴一覧', path: '/lists' },
  { label: 'ユーザー設定', path: '/user' },
];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // ユーザー名を追加
  const [loading, setLoading] = useState(true);
   const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs()); 
   const [activeDates, setActiveDates] = useState<string[]>([]);
  const [data, setData] = useState<{ date: string; count: number }[]>([]); 

   
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

 const isDateEnabled = (date: Dayjs | Date) => {
  const dayjsDate = dayjs(date); 
   const formatted = dayjsDate.format('YYYY-MM-DD');
  return activeDates.includes(formatted);
};
  const router = useRouter();

 const handleDateChange = (value: Dayjs | Date | null) => {
  if (!value) return;

  const date = dayjs(value);  
   if (!date.isValid() || !isDateEnabled(date)) return;

  setSelectedDate(date);
  const isoDate = date.format('YYYY-MM-DD');
  router.push(`/lists?date=${isoDate}`);
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  // ここでユーザー名を user テーブルから取得する関数を作成
  const fetchUserNameFromTable = async (userId: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('user') 
      .select('name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('ユーザー名取得エラー:', error);
      return null;
    }
    return data?.name || null;
  };

   const fetchPostSummary = async () => {
    const today = dayjs();
    const startOfWeek = today.startOf('isoWeek');
    const endOfWeek = today.endOf('isoWeek');

    const { data, error } = await supabase
      .from('post')
      .select('startTime')
      .gte('startTime',startOfWeek.toISOString())
      .lte('startTime',endOfWeek.toISOString());

    if (error || !data) return;

    const counts: Record<string, number> = {};

    for (let i = 0; i < 7; i++) {
      const date =  startOfWeek.add(i, 'day').format('YYYY-MM-DD');
      counts[date] = 0;
    }

     for (const post of data) {
    const date = dayjs(post.startTime).format('YYYY-MM-DD');
    if (counts[date] !== undefined) {
      counts[date]++;
    }
  }

    const summary = Object.entries(counts)
      .map(([date, count]) => ({ date, count }))

    setData(summary);
    setActiveDates(summary.filter(item => item.count > 0).map(item => item.date));
    console.log("有効日付:", summary.filter(item => item.count > 0).map(item => item.date));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log(session)

      if (sessionError || !session) {
        console.log("ログインセッションなし → サインインへ");
        router.push('/signin');
        return;
      }

      const userId = session.user.id;

      // user_metadataからname取得を試みる
      const nameFromMetadata = session.user.user_metadata?.name;

      if (nameFromMetadata) {
        setUserName(nameFromMetadata);
      } else {
        // なければ自作userテーブルから取得
        const nameFromTable = await fetchUserNameFromTable(userId);
        setUserName(nameFromTable?? session.user.email?? null);
      }
      setLoading(false);
    };

    fetchUser();
    fetchPostSummary();
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
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ m: 2 }}
          >
            <MenuIcon />
          </IconButton>
          </Box>

           <Box sx={{ flexGrow: 1}}>
          <Typography
            variant="h6"
            component="div"
           sx={{ textAlign: 'left' }}
          >
            DashBoard
          </Typography>
          </Box>
          {/* ユーザー名を表示 */}
           <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userName && (
            <Typography 
            variant="body1"
            color="inherit" sx={{
            display: { xs: 'none', sm: 'block' },
            mr: 2,
            whiteSpace: 'nowrap'
          }}>
            ユーザ名： {userName}さん
          </Typography>)}
          <Button color="inherit"onClick={handleLogout}>ログアウト</Button>
          </Box>
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
          onClick={() => router.push('/lists')} // クリック時に「対応履歴一覧」ページへ遷移
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
      
      <Box
  sx={{
    display: 'flex',
    flexDirection:{xs:'column',md:'row'},
    justifyContent: 'center',
    gap: 4,
    mt: 4,
  }}
>
  {/* カレンダー */}
  <Box sx={{ flex: 1, width: { xs: '100%', md: '60%' } }}>
        <Typography variant="h6" gutterBottom>対応履歴カレンダー</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            shouldDisableDate={(date) => !isDateEnabled(date)}
            sx={{
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
            <Box sx={{ flex: 1, width: { xs: '100%', md: '60%' }, height: 300 }}>
      <Typography variant="h6" gutterBottom>対応履歴件数（月曜～日曜日）</Typography>
      <ResponsiveContainer width="100%" height={300}>
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
      </Box>
  );
}