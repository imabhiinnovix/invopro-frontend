import { Box } from "@mui/material";
import CreateUpdateEntity from "../../components/atom/entity/createUpdateEntity";
import EntityTable from "../../components/atom/entity/entityTable";
import { useState } from "react";
import { STYLE_GUIDE } from "../../styles";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import CreateUpdateAttributeOption from "../../components/atom/attributeOption/createUpdateAttributeOption";
import { PageCardLayout, PageHeader, StyledButton } from "../../components/common";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";

export default function Entity() {
  const theme = useUnifiedTheme();
  const [reloadEntity, setReloadEntity] = useState(false);
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowAdd = checkPermission(
    permissions,
    PermissionsMap.ENTITIES,
    "create"
  );
  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.ENTITIES,
    "update"
  );
  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.ENTITIES,
    "delete"
  );
  return (
    <Box
      id="entity-list-view"
      sx={{
        p: STYLE_GUIDE.SPACING.s2,
      }}
    >
      <PageHeader
        title="Entities"
        subtext="Manage entities and their attributes."
        action={
          shouldAllowAdd ? (
            <CreateUpdateEntity
              setReloadEntity={setReloadEntity}
              title="Create New Entity"
              CustomButton={
                <StyledButton variant="primary" icon={<AddIcon sx={{ fontSize: "16px" }} />}>
                  Create New Entity
                </StyledButton>
              }
            />
          ) : undefined
        }
      />
      <PageCardLayout sx={{ overflowX: "auto", flexGrow: 1 }}>
        <Box id="entity-table-container" sx={{ overflowX: "auto", flexGrow: 1 }}>
          <EntityTable
            reloadEntity={reloadEntity}
            setReloadEntity={setReloadEntity}
            shouldAllowEdit={shouldAllowEdit}
            shouldAllowDelete={shouldAllowDelete}
          />
        </Box>
      </PageCardLayout>
    </Box>
  );
}
