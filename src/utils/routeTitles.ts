/**
 * Route to Page Title Mapping
 * Maps route paths to their corresponding page titles for the header
 */
export const routeTitles: Record<string, string> = {
  "/dashboard": "Analytics Dashboard",
  "/dashboard/overview": "Dashboard Overview",
  "/dashboard/analytics": "Dashboard Analytics",
  "/reports": "Custom Reports",
  "/data-source": "Data Sources",
  "/entity": "Entity",
  "/VixAi-Insights": "VixAI Insights",
  "/VixAi-Chart": "VixAI Chart",
  "/report-settings": "Report Settings",
  "/notification": "Notifications",
  "/notification-types": "Notification Types",
  "/notification-logs": "Notification Logs",
  "/settings/users": "Users",
  "/permissions": "Permissions",
  "/roles": "Roles",
  "/organization": "Organization",
  "/validation-errors": "Validation Errors",
  "/profile": "Profile",
  "/create-theme": "Create Theme",
  "/attribute-option": "Attribute Options",
  "/designation": "Designation",
  "/department": "Department",
  "/business-unit": "Business Unit",
  "/template": "Template",
  "/jobs": "Data Export Jobs",
  "/system-settings/charts/source-list": "Source List",
  "/themes": "Themes",
};

/**
 * Get page title from route path
 * @param pathname - Current route pathname
 * @returns Page title string
 */
export const getPageTitle = (pathname: string): string => {
  // Check for exact match first
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }

  // Check for dynamic routes (e.g., /dashboard/:id, /roles/edit/:id)
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Handle dashboard with ID
  if (pathSegments[0] === "dashboard" && pathSegments.length === 2) {
    return "Analytics Dashboard";
  }

  // Handle roles with mode
  if (pathSegments[0] === "roles") {
    if (pathSegments[1] === "add") return "Add Role";
    if (pathSegments[1] === "edit") return "Edit Role";
    if (pathSegments[1] === "view") return "View Role";
  }

  // Handle notification types
  if (pathSegments[0] === "notification-types") {
    if (pathSegments[1] === "add") return "Add Notification Type";
    if (pathSegments[1] === "edit") return "Edit Notification Type";
  }

  // Handle data source with ID
  if (pathSegments[0] === "data-source" && pathSegments.length === 2) {
    return "Data Source Details";
  }

  // Handle validation errors with ID
  if (pathSegments[0] === "validation-errors" && pathSegments.length === 2) {
    return "Validation Errors";
  }

  // Handle source list attributes
  if (
    pathSegments[0] === "system-settings" &&
    pathSegments[1] === "charts" &&
    pathSegments[2] === "source-list" &&
    pathSegments[3] === "attributes"
  ) {
    return "Source Attributes";
  }

  // Handle data source new
  if (pathSegments[0] === "data-source-new" && pathSegments.length === 2) {
    return "Data Source";
  }

  // Default: capitalize first segment or return "Dashboard"
  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0];
    return firstSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return "Analytics Dashboard";
};

