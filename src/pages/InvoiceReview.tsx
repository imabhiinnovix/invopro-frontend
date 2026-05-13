import React, { useState, useMemo, useEffect } from "react";
import type { PageProps, Invoice, InvoiceStatus } from "../types";
import useGet from "../hooks/useGet";
import { GET } from "../services/apiRoutes";
import { riskColor, statusColor } from "../utils/helpers";
import { SectionHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pill } from "../components/ui/Pill";
import { Tabs, SearchBox } from "../components/ui/Tabs";
import { DataTable, Column } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/Modal";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDate, formatDateWithoutTime } from "../utils/utils";
import { useAppDispatch } from "../storeHooks";
import { setMergedInvoices } from "../reducers/invoiceSlice";
import usePost from "../hooks/usePost";
import { toast } from "react-toastify";


interface ForceState { open: boolean; ref: string; }

export const InvoiceReview: React.FC<PageProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [force, setForce] = useState<ForceState>({ open: false, ref: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
    

  const [selectedByTab, setSelectedByTab] = useState<Record<string, Record<string, boolean>>>({});
  const selected = selectedByTab[tab] || {};

  const navigate = useNavigate();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });



const dispatch = useAppDispatch();

  const invoiceList = useGet<{
  success: boolean;
  data: Invoice[];
  totalCount: number;
  summary: any[];
  }>(
    ["invoiceList", paginationModel.page, paginationModel.pageSize],
    `${GET.Data_Source_Version}/list?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&dataSourceId=${import.meta.env.VITE_INVOICE_DATASOURCE_ID}`,
    true
  );

const mergedData = useMemo(() => {
  const rows = invoiceList?.data?.data || [];
  const summary = invoiceList?.data?.summary || [];

  const summaryMap = new Map(summary.map(s => [s.dataSourceVersionId, s]));

  return rows.map(row => {
    const s = summaryMap.get(row._id);

    return {
      ...row,
      totalLineItems: s?.totalLineItems,
      totalAmount: s?.totalAmount,
      totalApprovedCount: s?.totalApprovedCount,
      totalFlaggedCount: s?.totalFlaggedCount
    };
  });
}, [invoiceList?.data]);

useEffect(() => {
  if (mergedData?.length) {
    dispatch(setMergedInvoices(mergedData));
  }
}, [mergedData, dispatch]);

 const filtered = useMemo<Invoice[]>(() => {
  let rows = mergedData;

  if (tab === "pending")
    rows = rows.filter(i => !["Approved", "Paid"].includes(i.status));

  if (tab === "violation")
    rows = rows.filter(i => i.status === "Rate Violation");

  if (tab === "approved")
    rows = rows.filter(i => ["Approved", "Paid"].includes(i.status));

  if (search)
    rows = rows.filter(i =>
      i.vendor?.toLowerCase().includes(search.toLowerCase()) ||
      i.id?.toLowerCase().includes(search.toLowerCase())
    );

  return rows;
}, [mergedData, tab, search]);

  // const allSelected =
  //   filtered.length > 0 && filtered.every(r => selected[r.id]);

const anySelected = !!selectedId;

  // const toggleAll = () => {
  //   const newState: Record<string, boolean> = {};

  //   if (!allSelected) {
  //     filtered.forEach(r => {
  //       newState[r.id] = true;
  //     });
  //   }

  //   setSelectedByTab(prev => ({
  //     ...prev,
  //     [tab]: newState
  //   }));
  // };

