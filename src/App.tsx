import React, { useState } from 'react';
import {
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Typography,
    Stack,
} from '@mui/material';

type TimeType = 'plan' | 'actual';
type Category = '미팅' | '리뷰' | '언플랜드' | '작업';

interface TimeEntry {
    sprintId: string;
    memberId: string;
    type: TimeType;
    times: number[]; // [미팅, 리뷰, 언플랜드, 작업]
}

const categories: Category[] = ['미팅', '리뷰', '언플랜드', '작업'];
const members = [
    { id: 'm1', name: '홍길동' },
    { id: 'm2', name: '김철수' },
];

const sprints = [
    { id: 'S1', name: '2024-1차', start: '2024-06-01', end: '2024-06-14' },
    { id: 'S2', name: '2024-2차', start: '2024-06-15', end: '2024-06-28' },
];

const hardcodedData: TimeEntry[] = [
    { sprintId: 'S1', memberId: 'm1', type: 'plan', times: [5, 2, 1, 12] },
    { sprintId: 'S1', memberId: 'm1', type: 'actual', times: [6, 1, 2, 11] },
    { sprintId: 'S1', memberId: 'm2', type: 'plan', times: [4, 3, 2, 11] },
    { sprintId: 'S1', memberId: 'm2', type: 'actual', times: [5, 2, 2, 11] },
    { sprintId: 'S2', memberId: 'm1', type: 'plan', times: [4, 2, 2, 12] },
    { sprintId: 'S2', memberId: 'm1', type: 'actual', times: [5, 2, 1, 12] },
    { sprintId: 'S2', memberId: 'm2', type: 'plan', times: [5, 2, 1, 12] },
    { sprintId: 'S2', memberId: 'm2', type: 'actual', times: [4, 3, 2, 11] },
];

function percent(work: number, total: number) {
    return total === 0 ? 0 : Math.round((work / total) * 100);
}

