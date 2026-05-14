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
import { formatCurrency, formatDateWithoutTime } from "../utils/utils";
import { useAppDispatch } from "../storeHooks";
import { setMergedInvoices } from "../reducers/invoiceSlice";
import usePost from "../hooks/usePost";
import { toast } from "react-toastify";
import InvoiceReviewFilterModal from "../components/InvoiceReviewFilterModal";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { setDataSourceList } from "./dataSources/dataSourceActions";


interface ForceState { open: boolean; ref: string; }

export const InvoiceReview: React.FC<PageProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState<string>("all");
  // const [search, setSearch] = useState<string>("");
  const [force, setForce] = useState<ForceState>({ open: false, ref: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
    

  const [selectedByTab, setSelectedByTab] = useState<Record<string, Record<string, boolean>>>({});
  const selected = selectedByTab[tab] || {};

  const navigate = useNavigate();

  // const [paginationModel, setPaginationModel] = useState({
  //   page: 0,
  //   pageSize: 10,
  // });

  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

// const [selectedVendor, setSelectedVendor] = useState("");
// const [selectedYear, setSelectedYear] = useState("");
// const [selectedMonth, setSelectedMonth] = useState("");
// const [uploadedDateFilter, setUploadedDateFilter] = useState<any[]>([]);
// const [debouncedSearch, setDebouncedSearch] = useState("");

type TabFilterState = {
  search: string;
  debouncedSearch: string;
  vendor: string;
  year: string;
  month: string;
  uploadedDate: {
  startDate: string;
  endDate: string;
};
  pagination: {
    page: number;
    pageSize: number;
  };
};

const defaultTabState: TabFilterState = {
  search: "",
  debouncedSearch: "",
  vendor: "",
  year: "",
  month: "",
  uploadedDate: {
  startDate: "",
  endDate: ""
},
  pagination: {
    page: 0,
    pageSize: 10,
  },
};

const [tabState, setTabState] = useState<Record<string, TabFilterState>>({
  all: { ...defaultTabState },
  pending: { ...defaultTabState },
  approved: { ...defaultTabState },
});
const current = tabState[tab];

const [yearOptions, setYearOptions] = useState<string[]>([]);
const [monthOptions, setMonthOptions] = useState<string[]>([]);  

const [tabCounts, setTabCounts] = useState({
  total: 0,
  other: 0,
  approvedPaid: 0
});

const [countsInitialized, setCountsInitialized] = useState(false);

// const [tableLoading, setTableLoading] = useState(false);

//   useEffect(() => {
//   const timer = setTimeout(() => {
//     setDebouncedSearch(search);
//   }, 500);

//   return () => clearTimeout(timer);
// }, [search]);
useEffect(() => {
  const activeSearch = current.search;

  const timer = setTimeout(() => {
    setTabState(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        debouncedSearch: activeSearch
      }
    }));
  }, 500);

  return () => clearTimeout(timer);
}, [current.search, tab]);

useEffect(() => {
  setSelectedId(null);
}, [tab]);



const dispatch = useAppDispatch();

const aiStatus =
  tab === "approved"
    ? "approvedPaid"
    : tab === "pending"
    ? "other"
    : "";

  const invoiceList = useGet(
  [
    "invoiceList",
    tab,
    current.pagination.page,
    current.pagination.pageSize,
    current.debouncedSearch,
    current.year,
    current.month,
    current.vendor,
    current.uploadedDate?.startDate,
    current.uploadedDate?.endDate,
    aiStatus
  ],
  `${GET.Data_Source_Version}/list?page=${current.pagination.page + 1}&limit=${current.pagination.pageSize}&dataSourceId=${import.meta.env.VITE_INVOICE_DATASOURCE_ID}&search=${encodeURIComponent(current.debouncedSearch)}&year=${current.year}&month=${current.month}&vendorId=${current.vendor}${aiStatus ? `&aiStatus=${aiStatus}` : ""}${current.uploadedDate?.startDate && current.uploadedDate?.endDate
    ? `&startDate=${current.uploadedDate.startDate}&endDate=${current.uploadedDate.endDate}`
    : ""}`,
  true
);

const tableLoading =
  invoiceList.isLoading && !invoiceList?.data?.data;

// useEffect(() => {
//   setTableLoading(invoiceList.isLoading);
// }, [invoiceList.isLoading]);

// useEffect(() => {
//   setTableLoading(true);
// }, [
//   tab,
//   current.pagination.page,
//   current.pagination.pageSize,
//   current.debouncedSearch,
//   current.year,
//   current.month,
//   current.vendor
// ]);

  // Your existing API call with refreshKey dependency
  const dataSourceNotivixListAPI = useGet(
    ["dataSourceNotivixList"], // Add refreshKey to dependency array
    GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
  );
  // Effect to update Redux when API data changes
  useEffect(() => {
    if (dataSourceNotivixListAPI.data?.success) {
      dispatch(setDataSourceList(dataSourceNotivixListAPI.data.data));
    }
  }, [dataSourceNotivixListAPI.data, dispatch]);


const { list } = useSelector((state: RootState) => state.dataSource);

const listCurrentData = list?.find(
  (item) => item._id === import.meta.env.VITE_INVOICE_DATASOURCE_ID
);

