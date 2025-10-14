// import * as React from "react";
// import { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
// } from "@mui/material";

// import useDelete from "../../hooks/useDelete";
// import { DELETE } from "../../services/apiRoutes";
// import { useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { STYLE_GUIDE } from "../../styles";
// import { useComponentTypography } from "../../hooks";
// import { DesignationModal } from "./DesignationModal";
// import { DesignationDataTable } from "./DesignationDataTable";

// // Define types
// interface Designation {
//   _id: string;
//   organizationId: string;
//   name: string;
//   status: string;
//   permissions?: string[];
// }

// interface DesignationPostResponse {
//   success: boolean;
//   data: Designation;
// }

// export default function Designation() {
//   const queryClient = useQueryClient();

//   const [openModal, setOpenModal] = useState(false);
//   const [modalMode, setModalMode] = useState<
//     "add" | "edit" | "view" | "filter" | null
//   >(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [editDesignationId, setEditDesignationId] = useState<string | null>(
//     null
//   );
//   const [rowData, setRowData] = useState<string | null>(null);

//   const [searchValue, setSearchValue] = useState("");
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 10,
//   });
//   const [designationReload, setDesignationReload] = useState(false);
//   const [filterValues, setFilterValues] = useState({
//     name: "",
//     organizationId: "",
//     status: "",
//   });
//   const { getHeadingSx } = useComponentTypography();

//   // DELETE API
//   const deleteDesignation = useDelete<null, DesignationPostResponse>(
//     ["deleteDesignation"],
//     (data) => {
//       if (data?.success) {
//         setDesignationReload(true);
//         handleCloseDialog();
//       } else {
//         toast.error("Error deleting designation");
//       }
//     },
//     true
//   );

//   useEffect(() => {
//     if (designationReload) {
//       setDesignationReload(false);
//     }
//   }, [designationReload]);

//   const handleAddDesignation = () => {
//     setModalMode("add");
//     setOpenModal(true);
//   };

//   const handleEdit = (row: Designation) => {
//     setRowData(row?.name);
//     setEditDesignationId(row._id);
//     setModalMode("edit");
//     setOpenModal(true);
//   };

//   const handleView = (row: Designation) => {
//     setRowData(row?.name);

//     setEditDesignationId(row._id);
//     setModalMode("view");
//     setOpenModal(true);
//   };

//   const handleDelete = (id: string) => {
//     if (id) {
//       setDeleteId(id);
//       setOpenDialog(true);
//     }
//   };

//   const handleFilter = () => {
//     setModalMode("filter");
//     setOpenModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setModalMode(null);
//     setEditDesignationId(null);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setDeleteId(null);
//   };

//   const handleConfirmDelete = async () => {
//     if (deleteId) {
//       try {
//         await deleteDesignation.mutate({
//           url: `${DELETE.DELETE_ROLE}/${deleteId}`,
//         });
//       } catch (error) {
//         toast.error("Error deleting designation", error);
//       }
//     }
//   };

//   const handleFilterApply = (values: {
//     name: string;
//     organizationId: string;
//     status: string;
//   }) => {
//     setFilterValues(values);
//     setPaginationModel({ ...paginationModel, page: 0 });
//     handleCloseModal();
//   };

//   const handleFilterReset = () => {
//     setFilterValues({
//       name: "",
//       organizationId: "",
//       status: "",
//     });
//   };

//   const handleDesignationCreated = () => {
//     setDesignationReload(true);
//   };

//   const handleDesignationUpdated = () => {
//     setDesignationReload(true);
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchValue(e.target.value);
//     setPaginationModel({ ...paginationModel, page: 0 });
//   };

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         ml: { xs: 0 },
//         minHeight: "100vh",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           ...getHeadingSx(),
//           mb: STYLE_GUIDE?.SPACING?.s3,
//         }}
//       >
//         Designations{" "}
//       </Typography>

//       <DesignationDataTable
//         onAddDesignation={handleAddDesignation}
//         onEditDesignation={handleEdit}
//         onViewDesignation={handleView}
//         onDeleteDesignation={handleDelete}
//         onFilter={handleFilter}
//         searchValue={searchValue}
//         onSearchChange={handleSearchChange}
//         paginationModel={paginationModel}
//         setPaginationModel={setPaginationModel}
//         filterValues={filterValues}
//         designationReload={designationReload}
//         loading={deleteDesignation.isLoading}
//       />

