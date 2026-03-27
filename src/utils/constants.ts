export const roleId = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  USER: 3,
};

export const colorArray = [
  "#37D67A",
  "#2CCCE4",
  "#dce775",
  "#ff8a65",
  "#ba68c8",
  "#FF6666", // Darker Red
  "#FF9966", // Darker Peach
  "#9966FF", // Darker Lavender
  "#FF66B2", // Darker Rose
  "#FFB266", // Darker Apricot
  "#FFCC66", // Darker Cream
  "#6699FF", // Darker Sky Blue
  "#FF99CC", // Darker Mauve
  "#9999FF", // Darker Lilac
  "#D4C280", // Darker Beige
];

export const profileMenu = [
  { routeName: "/superadmin", name: "Admin Panel" },
  { routeName: "/admin", name: "Admin Panel" },
  { routeName: "/dashboard", name: "Dashboard" },
  { routeName: "/profile", name: "My Profile" },
  { routeName: "/change-password", name: "Change Password" },
  { routeName: "/help-desk", name: "Help Desk" },
  { routeName: "/settings", name: "Settings" },
];

export const SuperAdminSidebar = [
  {
    routeName: "/superadmin/organizationlist",
    name: "Organizations",
    icon: "clarity:organization-solid",
  },
  {
    routeName: "/superadmin/userlist",
    name: "User List",
    icon: "ph:user-list",
  },
];

interface AdminUserHeader {
  title: string;
  dataIndex:
    | "name"
    | "email"
    | "organization"
    | "role"
    | "filesCount"
    | "pdf"
    | "excel"
    | "word"
    | "workspacesCount"
    | "averageFilesPerWorkspace"
    | "totalSpaceUsed"
    | "timeSpentThisMonth"
    | "lastLogin"
    | "status"
    | "action";
}
export const adminUserListHeader: AdminUserHeader[] = [
  { title: "Name", dataIndex: "name" },
  { title: "Email", dataIndex: "email" },
  { title: "Organization", dataIndex: "organization" },
  { title: "Role", dataIndex: "role" },
  { title: "Files", dataIndex: "filesCount" },
  { title: "PDF", dataIndex: "pdf" },
  { title: "Excel", dataIndex: "excel" },
  { title: "Word", dataIndex: "word" },
  { title: "Workspaces", dataIndex: "workspacesCount" },
  {
    title: "Average Files Per Workspace",
    dataIndex: "averageFilesPerWorkspace",
  },
  {
    title: "Space Used",
    dataIndex: "totalSpaceUsed",
  },
  { title: "TimeSpent/Month", dataIndex: "timeSpentThisMonth" },
  { title: "Last Login", dataIndex: "lastLogin" },
  { title: "Status", dataIndex: "status" },
  { title: "Action", dataIndex: "action" },
];
interface AdminOrganizationHeader {
  title: string;
  dataIndex:
    | "name"
    | "description"
    | "filesCount"
    | "pdf"
    | "excel"
    | "word"
    | "usersCount"
    | "workspacesCount"
    | "averageFilesPerUser"
    | "averageFilesPerWorkspace"
    | "totalSpaceUsed"
    | "usersLoggedInLastMonth"
    | "totalLicenses"
    | "activeLicense"
    | "licenseExpiresAt"
    | "status"
    | "action";
}
export const adminOrganizationListHeader: AdminOrganizationHeader[] = [
  { title: "Name", dataIndex: "name" },
  { title: "Description", dataIndex: "description" },
  { title: "Files", dataIndex: "filesCount" },
  { title: "PDF", dataIndex: "pdf" },
  { title: "Excel", dataIndex: "excel" },
  { title: "Word", dataIndex: "word" },
  { title: "Users", dataIndex: "usersCount" },
  { title: "Workspaces", dataIndex: "workspacesCount" },
  {
    title: "Average Files Per User",
    dataIndex: "averageFilesPerUser",
  },
  {
    title: "Average Files Per Workspace",
    dataIndex: "averageFilesPerWorkspace",
  },
  {
    title: "Space Used",
    dataIndex: "totalSpaceUsed",
  },
  { title: "Monthly Active Users", dataIndex: "usersLoggedInLastMonth" },
  { title: "Licenses", dataIndex: "totalLicenses" },
  { title: "Active License", dataIndex: "activeLicense" },
  { title: "License Expires At", dataIndex: "licenseExpiresAt" },
  { title: "Status", dataIndex: "status" },
  { title: "Action", dataIndex: "action" },
];