useEffect(() => {
  if (!listCurrentData?.allDataSourceVersions) return;

  const versions = listCurrentData.allDataSourceVersions;
  if (!versions.length) return;

  const parsed = versions.map((v: any) => v.versionValue);

  const yearsSet = new Set<string>();
  const monthsMap: Record<string, Set<string>> = {};

  parsed.forEach((val: string) => {
    const [year, month] = val.split("-");

    yearsSet.add(year);

    if (!monthsMap[year]) {
      monthsMap[year] = new Set();
    }

    monthsMap[year].add(month);
  });

  const years = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  setYearOptions(years);

  const latest = [...parsed].sort().reverse()[0];
  if (!latest) return;

  const [defaultYear, defaultMonth] = latest.split("-");

  setTabState(prev => {
    const updated = { ...prev };

    Object.keys(updated).forEach(key => {
      if (!updated[key].year && !updated[key].month) {
        updated[key] = {
          ...updated[key],
          year: defaultYear,
          month: defaultMonth
        };
      }
    });

    return updated;
  });

  setMonthOptions(
    Array.from(monthsMap[defaultYear] || []).sort()
  );
}, [listCurrentData]);

useEffect(() => {
  if (!listCurrentData?.allDataSourceVersions || !current.year) return;

  const versions = listCurrentData.allDataSourceVersions;

  const months = versions
    .map((v: any) => v.versionValue)
    .filter((val: string) => val.startsWith(current.year))
    .map((val: string) => val.split("-")[1]);

  const uniqueMonths = Array.from(new Set(months)).sort();

  setMonthOptions(uniqueMonths);

setTabState(prev => {
  if (uniqueMonths.includes(prev[tab].month)) return prev;

  return {
    ...prev,
    [tab]: {
      ...prev[tab],
      month: uniqueMonths[0] || ""
    }
  };
});
}, [current.year, listCurrentData, tab]);

const handleOpenFiltersModal = () => setIsFiltersModalOpen(true);
const handleCloseFiltersModal = () => setIsFiltersModalOpen(false);

const handleApplyFilters = (filters: any) => {
  setTabState(prev => ({
    ...prev,
    [tab]: {
      ...prev[tab],
      vendor: filters.vendor || "",
      year: filters.year || "",
      month: filters.month || "",
      uploadedDate: filters.uploadedDate || [],
      pagination: {
        ...prev[tab].pagination,
        page: 0
      }
    }
  }));

  setIsFiltersModalOpen(false);
};

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


useEffect(() => {
  if (!invoiceList?.data?.aiSummary) return;

  const summary = invoiceList.data.aiSummary;

  setTabCounts(prev => {
    // first load → set all
    if (!countsInitialized) {
      setCountsInitialized(true);

      return {
        total: summary.totalCount || 0,
        other: summary.otherCount || 0,
        approvedPaid: summary.approvedPaidCount || 0
      };
    }

    // after first load → update only active tab
    if (tab === "all") {
      return {
        ...prev,
        total: summary.totalCount || 0
      };
    }

    if (tab === "pending") {
      return {
        ...prev,
        other: summary.otherCount || 0
      };
    }

    if (tab === "approved") {
      return {
        ...prev,
        approvedPaid: summary.approvedPaidCount || 0
      };
    }

    return prev;
  });
}, [invoiceList?.data?.aiSummary, tab, countsInitialized]);

// const filtered = useMemo<Invoice[]>(() => {
//   let rows = mergedData;

//   if (tab === "pending")
//     rows = rows.filter(i => !["Approved", "Paid"].includes(i.status));

//   if (tab === "violation")
//     rows = rows.filter(i => i.status === "Rate Violation");

//   if (tab === "approved")
//     rows = rows.filter(i => ["Approved", "Paid"].includes(i.status));

//   return rows;
// }, [mergedData, tab]);
const filtered = mergedData;

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


 const vendorList = useGet<{
  success: boolean;
  data: any[];
}>(
  ["vendorList"],
  GET.Vendor_List,
  true
);


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
    { id:"all", label:"All Invoices", count: tabCounts.total },
    { id:"pending", label:"Not Approved", count: tabCounts.other },
    { id:"approved", label:"Approved / Paid", count: tabCounts.approvedPaid },
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
      value={current.search}
onChange={(val) =>
  setTabState(prev => ({
    ...prev,
    [tab]: {
      ...prev[tab],
      search: val
    }
  }))
}
      placeholder="Search vendor or invoice..."
    />
  </div>

  {/* Actions */}
  <div style={{ display: "flex", gap: 8 }}>
    <Button
  variant="ghost"
  onClick={() => setIsFiltersModalOpen(true)}
>
  Filter
</Button>

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

      
  <div style={{ position: "relative" }}>
  <DataTable<Invoice>
    columns={columns}
    rows={filtered}
    onRowClick={(row) => navigate(`/inv-detail/${row._id}`)}
    keyField="_id"
  />

  {tableLoading && (
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

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontSize:12, color:"#6B7280" }}>
        <span>Total Records: {filtered.length}</span>
        <div style={{ display:"flex", gap:4 }}>
  {Array.from({
    length: Math.ceil(
      (invoiceList?.data?.totalCount || 0) / current.pagination.pageSize
    )
  }).map((_, i) => (
    <button
      key={i}
      onClick={() =>
        setTabState(prev => ({
  ...prev,
  [tab]: {
    ...prev[tab],
    pagination: {
      ...prev[tab].pagination,
      page: i
    }
  }
}))
      }
      style={{
        width:28,
        height:28,
        borderRadius:6,
        border:`1px solid ${
          i === current.pagination.page ? "#3B2FD9" : "#E4E7F0"
        }`,
        background:
          i === current.pagination.page ? "#3B2FD9" : "white",
        color:
          i === current.pagination.page ? "white" : "#1A1D2E",
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
    <InvoiceReviewFilterModal
  open={isFiltersModalOpen}
  onClose={handleCloseFiltersModal}
  onApply={handleApplyFilters}
  vendors={vendorList?.data?.data || []}
  currentFilters={{
  vendor: current.vendor,
  year: current.year,
  month: current.month,
  uploadedDate: current.uploadedDate
}}
  yearOptions={yearOptions}
  monthOptions={monthOptions}
/>
    </div>
  );
};