export default function App() {
    const [selectedSprint, setSelectedSprint] = useState<string>('S1');
    const [data, setData] = useState(hardcodedData);
    const [tab, setTab] = useState<'current' | 'compare'>('current');

    const sprintEntries = data.filter(e => e.sprintId === selectedSprint);

    const handleTimeChange = (
        memberId: string,
        type: 'plan' | 'actual',
        idx: number,
        value: number
    ) => {
        setData(prev =>
            prev.map(e =>
                e.sprintId === selectedSprint && e.memberId === memberId && e.type === type
                    ? { ...e, times: e.times.map((t, i) => (i === idx ? value : t)) }
                    : e
            )
        );
    };

    const getMemberEntries = (memberId: string) => {
        const plan = sprintEntries.find(e => e.memberId === memberId && e.type === 'plan');
        const actual = sprintEntries.find(e => e.memberId === memberId && e.type === 'actual');
        return { plan, actual };
    };

    function getTeamStats(entries: typeof sprintEntries, type: 'plan' | 'actual') {
        const filtered = members.map(m => entries.find(e => e.memberId === m.id && e.type === type)).filter(Boolean) as typeof sprintEntries;
        const totalWork = filtered.reduce((sum, e) => sum + e.times[3], 0);
        const totalSum = filtered.reduce((sum, e) => sum + e.times.reduce((a, b) => a + b, 0), 0);
        const avgWork = filtered.length ? Math.round(totalWork / filtered.length) : 0;
        const avgPercent = filtered.length
            ? Math.round(filtered.reduce((sum, e) => sum + percent(e.times[3], e.times.reduce((a, b) => a + b, 0)), 0) / filtered.length)
            : 0;
        const percentTotal = percent(totalWork, totalSum);
        return { totalWork, totalSum, avgWork, avgPercent, percentTotal };
    }

    const sprintStats = sprints.map(s => {
        const entries = data.filter(e => e.sprintId === s.id);
        return {
            sprint: s.name,
            plan: getTeamStats(entries, 'plan'),
            actual: getTeamStats(entries, 'actual'),
        };
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                스프린트 시간 관리
            </Typography>
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ mb: 3 }}
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="이번 스프린트" value="current" />
                <Tab label="스프린트 비교" value="compare" />
            </Tabs>
            {tab === 'current' && (
                <>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <FormControl size="small">
                            <InputLabel>스프린트 선택</InputLabel>
                            <Select
                                value={selectedSprint}
                                label="스프린트 선택"
                                onChange={(e: SelectChangeEvent) => setSelectedSprint(e.target.value)}
                                sx={{ minWidth: 140 }}
                            >
                                {sprints.map(s => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2} sx={{
                                        bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: 16, minWidth: 90
                                    }}>이름</TableCell>
                                    {categories.map(c => (
                                        <TableCell key={c} align="center" colSpan={2} sx={{
                                            bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                        }}>{c}</TableCell>
                                    ))}
                                    <TableCell align="center" colSpan={2} sx={{
                                        bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                    }}>합계</TableCell>
                                    <TableCell align="center" colSpan={2} sx={{
                                        bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                    }}>작업비율(%)</TableCell>
                                </TableRow>
                                <TableRow>
                                    {categories.map((c, i) => (
                                        <React.Fragment key={c}>
                                            <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>계획</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>실행</TableCell>
                                        </React.Fragment>
                                    ))}
                                    <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>계획</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>실행</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>계획</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>실행</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {members.map(m => {
                                    const { plan, actual } = getMemberEntries(m.id);
                                    if (!plan || !actual) return null;
                                    const planTotal = plan.times.reduce((a, b) => a + b, 0);
                                    const actualTotal = actual.times.reduce((a, b) => a + b, 0);
                                    const planWork = plan.times[3];
                                    const actualWork = actual.times[3];
                                    return (
                                        <TableRow key={m.id}>
                                            <TableCell sx={{
                                                fontWeight: 700, bgcolor: 'grey.100', color: 'primary.main'
                                            }}>{m.name}</TableCell>
                                            {categories.map((_, idx) => (
                                                <React.Fragment key={idx}>
                                                    <TableCell align="center" sx={{ color: 'grey.700', bgcolor: 'grey.50' }}>
                                                        <TextField
                                                            type="number"
                                                            value={plan.times[idx]}
                                                            size="small"
                                                            variant="standard"
                                                            inputProps={{
                                                                min: 0,
                                                                style: { textAlign: 'center', width: 40, MozAppearance: 'textfield' },
                                                                inputMode: 'numeric',
                                                                pattern: '[0-9]*'
                                                            }}
                                                            sx={{
                                                                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                                                    WebkitAppearance: 'none',
                                                                    margin: 0,
                                                                },
                                                                '& input[type=number]': {
                                                                    MozAppearance: 'textfield'
                                                                }
                                                            }}
                                                            onChange={e => handleTimeChange(m.id, 'plan', idx, Number(e.target.value))}
                                                            onBlur={e => {
                                                                // 0으로 시작하는 값이 있으면 0을 제거
                                                                let val = e.target.value;
                                                                if (/^0[0-9]+/.test(val)) {
                                                                    val = String(Number(val));
                                                                    handleTimeChange(m.id, 'plan', idx, Number(val));
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: 'grey.700', bgcolor: 'grey.50' }}>
                                                        <TextField
                                                            type="number"
                                                            value={actual.times[idx]}
                                                            size="small"
                                                            variant="standard"
                                                            inputProps={{
                                                                min: 0,
                                                                style: { textAlign: 'center', width: 40, MozAppearance: 'textfield' },
                                                                inputMode: 'numeric',
                                                                pattern: '[0-9]*'
                                                            }}
                                                            sx={{
                                                                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                                                    WebkitAppearance: 'none',
                                                                    margin: 0,
                                                                },
                                                                '& input[type=number]': {
                                                                    MozAppearance: 'textfield'
                                                                }
                                                            }}
                                                            onChange={e => handleTimeChange(m.id, 'actual', idx, Number(e.target.value))}
                                                            onBlur={e => {
                                                                // 0으로 시작하는 값이 있으면 0을 제거
                                                                let val = e.target.value;
                                                                if (/^0[0-9]+/.test(val)) {
                                                                    val = String(Number(val));
                                                                    handleTimeChange(m.id, 'actual', idx, Number(val));
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                </React.Fragment>
                                            ))}
                                            <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{planTotal}</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{actualTotal}</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'grey.100' }}>{percent(planWork, planTotal)}%</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'grey.100' }}>{percent(actualWork, actualTotal)}%</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{
                                            bgcolor: 'primary.main', color: 'white', fontWeight: 700
                                        }}>팀 합계</TableCell>
                                        {categories.map(c => (
                                            <TableCell key={c} align="center" sx={{
                                                bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                            }}>{c}</TableCell>
                                        ))}
                                        <TableCell align="center" sx={{
                                            bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                        }}>합계</TableCell>
                                        <TableCell align="center" sx={{
                                            bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                        }}>작업비율(%)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>계획</TableCell>
                                        {categories.map((_, idx) => {
                                            const planSum = members.reduce((sum, m) => {
                                                const entry = getMemberEntries(m.id).plan;
                                                return entry ? sum + entry.times[idx] : sum;
                                            }, 0);
                                            return (
                                                <TableCell key={idx} align="center" sx={{ bgcolor: 'grey.50' }}>{planSum}</TableCell>
                                            );
                                        })}
                                        <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{getTeamStats(sprintEntries, 'plan').totalSum}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{getTeamStats(sprintEntries, 'plan').percentTotal}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>실행</TableCell>
                                        {categories.map((_, idx) => {
                                            const actualSum = members.reduce((sum, m) => {
                                                const entry = getMemberEntries(m.id).actual;
                                                return entry ? sum + entry.times[idx] : sum;
                                            }, 0);
                                            return (
                                                <TableCell key={idx} align="center" sx={{ bgcolor: 'grey.50' }}>{actualSum}</TableCell>
                                            );
                                        })}
                                        <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{getTeamStats(sprintEntries, 'actual').totalSum}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{getTeamStats(sprintEntries, 'actual').percentTotal}%</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{
                                            bgcolor: 'primary.main', color: 'white', fontWeight: 700
                                        }}>팀 평균</TableCell>
                                        {categories.map(c => (
                                            <TableCell key={c} align="center" sx={{
                                                bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                            }}>{c}</TableCell>
                                        ))}
                                        <TableCell align="center" sx={{
                                            bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                        }}>작업량</TableCell>
                                        <TableCell align="center" sx={{
                                            bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600
                                        }}>작업비율(%)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>계획</TableCell>
                                        {categories.map((_, idx) => {
                                            const planAvg = Math.round(
                                                members.reduce((sum, m) => {
                                                    const entry = getMemberEntries(m.id).plan;
                                                    return entry ? sum + entry.times[idx] : sum;
                                                }, 0) / members.length
                                            );
                                            return (
                                                <TableCell key={idx} align="center" sx={{ bgcolor: 'grey.50' }}>{planAvg}</TableCell>
                                            );
                                        })}
                                        <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{getTeamStats(sprintEntries, 'plan').avgWork}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{getTeamStats(sprintEntries, 'plan').avgPercent}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>실행</TableCell>
                                        {categories.map((_, idx) => {
                                            const actualAvg = Math.round(
                                                members.reduce((sum, m) => {
                                                    const entry = getMemberEntries(m.id).actual;
                                                    return entry ? sum + entry.times[idx] : sum;
                                                }, 0) / members.length
                                            );
                                            return (
                                                <TableCell key={idx} align="center" sx={{ bgcolor: 'grey.50' }}>{actualAvg}</TableCell>
                                            );
                                        })}
                                        <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{getTeamStats(sprintEntries, 'actual').avgWork}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>{getTeamStats(sprintEntries, 'actual').avgPercent}%</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </>
            )}
            {tab === 'compare' && (
                <>
                    <Typography variant="h6" fontWeight={700} color="primary" sx={{ mt: 5, mb: 2 }}>
                        여러 스프린트 팀 통계 비교
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2} sx={{
                                        bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: 15, minWidth: 90
                                    }}>스프린트</TableCell>
                                    <TableCell align="center" colSpan={4} sx={{
                                        bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, borderRight: '2px solid #b2d3ff'
                                    }}>계획</TableCell>
                                    <TableCell align="center" colSpan={4} sx={{
                                        bgcolor: '#ffe9e0', color: '#b84a00', fontWeight: 600
                                    }}>실행</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>평균 작업량</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>평균 작업비율(%)</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500 }}>총 작업량</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: 'grey.100', fontWeight: 500, borderRight: '2px solid #b2d3ff' }}>총 작업비율(%)</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: '#fff6f2', color: '#b84a00', fontWeight: 500 }}>평균 작업량</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: '#fff6f2', color: '#b84a00', fontWeight: 500 }}>평균 작업비율(%)</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: '#fff6f2', color: '#b84a00', fontWeight: 500 }}>총 작업량</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: '#fff6f2', color: '#b84a00', fontWeight: 500 }}>총 작업비율(%)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sprintStats.map(stat => (
                                    <TableRow key={stat.sprint}>
                                        <TableCell sx={{
                                            fontWeight: 700, bgcolor: 'grey.100', color: 'primary.main'
                                        }}>{stat.sprint}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: 'grey.50' }}>{stat.plan.avgWork}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: 'grey.50' }}>{stat.plan.avgPercent}%</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: 'grey.50' }}>{stat.plan.totalWork}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: 'grey.50', borderRight: '2px solid #b2d3ff' }}>{stat.plan.percentTotal}%</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: '#fff6f2', color: '#b84a00' }}>{stat.actual.avgWork}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: '#fff6f2', color: '#b84a00' }}>{stat.actual.avgPercent}%</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: '#fff6f2', color: '#b84a00' }}>{stat.actual.totalWork}</TableCell>
                                        <TableCell align="center" sx={{ bgcolor: '#fff6f2', color: '#b84a00' }}>{stat.actual.percentTotal}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Container>
    );
}