// import { Box, Button, TextField } from "@mui/material";
// import { useState } from "react";
// import { DataGrid } from "@mui/x-data-grid";

// const DataSources = () => {
//   const [rows, setRows] = useState([
//     { id: 1, sbu: "Chemicals", newFillings: 23 },
//     { id: 2, sbu: "Polymers", newFillings: 24 },
//   ]);

//   const [newRow, setNewRow] = useState({ sbu: "", newFillings: "" });

//   // Handle cell edit
//   const handleProcessRowUpdate = (newRow) => {
//     const updatedRows = rows.map((row) =>
//       row.id === newRow.id ? { ...row, ...newRow } : row
//     );
//     setRows(updatedRows);
//     return newRow;
//   };

//   const handleAddRow = () => {
//     if (newRow.sbu && newRow.newFillings) {
//       const id = rows.length + 1;
//       setRows([...rows, { id, ...newRow }]);
//       setNewRow({ sbu: "", newFillings: "" });
//     }
//   };

//   const handleDeleteRow = (id) => {
//     setRows(rows.filter((row) => row.id !== id));
//   };

//   const columns = [
//     { field: "sbu", headerName: "SBU", width: 150, editable: true },
//     {
//       field: "newFillings",
//       headerName: "New Fillings",
//       width: 100,
//       editable: true,
//       type: "number",
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 120,
//       renderCell: (params) => (
//         <Button
//           variant="contained"
//           color="error"
//           onClick={() => handleDeleteRow(params.row.id)}
//         >
//           Delete
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <Box sx={{ height: 500, width: "100%" }}>
//       <div style={{ display: "inline-block" }}>
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           processRowUpdate={handleProcessRowUpdate}
//           autoPageSize
//         />
//       </div>

//       {/* Add new row section */}
//       <Box mt={2} display="flex" gap={2}>
//         <TextField
//           label="Name"
//           value={newRow.sbu}
//           onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
//         />
//         <TextField
//           label="Age"
//           type="number"
//           value={newRow.newFillings}
//           onChange={(e) => setNewRow({ ...newRow, age: e.target.value })}
//         />
//         <Button variant="contained" color="primary" onClick={handleAddRow}>
//           Add Row
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default DataSources;

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const EditableTable = () => {
  const [rows, setRows] = useState([
    { id: 1, name: "John Doe", age: 28, city: "New York" },
    { id: 2, name: "Jane Smith", age: 34, city: "Los Angeles" },
  ]);

  const handleEdit = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now(), name: "", age: "", city: "" }]);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: "900px", margin: "20px auto" }}
    >
      <Typography variant="h6" sx={{ p: 2, textAlign: "center" }}>
        Editable Table
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>City</TableCell>
            {/* <TableCell>Actions</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={row.id}>
              {["name", "age", "city"].map((field) => (
                <TableCell key={field}>
                  <TextField
                    value={row[field]}
                    onChange={(e) =>
                      handleEdit(rowIndex, field, e.target.value)
                    }
                    variant="standard"
                    size="small"
                    fullWidth
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: "1rem",
                        padding: "4px 0",
                        border: "none",
                        backgroundColor: "transparent",
                        "&:hover": { backgroundColor: "#f5f5f5" }, // Hover effect
                        "&:focus": { backgroundColor: "#fff" }, // Focus effect
                      },
                    }}
                  />
                </TableCell>
              ))}
              {/* <TableCell>
                <IconButton
                  onClick={() => handleDeleteRow(rowIndex)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </TableCell> */}
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4} align="center">
              <Button
                onClick={handleAddRow}
                startIcon={<Add />}
                variant="contained"
                color="primary"
              >
                Add Row
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EditableTable;
