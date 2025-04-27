'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Box, Tooltip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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

  if (type === 'usdm' && typeof value === 'number') {
    // Format currency values
    if (value >= 100000) {
      return `$ ${(value / 1000000).toFixed(2)} M`;
    }
    return value.toString();
  }

  return value;
};

interface ViewReportProps {
  dataSourceVersionId: string;
  versionCode: string;
  mappingFuctionName: string;
  versionValue: string;
  sheetCode: string;
  designCode: string;
  customReportId: string;
  maxHeight?: number;
  isView?: boolean;
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
  fontBold: boolean;
  lastCellBackGroundColor: string;
}

interface Section {
  sectionName: string;
  sectionBackGroundColor: string;
  sectionTextColor: string;
  sectionHorizontalAlignment: Alignment;
  sectionVerticalAlignment: Alignment;
  spanColumns: boolean;
  subSections: SubSection[];
  view: string;
  fontBold: boolean;
}

interface ReportRequestData {
  success: boolean;
  data: Record<string, any>[];
}

interface ReportResponseDesignData {
  success: boolean;
  data: Section[];
}
const ViewReport: React.FC<ViewReportProps> = ({
  dataSourceVersionId,
  versionCode,
  mappingFuctionName,
  versionValue,
  sheetCode,
  designCode,
  customReportId,
  maxHeight,
  isView,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});
  const toggleSection = (index: number) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const [zoomScale, setZoomScale] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const reportData = useGet<ReportRequestData>(
    [`reportDataOnDataSourceVersionId`, String(dataSourceVersionId)],
    GET?.Custom_Report +
      `/reportDataOnDataSourceVersionId/${dataSourceVersionId}?versionCode=${versionCode}&mappingFuctionName=${mappingFuctionName}&versionValue=${versionValue}`,
    !!dataSourceVersionId && !!versionCode && !!versionValue
  );

  const designData = useGet<ReportResponseDesignData>(
    [`customReportDesignData`, String(customReportId), String(dataSourceVersionId)],
    GET?.Custom_Report +
      `/customReportDesignData/${customReportId}?mappingFuctionName=${mappingFuctionName}&versionValue=${versionValue}&sheetCode=${sheetCode}&designCode=${designCode}`,
    !!customReportId && !!versionValue && !!sheetCode && !!designCode && !!dataSourceVersionId
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
      {isView && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Tooltip title="Reset Zoom (Ctrl+0)">
            <IconButton onClick={handleResetZoom} disabled={zoomScale === 1}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out (Ctrl+-)">
            <IconButton onClick={handleZoomOut} disabled={zoomScale <= 0.5}>
              <ZoomOutIcon />
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
          {reportData.isFetching && designData.isFetching ? (
            <Box
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', width: '100%' }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #3498db',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <Box sx={{ mt: 2, color: 'text.secondary' }}>Loading report data...</Box>
              </Box>
            </Box>
          ) : !reportData.data || !designData.data ? (
            <Box
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', width: '100%' }}
            >
              <Box sx={{ color: 'text.secondary', fontSize: '1rem' }}>No report data found</Box>
            </Box>
          ) : (
            <StyledTableContainer>
              <Table size="small" aria-label="dynamic report table">
                <TableBody>
                  {designData.data?.data?.map((section, sectionIndex) => {
                    const subSections = section.subSections || [];
                    const isRowView = section?.view === 'row';
                    const isColumnView = section?.view === 'column';
                    const formatColor = (color?: string) => (color ? `#${color}` : undefined);
                    return (
                      <React.Fragment key={`section-${sectionIndex}`}>
                        {!!section.sectionName && (
                          <TableRow>
                            <DynamicCell
                              colSpan={section.spanColumns ? (reportData.data?.data.length ?? 0) + 1 : 1}
                              align={section.sectionHorizontalAlignment || 'center'}
                              bgColor={formatColor(section.sectionBackGroundColor)}
                              textColor={formatColor(section.sectionTextColor)}
                              fontWeight={section.fontBold ? 'bold' : ''}
                              onClick={() => toggleSection(sectionIndex)}
                            >
                              <Box
                                sx={{
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                {' '}
                                <Box sx={{ flex: 1 }}>{section.sectionName}</Box>
                                <Box sx={{ pr: 1 }}>
                                  {collapsedSections[sectionIndex] ? (
                                    <KeyboardArrowDownIcon />
                                  ) : (
                                    <KeyboardArrowUpIcon />
                                  )}
                                </Box>
                              </Box>
                            </DynamicCell>
                          </TableRow>
                        )}
                        {!collapsedSections[sectionIndex] &&
                          isRowView &&
                          subSections?.map((subSection, subIndex) => (
                            <TableRow key={`subrow-${subIndex}`}>
                              <DynamicCell
                                bgColor={formatColor(subSection.headerBackGroundColor)}
                                textColor={formatColor(subSection.headerColor)}
                                fontWeight="bold"
                                align={subSection.horizontalAlignment || 'left'}
                              >
                                {subSection.headerName}
                              </DynamicCell>

                              {reportData.data?.data?.map((rowData, dataIndex) => (
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

                        {!collapsedSections[sectionIndex] && isColumnView && (
                          <>
                            <TableRow>
                              {subSections?.map((subSection, subIndex) => (
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

                            {(reportData.data?.data || []).map((rowData, rowIndex) => {
                              const isLastRow = rowIndex === reportData.data?.data.length - 1;

                              return (
                                <TableRow key={`row-${rowIndex}`}>
                                  {subSections?.map((subSection, subIndex) => {
                                    const backgroundColor = isLastRow
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
                              );
                            })}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}
        </ZoomContainer>
      </ScrollContainer>
    </Box>
  );
};

export default ViewReport;