interface AdminWorkspaceHeader {
  title: string;
  dataIndex:
    | "workspaceName"
    | "filesCount"
    | "pdf"
    | "excel"
    | "word"
    | "totalSpaceUsed";
}
export const adminWorkspaceListHeader: AdminWorkspaceHeader[] = [
  { title: "Workspace Name", dataIndex: "workspaceName" },
  { title: "Files", dataIndex: "filesCount" },
  { title: "PDF", dataIndex: "pdf" },
  { title: "Excel", dataIndex: "excel" },
  { title: "Word", dataIndex: "word" },
  {
    title: "Space Used",
    dataIndex: "totalSpaceUsed",
  },
];

export const CreateUserForm = [
  {
    id: "user-name",
    label: "First Name :",
    name: "firstName",
    placeholder: "First Name",
  },
  {
    id: "last-name",
    label: "Last Name :",
    name: "lastName",
    placeholder: "Last Name",
  },
  {
    id: "email",
    label: "Email :",
    name: "email",
    placeholder: "Email",
  },
  {
    id: "password",
    label: "Password :",
    name: "password",
    placeholder: "Password",
  },
];

export const CreateOrganizationForm = [
  {
    id: "name",
    label: "Name :",
    name: "name",
    placeholder: "Name",
    type: "text",
  },
  {
    id: "description",
    label: "Description :",
    name: "description",
    placeholder: "Description",
    type: "text",
  },
  {
    id: "totalLicenses",
    label: "Licenses :",
    name: "totalLicenses",
    placeholder: "Licenses",
    type: "number",
  },
];

export const AdminSidebar = [
  {
    routeName: "/admin/myorganization",
    name: "My Organization",
    icon: "clarity:organization-solid",
  },
  {
    routeName: "/admin/userlist",
    name: "User List",
    icon: "ph:user-list",
  },
];

export const PermissionsMap = {
  DATA_SOURCE: "Data Source",
  DESIGNATION: "Designation",
  DEPARTMENT: "Department",
  USER_PROFILE_IMAGE: "User Profile Image",
  DASHBOARD_THEME: "Dashboard Theme",
  DASHBOARD_FONT_THEME: "Dashboard Font Theme",
  NOTIFICATION_MEDIUM_SETTING: "Notification Medium Setting",
  NOTIFICATION_SETTING_TEMPLATE: "Notification Setting Template",
  NOTIFICATION_SETTING_FREQUENCY: "Notification Setting Frequency",
  NOTIFICATION_SETTING_TYPE: "Notification Setting Type",
  DERIVED_FIELD: "Derived Field",
  NL_QUERY: "NL Query",
  CUSTOM_REPORT: "Custom Report",
  DASHBOARD_SHARE: "Dashboard Share",
  WIDGET_THEME: "Widget Theme",
  GET_DATA_BY_VERSION_ID_WIDGET_THEME: "get_data_by_version_idWidget Theme",
  OPERATOR: "Operator",
  WIDGET_TYPE: "Widget Type",
  DASHBOARD: "Dashboard",
  DATA_SOURCE_VERSION: "Data Source Version",
  FILE_UPLOAD: "File Upload",
  ATTRIBUTE_OPTION: "Attribute Option",
  ENTITIES: "Entities",
  PRODUCT_SUBSCRIPTION: "Product Subscription",
  ORGANIZATION: "Organization",
  PRODUCT: "Product",
  ROLE: "Role",
  PERMISSION: "Permission",
  USER: "User",
  SOURCE_LIST: "Organization Visibility Setting",
  NOTIFICATION_LOGS: "Notification Prepared",
  BUSINESS_UNIT: "BusinessUnit",
  DEFAULT_DASHBOARD: "Default Dashboard",
  VENDOR: "Vendor",
  ENGAGEMENTLETTER: "EngagementLetter",
  LEGALDOCUMENT: "LegalDocument",
  VENDORINVOICE: "VendorInvoice",
  PAYMENT: "PaymentInfo",
  PURCHASE_ORDER: "PurchaseOrder",
  ACTIVITY: "Activity",
} as const;

export type PermissionResourceType =
  (typeof PermissionsMap)[keyof typeof PermissionsMap];

export type PermissionResourceCode =
  | "get"
  | "list"
  | "update"
  | "create"
  | "delete";

export const AI_INSIGHT_URL = "http://127.0.0.1:5000/new-landing-page"; // TODO: change to the actual production URL
export const AI_INSIGHT_SESSION_ID = "04166e4d613a476a90341ddfd374e86e"; // TODO: change to the actual production session ID

// Polling intervals (in milliseconds)
export const DOWNLOAD_REQUEST_POLLING_INTERVAL = 5000; // 5 seconds
