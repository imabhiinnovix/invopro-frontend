import { Box, Button } from "@mui/material";
import CreateUpdateEntity from "../../components/atom/entity/createUpdateEntity";
import EntityTable from "../../components/atom/entity/entityTable";
import { useState } from "react";
import { STYLE_GUIDE } from "../../styles";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import CreateUpdateAttributeOption from "../../components/atom/attributeOption/createUpdateAttributeOption";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import PrimaryButton from "../../components/common/PrimaryButton";
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
      sx={{
        p: STYLE_GUIDE.SPACING.s2,
      }}
    >
      <CommonPageHeader
        title="Entities"
        actions={
          <CreateUpdateEntity
            setReloadEntity={setReloadEntity}
            title="Create New Entity"
            CustomButton={
              shouldAllowAdd && (
                <PrimaryButton variant="contained">
                  Create New Entity
                </PrimaryButton>
              )
            }
          />
        }
      />

      <Box mt={STYLE_GUIDE.SPACING.s8} sx={{ overflowX: "auto", flexGrow: 1 }}>
        <EntityTable
          reloadEntity={reloadEntity}
          setReloadEntity={setReloadEntity}
          shouldAllowEdit={shouldAllowEdit}
          shouldAllowDelete={shouldAllowDelete}
        />
      </Box>
    </Box>
  );
}
