'use client';
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';

// Styled components for custom table styling
const StyledTableContainer = styled(TableContainer)({
  maxWidth: '100%',
  overflowX: 'auto',
  border: '1px solid #ccc',
  boxShadow: 'none',
});

// Dynamic styled cell component that takes color props
const DynamicCell = styled(TableCell)<{
  bgColor?: string;
  textColor?: string;
  align?: 'left' | 'center' | 'right';
  fontWeight?: string;
}>(({ bgColor, textColor, align, fontWeight }) => ({
  backgroundColor: bgColor ? `#${bgColor}` : 'transparent',
  color: textColor ? `#${textColor}` : 'inherit',
  padding: '6px',
  textAlign: align || 'left',
  border: '1px solid #ccc',
  fontSize: '0.8rem',
  fontWeight: fontWeight || 'normal',
}));

// Format value based on type
const formatValue = ({ value, type }: { value: any; type: string }) => {
  if (value === undefined || value === null) return '';

  if (type === 'percentage') {
    return typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : value;
  }

  if (type === 'usdk' && typeof value === 'number') {
    // Format currency values
    if (value >= 1000) {
      return `$ ${(value / 1000).toFixed(2)} K`;
    }
    return value.toString();
  }

  return value;
};

interface ViewReportProps {
  setViewReportRequestId: React.Dispatch<React.SetStateAction<string>>;
  viewReportRequestId: string;
  targetRef: any;
}

type Alignment = 'left' | 'center' | 'right';

type HeaderType = 'string' | 'number' | 'percentage';

interface SubSection {
  headerName: string;
  headerBackGroundColor: string;
  headerColor: string;
  horizontalAlignment: Alignment;
  verticalAlignment: Alignment;
  type: HeaderType;
  spanColumns: boolean;
}

interface Section {
  sectionName: string;
  sectionBackGroundColor: string;
  sectionColor: string;
  sectionHorizontalAlignment: Alignment;
  sectionVerticalAlignment: Alignment;
  spanColumns: boolean;
  subSections: SubSection[];
}

interface ReportRequestData {
  success: boolean;
  data: Record<string, any>[];
  sections: Section[];
}
const ViewReport: React.FC<ViewReportProps> = ({ setViewReportRequestId, viewReportRequestId, targetRef }) => {
  const allReportData = useGet<ReportRequestData>(
    [`allReportData`, String(viewReportRequestId)],
    GET?.Custom_Report + `/view/${viewReportRequestId}`,
    !!viewReportRequestId
  );
  return (
    <Box sx={{ width: '100%', marginBottom: 5 }} ref={targetRef}>
      <StyledTableContainer>
        <Table size="small" aria-label="patent portfolio table">
          <TableHead></TableHead>
          <TableBody>
            {allReportData.data?.sections.map((section, sectionIndex) => {
              return (
                <React.Fragment key={`section-${sectionIndex}`}>
                  {(section.sectionName || section.spanColumns) && (
                    <TableRow>
                      <DynamicCell
                        bgColor={section.sectionBackGroundColor}
                        textColor={section.sectionColor}
                        fontWeight="bold"
                        align="center"
                        colSpan={allReportData.data?.data.length + 1}
                      >
                        {section.sectionName}
                      </DynamicCell>
                    </TableRow>
                  )}
                  {section.subSections?.map((subSection, subIndex) => (
                    <TableRow key={`subsection-${sectionIndex}-${subIndex}`}>
                      <DynamicCell
                        bgColor={subSection.headerBackGroundColor}
                        textColor={subSection.headerColor}
                        fontWeight="bold"
                        align="center"
                      >
                        {subSection.headerName}
                      </DynamicCell>
                      {allReportData.data?.data.map((data: any, dataIndex) => (
                        <DynamicCell
                          key={`data-${sectionIndex}-${subIndex}-${dataIndex}`}
                          bgColor={subSection.headerBackGroundColor}
                          textColor={subSection.headerColor}
                          fontWeight="bold"
                          align="center"
                        >
                          {formatValue({
                            value: data[subSection.headerName],
                            type: subSection.type,
                          })}
                        </DynamicCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  );
};

export default ViewReport;
