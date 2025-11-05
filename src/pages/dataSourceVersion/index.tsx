import { Box, Button } from "@mui/material";
import { useState } from "react";
import CreateDataSourceVersion from "../../components/atom/dataSourceVerion/createDataSourceVersion";
import DataSourceVersionTable from "../../components/atom/dataSourceVerion/dataSourceVersionTable";
import { STYLE_GUIDE } from "../../styles";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import PrimaryButton from "../../components/common/PrimaryButton";
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
      sx={{
        p: STYLE_GUIDE.SPACING.s2,
      }}
    >
      <CommonPageHeader
        title="Data Source Version"
        actions={
          shouldAllowAdd && (
            <CreateDataSourceVersion
              setReload={setReload}
              title="Create New Data Source Version"
              CustomButton={
                <PrimaryButton variant="contained">
                  Create Data Source Version
                </PrimaryButton>
              }
            />
          )
        }
      />

      <DataSourceVersionTable reload={reload} setReload={setReload} />
    </Box>
  );
}
