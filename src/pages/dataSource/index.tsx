import { Box } from "@mui/material";
import { useState } from "react";
import CreateUpdateDataSource from "../../components/atom/dataSource/createUpdateDataSource";
import DataSourceTable from "../../components/atom/dataSource/dataSourceTable";
import { STYLE_GUIDE } from "../../styles";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";
import AddIcon from "@mui/icons-material/Add";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

export default function DataSource() {
  const [reload, setReload] = useState(false);
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowAdd = checkPermission(
    permissions,
    PermissionsMap.DATA_SOURCE,
    "create"
  );

  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.DATA_SOURCE,
    "update"
  );

  return (
    <Box sx={{ p: STYLE_GUIDE.SPACING.s2 }}>
      <PageHeader
        title="Data Source"
        subtext="Manage data sources and their configurations."
        action={
          shouldAllowAdd ? (
            <CreateUpdateDataSource
              setReload={setReload}
              title="Create New Data Source"
              CustomButton={
                <StyledButton
                  variant="primary"
                  icon={<AddIcon sx={{ fontSize: "16px" }} />}
                >
                  Create New Data Source
                </StyledButton>
              }
            />
          ) : undefined
        }
      />
      <PageCardLayout>
        <DataSourceTable
          reload={reload}
          setReload={setReload}
          shouldAllowEdit={shouldAllowEdit}
        />
      </PageCardLayout>
    </Box>
  );
}
