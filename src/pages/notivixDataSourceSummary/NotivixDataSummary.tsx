import * as React from "react";
import { Box, Typography } from "@mui/material";
import { formatCurrency } from "../../utils/utils";

interface Props {
  totalSummary: Record<string, number>;
  columnMap: Record<string, string>;
  defaultCurrency?: string;
  currencies:string[];
}

export const NotivixDataSummary: React.FC<Props> = ({
  totalSummary,
  columnMap,
  defaultCurrency,
  currencies
}) => {
  const summaryCards = React.useMemo(() => {
    if (!totalSummary) return [];

    return Object.entries(totalSummary).map(([key, value]) => {
      const isConverted = key.startsWith("Converted|");

      let label;

      if (isConverted) {
        label = `${columnMap[key] || key} (${defaultCurrency || "Converted"})`;
      } else {
        label = columnMap[key] || key;
      }

      return {
        label,
        isConverted,
        value: Number(value) || 0,
      };
    });
  }, [totalSummary, columnMap, defaultCurrency]);

  if (!summaryCards.length) return null;

  return (
    <Box
      sx={{
        // position: "sticky",
        top: 0,
        zIndex: 1000,
        // backgroundColor: "#ffffff",
        // borderBottom: "1px solid #e5e7eb",
        py: 2,
        mb: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2,
          width: "100%",
        }}
      >
        {summaryCards.map((item, index) => (
          <Box
            key={index}
            sx={{
              padding: 2,
              borderRadius: 2,
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.8rem",
                color: "#6b7280",
                mb: 0.5,
              }}
            >
              {item.label}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: item.isConverted ? "#2563eb" : "#111827",
              }}
            >
                {
                !item.isConverted
                    ? currencies.length === 1
                    ? formatCurrency(item.value, currencies[0])
                    : "Multiple"
                    : formatCurrency(item.value, defaultCurrency)
                }
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};