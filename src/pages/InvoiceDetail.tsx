import React, { useEffect, useState, useMemo } from "react";
import type { PageProps, InvoiceLineItem } from "../types";
import { INVOICES, INVOICE_LINE_ITEMS, AUDIT_LOG } from "../data/mockData";
import { fmtN } from "../utils/helpers";
import { SectionHeader, SubHead, Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pill } from "../components/ui/Pill";
import { DataTable, Column } from "../components/ui/DataTable";
import { AuditTrail } from "../components/AuditTrail";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Select, FormGrid, FormField, TextArea } from "../components/ui/FormField";
import { InvoiceRowModal } from "../components/InvoiceRowModal";
import { useNavigate } from "react-router-dom";
import useGet from "../hooks/useGet";
import useDelete from "../hooks/useDelete";
import { GET, DELETE } from "../services/apiRoutes";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Tooltip, Typography } from "@mui/material";
import { RootState } from "../store";
import { useAppDispatch } from "../storeHooks";
import { setDataSourceList } from "./dataSources/dataSourceActions";
import { formatCurrency, formatDateWithoutTime } from "../utils/utils";
import usePut from "../hooks/usePut";
import { PUT } from "../services/apiRoutes";




export const InvoiceDetail: React.FC<PageProps> = ({ onNavigate }) => {

  const dispatch = useAppDispatch();


  const [editMode, setEditMode] = useState(false);
  const [forceCase, setForceCase] = useState("");
  const [forceOpen, setForceOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedCaseNumber, setSelectedCaseNumber] = useState("");
// const [addOpen, setAddOpen] = useState(false);
const [editOpen, setEditOpen] = useState(false);
const [formData, setFormData] = useState<Record<string, any>>({ id: "" });
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [pageLoading, setPageLoading] = useState(false);

  const navigate = useNavigate();

  const updateVersionRow = usePut(["updateVersionRow"]);

 const { id: valueId } = useParams<{ id: string }>();

const [rows, setRows] = useState<any[]>([]);
const [rowCount, setRowCount] = useState(0);
const [loading, setLoading] = useState(false);

const [paginationModel, setPaginationModel] = useState({
  page: 0,
  pageSize: 10,
});

const [searchValue, setSearchValue] = useState("");
const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
const [filter, setFilter] = useState({});
const [selectedYear, setSelectedYear] = useState("");
const [selectedMonth, setSelectedMonth] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);



const invoiceList = useSelector((state: RootState) => {
  console.log("Redux invoice state:", state.invoice);
  return state.invoice.mergedData || [];
});

const invoice = invoiceList.find(i => i._id === valueId);


  // Your existing API call with refreshKey dependency
  const dataSourceNotivixListAPI = useGet<DataSourceListPayload>(
    ["dataSourceNotivixList", refreshKey], // Add refreshKey to dependency array
    GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
  );
  // Effect to update Redux when API data changes
  useEffect(() => {
    if (dataSourceNotivixListAPI.data?.success) {
      dispatch(setDataSourceList(dataSourceNotivixListAPI.data.data));
    }
  }, [dataSourceNotivixListAPI.data, dispatch]);

  // Effect to listen for status changes
  useEffect(() => {
    const handleStatusChange = () => {
      // Increment refreshKey to trigger API refetch
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("dataSourceStatusChanged", handleStatusChange);

    return () => {
      window.removeEventListener("dataSourceStatusChanged", handleStatusChange);
    };
  }, []);
const { list } = useSelector((state: RootState) => state.dataSource);
const listCurrentData = list?.find((item) => item._id === import.meta.env.VITE_INVOICE_DATASOURCE_ID);


  const [status, setStatus] = useState(invoice?.aiStatus);


useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearchValue(searchValue);
  }, 500);

  return () => clearTimeout(handler);
}, [searchValue]);

