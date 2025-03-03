import { Box } from '@mui/material';
import GenerateReport from '../../components/atom/report/generateReport';
import { useState } from 'react';
import ReportRequestTable from '../../components/atom/report/reportRequestTable';

export default function Report() {
  const [reload, setReload] = useState(false);
  return (
    <Box
      display="flex"
      flexDirection="column"
      p={2}
      gap={4}
      width="100%"
      bgcolor="#f9f9f9"
      sx={{
        height: 'calc(100vh - 70px)',
        '@media (max-width: 600px)': {
          p: 1,
          gap: 1,
        },
      }}
    >
      <GenerateReport setReload={setReload} />
      <ReportRequestTable setReload={setReload} reload={reload} />
    </Box>
  );
}
