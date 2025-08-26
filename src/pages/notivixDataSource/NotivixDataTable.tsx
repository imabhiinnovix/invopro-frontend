// import * as React from "react";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   InputAdornment,
//   Tooltip,
// } from "@mui/material";
// import { STYLE_GUIDE } from "../../styles";
// import SearchIcon from "@mui/icons-material/Search";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import AddIcon from "@mui/icons-material/Add";
// import { CustomPagination } from "../../components/common/pagination/customPagination";
// import ImportFile from "../../components/common/importFile/ImportFile";
// import dayjs from "dayjs"; 

// interface TableSectionProps {
//   rows: any[];
//   columns: GridColDef[];
//   loading: boolean;
//   rowCount: number;
//   paginationModel: { page: number; pageSize: number };
//   setPaginationModel: React.Dispatch<
//     React.SetStateAction<{ page: number; pageSize: number }>
//   >;
//   searchValue: string;
//   handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   handleView: (id: string) => void;
//   handleEdit: (id: string) => void;
//   handleDelete: (id: string) => void;
//   handleAddNotification: () => void;
//   handleFilter: () => void;
//   listCurrentData: any;
//   dataSourceId: string;
// }

// export const NotivixDataTable: React.FC<TableSectionProps> = ({
//   rows,
//   columns,
//   loading,
//   rowCount,
//   paginationModel,
//   setPaginationModel,
//   searchValue,
//   handleSearchChange,
//   handleAddNotification,
//   handleFilter,
//   dataSourceId,
// }) => {
//   const paginationModelMemo = React.useMemo(
//     () => ({
//       page: paginationModel.page,
//       pageSize: paginationModel.pageSize,
//     }),
//     [paginationModel.page, paginationModel.pageSize]
//   );

//   console.log("dataSourceIdin table comp", dataSourceId);

//   // Format columns to handle date fields
//   const formattedColumns = React.useMemo(() => {
//     return columns.map((column) => {
//       // Check if this column is a date field
//       if (column.field.toLowerCase().includes('date')) {
//         return {
//           ...column,
//           renderCell: (params: any) => {
//             const value = params.value;
//             if (value) {
//               try {
//                 // Format the date to DD-MMM-YYYY
//                 return dayjs(value).format('DD-MMM-YYYY');
//               } catch (error) {
//                 console.error('Error formatting date:', error);
//                 return value;
//               }
//             }
//             return value;
//           }
//         };
//       }
//       return column;
//     });
//   }, [columns]);

//   return (
//     <Card
//       sx={{
//         backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//         boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
//         borderRadius: "8px",
//         overflow: "visible",
//       }}
//     >
//       <CardContent sx={{ p: 3 }}>
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 2,
//           }}
//         >
//           <TextField
//             placeholder="Search..."
//             variant="outlined"
//             size="small"
//             value={searchValue}
//             onChange={handleSearchChange}
//             sx={{
//               width: "300px",
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                 "& fieldset": {
//                   borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
//                 },
//                 "&:hover fieldset": {
//                   borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 },
//               },
//             }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon
//                     sx={{
//                       color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                     }}
//                   />
//                 </InputAdornment>
//               ),
//             }}
//           />
//           <Box sx={{ display: "flex", gap: 1 }}>
//             <Button
//               variant="outlined"
//               startIcon={<FilterListIcon />}
//               onClick={handleFilter}
//               sx={{
//                 borderRadius: "8px",
//                 borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
//                 color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 "&:hover": {
//                   backgroundColor:
//                     STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
//                   borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 },
//               }}
//             >
//               Filter
//             </Button>
//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               onClick={handleAddNotification}
//               sx={{
//                 borderRadius: "8px",
//                 backgroundColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                 color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                 "&:hover": {
//                   backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
//                 },
//               }}
//             >
//               Add
//             </Button>
//             {/* <ImportFile
//               title="Import"
//               dataSourceId={dataSourceId}
//               CustomButton={
//                 <Button
//                   startIcon={<AddIcon />}
//                   variant="contained"
//                   sx={{
//                     borderRadius: "8px",
//                     backgroundColor:
//                       STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
//                     color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
//                     "&:hover": {
//                       backgroundColor:
//                         STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
//                     },
//                   }}
//                 >
//                   Import
//                 </Button>
//               }
//             /> */}
//           </Box>
//         </Box>
//         {rows.length > 0 ? (
//           <DataGrid
//             loading={loading}
//             rows={rows}
//             columns={formattedColumns} // Use formatted columns instead of original columns
//             getRowId={(row) => row._id}
//             paginationMode="server"
//             rowCount={rowCount}
//             paginationModel={paginationModelMemo}
//             onPaginationModelChange={setPaginationModel}
//             pageSizeOptions={[5, 10, 20]}
//             disableColumnMenu
//             slots={{
//               pagination: () => (
//                 <CustomPagination
//                   paginationModel={paginationModelMemo}
//                   setPaginationModel={setPaginationModel}
//                   rowCount={rowCount}
//                 />
//               ),
//             }}
//           />
//         ) : (
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               py: 4,
//               textAlign: "center",
//             }}
//           >
//             <Typography
//               variant="h6"
//               sx={{
//                 color: STYLE_GUIDE?.COLORS?.black || "#000000",
//                 mb: 1,
//                 opacity: 0.6,
//               }}
//             >
//               No Data Available
//             </Typography>
//             <Typography
//               variant="body2"
//               sx={{
//                 color: STYLE_GUIDE?.COLORS?.black || "#000000",
//                 opacity: 0.6,
//               }}
//             >
//               No records found.
//             </Typography>
//           </Box>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import ImportFile from "../../components/common/importFile/ImportFile";
import dayjs from "dayjs"; 

interface TableSectionProps {
  rows: any[];
  columns: GridColDef[];
  loading: boolean;
  rowCount: number;
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: React.Dispatch<
    React.SetStateAction<{ page: number; pageSize: number }>
  >;
  searchValue: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleView: (id: string) => void;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  handleAddNotification: () => void;
  handleFilter: () => void;
  listCurrentData: any;
  dataSourceId: string;
}

// Generic function to render cell values
const renderCellValue = (value: any) => {
  if (value == null) return '';
  
  // Check if value is an array
  if (Array.isArray(value)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
        {value.map((item, index) => (
          <Typography 
            key={index} 
            variant="body2" 
            sx={{ 
              fontSize: '0.875rem',
              lineHeight: 1.2,
              wordBreak: 'break-word'
            }}
          >
            {String(item)}
          </Typography>
        ))}
      </Box>
    );
  }
  
  // For non-array values, return as string
  return String(value);
};