const sourceVersionData = useGet<any>(
  [
    "sourceVersionData",
    String(paginationModel.page + 1),
    String(paginationModel.pageSize),
    debouncedSearchValue,
    valueId || "",
    JSON.stringify(filter),
    selectedYear,
    selectedMonth,
  ],
  `${GET.SOURCE_VERSION_DATA}?dataSourceId=${encodeURIComponent(
    import.meta.env.VITE_INVOICE_DATASOURCE_ID || ""
  )}&versionId=${valueId}&filters=${encodeURIComponent(JSON.stringify(filter))}
  &year=${selectedYear}
  &month=${selectedMonth}
  &page=${paginationModel.page + 1}
  &limit=${paginationModel.pageSize}
  &search=${encodeURIComponent(debouncedSearchValue)}`,
  !! import.meta.env.VITE_INVOICE_DATASOURCE_ID
);

useEffect(() => {
  setLoading(sourceVersionData.isLoading);

  if (!sourceVersionData.isLoading) {
    setPageLoading(false);
  }

  const rawData = sourceVersionData?.data?.data || [];
  const totalCount = sourceVersionData?.data?.totalCount || 0;

  const displayFields =
    listCurrentData?.fieldSettings?.filter(
      (field: any) => field.isDisplayEnable && field.mappedAttributeName
    ) || [];

  const formattedRows = rawData.map((item: any) => {
    const row: Record<string, any> = {
      _id: item._id,
      aiPreValidateStatus: item?.aiPreValidateStatus || "pending",
      aiCostValidateStatus: item?.aiCostValidateStatus || "pending",
    };

    displayFields.forEach((field: any) => {
      row[field.mappedAttributeName] =
        item.rowData?.[field.mappedAttributeName] ||
        item[field.mappedAttributeName] ||
        "";
    });

    return row;
  });

  setRows(formattedRows);
  setRowCount(totalCount);
}, [sourceVersionData.data, sourceVersionData.isLoading]);

const rowAuditList = useGet(
  [
    "rowAuditList",
    paginationModel.page,
    paginationModel.pageSize,
    valueId,
    selectedCase,
    auditOpen,
  ],
  `${GET.Data_Source_Version}/auditList?page=1&limit=1000&versionId=${valueId}&recordId=${selectedCase}`,
  Boolean(valueId && selectedCase && auditOpen)
);

const invoiceAuditList = useGet(
  [
    "invoiceAuditList",
    valueId
  ],
  `${GET.Data_Source_Version}/auditList?page=1&limit=1000&versionId=${valueId}`,
  Boolean(valueId)
);

  const allSelected =
  rows.length > 0 &&
  rows.every((r) => selected[r._id]);

  const anySelected = Object.values(selected).some(Boolean);

  const toggleAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const map: Record<string, boolean> = {};
      rows.forEach((r) => (map[r._id] = true));
      setSelected(map);
    }
  };

  const toggleOne = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const deleteVersionRow = useDelete(["deleteVersionRow"]);

  const attributeList = useGet<{
  success: boolean;
  data: any[];
}>(["attributeList"], GET.Attribute_Option_List + "?paginate=false");

const handleDelete = async (id: string) => {
  try {
    await deleteVersionRow.mutateAsync({
      url: DELETE.DELETE_VERSION_ROW,
      payload: {
        dataSourceId: valueId,
        ids: [id],
      },
    });

    toast.success("Deleted successfully");
    sourceVersionData.refetch();
  } catch (err) {
    toast.error("Delete failed");
  }
};

useEffect(() => {
  setPageLoading(true);
}, [paginationModel.page, paginationModel.pageSize]);

const handleSave = async (data: any) => {
  try {
    await updateVersionRow.mutateAsync({
      url: PUT.UPDATE_VERSION_ROW,
      payload: {
        dataSourceId: valueId,
        rowId: editingRow?._id,
        rowData: data,
      },
    });

    toast.success("Row updated successfully");

    sourceVersionData.refetch();
  } catch (err) {
  }
};

const handleSearchChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setSearchValue(e.target.value);
};
 

 const infoFields = [
   { label: "Vendor", value: invoice?.vendorId?.name || "-" },

  {
    label: "Invoice Number",
    value: invoice?.aiExtraction?.invoiceNumber || "-"
  },

  { label: "Billing Period", value: invoice?.versionValue || "-" },

  {
    label: "Invoice Date",
    value: invoice?.aiExtraction?.invoiceDate
      ? formatDateWithoutTime(invoice.aiExtraction.invoiceDate)
      : "-"
  },

  {
    label: "Total Amount",
    value: formatCurrency(
      invoice?.totalAmount || 0,
      invoice?.aiExtraction?.conversion?.baseCurrency || "USD"
    )
  },
  {
    label: "Line Items",
    value: `${invoice?.totalLineItems || 0} total • ${invoice?.totalApprovedCount || 0} matched • ${invoice?.totalFlaggedCount || 0} flagged`
  },
  {
    label: "Validation Status",
    value: invoice?.totalFlaggedCount > 0
      ? `${invoice.totalFlaggedCount} Issues Found`
      : "All Validated"
  }
];

const itemCols: Column<any>[] = useMemo(() => {
  if (!listCurrentData?.fieldSettings) return [];

  const displayFields =
    listCurrentData.fieldSettings.filter(
      (field: any) =>
        field.isDisplayEnable && field.mappedAttributeName
    ) || [];

  const dynamicCols = displayFields.map((field: any) => ({
    key: field.mappedAttributeName,
    label: field.label,

    render: (value: any) => {
      if (value == null) return "—";

      if (Array.isArray(value)) {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {value.map((item, i) => (
              <span key={i}>{String(item)}</span>
            ))}
          </div>
        );
      }

      if (typeof value === "number") {
        return fmtN(value);
      }

      if (
        field.mappedAttributeName
          .toLowerCase()
          .includes("status")
      ) {
        return (
          <Pill
            label={String(value)}
            color={
              value === "completed"
                ? "green"
                : value === "error"
                ? "red"
                : "yellow"
            }
          />
        );
      }

      const cellValue = String(value);

      return cellValue.length > 25 ? (
        <Tooltip title={cellValue} arrow>
          <Typography
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 180,
              fontSize: "14px",
            }}
          >
            {cellValue}
          </Typography>
        </Tooltip>
      ) : (
        cellValue
      );
    },
  }));

  return [
    {
      key: "_cb",
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
        />
      ),

      render: (_: any, r: any) => (
        <input
          type="checkbox"
          checked={!!selected[r._id]}
          onChange={() => toggleOne(r._id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },

    ...dynamicCols,

    {
      key: "_actions",
      label: "Actions",

      render: (_: any, r: any) => (
        <div style={{ display: "flex", gap: 6 }}>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
  e.stopPropagation();

  const selectedRow = structuredClone(r); // important safety copy

  setEditOpen(true);
  setFormData({
    id: selectedRow._id,
    ...Object.fromEntries(
      Object.entries(selectedRow).map(([key, value]) => [
        key,
        Array.isArray(value) ? value : value ?? "",
      ])
    ),
  });
}}
          >
            Edit
          </Button>

          {/* <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r._id);
            }}
          >
            Delete
          </Button> */}
        </div>
      ),
    },
  ];
}, [
  listCurrentData?.fieldSettings,
  selected,
  allSelected,
]);

  // ✅ FIXED SAFE NAVIGATION
const handleAuditOpen = (row: any) => {
  console.log('row',row);
  setSelectedCase(row._id);
  setSelectedCaseNumber(row?.['SABIC Case Reference Number'])
  setAuditOpen(true);

};  

const totalPages = Math.ceil((rowCount || 0) / paginationModel.pageSize);