const toggleOne = (id: string) => {
  setSelectedId(prev => (prev === id ? null : id));
};
const sendRevalidateRows = usePost<any, any>(
  ["sendRevalidateRows"],
  (res) => {
    if (res?.success) {
      toast.success("Revalidation triggered successfully");
      setSelectedId(null); // ✅ correct reset
      invoiceList.refetch?.(); // or your correct query refetch
    }
  },
  true
);
const handleRevalidate = async () => {
  try {
    if (!selectedId) {
      toast.error("Please select a row");
      return;
    }

    const payload = {
      dataSourceId: import.meta.env.VITE_INVOICE_DATASOURCE_ID,
      versionId: selectedId,
      isAllSelected: true,
    };

    await sendRevalidateRows.mutateAsync({
      url: "/common/dataSourceVersion/revalidateRows",
      payload,
    });

    // clear only current tab selection
    setSelectedByTab((prev) => ({
      ...prev,
      [tab]: {},
    }));

  } catch (err) {
    toast.error("Revalidation failed");
  }
};

  const columns: Column<Invoice>[] = [
   {
  key: "_cb",
  label: "", // ✅ no select-all checkbox
  render: (_: any, r) => (
    <div onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={selectedId === r._id}
        onChange={() => toggleOne(r._id as string)}
      />
    </div>
  )
},
    {
    key: "vendorId",
    label: "Vendor",
    render: (_: any, r: any) => (
      <strong>{r?.vendorId?.name || r?.vendor || "-"}</strong>
    )
    },
    {
      key: "invoiceNumber",
      label: "Invoice No.",
      render: (_, r: any) =>
        r?.aiExtraction?.invoiceNumber || "-"
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      render: (_, r: any) =>
        r?.aiExtraction?.invoiceDate
          ? formatDateWithoutTime(r.aiExtraction.invoiceDate)
          : "-"
    },
    {
      key: "versionValue",
      label: "Billing Period",
      render: (_: any, r: any) =>
        r?.versionValue || "-"
    },
   {
      key: "totalAmount",
      label: "Total Amount",
      render: (v, r: any) =>
        formatCurrency(
          v || 0,
          r?.aiExtraction?.conversion?.baseCurrency || "USD"
        )
    },
    {
      key: "totalLineItems",
      label: "Line Items",
      render: (v) => v ?? 0,
    },
   {
      key: "totalApprovedCount",
      label: "Matched",
      render: (v) => (
        <span style={{ color: "#16A34A", fontWeight: 600 }}>
          {v ?? 0}
        </span>
      ),
    },
   {
  key: "totalFlaggedCount",
  label: "Flagged",
  render: (v) => (
    <span style={{ color: "#DC2626", fontWeight: 600 }}>
      {v ?? 0}
    </span>
  ),
},
    { key:"risk", label:"Risk" },
    { key:"aiStatus", label:"Status", render:v => <Pill label={String(v)} color={statusColor(v as any)} /> },
    {
      key:"_actions",
      label:"Actions",
      render:(_, r) => {
        const isFlagged = !["Approved","Paid"].includes(r.status as InvoiceStatus);

        return (
          <div style={{ display:"flex", gap:5 }}>
            <Button
              size="sm"
              variant="primary"
              onClick={e => {
                e.stopPropagation();
               navigate(`/inv-detail/${r._id}`);
              }}
            >
              Review
            </Button>

            {/* {isFlagged && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setForce({ open:true, ref: r.id as string });
                }}
                style={{
                  background:"#7C4DFF",
                  color:"#fff",
                  border:"none",
                  borderRadius:6,
                  padding:"4px 10px",
                  fontSize:11,
                  fontWeight:700,
                  cursor:"pointer"
                }}
              >
                Force Pass
              </button>
            )} */}
          </div>
        );
      }
    }
  ];

  if (invoiceList.isLoading) {
  return <div>Loading invoices...</div>;
}

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Invoice Review & Audit"
        subtitle="Last updated: 20 Apr 2026 01:23:47 PM"
      />

      {/* ✅ Tabs + Actions */}
      <Tabs
  active={tab}
  onChange={(t) => setTab(t)}
  tabs={[
    { id:"all", label:"All Invoices", count: invoiceList?.data?.totalCount || 0},
    { id:"pending", label:"Not Approved", count:invoiceList?.data?.data?.filter(i=>!["Approved","Paid"].includes(i.status)).length },
    // { id:"violation", label:"Rate Violations", count:invoiceList?.data?.data?.filter(i=>i.status==="Rate Violation").length },
    { id:"approved", label:"Approved / Paid", count:invoiceList?.data?.data?.filter(i=>["Approved","Paid"].includes(i.status)).length },
  ]}
/>

      <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
  gap: 10
}}>
  {/* Search */}
  <div style={{ flex: 1, maxWidth: 320 }}>
    <SearchBox
      value={search}
      onChange={setSearch}
      placeholder="Search vendor or invoice..."
    />
  </div>

  {/* Actions */}
  <div style={{ display: "flex", gap: 8 }}>
    <Button variant="ghost">Filter</Button>

    {tab !== "approved" && (
     <Button
  variant="outline"
  disabled={!anySelected}
  onClick={handleRevalidate}
>
  Revalidate
</Button>
    )}
  </div>
</div>

      <DataTable<Invoice>
        columns={columns}
        rows={filtered}
        onRowClick={(row) => navigate(`/inv-detail/${row._id}`)}
        keyField="_id"
      />

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontSize:12, color:"#6B7280" }}>
        <span>Total Records: {filtered.length}</span>
        <div style={{ display:"flex", gap:4 }}>
  {Array.from({
    length: Math.ceil(
      (invoiceList?.data?.totalCount || 0) / paginationModel.pageSize
    )
  }).map((_, i) => (
    <button
      key={i}
      onClick={() =>
        setPaginationModel(prev => ({
          ...prev,
          page: i
        }))
      }
      style={{
        width:28,
        height:28,
        borderRadius:6,
        border:`1px solid ${
          i === paginationModel.page ? "#3B2FD9" : "#E4E7F0"
        }`,
        background:
          i === paginationModel.page ? "#3B2FD9" : "white",
        color:
          i === paginationModel.page ? "white" : "#1A1D2E",
        cursor:"pointer"
      }}
    >
      {i + 1}
    </button>
  ))}
</div>
      </div>

      <ConfirmModal
        open={force.open}
        onClose={() => setForce({ open:false, ref:"" })}
        onConfirm={() => setForce({ open:false, ref:"" })}
        title="Force Validation Pass"
        confirmLabel="Confirm Force Pass"
        confirmVariant="force"
        message={
          <>You are about to force-pass flagged record <strong>{force.ref}</strong>.</>
        }
        warning="This action is irreversible."
      />
    </div>
  );
};