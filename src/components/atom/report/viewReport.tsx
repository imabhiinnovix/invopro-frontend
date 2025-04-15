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
  reportDetailData: string;
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
const ViewReport: React.FC<ViewReportProps> = ({
  setViewReportRequestId,
  reportDetailData,
  viewReportRequestId,
  targetRef,
}) => {
  const allReportData = useGet<ReportRequestData>(
    [`allReportData`, String(viewReportRequestId), String(reportDetailData)],
    GET?.Custom_Report + `/view/${viewReportRequestId}/${reportDetailData}`,
    !!viewReportRequestId
  );
  return (
    <Box sx={{ width: '100%', marginBottom: 5 }}>
      <StyledTableContainer>
        <Table size="small" aria-label="dynamic report table">
          <TableBody>
            {allReportData.data?.sections.map((section, sectionIndex) => {
              const subSections = section.subSections || [];
              const isRowView = section?.view === 'row' || subSections[0]?.view === 'row';
              const isColumnView = section?.view === 'column' || subSections[0]?.view === 'column';
              const formatColor = (color?: string) => (color ? `#${color}` : undefined);
              return (
                <React.Fragment key={`section-${sectionIndex}`}>
                  {(section.sectionName || section.spanColumns) && (
                    <TableRow>
                      <DynamicCell
                        colSpan={(allReportData.data?.data.length ?? 0) + 1}
                        align={section.sectionHorizontalAlignment || 'center'}
                        bgColor={formatColor(section.sectionBackGroundColor)}
                        textColor={formatColor(section.sectionColor)}
                        fontWeight="bold"
                      >
                        {section.sectionName}
                      </DynamicCell>
                    </TableRow>
                  )}
                  {isRowView &&
                    subSections.map((subSection, subIndex) => (
                      <TableRow key={`subrow-${subIndex}`}>
                        <DynamicCell
                          bgColor={formatColor(subSection.headerBackGroundColor)}
                          textColor={formatColor(subSection.headerColor)}
                          fontWeight="bold"
                          align={subSection.horizontalAlignment || 'left'}
                        >
                          {subSection.headerName}
                        </DynamicCell>

                        {allReportData.data?.data.map((rowData, dataIndex) => (
                          <DynamicCell
                            key={`rowdata-${dataIndex}`}
                            bgColor={formatColor(subSection.headerBackGroundColor)}
                            textColor={formatColor(subSection.headerColor)}
                            fontWeight="normal"
                            align={subSection.horizontalAlignment || 'center'}
                          >
                            {formatValue({
                              value: rowData[subSection.headerName],
                              type: subSection.type,
                            })}
                          </DynamicCell>
                        ))}
                      </TableRow>
                    ))}

                  {isColumnView && (
                    <>
                      <TableRow>
                        {subSections.map((subSection, subIndex) => (
                          <DynamicCell
                            key={`header-${subIndex}`}
                            bgColor={formatColor(subSection.headerBackGroundColor)}
                            textColor={formatColor(subSection.headerColor)}
                            fontWeight="bold"
                            align={subSection.horizontalAlignment || 'center'}
                          >
                            {subSection.headerName}
                          </DynamicCell>
                        ))}
                      </TableRow>

                      {(allReportData.data?.data || []).map((rowData, rowIndex) => (
                        <TableRow key={`row-${rowIndex}`}>
                          {subSections.map((subSection, subIndex) => {
                            const isTotalRow = rowData?.STC === 'Totals';
                            const backgroundColor = isTotalRow
                              ? formatColor(subSection.lastCellBackGroundColor)
                              : 'transparent';

                            return (
                              <DynamicCell
                                key={`cell-${rowIndex}-${subIndex}`}
                                bgColor={backgroundColor}
                                textColor={formatColor(subSection.headerColor)}
                                fontWeight="normal"
                                align={subSection.horizontalAlignment || 'center'}
                              >
                                {formatValue({
                                  value: rowData[subSection.headerName],
                                  type: subSection.type,
                                })}
                              </DynamicCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </>
                  )}
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
