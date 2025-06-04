'use client'

import { useEffect, useState, ReactNode } from 'react';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemText, Toolbar, Typography, Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import supabase from '../utils/supabase/supabaseClient';

type Props = {
  children: ReactNode;
  title?: string;
};

const drawerWidth = 240;

export default function Layout({ children, title = 'ダッシュボード' }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const navItems = [
    { label: 'ホーム', path: '/dashboard' },
    { label: '対応履歴一覧', path: '/lists' },
    { label: 'ユーザー設定', path: '/user' },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push('/signin');
        return;
      }
      const userId = session.user.id;
      const name = session.user.user_metadata?.name || (await fetchUserNameFromTable(userId));
      setUserName(name ?? session.user.email ?? null);
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  if (loading) return null;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>メニュー</Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => router.push(item.path)}>
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

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: { xs: 1, sm: 0 } }}>
            {userName && (
              <Typography color="inherit" sx={{ marginRight: 2 }}>
                ユーザー名：{userName}さん
              </Typography>
            )}
            <Button color="inherit" onClick={handleLogout}>ログアウト</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 共通 Drawer（PC/モバイル） */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3 }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