// Generic function to get tooltip text for arrays
const getTooltipText = (value: any) => {
  if (Array.isArray(value)) {
    return value.join('\n');
  }
  return String(value);
};

// Additional update needed for the main NotivixDataSource component:
// In the useEffect where you format rows, update the formattedRows mapping:

/*
const formattedRows = rawData.map((item) => {
  const row = { _id: item._id || item.id };
  displayFields.forEach((field) => {
    const value = item.rowData?.[field.mappedAttributeName] || 
                   item[field.mappedAttributeName] || 
                   "";
    
    // ✅ Preserve array structure instead of converting to string
    row[field.mappedAttributeName] = value;
  });
  return row;
});
*/

export const NotivixDataTable: React.FC<TableSectionProps> = ({
  rows,
  columns,
  loading,
  rowCount,
  paginationModel,
  setPaginationModel,
  searchValue,
  handleSearchChange,
  handleAddNotification,
  handleFilter,
  dataSourceId,
}) => {
  const paginationModelMemo = React.useMemo(
    () => ({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
    }),
    [paginationModel.page, paginationModel.pageSize]
  );

  console.log("dataSourceIdin table comp", dataSourceId);

  // Format columns to handle date fields and arrays
  const formattedColumns = React.useMemo(() => {
    return columns.map((column) => {
      // Skip actions column
      if (column.field === 'actions') {
        return column;
      }

      return {
        ...column,
        renderCell: (params: any) => {
          const value = params.value;
          
          // Handle date fields
          if (column.field.toLowerCase().includes('date') && value && !Array.isArray(value)) {
            try {
              return dayjs(value).format('DD-MMM-YYYY');
            } catch (error) {
              console.error('Error formatting date:', error);
              return renderCellValue(value);
            }
          }
          
          // Handle all other values (including arrays)
          const cellContent = renderCellValue(value);
          const tooltipText = getTooltipText(value);
          
          // Show tooltip only if content is truncated or is an array
          const shouldShowTooltip = Array.isArray(value) || 
            (typeof value === 'string' && value.length > 30);
          
          return shouldShowTooltip ? (
            <Tooltip 
              title={tooltipText} 
              arrow 
              placement="top-start"
              sx={{
                maxWidth: 'none',
                '& .MuiTooltip-tooltip': {
                  whiteSpace: 'pre-line',
                  maxWidth: '400px'
                }
              }}
            >
              <Box sx={{ 
                width: '100%', 
                overflow: 'hidden',
                cursor: 'help'
              }}>
                {cellContent}
              </Box>
            </Tooltip>
          ) : (
            <Box sx={{ width: '100%' }}>
              {cellContent}
            </Box>
          );
        },
        // Adjust row height for columns that might contain arrays
        ...(column.field !== 'actions' && {
          minWidth: 150,
        })
      };
    });
  }, [columns]);

  return (
    <Card
      sx={{
        backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={searchValue}
            onChange={handleSearchChange}
            sx={{
              width: "300px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                "& fieldset": {
                  borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                },
                "&:hover fieldset": {
                  borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilter}
              sx={{
                borderRadius: "8px",
                borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                "&:hover": {
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
                  borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                },
              }}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNotification}
              sx={{
                borderRadius: "8px",
                backgroundColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                "&:hover": {
                  backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                },
              }}
            >
              Add
            </Button>
            <ImportFile
              title="Import"
              dataSourceId={dataSourceId}
              CustomButton={
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor:
                      STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                    color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                    "&:hover": {
                      backgroundColor:
                        STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                    },
                  }}
                >
                  Import
                </Button>
              }
            />
          </Box>
        </Box>
        {rows.length > 0 ? (
          <DataGrid
            loading={loading}
            rows={rows}
            columns={formattedColumns}
            getRowId={(row) => row._id}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModelMemo}
            onPaginationModelChange={setPaginationModel}
            // pageSizeOptions={[5, 10, 20]}
            disableColumnMenu
            getRowHeight={() => 'auto'} // Allow dynamic row height
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'flex-start', // Align content to top for better readability
                paddingY: 1,
                lineHeight: 1.4,
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || '#f5f5f5',
                },
              },
            }}
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModelMemo}
                  setPaginationModel={setPaginationModel}
                  rowCount={rowCount}
                />
              ),
            }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: STYLE_GUIDE?.COLORS?.black || "#000000",
                mb: 1,
                opacity: 0.6,
              }}
            >
              No Data Available
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: STYLE_GUIDE?.COLORS?.black || "#000000",
                opacity: 0.6,
              }}
            >
              No records found.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};