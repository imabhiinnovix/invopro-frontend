'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Styled components for custom table styling
const StyledTableContainer = styled(TableContainer)({
  maxWidth: '100%',
  overflowX: 'auto',
  border: '1px solid #ccc',
  boxShadow: 'none',
});

// Zoom container with scroll capabilities
const ZoomContainer = styled(Box)<{ scale: number }>(({ scale }) => ({
  transform: `scale(${scale})`,
  transformOrigin: 'top left',
  transition: 'transform 0.3s ease',
  width: 'fit-content',
  minWidth: '100%',
}));

// Scroll container to enable scrolling when zoomed
const ScrollContainer = styled(Box)<{ scale: number; maxHeight?: number }>(({ scale, maxHeight }) => ({
  overflow: 'auto',
  maxHeight: scale > 1 && maxHeight && maxHeight > 0 ? `${maxHeight}px` : '100%',
  width: '100%',
  position: 'relative',
}));

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
  maxHeight?: number;
  isZoom?: boolean;
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
  maxHeight,
  isZoom,
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const allReportData = useGet<ReportRequestData>(
    [`allReportData`, String(viewReportRequestId), String(reportDetailData)],
    GET?.Custom_Report + `/view/${viewReportRequestId}/${reportDetailData}`,
    !!viewReportRequestId
  );
  // Zoom in function
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  // Zoom out function
  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  // Add keyboard shortcuts for zooming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl key is pressed
      if (e.ctrlKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Box sx={{ width: '100%', marginBottom: 5 }}>
      {isZoom && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Tooltip title="Zoom Out (Ctrl+-)">
            <IconButton onClick={handleZoomOut} disabled={zoomScale <= 0.5}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom (Ctrl+0)">
            <IconButton onClick={handleResetZoom} disabled={zoomScale === 1}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In (Ctrl++)">
            <IconButton onClick={handleZoomIn} disabled={zoomScale >= 3}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>{Math.round(zoomScale * 100)}%</Box>
        </Box>
      )}
      <ScrollContainer ref={scrollContainerRef} scale={zoomScale} maxHeight={maxHeight}>
        <ZoomContainer scale={zoomScale}>
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
        </ZoomContainer>
      </ScrollContainer>
    </Box>
  );
};

export default ViewReport;
