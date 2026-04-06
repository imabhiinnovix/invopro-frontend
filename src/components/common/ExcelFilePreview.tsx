import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  TextField,
} from "@mui/material";
import * as XLSX from "xlsx";

interface Props {
  fileUrl?: string | null;
}

export default function ExcelFilePreview({ fileUrl }: Props) {
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);

  const [fullData, setFullData] = useState<Record<string, any>[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [visibleCount, setVisibleCount] = useState(100);

  useEffect(() => {
  setVisibleCount(100);
}, [search, activeSheet, fullData]);

  const isExcel =
    fileUrl?.endsWith(".xlsx") || fileUrl?.endsWith(".xls");

  // 🔹 Load Excel file
  useEffect(() => {
    if (!fileUrl || !isExcel) return;

    setLoading(true);

    fetch(fileUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const wb = XLSX.read(buffer, { type: "array" });
        setWorkbook(wb);
        setSheets(wb.SheetNames);
        setActiveSheet(0);
      })
      .catch(() => {
        setFullData([]);
      })
      .finally(() => setLoading(false));
  }, [fileUrl]);

  // 🔹 Parse sheet (FIXED alignment)
  useEffect(() => {
    if (!workbook || sheets.length === 0) return;

    const sheet = workbook.Sheets[sheets[activeSheet]];

    const json = XLSX.utils.sheet_to_json(sheet, {
      defval: "", // ✅ FIX: prevents undefined & shifting
    });

    setFullData(json);
  }, [activeSheet, workbook, sheets]);

  // 🔍 Search across FULL dataset
  const filteredData = useMemo(() => {
    if (!search) return fullData;

    const lower = search.toLowerCase();

    return fullData.filter((row) =>
      Object.values(row).some((cell) =>
        String(cell).toLowerCase().includes(lower)
      )
    );
  }, [search, fullData]);

  // 🔹 Limit visible rows (performance)
 const displayData = filteredData.slice(0, visibleCount);

 const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

  // near bottom
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    setVisibleCount((prev) =>
      prev < filteredData.length ? prev + 100 : prev
    );
  }
};

  // 🔹 Extract headers
  const headers =
    displayData.length > 0
      ? Object.keys(displayData[0])
      : fullData.length > 0
      ? Object.keys(fullData[0])
      : [];

  if (!fileUrl || !isExcel) return null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      border="1px solid #ddd"
      borderRadius={1}
      height="800px"
      display="flex"
      flexDirection="column"
    >
      {/* 🔍 Search */}
      <Box p={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search entire Excel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* 📄 Sheet Tabs */}
      <Tabs value={activeSheet} onChange={(_, v) => setActiveSheet(v)}>
        {sheets.map((sheet, i) => (
          <Tab key={i} label={sheet} />
        ))}
      </Tabs>

      {/* 📊 Info */}
      <Box px={2} py={1}>
        <Typography variant="caption">
          Showing {displayData.length} of {filteredData.length} rows
        </Typography>
      </Box>

      {/* 📋 Table */}
      <Box flex={1} overflow="auto" p={1} onScroll={handleScroll}>
        {displayData.length === 0 ? (
          <Typography align="center">No data found</Typography>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px",
                      background: "#f5f5f5",
                      fontWeight: 600,
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayData.map((row, i) => (
                <tr key={i}>
                  {headers.map((header, j) => (
                    <td
                      key={j}
                      style={{
                      border: "1px solid #ccc",
                        padding: "6px",
                        fontSize: 12,
                      }}
                    >
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </Box>
  );
}