//       <DesignationModal
//         rowData={rowData}
//         open={openModal}
//         onClose={handleCloseModal}
//         mode={modalMode}
//         editDesignationId={editDesignationId}
//         filterValues={filterValues}
//         onFilterApply={handleFilterApply}
//         onFilterReset={handleFilterReset}
//         onDesignationCreated={handleDesignationCreated}
//         onDesignationUpdated={handleDesignationUpdated}
//       />

//       <Dialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         sx={{
//           "& .MuiDialog-paper": {
//             borderRadius: "8px",
//           },
//         }}
//       >
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to delete this?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} sx={{ borderRadius: "8px" }}>
//             No
//           </Button>
//           <Button
//             onClick={handleConfirmDelete}
//             color="error"
//             sx={{ borderRadius: "8px" }}
//             disabled={deleteDesignation.isLoading}
//           >
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }


import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import useDelete from "../../hooks/useDelete";
import { DELETE } from "../../services/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks";
import { DesignationModal } from "./DesignationModal";
import { DesignationDataTable } from "./DesignationDataTable";

// Define types
interface Designation {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
  department?: {
    _id: string;
    name: string;
    status: string;
  };
}

interface DesignationPostResponse {
  success: boolean;
  data: Designation;
}

export default function Designation() {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDesignationId, setEditDesignationId] = useState<string | null>(
    null
  );
  const [rowData, setRowData] = useState<Designation | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [designationReload, setDesignationReload] = useState(false);
  const [filterValues, setFilterValues] = useState({
    name: "",
    organizationId: "",
    status: "",
  });
  const { getHeadingSx } = useComponentTypography();

  // DELETE API
  const deleteDesignation = useDelete<null, DesignationPostResponse>(
    ["deleteDesignation"],
    (data) => {
      if (data?.success) {
        setDesignationReload(true);
        handleCloseDialog();
      } else {
        toast.error("Error deleting designation");
      }
    },
    true
  );

  useEffect(() => {
    if (designationReload) {
      setDesignationReload(false);
    }
  }, [designationReload]);

  const handleAddDesignation = () => {
    setModalMode("add");
    setOpenModal(true);
  };

  const handleEdit = (row: Designation) => {
    setRowData(row);
    setEditDesignationId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: Designation) => {
    setRowData(row);
    setEditDesignationId(row._id);
    setModalMode("view");
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    if (id) {
      setDeleteId(id);
      setOpenDialog(true);
    }
  };

  const handleFilter = () => {
    setModalMode("filter");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setEditDesignationId(null);
    setRowData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteDesignation.mutate({
          url: `${DELETE.DELETE_ROLE}/${deleteId}`,
        });
      } catch (error) {
        toast.error("Error deleting designation", error);
      }
    }
  };

  const handleFilterApply = (values: {
    name: string;
    departmentId: string;
  }) => {
    setFilterValues({
      name: values.name,
      organizationId: "",
      status: "",
    });
    setPaginationModel({ ...paginationModel, page: 0 });
    handleCloseModal();
  };

  const handleFilterReset = () => {
    setFilterValues({
      name: "",
      organizationId: "",
      status: "",
    });
  };

  const handleDesignationCreated = () => {
    setDesignationReload(true);
  };

  const handleDesignationUpdated = () => {
    setDesignationReload(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          ...getHeadingSx(),
          mb: STYLE_GUIDE?.SPACING?.s3,
        }}
      >
        Designations{" "}
      </Typography>

      <DesignationDataTable
        onAddDesignation={handleAddDesignation}
        onEditDesignation={handleEdit}
        onViewDesignation={handleView}
        onDeleteDesignation={handleDelete}
        onFilter={handleFilter}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        filterValues={filterValues}
        designationReload={designationReload}
        loading={deleteDesignation.isLoading}
      />

      <DesignationModal
        rowData={rowData}
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        editDesignationId={editDesignationId}
        filterValues={filterValues}
        onFilterApply={handleFilterApply}
        onFilterReset={handleFilterReset}
        onDesignationCreated={handleDesignationCreated}
        onDesignationUpdated={handleDesignationUpdated}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: "8px" }}>
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            sx={{ borderRadius: "8px" }}
            disabled={deleteDesignation.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}