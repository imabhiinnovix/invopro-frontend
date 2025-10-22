


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
// import { TemplateDataTable } from "./TemplateDataTable";
// import { TemplateModal } from "./TemplateModal";


// // Define types
// interface Template {
//   _id: string;
//   organizationId: string;
//   name: string;
//   status: string;
//   permissions?: string[];
//   template?: {
//     _id: string;
//     name: string;
//     status: string;
//   };
// }

// interface TemplatePostResponse {
//   success: boolean;
//   data: Template;
// }

// export default function Template() {
//   const queryClient = useQueryClient();

//   const [openModal, setOpenModal] = useState(false);
//   const [modalMode, setModalMode] = useState<
//     "add" | "edit" | "view" | "filter" | null
//   >(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [editTemplateId, setEditTemplateId] = useState<string | null>(
//     null
//   );
//   const [rowData, setRowData] = useState<Template| null>(null);

//   const [searchValue, setSearchValue] = useState("");
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 10,
//   });
//   const [templateReload, setTemplatetReload] = useState(false);
//   const [filterValues, setFilterValues] = useState({
//     name: "",
//     organizationId: "",
//     status: "",
//   });
//   const { getHeadingSx } = useComponentTypography();

//   // DELETE API
//   const deleteTemplate = useDelete<null, TemplatePostResponse>(
//     ["deleteTemplate"],
//     (data) => {
//       if (data?.success) {
//         setTemplateReload(true);
//         handleCloseDialog();
//       } else {
//         toast.error("Error deleting template");
//       }
//     },
//     true
//   );

//   useEffect(() => {
//     if (templateReload) {
//       setTemplateReload(false);
//     }
//   }, [templateReload]);

//   const handleAddTemplate = () => {
//     setModalMode("add");
//     setOpenModal(true);
//   };

//   const handleEdit = (row: Template) => {
//     setRowData(row);
//     setEditTemplateId(row._id);
//     setModalMode("edit");
//     setOpenModal(true);
//   };

//   const handleView = (row: Template) => {
//     setRowData(row);
//     setEditTemplateId(row._id);
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
//     console.log("Closing modal");
//     setOpenModal(false);
//     setModalMode(null);
//     setEditTemplateId(null);
//     setRowData(null);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setDeleteId(null);
//   };

//   const handleConfirmDelete = async () => {
//     if (deleteId) {
//       try {
//         await deleteTemplate.mutate({
//           url: `${DELETE.DELETE_ROLE}/${deleteId}`,
//         });
//       } catch (error) {
//         toast.error("Error deleting Template", error);
//       }
//     }
//   };

//   const handleFilterApply = (values: {
//     name: string;
//     templateId: string;
//   }) => {
//     setFilterValues({
//       name: values.name,
//       organizationId: "",
//       status: "",
//     });
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

//   const handleTemplateCreated = () => {
//     setTemplateReload(true);
//   };

//   const handleTemplateUpdated = () => {
//     setTemplateReload(true);
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
//        Templates{" "}
//       </Typography>

//       <TemplateDataTable
//         onAddTemplate={handleAddTemplate}
//         onEditTemplate={handleEdit}
//         onViewTemplate={handleView}
//         onDeleteTemplatet={handleDelete}
//         onFilter={handleFilter}
//         searchValue={searchValue}
//         onSearchChange={handleSearchChange}
//         paginationModel={paginationModel}
//         setPaginationModel={setPaginationModel}
//         filterValues={filterValues}
//         templateReload={templateReload}
//         loading={deleteTemplate.isLoading}
//       />

//       <TemplateModal
//         rowData={rowData}
//         open={openModal}
//         onClose={handleCloseModal}
//         mode={modalMode}
//         editTemplateId={editTemplateId}
//         filterValues={filterValues}
//         onFilterApply={handleFilterApply}
//         onFilterReset={handleFilterReset}
//         onTemplateCreated={handleTemplateCreated}
//         onTemplateUpdated={handleTemplateUpdated}
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
//             disabled={deleteTemplate.isLoading}
//           >
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
// Template.tsx - Fixed version

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
import { TemplateDataTable } from "./TemplateDataTable";
import { TemplateModal } from "./TemplateModal";

// Define types
interface Template {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
  template?: {
    _id: string;
    name: string;
    status: string;
  };
}

interface TemplatePostResponse {
  success: boolean;
  data: Template;
}

export default function Template() {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [rowData, setRowData] = useState<Template | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [templateReload, setTemplateReload] = useState(false);
  const [filterValues, setFilterValues] = useState({
    name: "",
    organizationId: "",
    status: "",
  });
  const { getHeadingSx } = useComponentTypography();

  // DELETE API
  const deleteTemplate = useDelete<null, TemplatePostResponse>(
    ["deleteTemplate"],
    (data) => {
      if (data?.success) {
        setTemplateReload(true);
        handleCloseDialog();
      } else {
        toast.error("Error deleting template");
      }
    },
    true
  );

  useEffect(() => {
    if (templateReload) {
      setTemplateReload(false);
    }
  }, [templateReload]);

  const handleAddTemplate = () => {
    setModalMode("add");
    setOpenModal(true);
  };

  const handleEdit = (row: Template) => {
    setRowData(row);
    setEditTemplateId(row._id);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleView = (row: Template) => {
    setRowData(row);
    setEditTemplateId(row._id);
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
    console.log("Closing modal");
    setOpenModal(false);
    setModalMode(null);
    setEditTemplateId(null);
    setRowData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteTemplate.mutate({
          url: `${DELETE.DELETE_ROLE}/${deleteId}`,
        });
      } catch (error) {
        toast.error("Error deleting Template");
      }
    }
  };

  const handleFilterApply = (values: {
    name: string;
    templateId: string;
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

  // ✅ Fixed callbacks - properly use setTemplateReload
  const handleTemplateCreated = () => {
    console.log("✅ Template created - triggering reload");
    setTemplateReload(true);
  };

  const handleTemplateUpdated = () => {
    console.log("✅ Template updated - triggering reload");
    setTemplateReload(true);
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
        Templates
      </Typography>

      <TemplateDataTable
        onAddTemplate={handleAddTemplate}
        onEditTemplate={handleEdit}
        onViewTemplate={handleView}
        onDeleteTemplatet={handleDelete}
        onFilter={handleFilter}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        filterValues={filterValues}
        templateReload={templateReload}
        loading={deleteTemplate.isLoading}
      />

      <TemplateModal
        rowData={rowData}
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        editTemplateId={editTemplateId}
        filterValues={filterValues}
        onFilterApply={handleFilterApply}
        onFilterReset={handleFilterReset}
        onTemplateCreated={handleTemplateCreated}
        onTemplateUpdated={handleTemplateUpdated}
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
            disabled={deleteTemplate.isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}