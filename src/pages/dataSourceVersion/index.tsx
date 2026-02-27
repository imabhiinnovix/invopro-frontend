import { Box, Button } from "@mui/material";
import { useState } from "react";
import CreateDataSourceVersion from "../../components/atom/dataSourceVerion/createDataSourceVersion";
import DataSourceVersionTable from "../../components/atom/dataSourceVerion/dataSourceVersionTable";
import { STYLE_GUIDE } from "../../styles";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { PageHeader } from "../../components/common";
import { StyledButton } from "../../components/common";
import { PermissionsMap } from "../../utils/constants";
import { checkPermission } from "../../utils/utils";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

export default function DataSourceVersion() {
  const theme = useUnifiedTheme();
  const [reload, setReload] = useState(false);
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowAdd = checkPermission(
    permissions,
    PermissionsMap.DATA_SOURCE_VERSION,
    "create_data"
  );

  return (
    <Box
      id="data-source-version-list-view"
    >
      <PageHeader
        title="Data Upload"
        subtext="Upload and manage data source versions."
        action={
          shouldAllowAdd ? (
            <CreateDataSourceVersion
              setReload={setReload}
              title="File Upload"
              CustomButton={
                <StyledButton variant="primary">File Upload</StyledButton>
              }
            />
          ) : undefined
        }
      />

      <DataSourceVersionTable reload={reload} setReload={setReload} />
    </Box>
  );
}
