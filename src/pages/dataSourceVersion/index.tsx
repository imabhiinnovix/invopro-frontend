import { Box } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import CreateDataSourceVersion from "../../components/atom/dataSourceVerion/createDataSourceVersion";
import DataSourceVersionTable from "../../components/atom/dataSourceVerion/dataSourceVersionTable";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { PageHeader, StyledButton } from "../../components/common";
import { PermissionsMap } from "../../utils/constants";
import { checkPermission } from "../../utils/utils";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

export default function DataSourceVersion() {
  const theme = useUnifiedTheme();
  const [reload, setReload] = useState(false);

  // ✅ Get param
  const { dataSourceId } = useParams();

  // ✅ Permissions
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );

  const shouldAllowAdd = checkPermission(
    permissions,
    PermissionsMap.DATA_SOURCE_VERSION,
    "create_data"
  );

  // ✅ Get data source list
  const { list } = useSelector((state: RootState) => state.dataSource);

  // ✅ Find current data source
  const listCurrentData = list?.find(
    (item) => item._id === dataSourceId
  );

  // ✅ Dynamic title & subtext
  const isDataSourceView = !!dataSourceId && listCurrentData;

  const dataSourceName = listCurrentData?.name || "Data Source";

  const title = isDataSourceView
    ? `${dataSourceName} Upload`
    : "Data Upload";

  const subtext = isDataSourceView
    ? `Upload and manage ${dataSourceName} uploads.`
    : "Upload and manage data uploads.";

  return (
    <Box id="data-source-version-list-view">
      <PageHeader
        title={title}
        subtext={subtext}
        // ✅ Uncomment if needed
        // action={
        //   shouldAllowAdd ? (
        //     <CreateDataSourceVersion
        //       setReload={setReload}
        //       title="File Upload"
        //       CustomButton={
        //         <StyledButton variant="primary">
        //           File Upload
        //         </StyledButton>
        //       }
        //       dataSourceId={dataSourceId} // optional (if needed)
        //     />
        //   ) : undefined
        // }
      />

      <DataSourceVersionTable
        reload={reload}
        setReload={setReload}
      />
    </Box>
  );
}