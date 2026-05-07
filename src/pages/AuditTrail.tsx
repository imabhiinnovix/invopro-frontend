import React, { useMemo, useState } from "react";
import { AUDIT_LOG } from "../data/mockData";
import { SectionHeader, Card } from "../components/ui/Card";
import { AuditTrail } from "../components/AuditTrail";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Select, FormGrid, FormField, TextArea } from "../components/ui/FormField";

export const AuditTrailPage: React.FC<{
  onNavigate: (page: string, params?: any) => void;
  params?: any;
}> = ({ onNavigate, params }) => {

  const caseNumber = params?.case;

  const [commentOpen, setCommentOpen] = useState(false);

  const logs = useMemo(() => {
    return AUDIT_LOG;
    if (!caseNumber) return AUDIT_LOG;
    return AUDIT_LOG.filter(l => l.case === caseNumber);
  }, [caseNumber]);

  return (
    <div style={{ padding: 24 }}>

      {/* HEADER */}
      <div style={{ marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => onNavigate("inv-detail")}>
          Back to Invoice Detail
        </Button>
      </div>

      {/* <SectionHeader
        title="Audit Trail"
        subtitle={caseNumber ? `Case: ${caseNumber}` : "System-wide audit logs"}
      /> */}

      {/* CONTEXT BANNER */}
      {/* {caseNumber && (
        <Card style={{ marginTop: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280" }}>
            Showing audit history for:
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 700,
            color: "#3B2FD9",
            marginTop: 4
          }}>
            {caseNumber}
          </div>
        </Card>
      )} */}

      {/* ✅ ONLY CHANGE HERE (ADD onAddComment like InvoiceDetail) */}
      <Card>
        <AuditTrail
          caseNumber={caseNumber}
          entries={logs}
          onAddComment={() => setCommentOpen(true)}
        />
      </Card>

      {/* COMMENT MODAL (same style as InvoiceDetail) */}
      <Modal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        title="Add Comment / Note"
        subtitle={`Add a note to audit trail for ${caseNumber || "system"}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCommentOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setCommentOpen(false)}>
              Add to Audit Trail
            </Button>
          </>
        }
      >
        <FormGrid cols={1}>
          <FormField label="Comment Type">
            <Select
              value=""
              onChange={() => {}}
              options={[
                "General Note",
                "Request to Vendor",
                "Internal Escalation",
                "Correction Note"
              ].map(v => ({ value: v, label: v }))}
            />
          </FormField>

          <FormField label="Comment *">
            <TextArea rows={4} placeholder="Enter your comment..." />
          </FormField>

          <FormField label="Priority">
            <Select
              value=""
              onChange={() => {}}
              options={[
                "Normal",
                "High",
                "Urgent"
              ].map(v => ({ value: v, label: v }))}
            />
          </FormField>
        </FormGrid>
      </Modal>

    </div>
  );
};