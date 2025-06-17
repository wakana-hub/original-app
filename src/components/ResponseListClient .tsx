'use client';

import { Box, Typography, Button, CircularProgress, SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postStatusLabel, inquiryTypeLabel, categoryLabel } from '../../src/app/enums';
import Layout from '../components/Layout';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import AddIcon from '@mui/icons-material/Add';
import { useSearchParams } from 'next/navigation';
import supabase from '../utils/supabase/supabaseClient';
import { FilterBox } from '../components/FilterBox';
import { ResponseListsTable } from '../components/ResponseListsTable';

dayjs.extend(utc);
dayjs.extend(timezone);

type FilterKey =
	| 'number'
	| 'date'
	| 'responder'
	| 'status'
	| 'inquiryType'
	| 'category'
	| 'message';

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

				const normalized = data.map(
					(post: ApiPost): Post => ({
						id: post.id,
						date: post.startTime.replace('T', ' '),
						status: post.status,
						inquiryType: post.inquiryType,
						category: post.category,
						message: post.message,
						responder: post.user?.name || null,
						startTime: post.startTime.replace('T', ' '),
					})
				);
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

	const filteredData = sortedPosts.filter((row) => {
		const dateObj = dayjs.utc(row.date).tz('Asia/Tokyo');

		const month = dateObj.format('MM');
		const day = dateObj.format('DD');

		return (
			(filters.number === '' || String(row.id).includes(filters.number)) &&
			(filters.dateMonth === '' || month === filters.dateMonth) &&
			(filters.dateDay === '' || day === filters.dateDay) &&
			(filters.responder === '' || (row.responder ?? '').includes(filters.responder)) &&
			(filters.status === '' || row.status === labelToKey(filters.status, 'status')) &&
			(filters.inquiryType === '' ||
				row.inquiryType === labelToKey(filters.inquiryType, 'inquiryType')) &&
			(filters.category === '' || row.category === labelToKey(filters.category, 'category'))
		);
	});

	const getUniqueOptions = (key: keyof Post): string[] => {
		const uniqueKeys = [...new Set(posts.map((item) => item[key] ?? '').filter(Boolean))];

		// keyごとに日本語変換する
		if (key === 'status') {
			return uniqueKeys.map((k) => postStatusLabel[k as keyof typeof postStatusLabel] ?? k);
		}
		if (key === 'inquiryType') {
			return uniqueKeys.map((k) => inquiryTypeLabel[k as keyof typeof inquiryTypeLabel] ?? k);
		}
		if (key === 'category') {
			return uniqueKeys.map((k) => categoryLabel[k as keyof typeof categoryLabel] ?? k);
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
		const jpTime = dayjs.utc(row.startTime).tz('Asia/Tokyo');
		const rowDate = jpTime.format('YYYY-MM-DD');
		return rowDate === todayDate;
	}).length;

	const handleDelete = async (id: string) => {
		if (!confirm('本当に削除しますか？')) return;
		try {
			const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
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
		return <CircularProgress size={40} thickness={5} color="primary" />;
	}

	return (
		<Layout title="対応履歴一覧">
			<Box component="main" sx={{ flexGrow: 1 }}>
				<Box display="flex" flexDirection="column" alignItems="flex-start" gap={1} mb={2}>
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
						}}
						onClick={() => router.push('/create')}
					>
						新規作成
					</Button>
					<Box
						sx={{
							border: '1px solid #ccc',
							borderRadius: 1,
							padding: 1.5,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: 2,
						}}
					>
						<Typography variant="h6" sx={{ m: 0 }}>
							今日の件数: {todayDataCount}件
						</Typography>
					</Box>
				</Box>

				<FilterBox
					activeTab={activeTab}
					handleFilterChange={handleFilterChange}
					handleSelectChange={handleSelectChange}
					filters={filters}
					selectedDate={selectedDate}
					setFilters={setFilters}
					getUniqueOptions={getUniqueOptions}
				/>

				<ResponseListsTable
					data={filteredData}
					onDelete={handleDelete}
					postStatusLabel={postStatusLabel}
					inquiryTypeLabel={inquiryTypeLabel}
					categoryLabel={categoryLabel}
				/>
			</Box>
		</Layout>
	);
}