const getPageNumbers = () => {
  const maxVisible = 5;
  const current = paginationModel.page;

  let start = Math.max(0, current - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(0, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const mappedInvoiceAuditLogs = useMemo(() => {
  const logs = invoiceAuditList?.data?.data || [];

  return logs.map((log: any, index: number) => ({
    id: log._id || index,
    type: "upload",
    actor: log?.changedBy?.firstName
      ? `${log.changedBy.firstName} ${log.changedBy.lastName || ""}`
      : log.source,
    time: new Date(log.createdAt).toLocaleString(),
    message: `${log.changeType} performed`,
    meta: log.auditLevel,
  }));
}, [invoiceAuditList.data]);

const mappedRowAuditLogs = useMemo(() => {
  const logs = rowAuditList?.data?.data || [];

  return logs.map((log: any, index: number) => ({
    id: log._id || index,

    type:
      log.changeType === "UPLOAD"
        ? "upload"
        : log.changeType === "EDIT"
        ? "edit"
        : log.changeType === "APPROVAL"
        ? "approval"
        : log.changeType === "PAYMENT_STATUS"
        ? "payment"
        : "validation",

    actor:
      log?.changedBy?.firstName
        ? `${log.changedBy.firstName} ${log.changedBy.lastName || ""}`
        : log.source,

    time: new Date(log.createdAt).toLocaleString(),

    message:
      log.changeType === "EDIT"
        ? `Updated ${log.changes?.length || 0} field(s)`
        : `${log.changeType} performed`,

    meta:
      log.changes?.length
        ? log.changes
            .map(
              (c: any) =>
                `${c.field}: ${c.oldValue || "-"} → ${c.newValue || "-"}`
            )
            .join(" | ")
        : log.auditLevel,
  }));
}, [rowAuditList.data]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => navigate("/invoice-review")}>
          Back to Invoice Review
        </Button>
      </div>
             <SectionHeader
        title={`Invoice Detail ${
          invoice?.aiExtraction?.invoiceNumber
            ? " - " + invoice.aiExtraction.invoiceNumber
            : ""
        }`}
        subtitle={`${invoice?.vendorId?.name} · ${invoice?.versionValue}`}
        // actions={
        //   <>
        //     <Button variant="ghost">Filter</Button>
        //     <Button variant="outline" disabled={!anySelected}>
        //       Revalidate
        //     </Button>

        //     {editMode ? (
        //       <>
        //         <Button variant="success" onClick={() => setEditMode(false)}>Save Changes</Button>
        //         <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
        //       </>
        //     ) : (
        //       <>
        //         {/* <Button variant="outline" onClick={() => setEditMode(true)}>Edit</Button> */}
        //         <Button variant="ghost">Export</Button>
        //       </>
        //     )}
        //   </>
        // }
      />
     

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
          {infoFields.map(f => (
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:"#6B7280" }}>{f.label}</div>
              <div style={{ fontSize:13, fontWeight:600 }}>{f.value}</div>
            </div>
          ))}

          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"#6B7280" }}>
              Approval Status
            </div>

            {editMode ? (
              <Select
                options={["Analyst Review","Approved","Revalidation Needed","Rate Violation","Paid"].map(v => ({ value:v, label:v }))}
                value={status}
                onChange={(v:any) => setStatus(v)}
              />
            ) : (
              <Pill label={status} color="red" />
            )}
          </div>
        </div>
      </Card>

             <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  }}
>
  <div
    style={{
      fontSize: 14,
      fontWeight: 600,
      color: "#1A1D2E"
    }}
  >
    Invoice Line Items
  </div>

  <div style={{ display: "flex", gap: 8 }}>
    <Button variant="ghost">Filter</Button>
    {/* <Button
  variant="primary"
  onClick={() => setAddOpen(true)}
>
  Add Line Item
</Button> */}
    <Button variant="outline" disabled={!anySelected}>
      Revalidate
    </Button>
    <Button variant="ghost">Export</Button>
  </div>
