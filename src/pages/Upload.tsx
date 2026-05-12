import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import { useForm, Controller } from "react-hook-form";
import CommonDatePicker from "../components/common/datePicker/datePicker";
import usePostMultipart from "../hooks/usePostMultipleMultipart";
import { POST } from "../services/apiRoutes";
import useGet from "../hooks/useGet";
import { GET } from "../services/apiRoutes";
import { useUploadCustomReportFile } from "../hooks/useFileUpalod";

type UploadTab   = "activity" | "invoice";
type UploadState = "idle" | "ready" | "uploaded";

interface FileZoneProps {
  id:        string;
  state:     UploadState;
  accept:    string;
  label:     string;
  subLabel:  string;
  isInvoice?: boolean;
  files?: File[];
  onFile: (files: File[]) => void;
  onUpload:  () => void;
}
const ACTIVITY_TYPE_OPTIONS = ["MailBox","Action","Disclosure","Portfolio"];
// const VENDOR_OPTIONS = ["WBD","AOMB","CCPIT","JAH","Allegro","Saba","Quicker","S Y-CHA","EP&C","Lavery","Conley Rose"];
const REGION_OPTIONS = ["United States","Europe","China","Japan","South Korea","All Regions"];

const FileZone: React.FC<FileZoneProps> = ({ id, state, files, accept, label, subLabel, onFile, onUpload }) => {
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFile(files);
  }, [onFile]);

  const isUploaded = state === "uploaded";
  const isReady    = state === "ready";

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !isUploaded && document.getElementById(id)?.click()}
      style={{
        border: `2px dashed ${isUploaded ? "#16A34A" : dragging ? "#7C4DFF" : "#3B2FD9"}`,
        borderStyle: isUploaded ? "solid" : "dashed",
        borderRadius: 10,
        padding: 28,
        textAlign: "center",
        background: isUploaded ? "#F8F9FF" : dragging ? "#EEF0FF" : "#F8F9FF",
        cursor: isUploaded ? "default" : "pointer",
        transition: "all 0.2s",
        marginBottom: 16,
      }}
    >
      <input id={id} type="file" multiple accept={accept} style={{ display: "none" }} onChange={e => {
  const files = Array.from(e.target.files || []);
  if (files.length) onFile(files);
}} />
      <svg width="32" height="32" viewBox="0 0 24 24" fill={isUploaded ? "#16A34A" : "#3B2FD9"} style={{ display: "block", margin: "0 auto 8px" }}>
        {isUploaded
          ? <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          : <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>}
      </svg>
      <div style={{ fontSize: 14, fontWeight: 600, color: isUploaded ? "#16A34A" : "#3B2FD9" }}>
        {isUploaded ? "File uploaded successfully" : files?.length
  ? `${files[0].name}${files.length > 1 ? ` +${files.length - 1} more` : ""}`
  : label}
      </div>
      {!isUploaded && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{subLabel}</div>}
    </div>
  );
};

interface FieldProps { label: string; required?: boolean; children: React.ReactNode; }
const Field: React.FC<FieldProps> = ({ label, required, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}{required && <span style={{ color: "#DC2626", marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
);

type SelectOption =
  | string
  | {
      value: string;
      label: string;
    };

const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: "100%",
      border: "1.5px solid #E4E7F0",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 13,
      fontFamily: "inherit",
      color: "#1A1D2E",
      background: "#fff",
      outline: "none",
      cursor: "pointer"
    }}
  >
    <option value="">Select...</option>

    {options.map((o) =>
      typeof o === "string" ? (
        <option key={o} value={o}>
          {o}
        </option>
      ) : (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      )
    )}
  </select>
);

interface StepProps { steps: string[]; done: boolean[]; }
const FlowSteps: React.FC<StepProps> = ({ steps, done }) => (
  <div style={{ background: "#fff", border: "1px solid #E4E7F0", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", overflowX: "auto", gap: 0 }}>
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: done[i] ? "#16A34A" : "#3B2FD9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
            {done[i] ? <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> : i + 1}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: done[i] ? "#16A34A" : "#1A1D2E", whiteSpace: "nowrap" }}>{s}</span>
        </div>
        {i < steps.length - 1 && <div style={{ width: 24, height: 2, background: done[i] ? "#16A34A" : "#E4E7F0", margin: "0 8px", flexShrink: 0 }} />}
      </React.Fragment>
    ))}
  </div>
);

type UploadProps = {
  onNavigate: (page: any) => void;
};

