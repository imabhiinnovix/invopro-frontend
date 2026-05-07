import React, { useState } from "react";
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


export const InvoiceDetail: React.FC<PageProps> = ({ onNavigate }) => {
  const inv = INVOICES[0];

  const [editMode, setEditMode] = useState(false);
  const [forceCase, setForceCase] = useState("");
  const [forceOpen, setForceOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
const [selectedCase, setSelectedCase] = useState("");
const [addOpen, setAddOpen] = useState(false);
const [editOpen, setEditOpen] = useState(false);
const [editingRow, setEditingRow] = useState<InvoiceLineItem | null>(null);

  const [status, setStatus] = useState(inv.status);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  
  const allSelected =
    INVOICE_LINE_ITEMS.length > 0 &&
    INVOICE_LINE_ITEMS.every(r => selected[r.case]);

  const anySelected = Object.values(selected).some(Boolean);

  const toggleAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const map: Record<string, boolean> = {};
      INVOICE_LINE_ITEMS.forEach(r => (map[r.case] = true));
      setSelected(map);
    }
  };

  const toggleOne = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const infoFields = [
    { label:"Vendor", value:inv.vendor },
    { label:"Invoice Number", value:inv.id },
    { label:"Billing Period", value:inv.period },
    { label:"Invoice Date", value:inv.date },
    { label:"Total Amount", value:`${inv.amount.toLocaleString()} ${inv.currency}` },
    { label:"Region", value:inv.region },
    { label:"Line Items", value:`${inv.items} total (${inv.matched} matched, ${inv.flagged} flagged)` },
    { label:"Validation Status", value:inv.flagged > 0 ? "Flagged" : "Clean" },
  ];

  const itemCols: Column<InvoiceLineItem>[] = [
    {
      key: "_cb",
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          onClick={e => e.stopPropagation()}
        />
      ),
      render: (_, r) => (
        <div onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!selected[r.case]}
            onChange={() => toggleOne(r.case as string)}
          />
        </div>
      )
    },

    { key:"case", label:"SABIC Case Ref", render:v => <span style={{ fontFamily:"monospace", fontSize:11, color:"#3B2FD9" }}>{String(v)}</span> },
    { key:"code", label:"Code", render:v => <span style={{ background:"#EEF0FF", color:"#3B2FD9", borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{String(v)}</span> },
    { key:"activity", label:"Activity" },
    { key:"attorney", label:"Attorney" },
    { key:"amount", label:"Amount (USD)", render:v => <strong>${fmtN(Number(v))}</strong> },

    {
      key:"matched",
      label:"Match Status",
      render:v => Boolean(v)
        ? <Pill label="Matched" color="green"/>
        : <Pill label="Unmatched" color="red"/>
    },

    { key:"reason", label:"Flag Reason", render:v => String(v) ? <span style={{ color:"#DC2626", fontSize:11 }}>{String(v)}</span> : <span style={{ color:"#6B7280" }}>—</span> },

    {
      key:"_actions",
      label:"Actions",
      render:(_, r) => (
        <div style={{ display:"flex", gap:6 }}>
          <Button
  size="sm"
  variant="outline"
  onClick={e => {
    e.stopPropagation();
    setEditingRow(r);
    setEditOpen(true);
  }}
>
  Edit
</Button>

          {/* {!r.matched ? (
            <button
              onClick={() => { setForceCase(r.case as string); setForceOpen(true); }}
              style={{ background:"#7C4DFF", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:700 }}
            >
              Force Pass
            </button>
          ) : <span style={{ color:"#6B7280" }}>—</span>} */}
        </div>
      )
    }
  ];

  // ✅ FIXED SAFE NAVIGATION
const handleAuditOpen = (caseNo: string) => {
  setSelectedCase(caseNo);
  setAuditOpen(true);
};

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => navigate("inv-review")}>
          Back to Invoice Review
        </Button>
      </div>
             <SectionHeader
        title={`Invoice Detail — ${inv.id}`}
        subtitle={`${inv.vendor} · ${inv.period}`}
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
    <Button
  variant="primary"
  onClick={() => setAddOpen(true)}
>
  Add Line Item
</Button>
    <Button variant="outline" disabled={!anySelected}>
      Revalidate
    </Button>
    <Button variant="ghost">Export</Button>
  </div>
</div>
      <DataTable<InvoiceLineItem>
  columns={itemCols}
  rows={INVOICE_LINE_ITEMS}
  keyField="case"
  onRowClick={(row) => handleAuditOpen(row.case)}
/>

      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        marginTop:12,
        fontSize:12,
        color:"#6B7280"
      }}>
        <span>Total Records: {INVOICE_LINE_ITEMS.length}</span>

        <div style={{ display:"flex", gap:4 }}>
          {[1,2,3].map(p => (
            <button
              key={p}
              style={{
                width:28,
                height:28,
                borderRadius:6,
                border:`1px solid ${p===1 ? "#3B2FD9" : "#E4E7F0"}`,
                background:p===1 ? "#3B2FD9" : "white",
                color:p===1 ? "white" : "#1A1D2E",
                cursor:"pointer",
                fontSize:12,
                fontWeight:600
              }}
            >
              {p}
            </button>
          ))}
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
      caseNumber={selectedCase}
      entries={AUDIT_LOG}
      onAddComment={() => setCommentOpen(true)}
    />
  </div>
</Modal>
<InvoiceRowModal
  open={addOpen}
  mode="add"
  invoiceId={inv.id}
  onClose={() => setAddOpen(false)}
  onSave={(data) => {
    console.log(data);
    setAddOpen(false);
  }}
  width={900}  
/>
<InvoiceRowModal
  open={editOpen}
  mode="edit"
  row={editingRow}
  invoiceId={inv.id}
  onClose={() => setEditOpen(false)}
  onSave={(data) => {
    console.log(data);
    setEditOpen(false);
  }}
  width={900}  
/>
      <AuditTrail entries={AUDIT_LOG} onAddComment={() => setCommentOpen(true)} />

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