</div>
     <div style={{ position: "relative" }}>
  <DataTable
    columns={itemCols}
    rows={rows}
    keyField="_id"
    onRowClick={(row) => handleAuditOpen(row)}
  />

  {(loading || pageLoading) && (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(255,255,255,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="spinner" />
    </div>
  )}
</div>

      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        marginTop:12,
        fontSize:12,
        color:"#6B7280"
      }}>
        <span>Total Records: {rowCount}</span>

         {/* Pagination */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
  {/* Prev button */}
  <button
    disabled={paginationModel.page === 0}
    onClick={() =>
      setPaginationModel((prev) => ({
        ...prev,
        page: prev.page - 1,
      }))
    }
    style={{
      width: 28,
      height: 28,
      borderRadius: 6,
      border: "1px solid #E4E7F0",
      background: "white",
      cursor: "pointer",
      opacity: paginationModel.page === 0 ? 0.4 : 1,
    }}
  >
    ‹
  </button>

  {/* Page numbers (max 5) */}
  {getPageNumbers().map((i) => (
    <button
      key={i}
      onClick={() =>
        setPaginationModel((prev) => ({
          ...prev,
          page: i,
        }))
      }
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: `1px solid ${
          i === paginationModel.page ? "#3B2FD9" : "#E4E7F0"
        }`,
        background: i === paginationModel.page ? "#3B2FD9" : "white",
        color: i === paginationModel.page ? "white" : "#1A1D2E",
        cursor: "pointer",
      }}
    >
      {i + 1}
    </button>
  ))}

  {/* Next button */}
  <button
    disabled={paginationModel.page >= totalPages - 1}
    onClick={() =>
      setPaginationModel((prev) => ({
        ...prev,
        page: prev.page + 1,
      }))
    }
    style={{
      width: 28,
      height: 28,
      borderRadius: 6,
      border: "1px solid #E4E7F0",
      background: "white",
      cursor: "pointer",
      opacity: paginationModel.page >= totalPages - 1 ? 0.4 : 1,
    }}
  >
    ›
  </button>
</div>
      </div>

      <Modal
  open={auditOpen}
  onClose={() => setAuditOpen(false)}
  title=''
  width={900}  
  footer={
    <Button variant="ghost" onClick={() => setAuditOpen(false)}>
      Close
    </Button>
  }
>
  <div
    style={{
      maxHeight: "70vh",
      overflowY: "auto",
      paddingRight: 8
    }}
  >
    <AuditTrail
      caseNumber={selectedCaseNumber}
      entries={mappedRowAuditLogs}
      onAddComment={() => setCommentOpen(true)}
    />
  </div>
</Modal>
{/* <InvoiceRowModal
  open={addOpen}
  mode="add"
  onClose={() => setAddOpen(false)}
  onSave={(data) => {
    console.log(data);
    setAddOpen(false);
  }}
  width={900}  
/> */}
<InvoiceRowModal
  openModal={editOpen}
  modalMode="edit"
  formData={formData}
  openDialog={false}
  deleteId={null}
  listCurrentData={listCurrentData}
  sourceVersionData={sourceVersionData}
  columns={[]}
  handleCloseModal={() => setEditOpen(false)}
  handleCloseDialog={() => {}}
  handleConfirmDelete={() => {}}
  handleSave={handleSave}
  setFormData={setFormData}
  switchToEditMode={() => {}}
  dataSourceId={import.meta.env.VITE_INVOICE_DATASOURCE_ID}
  refreshData={() => sourceVersionData.refetch()}
  attributeListData={attributeList?.data?.data || []}
/>
      <AuditTrail entries={mappedInvoiceAuditLogs} onAddComment={() => setCommentOpen(true)} />

      <ConfirmModal
        open={forceOpen}
        onClose={() => setForceOpen(false)}
        onConfirm={() => setForceOpen(false)}
        title="Force Validation Pass"
        confirmLabel="Confirm Force Pass"
        confirmVariant="force"
        message={<>Force-passing <strong>{forceCase}</strong></>}
        warning="This action is irreversible."
      />

      <Modal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        title="Add Comment / Note"
        subtitle="Add a note to the audit trail for invoice INV-1021"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCommentOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setCommentOpen(false)}>Add to Audit Trail</Button>
          </>
        }
      >
        <FormGrid cols={1}>
          <FormField label="Comment Type">
            <Select value="" onChange={() => {}} options={["General Note","Request to Vendor","Internal Escalation","Correction Note"].map(v=>({value:v,label:v}))} />
          </FormField>
          <FormField label="Comment *">
            <TextArea rows={4} placeholder="Enter your comment or note..." />
          </FormField>
          <FormField label="Priority">
            <Select value="" onChange={() => {}} options={["Normal","High","Urgent"].map(v=>({value:v,label:v}))} />
          </FormField>
        </FormGrid>
      </Modal>
    </div>
  );
};