export const Upload: React.FC<UploadProps> = ({ onNavigate }) => {
  const [tab,     setTab]     = useState<UploadTab>("activity");
  const [vendor,  setVendor]  = useState("");
  const [activityType,  setActivityType]  = useState("");
  const [region,  setRegion]  = useState("");
  const [actFiles, setActFiles] = useState<File[]>([]);
  const [invFiles, setInvFiles] = useState<File[]>([]);
  const [invoiceMonth, setInvoiceMonth] = useState(
    DateTime.now().toFormat("yyyy-MM")
  );
  const [actState, setActState] = useState<UploadState>("idle");
  const [invState, setInvState] = useState<UploadState>("idle");

  const handleActFile = (files: File[]) => {
    setActFiles(prev => [...prev, ...files]);
    setActState("ready");
  };
  const handleInvFile = (files: File[]) => {
    setInvFiles(prev => [...prev, ...files]);
    setInvState("ready");
  };

  const done = [actState === "uploaded", invState === "uploaded", false, false];

  const navigate = useNavigate();

  const { control, handleSubmit, reset } = useForm({
  defaultValues: {
    activityMonth: DateTime.now().toFormat("yyyy-MM"),
    invoiceMonth: DateTime.now().toFormat("yyyy-MM"),
  },
});

const { mutate: mutateReportUpload, isPending: isInvoiceUploading } =
  useUploadCustomReportFile();


const { data: vendorData, isLoading: vendorLoading } = useGet<{
  success: boolean;
  data: any[];
}>(
  ["vendorList"],
  GET.Vendor_List,
  true
);

const vendorOptions =
  vendorData?.data?.map((vendor) => ({
    value: vendor._id,
    label: vendor.name,
  })) || [];

  const createActivity = usePostMultipart(
    ["createActivity"],
    (data) => {
      if (data?.success) {
        setActState("idle");
        setActFiles([]);
        setActivityType("");

        reset({
          activityMonth: DateTime.now().toFormat("yyyy-MM"),
          invoiceMonth: DateTime.now().toFormat("yyyy-MM"),
        });
      }
    },
    true
  );

  const handleActivitySubmit = (data: any) => {
    if (!actFiles.length || !activityType) return;

    createActivity.mutate({
      url: POST.Create_Activity,
      payload: {
        activityType: activityType.toLowerCase(),
        versionValue: DateTime.fromISO(data.activityMonth).toFormat("yyyy-LL"),
        files: actFiles,
      },
    });
  };

  const handleInvoiceSubmit = (data: any) => {
  if (!invFiles.length || !vendor) return;

  const formattedVersion = DateTime.fromISO(data.invoiceMonth).toFormat("yyyy-LL");

  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const formData = new FormData();

formData.append("dataSourceId", import.meta.env.VITE_INVOICE_DATASOURCE_ID);
formData.append("versionValue", formattedVersion);
formData.append("versionName", `version_${Date.now()}_${randomSuffix}`);
formData.append("operation", "dataSourceVersionAI");
formData.append("mappings", JSON.stringify({}));
formData.append("vendorId", vendor);

invFiles.forEach((file) => {
  formData.append("files", file);
});

mutateReportUpload(formData, {
  onSuccess: (res: any) => {
    if (res?.status === "pending") {
      setInvState("uploaded");
      setInvFiles([]);
      setVendor("");

      reset({
        activityMonth: DateTime.now().toFormat("yyyy-MM"),
        invoiceMonth: DateTime.now().toFormat("yyyy-MM"),
      });
    }
  },
  onError: (err: any) => {
    console.error(err);
  },
});
};

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1D2E", margin: 0 }}>Data Upload</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Upload source data required for invoice validation</p>
        </div>
      </div>

      {/* <FlowSteps steps={["Upload Activity Data","Upload Vendor Invoice"]} done={done} /> */}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #E4E7F0", marginBottom: 20 }}>
        {([["activity","Monthly Activity"],["invoice","Vendor Invoice"]] as [UploadTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ border: "none", background: "none", cursor: "pointer", padding: "10px 18px", fontSize: 13, fontWeight: tab === id ? 700 : 500, color: tab === id ? "#3B2FD9" : "#6B7280", borderBottom: `2px solid ${tab === id ? "#3B2FD9" : "transparent"}`, marginBottom: -2, fontFamily: "inherit" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Activity upload */}
      {tab === "activity" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "#3B2FD912", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Monthly System Activity Upload</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Upload monthly IP activity data — filings, office actions, renewals</div>
            </div>
          </div>
          <div style={{ height: 1, background: "#E4E7F0", marginBottom: 16 }} />
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <Field label="Activity Type" required>
              <Select value={activityType} onChange={setActivityType} options={ACTIVITY_TYPE_OPTIONS} />
            </Field>
            <Field label="Activity Month" required>
            <Controller
              name="activityMonth"
              control={control}
              render={({ field }) => (
                <CommonDatePicker
                  name={field.name}
                  control={control}
                  views={["year", "month"]}
                  label=""
                />
              )}
            />
          </Field>
          </div>
          <FileZone id="act-file" state={actState} files={actFiles} accept=".xlsx,.csv,.pdf" label="Drag & drop or click to browse" subLabel="Supports .xlsx, .csv, .pdf" onFile={handleActFile} onUpload={() => setActState("uploaded")} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Pill state={actState} />
            <button disabled={actState === "idle" || createActivity.isPending} onClick={handleSubmit(handleActivitySubmit)} style={{ padding: "8px 16px", background: actState === "uploaded" ? "transparent" : "linear-gradient(135deg,#3B2FD9,#7C4DFF)", color: actState === "uploaded" ? "#6B7280" : "#fff", border: actState === "uploaded" ? "1px solid #E4E7F0" : "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: actState === "idle" ? "not-allowed" : "pointer", opacity: actState === "idle" ? 0.4 : 1, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              {actState === "uploaded" ? "✓ Submitted" : "Submit Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Invoice upload */}
      {tab === "invoice" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E4E7F0", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "#3B2FD912", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B2FD9"><path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Vendor Invoice Upload</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Upload vendor PDF invoice for AI extraction and validation</div>
            </div>
          </div>
          <div style={{ height: 1, background: "#E4E7F0", marginBottom: 16 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <Field label="Vendor" required>
              <Select
  value={vendor}
  onChange={setVendor}
  options={vendorOptions}
/>
            </Field>
            <Field label="Invoice Month" required>
  <Controller
    name="invoiceMonth"
    control={control}
    render={({ field }) => (
      <CommonDatePicker
        name={field.name}
        control={control}
        views={["year", "month"]}
        label=""
      />
    )}
  />
</Field>
          </div>
          <FileZone id="inv-file" state={invState} files={invFiles} accept=".pdf" label="Drag & drop or click to browse" subLabel="PDF invoice files accepted" isInvoice onFile={handleInvFile} onUpload={() => setInvState("uploaded")} />
         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <Pill state={invState} />

  <div style={{ display: "flex", gap: 10 }}>
   <button
    disabled={invState !== "uploaded"}
    onClick={() => navigate("/invoice-review")}
    style={{
      padding: "8px 16px",
      background:
        invState === "uploaded" ? "#fff" : "#F9FAFB",
      color:
        invState === "uploaded"
          ? "#3B2FD9"
          : "#9CA3AF",
      border:
        invState === "uploaded"
          ? "1px solid #3B2FD9"
          : "1px solid #E5E7EB",
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 13,
      cursor:
        invState === "uploaded"
          ? "pointer"
          : "not-allowed",
      opacity: invState === "uploaded" ? 1 : 0.65,
      fontFamily: "inherit"
    }}
  >
    Go to Invoice List
  </button>

    <button
      disabled={!invFiles.length || !vendor || isInvoiceUploading}
      onClick={handleSubmit(handleInvoiceSubmit)}
      style={{
        padding: "8px 16px",
        background: invState === "uploaded"
          ? "transparent"
          : "linear-gradient(135deg,#3B2FD9,#7C4DFF)",
        color: invState === "uploaded" ? "#6B7280" : "#fff",
        border: invState === "uploaded" ? "1px solid #E4E7F0" : "none",
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 13,
        cursor: invState === "idle" ? "not-allowed" : "pointer",
        opacity: invState === "idle" ? 0.4 : 1,
        fontFamily: "inherit"
      }}
    >
     {isInvoiceUploading
  ? "Uploading..."
  : invState === "uploaded"
  ? "✓ Submitted"
  : "Submit for Validation"}
    </button>
  </div>
</div>
        </div>
      )}
    </div>
  );
};

const Pill: React.FC<{ state: UploadState }> = ({ state }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: state === "uploaded" ? "#FCFCFC" : "#F3F4F6", color: state === "uploaded" ? "#15803D" : "#374151" }}>
    {state === "uploaded" ? "Validated" : state === "ready" ? "Ready to submit" : "Awaiting upload"}
  </span>
);
