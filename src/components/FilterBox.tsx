import React from 'react';
import { Box, Stack, FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField, Button, SelectChangeEvent } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dayjs from 'dayjs';

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

type FilterKeys = 'number' | 'dateMonth' | 'dateDay' | 'responder' | 'status' | 'inquiryType' | 'category';

interface Filters {
  number: string;
  dateMonth: string;
  dateDay: string;
  responder: string;
  status: string;
  inquiryType: string;
  category: string;
}

interface FilterBoxProps {
  activeTab: string;
  filters: Filters;
  selectedDate: Date | null;
  handleSelectChange: (event: SelectChangeEvent<string>) => void;
  handleFilterChange: (key: FilterKeys, value: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  getUniqueOptions:  (key: keyof Post) => string[];
}

export const FilterBox: React.FC<FilterBoxProps> = ({
  activeTab,
  filters,
  selectedDate,
  handleSelectChange,
  handleFilterChange,
  setFilters,
  getUniqueOptions,
}) => {
  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: 1,
        p: 2,
        mb: 2,
        width: { xs: '100%', sm: 'auto' },
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel id="filter-label">フィルター項目</InputLabel>
          <Select labelId="filter-label" value={activeTab} label="フィルター項目" onChange={handleSelectChange}>
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
            renderInput={(params) => <TextField {...params} label="登録番号" size="small" fullWidth sx={{ mt: 2, mb: 1, maxWidth: '100%' }} />}
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
                textField: { size: 'small', fullWidth: true, sx: { mt: 2, mb: 1 } },
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
          sx={{ mt: 2 }}
          onClick={() =>
            setFilters({
              number: '',
              dateMonth: '',
              dateDay: '',
              responder: '',
              status: '',
              inquiryType: '',
              category: '',
            })
          }
        >
          フィルターリセット
        </Button>
      </Stack>
    </Box>
  );
};