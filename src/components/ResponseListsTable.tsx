import {
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/navigation';

dayjs.extend(utc);
dayjs.extend(timezone);

type RowType = {
	id: string;
	date: string;
	responder?: string | null;
	status: string;
	inquiryType: string;
	category: string;
	message: string;
};

type LabelMap = {
	[key: string]: string;
};

type Props = {
	data: RowType[];
	postStatusLabel: LabelMap;
	inquiryTypeLabel: LabelMap;
	categoryLabel: LabelMap;
	onDelete: (id: string) => void;
};

export const ResponseListsTable: React.FC<Props> = ({
	data,
	postStatusLabel,
	inquiryTypeLabel,
	categoryLabel,
	onDelete,
}) => {
	const router = useRouter();

	return (
		<>
			<Typography variant="h5" gutterBottom>
				対応履歴一覧
			</Typography>
			<TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
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
						{data.map((row) => (
							<TableRow key={row.id}>
								<TableCell>{row.id}</TableCell>
								<TableCell>
									{dayjs
										.utc(row.date)
										.tz('Asia/Tokyo')
										.format('YYYY-MM-DD HH:mm')}
								</TableCell>
								<TableCell>{row.responder ?? '-'}</TableCell>
								<TableCell>
									{postStatusLabel[row.status as keyof typeof postStatusLabel] ??
										row.status}
								</TableCell>
								<TableCell>
									{inquiryTypeLabel[
										row.inquiryType as keyof typeof inquiryTypeLabel
									] ?? row.inquiryType}
								</TableCell>
								<TableCell>
									{categoryLabel[row.category as keyof typeof categoryLabel] ??
										row.category}
								</TableCell>
								<TableCell>
									<Tooltip title={row.message}>
										<span>
											{row.message.length > 15
												? `${row.message.slice(0, 15)}...`
												: row.message}
										</span>
									</Tooltip>
								</TableCell>
								<TableCell>
									<Button
										size="small"
										variant="outlined"
										sx={{ mr: 1 }}
										onClick={() => router.push(`/lists/${row.id}`)}
									>
										詳細・編集
									</Button>
									<Button
										size="small"
										color="error"
										variant="outlined"
										onClick={() => onDelete(row.id)}
									>
										削除
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
};
