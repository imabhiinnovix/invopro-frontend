// import { useEffect, useMemo, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TextField,
//   Container,
//   Box,
//   Stack,
//   Typography,
//   Button,
//   CircularProgress,
//   Card,
//   CardContent,
// } from "@mui/material";
// import { useForm } from "react-hook-form";
// import CommonDatePicker from "../../components/common/datePicker/datePicker";
// import { useAppSelector } from "../../storeHooks";
// import { useParams } from "react-router-dom";
// import { GET, POST } from "../../services/apiRoutes";
// import {
//   OptionsAttributesValueResponce,
//   SourceValueData,
//   SourceValuePayload,
// } from "./types";
// import useGet from "../../hooks/useGet";
// import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
// import { DateTime } from "luxon";
// import usePost from "../../hooks/usePost";
// import { STYLE_GUIDE } from "../../styles";
// import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
// import { useComponentTypography } from "../../hooks/useComponentTypography";
// import { DataSourceListData } from "../../components/atom/sideNav/types";

// const DataSources = () => {
//   const theme = useUnifiedTheme();
//   const { getHeadingSx, getTableSx } = useComponentTypography();
//   const [rows, setRows] = useState<
//     { [x: string]: string | number | boolean }[]
//   >([]);

//   const { id } = useParams();

//   const { control, watch } = useForm<{ versionValue: string }>({});

//   // const reduxDataSourceList = useAppSelector((state) => state.dataSource.list);

//   const dataSourceListAPI = useGet<{
//     success: boolean;
//     data: DataSourceListData[];
//   }>(["dataSourceList"], GET?.DATA_SOURCE_LIST + `?canEditInline=true`, true);

//    const dataSourceList = useMemo(() => {

//       return dataSourceListAPI?.data?.pages?.flatMap((page) => page?.data) || [];
//     }, [dataSourceListAPI?.data?.pages]);

//       console.log("dataSourceListAPI", dataSourceList);

//   const reduxDataSourceList = dataSourceList;
//   const dataSourceAttributes = useMemo(
//     () =>
//       reduxDataSourceList?.find((source) => source?._id === id)?.entityId
//         ?.attributes,
//     [id, reduxDataSourceList]
//   );

//   const optionsAttributes = useMemo(
//     () => dataSourceAttributes?.find((attr) => attr?.type === "option"),
//     [dataSourceAttributes]
//   );

//   const textAttributes = useMemo(
//     () => dataSourceAttributes?.filter((attr) => attr?.type !== "option"),
//     [dataSourceAttributes]
//   );

//   const versionDate = watch("versionValue")
//     ? DateTime.fromISO(watch("versionValue")).toFormat("yyyy-LL")
//     : null;

//   const OptionsAttributesValue = useGet<OptionsAttributesValueResponce>(
//     ["optionsAttributesValue" + optionsAttributes?.optionAttributeId],
//     GET?.ATTRIBUTE_OPTIONS_LIST + optionsAttributes?.optionAttributeId,
//     !!optionsAttributes?.optionAttributeId
//   );

//   const { infiniteQuery: sourceData, lastElementRef } = useInfiniteScroll<
//     SourceValuePayload,
//     SourceValueData
//   >(
//     ["sourceData", versionDate ?? ""],
//     GET?.SOURCE_VERSION_DATA +
//       `?dataSourceId=${id}&versionValue=${versionDate}`,
//     10,
//     "get",
//     !!optionsAttributes?.optionAttributeId && !!versionDate
//   );

//   const dataSourceCreate = usePost([""], () => {}, true);

//   const sourceMap = useMemo(() => {
//     return (
//       sourceData?.data?.pages
//         ?.flatMap((page) => page?.data)
//         ?.map((item) => item?.rowData) || []
//     );
//   }, [sourceData?.data?.pages]);

//   useEffect(() => {
//     if (versionDate && id) {
//       sourceData?.refetch();
//     }
//   }, [versionDate, id]);

//   useEffect(() => {
//     if (
//       !OptionsAttributesValue?.data?.data?.attributeValue ||
//       !sourceMap ||
//       !textAttributes
//     ) {
//       setRows([]);
//       return;
//     }

//     const newRows = OptionsAttributesValue.data.data.attributeValue.map(
//       (val) => {
//         const matchingRow = sourceMap.find(
//           (source) =>
//             source?.[
//               optionsAttributes?.name ?? "defaultName"
//             ]?.toLowerCase() === val?.toLowerCase()
//         );

//         // Dynamically map text attributes with proper default values
//         const rowData = textAttributes.reduce(
//           (acc: Record<string, string | number>, attr) => {
//             const value = matchingRow ? matchingRow[attr?.name] : null;

//             if (attr.type === "number") {
//               acc[attr?.name] = value != null ? Number(value) : 0;
//             } else {
//               acc[attr?.name] = value != null ? value : "";
//             }

//             return acc;
//           },
//           {}
//         );

//         return {
//           [optionsAttributes?.name ?? "defaultName"]: val,
//           ...rowData,
//         };
//       }
//     );

//     setRows(newRows);
//   }, [
//     OptionsAttributesValue?.data?.data?.attributeValue,
//     optionsAttributes?.name,
//     textAttributes,
//     sourceMap,
//   ]);

//   const header = useMemo(
//     () => [
//       ...(optionsAttributes
//         ? [optionsAttributes]
//         : [
//             {
//               name: "Default Name",
//               mappingName: "defaultName",
//               type: "option",
//               required: true,
//               validation: [],
//               transformations: [],
//               optionAttributeId: "",
//               cleaner: [],
//             },
//           ]),
//       ...(textAttributes || []),
//     ],
//     [optionsAttributes, textAttributes]
//   );

//   const handleEdit = (index: number, field: string, value: string) => {
//     const updatedRows = [...rows];
//     const row = updatedRows[index];
//     row[field as keyof typeof row] = value;
//     setRows(updatedRows);
//   };

//   const handleSave = () => {
//     if (versionDate && id) {
//       // Map and transform rows based on textAttributes
//       const transformedRows = rows.map((row) => {
//         const transformedRow = { ...row };

//         textAttributes?.forEach((attr) => {
//           const value = row[attr.name];

//           if (attr.type === "number") {
//             transformedRow[attr.name] = value
//               ? parseFloat(value?.toString())
//               : 0;
//           } else if (attr.type === "boolean") {
//             transformedRow[attr.name] = value === "true";
//           } else {
//             transformedRow[attr.name] = value || "";
//           }
//         });

//         return transformedRow;
//       });

//       const payload = {
//         dataSourceId: id,
//         versionValue: versionDate,
//         versionData: transformedRows,
//       };

//       dataSourceCreate?.mutate({
//         url: POST?.DATA_SOURCE_VERSION_CREATE,
//         payload,
//       });
//     }
//   };

//   const tab = localStorage.getItem("activeTab");
//   console.log("rrrrrrr", tab === "Notifix");

//   return (
//     <>
//       {tab === "Notifix" ? (
//         <p>yesss</p>
//       ) : (
//         <Container
//           maxWidth="xl"
//           sx={{
//             margin: STYLE_GUIDE.SPACING.s8,
//             padding: STYLE_GUIDE.SPACING.s8,
//             backgroundColor: theme.palette.background.paper,
//             borderRadius: STYLE_GUIDE.SPACING.s3,
//             boxShadow: STYLE_GUIDE.SHADOWS.base,
//           }}
//         >
//           <Card
//             sx={{
//               marginBottom: STYLE_GUIDE.SPACING.s8,
//             }}
//           >
//             <CardContent sx={{ padding: STYLE_GUIDE.SPACING.s4 }}>
//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//               >
//                 <Stack direction="row" spacing={2} alignItems="center">
//                   <Typography
//                     variant="h6"
//                     sx={{
//                       ...getHeadingSx(),
//                       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                       color: theme.palette.primary.main,
//                     }}
//                   >
//                     Data Source Version
//                   </Typography>
//                   <CommonDatePicker
//                     name="versionValue"
//                     control={control}
//                     views={["year", "month"]}
//                     label="Period*"
//                     rules={{ required: "Period is required" }}
//                   />
//                 </Stack>
//                 <Button
//                   variant="contained"
//                   disabled={dataSourceCreate?.isPending || !(versionDate && id)}
//                   onClick={handleSave}
//                   sx={{
//                     minWidth: "150px",
//                     height: "40px",
//                     borderRadius: STYLE_GUIDE.SPACING.s1,
//                     textTransform: "none",
//                     fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                     fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                     boxShadow: "none",
//                     "&:hover": {
//                       boxShadow: "none",
//                     },
//                   }}
//                 >
//                   {dataSourceCreate?.isPending ? (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         width: "56px",
//                         height: "24px",
//                       }}
//                     >
//                       <CircularProgress
//                         size={20}
//                         sx={{ color: STYLE_GUIDE.COLORS.white }}
//                       />
//                     </Box>
//                   ) : (
//                     "Save Changes"
//                   )}
//                 </Button>
//               </Stack>
//             </CardContent>
//           </Card>

//           <Box sx={{ display: "flex", justifyContent: "center" }}>
//             <TableContainer
//               component={Paper}
//               sx={{
//                 ...getTableSx(),
//                 maxHeight: "calc(100vh - 300px)",
//                 borderRadius: STYLE_GUIDE.SPACING.s2,
//                 boxShadow: STYLE_GUIDE.SHADOWS.xxxl,
//                 width: "fit-content",
//                 backgroundColor:
//                   theme.palette.card?.background ||
//                   STYLE_GUIDE.COLORS.backgroundSurface,
//                 "& .MuiTable-root": {
//                   minWidth: "600px",
//                 },
//               }}
//             >
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     {header?.map((field) => (
//                       <TableCell
//                         key={field?.optionAttributeId}
//                         sx={{
//                           backgroundColor:
//                             theme.palette.table?.headerBackground ||
//                             STYLE_GUIDE.COLORS.backgroundLightGray,
//                           fontWeight:
//                             STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//                           color:
//                             theme.palette.table?.headerText ||
//                             STYLE_GUIDE.COLORS.textGray,
//                           borderBottom: `2px solid ${STYLE_GUIDE.COLORS.divider}`,
//                           padding: "12px 16px",
//                         }}
//                       >
//                         {field?.name}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {rows.map((row, rowIndex) => (
//                     <TableRow
//                       key={rowIndex}
//                       sx={{
//                         backgroundColor:
//                           rowIndex % 2 === 0
//                             ? theme.palette.table?.rowEvenBackground ||
//                               STYLE_GUIDE.COLORS.white
//                             : theme.palette.table?.rowOddBackground ||
//                               STYLE_GUIDE.COLORS.backgroundDefault,
//                         "&:hover": {
//                           backgroundColor:
//                             theme.palette.table?.rowHoverBackground ||
//                             STYLE_GUIDE.COLORS.backgroundHover,
//                         },
//                       }}
//                     >
//                       {header?.map((field, headIndex) => (
//                         <TableCell
//                           key={field?.optionAttributeId}
//                           sx={{
//                             padding: "12px 16px",
//                             borderBottom: `1px solid ${STYLE_GUIDE.COLORS.divider2}`,
//                             color:
//                               theme.palette.table?.rowText ||
//                               STYLE_GUIDE.COLORS.textDarkGray,
//                           }}
//                         >
//                           <TextField
//                             value={row[field?.name as keyof typeof row]}
//                             disabled={headIndex === 0}
//                             onChange={(e) =>
//                               handleEdit(rowIndex, field?.name, e.target.value)
//                             }
//                             variant="outlined"
//                             size="small"
//                             type={
//                               textAttributes?.find((attr) => {
//                                 return attr?.name === field?.name;
//                               })?.type ?? "text"
//                             }
//                             fullWidth
//                             sx={{
//                               "& .MuiOutlinedInput-root": {
//                                 borderRadius: STYLE_GUIDE.SPACING.s2,
//                                 alignItems: "flex-start",
//                                 paddingRight: STYLE_GUIDE.SPACING.s2,
//                                 fontSize: "14px",
//                                 backgroundColor:
//                                   theme.palette.background.paper ||
//                                   STYLE_GUIDE.COLORS.white,
//                                 "& fieldset": {
//                                   borderColor:
//                                     theme.palette.input?.border ||
//                                     STYLE_GUIDE.COLORS.borderGray,
//                                 },
//                                 "&:hover fieldset": {
//                                   borderColor:
//                                     theme.palette.border?.hover ||
//                                     STYLE_GUIDE.COLORS.borderGray,
//                                 },
//                                 "&.Mui-focused fieldset": {
//                                   borderColor:
//                                     theme.palette.input?.focusBorder ||
//                                     STYLE_GUIDE.COLORS.primary,
//                                 },
//                               },
//                               "& .MuiInputLabel-root": {
//                                 color:
//                                   theme.palette.text?.secondary ||
//                                   STYLE_GUIDE.COLORS.textMediumGray,
//                               },
//                               "& .MuiInputLabel-root.Mui-focused": {
//                                 color:
//                                   theme.palette.input?.focusBorder ||
//                                   STYLE_GUIDE.COLORS.primary,
//                               },
//                               "& .MuiInputBase-input": {
//                                 color:
//                                   theme.palette.table?.rowText ||
//                                   theme.palette.input?.text ||
//                                   STYLE_GUIDE.COLORS.textDarkGray,
//                               },
//                               "& .MuiInputBase-input::placeholder": {
//                                 color:
//                                   theme.palette.text?.secondary ||
//                                   STYLE_GUIDE.COLORS.textMediumGray,
//                               },
//                               "& .MuiInputBase-input:-webkit-autofill": {
//                                 WebkitTextFillColor:
//                                   theme.palette.table?.rowText ||
//                                   theme.palette.input?.text ||
//                                   STYLE_GUIDE.COLORS.textDarkGray,
//                                 WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper || STYLE_GUIDE.COLORS.white} inset`,
//                               },
//                             }}
//                             slotProps={{
//                               input: {
//                                 onWheel: (e) => {
//                                   if (
//                                     (e.target as HTMLInputElement)?.type ===
//                                     "number"
//                                   ) {
//                                     (e.target as HTMLInputElement)?.blur();
//                                   }
//                                 },
//                                 onKeyDown: (e) => {
//                                   if (
//                                     (e.currentTarget as HTMLInputElement)
//                                       .type === "number" &&
//                                     ["e", "E", "+", "-"].includes(e.key)
//                                   ) {
//                                     e.preventDefault();
//                                   }
//                                 },
//                                 sx: {
//                                   fontSize:
//                                     STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//                                   padding: "8px 12px",
//                                 },
//                               },
//                             }}
//                           />
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))}
//                   {sourceData?.hasNextPage && (
//                     <TableRow>
//                       <TableCell colSpan={header.length}>
//                         <Box
//                           ref={lastElementRef}
//                           sx={{
//                             padding: "1rem",
//                             textAlign: "center",
//                             color: "#6c757d",
//                           }}
//                         >
//                           Loading more data...
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         </Container>
//       )}
//     </>
//   );
// };

// export default DataSources;
// import { useEffect, useMemo, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TextField,
//   Container,
//   Box,
//   Stack,
//   Typography,
//   Button,
//   CircularProgress,
//   Card,
//   CardContent,
// } from "@mui/material";
// import { useForm } from "react-hook-form";
// import CommonDatePicker from "../../components/common/datePicker/datePicker";
// import { useAppSelector } from "../../storeHooks";
// import { useParams } from "react-router-dom";
// import { GET, POST } from "../../services/apiRoutes";
// import {
//   OptionsAttributesValueResponce,
//   SourceValueData,
//   SourceValuePayload,
// } from "./types";
// import useGet from "../../hooks/useGet";
// import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
// import { DateTime } from "luxon";
// import usePost from "../../hooks/usePost";
// import { STYLE_GUIDE } from "../../styles";
// import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
// import { useComponentTypography } from "../../hooks/useComponentTypography";
// import { DataSourceListData } from "../../components/atom/sideNav/types";

// const DataSources = () => {
//   const theme = useUnifiedTheme();
//   const { getHeadingSx, getTableSx } = useComponentTypography();
//   const [rows, setRows] = useState<
//     { [x: string]: string | number | boolean }[]
//   >([]);

//   const { id } = useParams();

//   // Set default value to December 2024
//   const { control, watch, setValue } = useForm<{ versionValue: string }>({
//     defaultValues: {
//       versionValue: "2024-12", // Default to December 2024
//     },
//   });

//   // const reduxDataSourceList = useAppSelector((state) => state.dataSource.list);

//   const dataSourceListAPI = useGet<{
//     success: boolean;
//     data: DataSourceListData[];
//   }>(["dataSourceList"], GET?.DATA_SOURCE_LIST + `?canEditInline=true`, true);

//    const dataSourceList = useMemo(() => {

//       return dataSourceListAPI?.data?.pages?.flatMap((page) => page?.data) || [];
//     }, [dataSourceListAPI?.data?.pages]);

//   // const reduxDataSourceList = dataSourceList;
//   console.log("dataSourceListAPI", dataSourceList);
//   const dataSourceAttributes = useMemo(
//     () =>
//       dataSourceList?.find((source) => source?._id === id)?.entityId
//         ?.attributes,
//     [id, dataSourceList]
//   );

//   const optionsAttributes = useMemo(
//     () => dataSourceAttributes?.find((attr) => attr?.type === "option"),
//     [dataSourceAttributes]
//   );

//   const textAttributes = useMemo(
//     () => dataSourceAttributes?.filter((attr) => attr?.type !== "option"),
//     [dataSourceAttributes]
//   );

//   const versionDate = watch("versionValue")
//     ? DateTime.fromISO(watch("versionValue")).toFormat("yyyy-LL")
//     : null;

//   const OptionsAttributesValue = useGet<OptionsAttributesValueResponce>(
//     ["optionsAttributesValue" + optionsAttributes?.optionAttributeId],
//     GET?.ATTRIBUTE_OPTIONS_LIST + optionsAttributes?.optionAttributeId,
//     !!optionsAttributes?.optionAttributeId
//   );

//   const { infiniteQuery: sourceData, lastElementRef } = useInfiniteScroll<
//     SourceValuePayload,
//     SourceValueData
//   >(
//     ["sourceData", id, versionDate ?? ""],
//     GET?.SOURCE_VERSION_DATA +
//       `?dataSourceId=${id}&versionValue=${versionDate}`,
//     10,
//     "get",
//     !!optionsAttributes?.optionAttributeId && !!versionDate
//   );

//   const dataSourceCreate = usePost([""], () => {}, true);

//   const sourceMap = useMemo(() => {
//     return (
//       sourceData?.data?.pages
//         ?.flatMap((page) => page?.data)
//         ?.map((item) => item?.rowData) || []
//     );
//   }, [sourceData?.data?.pages]);

//   // Set default value when component mounts
//   useEffect(() => {
//     setValue("versionValue", "2024-12");
//   }, [setValue]);

//   useEffect(() => {
//     if (versionDate && id) {
//       sourceData?.refetch();
//     }
//   }, [versionDate, id]);

//   useEffect(() => {
//     if (
//       !OptionsAttributesValue?.data?.data?.attributeValue ||
//       !sourceMap ||
//       !textAttributes
//     ) {
//       setRows([]);
//       return;
//     }

//     const newRows = OptionsAttributesValue.data.data.attributeValue.map(
//       (val) => {
//         const matchingRow = sourceMap.find(
//           (source) =>
//             source?.[
//               optionsAttributes?.name ?? "defaultName"
//             ]?.toLowerCase() === val?.toLowerCase()
//         );

//         // Dynamically map text attributes with proper default values
//         const rowData = textAttributes.reduce(
//           (acc: Record<string, string | number>, attr) => {
//             const value = matchingRow ? matchingRow[attr?.name] : null;

//             if (attr.type === "number") {
//               acc[attr?.name] = value != null ? Number(value) : 0;
//             } else {
//               acc[attr?.name] = value != null ? value : "";
//             }

//             return acc;
//           },
//           {}
//         );

//         return {
//           [optionsAttributes?.name ?? "defaultName"]: val,
//           ...rowData,
//         };
//       }
//     );

//     setRows(newRows);
//   }, [
//     OptionsAttributesValue?.data?.data?.attributeValue,
//     optionsAttributes?.name,
//     textAttributes,
//     sourceMap,
//   ]);

//   const header = useMemo(
//     () => [
//       ...(optionsAttributes
//         ? [optionsAttributes]
//         : [
//             {
//               name: "Default Name",
//               mappingName: "defaultName",
//               type: "option",
//               required: true,
//               validation: [],
//               transformations: [],
//               optionAttributeId: "",
//               cleaner: [],
//             },
//           ]),
//       ...(textAttributes || []),
//     ],
//     [optionsAttributes, textAttributes]
//   );

//   const handleEdit = (index: number, field: string, value: string) => {
//     const updatedRows = [...rows];
//     const row = updatedRows[index];
//     row[field as keyof typeof row] = value;
//     setRows(updatedRows);
//   };

//   const handleSave = () => {
//     if (versionDate && id) {
//       // Map and transform rows based on textAttributes
//       const transformedRows = rows.map((row) => {
//         const transformedRow = { ...row };

//         textAttributes?.forEach((attr) => {
//           const value = row[attr.name];

//           if (attr.type === "number") {
//             transformedRow[attr.name] = value
//               ? parseFloat(value?.toString())
//               : 0;
//           } else if (attr.type === "boolean") {
//             transformedRow[attr.name] = value === "true";
//           } else {
//             transformedRow[attr.name] = value || "";
//           }
//         });

//         return transformedRow;
//       });

//       const payload = {
//         dataSourceId: id,
//         versionValue: versionDate,
//         versionData: transformedRows,
//       };

//       dataSourceCreate?.mutate({
//         url: POST?.DATA_SOURCE_VERSION_CREATE,
//         payload,
//       });
//     }
//   };

//   const tab = localStorage.getItem("activeTab");

//   return (
//     <>
//       {tab === "Notifix" ? (
//         <p>yesss</p>
//       ) : (
//         <Container
//           maxWidth="xl"
//           sx={{
//             margin: STYLE_GUIDE.SPACING.s8,
//             padding: STYLE_GUIDE.SPACING.s8,
//             backgroundColor: theme.palette.background.paper,
//             borderRadius: STYLE_GUIDE.SPACING.s3,
//             boxShadow: STYLE_GUIDE.SHADOWS.base,
//           }}
//         >
//           <Card
//             sx={{
//               marginBottom: STYLE_GUIDE.SPACING.s8,
//             }}
//           >
//             <CardContent sx={{ padding: STYLE_GUIDE.SPACING.s4 }}>
//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//               >
//                 <Stack direction="row" spacing={2} alignItems="center">
//                   <Typography
//                     variant="h6"
//                     sx={{
//                       ...getHeadingSx(),
//                       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                       color: theme.palette.primary.main,
//                     }}
//                   >
//                     Data Source Version
//                   </Typography>
//                   <CommonDatePicker
//                     name="versionValue"
//                     control={control}
//                     views={["year", "month"]}
//                     label="Period*"
//                     rules={{ required: "Period is required" }}
//                   />
//                 </Stack>
//                 <Button
//                   variant="contained"
//                   disabled={dataSourceCreate?.isPending || !(versionDate && id)}
//                   onClick={handleSave}
//                   sx={{
//                     minWidth: "150px",
//                     height: "40px",
//                     borderRadius: STYLE_GUIDE.SPACING.s1,
//                     textTransform: "none",
//                     fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                     fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                     boxShadow: "none",
//                     "&:hover": {
//                       boxShadow: "none",
//                     },
//                   }}
//                 >
//                   {dataSourceCreate?.isPending ? (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         width: "56px",
//                         height: "24px",
//                       }}
//                     >
//                       <CircularProgress
//                         size={20}
//                         sx={{ color: STYLE_GUIDE.COLORS.white }}
//                       />
//                     </Box>
//                   ) : (
//                     "Save Changes"
//                   )}
//                 </Button>
//               </Stack>
//             </CardContent>
//           </Card>

//           <Box sx={{ display: "flex", justifyContent: "center" }}>
//             <TableContainer
//               component={Paper}
//               sx={{
//                 ...getTableSx(),
//                 maxHeight: "calc(100vh - 300px)",
//                 borderRadius: STYLE_GUIDE.SPACING.s2,
//                 boxShadow: STYLE_GUIDE.SHADOWS.xxxl,
//                 width: "fit-content",
//                 backgroundColor:
//                   theme.palette.card?.background ||
//                   STYLE_GUIDE.COLORS.backgroundSurface,
//                 "& .MuiTable-root": {
//                   minWidth: "600px",
//                 },
//               }}
//             >
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     {header?.map((field) => (
//                       <TableCell
//                         key={field?.optionAttributeId}
//                         sx={{
//                           backgroundColor:
//                             theme.palette.table?.headerBackground ||
//                             STYLE_GUIDE.COLORS.backgroundLightGray,
//                           fontWeight:
//                             STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//                           color:
//                             theme.palette.table?.headerText ||
//                             STYLE_GUIDE.COLORS.textGray,
//                           borderBottom: `2px solid ${STYLE_GUIDE.COLORS.divider}`,
//                           padding: "12px 16px",
//                         }}
//                       >
//                         {field?.name}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {rows.map((row, rowIndex) => (
//                     <TableRow
//                       key={rowIndex}
//                       sx={{
//                         backgroundColor:
//                           rowIndex % 2 === 0
//                             ? theme.palette.table?.rowEvenBackground ||
//                               STYLE_GUIDE.COLORS.white
//                             : theme.palette.table?.rowOddBackground ||
//                               STYLE_GUIDE.COLORS.backgroundDefault,
//                         "&:hover": {
//                           backgroundColor:
//                             theme.palette.table?.rowHoverBackground ||
//                             STYLE_GUIDE.COLORS.backgroundHover,
//                         },
//                       }}
//                     >
//                       {header?.map((field, headIndex) => (
//                         <TableCell
//                           key={field?.optionAttributeId}
//                           sx={{
//                             padding: "12px 16px",
//                             borderBottom: `1px solid ${STYLE_GUIDE.COLORS.divider2}`,
//                             color:
//                               theme.palette.table?.rowText ||
//                               STYLE_GUIDE.COLORS.textDarkGray,
//                           }}
//                         >
//                           <TextField
//                             value={row[field?.name as keyof typeof row]}
//                             disabled={headIndex === 0}
//                             onChange={(e) =>
//                               handleEdit(rowIndex, field?.name, e.target.value)
//                             }
//                             variant="outlined"
//                             size="small"
//                             type={
//                               textAttributes?.find((attr) => {
//                                 return attr?.name === field?.name;
//                               })?.type ?? "text"
//                             }
//                             fullWidth
//                             sx={{
//                               "& .MuiOutlinedInput-root": {
//                                 borderRadius: STYLE_GUIDE.SPACING.s2,
//                                 alignItems: "flex-start",
//                                 paddingRight: STYLE_GUIDE.SPACING.s2,
//                                 fontSize: "14px",
//                                 backgroundColor:
//                                   theme.palette.background.paper ||
//                                   STYLE_GUIDE.COLORS.white,
//                                 "& fieldset": {
//                                   borderColor:
//                                     theme.palette.input?.border ||
//                                     STYLE_GUIDE.COLORS.borderGray,
//                                 },
//                                 "&:hover fieldset": {
//                                   borderColor:
//                                     theme.palette.border?.hover ||
//                                     STYLE_GUIDE.COLORS.borderGray,
//                                 },
//                                 "&.Mui-focused fieldset": {
//                                   borderColor:
//                                     theme.palette.input?.focusBorder ||
//                                     STYLE_GUIDE.COLORS.primary,
//                                 },
//                               },
//                               "& .MuiInputLabel-root": {
//                                 color:
//                                   theme.palette.text?.secondary ||
//                                   STYLE_GUIDE.COLORS.textMediumGray,
//                               },
//                               "& .MuiInputLabel-root.Mui-focused": {
//                                 color:
//                                   theme.palette.input?.focusBorder ||
//                                   STYLE_GUIDE.COLORS.primary,
//                               },
//                               "& .MuiInputBase-input": {
//                                 color:
//                                   theme.palette.table?.rowText ||
//                                   theme.palette.input?.text ||
//                                   STYLE_GUIDE.COLORS.textDarkGray,
//                               },
//                               "& .MuiInputBase-input::placeholder": {
//                                 color:
//                                   theme.palette.text?.secondary ||
//                                   STYLE_GUIDE.COLORS.textMediumGray,
//                               },
//                               "& .MuiInputBase-input:-webkit-autofill": {
//                                 WebkitTextFillColor:
//                                   theme.palette.table?.rowText ||
//                                   theme.palette.input?.text ||
//                                   STYLE_GUIDE.COLORS.textDarkGray,
//                                 WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper || STYLE_GUIDE.COLORS.white} inset`,
//                               },
//                             }}
//                             slotProps={{
//                               input: {
//                                 onWheel: (e) => {
//                                   if (
//                                     (e.target as HTMLInputElement)?.type ===
//                                     "number"
//                                   ) {
//                                     (e.target as HTMLInputElement)?.blur();
//                                   }
//                                 },
//                                 onKeyDown: (e) => {
//                                   if (
//                                     (e.currentTarget as HTMLInputElement)
//                                       .type === "number" &&
//                                     ["e", "E", "+", "-"].includes(e.key)
//                                   ) {
//                                     e.preventDefault();
//                                   }
//                                 },
//                                 sx: {
//                                   fontSize:
//                                     STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//                                   padding: "8px 12px",
//                                 },
//                               },
//                             }}
//                           />
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))}
//                   {sourceData?.hasNextPage && (
//                     <TableRow>
//                       <TableCell colSpan={header.length}>
//                         <Box
//                           ref={lastElementRef}
//                           sx={{
//                             padding: "1rem",
//                             textAlign: "center",
//                             color: "#6c757d",
//                           }}
//                         >
//                           Loading more data...
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         </Container>
//       )}
//     </>
//   );
// };

// export default DataSources;

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Container,
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { useForm } from "react-hook-form";
import CommonDatePicker from "../../components/common/datePicker/datePicker";
import { useAppSelector } from "../../storeHooks";
import { useParams } from "react-router-dom";
import { GET, POST } from "../../services/apiRoutes";
import {
  OptionsAttributesValueResponce,
  SourceValueData,
  SourceValuePayload,
} from "./types";
import useGet from "../../hooks/useGet";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { DateTime } from "luxon";
import usePost from "../../hooks/usePost";
import { STYLE_GUIDE } from "../../styles";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { DataSourceListData } from "../../components/atom/sideNav/types";
import { PageHeader, PageCardLayout, StyledButton } from "../../components/common";

const DataSources = () => {
  const theme = useUnifiedTheme();
  const { getHeadingSx, getTableSx } = useComponentTypography();
  const [rows, setRows] = useState<
    { [x: string]: string | number | boolean }[]
  >([]);

  const { id } = useParams();

  // Set default value to December 2024
  const { control, watch, setValue } = useForm<{ versionValue: string }>({
    defaultValues: {
      versionValue: "2024-12", // Default to December 2024
    },
  });

  // const reduxDataSourceList = useAppSelector((state) => state.dataSource.list);

  const dataSourceListAPI = useGet<{
    success: boolean;
    data: DataSourceListData[];
  }>(
    ["dataSourceListAPI"],
    GET?.DATA_SOURCE_LIST + `?canEditInline=true`,
    true
  );

  // Fix: Correctly extract data from the API response
  const dataSourceList = useMemo(() => {
    // Check if the API data exists and has the expected structure
    if (dataSourceListAPI?.data?.data) {
      return dataSourceListAPI.data.data;
    }
    return [];
  }, [dataSourceListAPI?.data]);

  // Log the correct dataSourceList for debugging
  console.log("dataSourceList", dataSourceList);

  const currentDataSource = useMemo(
    () => dataSourceList?.find((source) => source?._id === id),
    [id, dataSourceList]
  );

  const dataSourceAttributes = useMemo(
    () => currentDataSource?.entityId?.attributes,
    [currentDataSource]
  );

  const optionsAttributes = useMemo(
    () => dataSourceAttributes?.find((attr) => attr?.type === "option"),
    [dataSourceAttributes]
  );

  const textAttributes = useMemo(
    () => dataSourceAttributes?.filter((attr) => attr?.type !== "option"),
    [dataSourceAttributes]
  );

  const versionDate = watch("versionValue")
    ? DateTime.fromISO(watch("versionValue")).toFormat("yyyy-LL")
    : null;

  const OptionsAttributesValue = useGet<OptionsAttributesValueResponce>(
    ["optionsAttributesValue" + optionsAttributes?.optionAttributeId],
    GET?.ATTRIBUTE_OPTIONS_LIST + optionsAttributes?.optionAttributeId,
    !!optionsAttributes?.optionAttributeId
  );

  const { infiniteQuery: sourceData, lastElementRef } = useInfiniteScroll<
    SourceValuePayload,
    SourceValueData
  >(
    ["sourceData", id, versionDate ?? ""],
    GET?.SOURCE_VERSION_DATA +
      `?dataSourceId=${id}&versionValue=${versionDate}`,
    10,
    "get",
    !!optionsAttributes?.optionAttributeId && !!versionDate
  );

  const dataSourceCreate = usePost([""], () => {}, true);

  const sourceMap = useMemo(() => {
    return (
      sourceData?.data?.pages
        ?.flatMap((page) => page?.data)
        ?.map((item) => item?.rowData) || []
    );
  }, [sourceData?.data?.pages]);

  // Set default value when component mounts
  useEffect(() => {
    setValue("versionValue", "2024-12");
  }, [setValue]);

  useEffect(() => {
    if (versionDate && id) {
      sourceData?.refetch();
    }
  }, [versionDate, id]);

  useEffect(() => {
    if (
      !OptionsAttributesValue?.data?.data?.attributeValue ||
      !sourceMap ||
      !textAttributes
    ) {
      setRows([]);
      return;
    }

    const newRows = OptionsAttributesValue.data.data.attributeValue.map(
      (val) => {
        const matchingRow = sourceMap.find(
          (source) =>
            source?.[
              optionsAttributes?.name ?? "defaultName"
            ]?.toLowerCase() === val?.toLowerCase()
        );

        // Dynamically map text attributes with proper default values
        const rowData = textAttributes.reduce(
          (acc: Record<string, string | number>, attr) => {
            const value = matchingRow ? matchingRow[attr?.name] : null;

            if (attr.type === "number") {
              acc[attr?.name] = value != null ? Number(value) : 0;
            } else {
              acc[attr?.name] = value != null ? value : "";
            }

            return acc;
          },
          {}
        );

        return {
          [optionsAttributes?.name ?? "defaultName"]: val,
          ...rowData,
        };
      }
    );

    setRows(newRows);
  }, [
    OptionsAttributesValue?.data?.data?.attributeValue,
    optionsAttributes?.name,
    textAttributes,
    sourceMap,
  ]);

  const header = useMemo(
    () => [
      ...(optionsAttributes
        ? [optionsAttributes]
        : [
            {
              name: "Default Name",
              mappingName: "defaultName",
              type: "option",
              required: true,
              validation: [],
              transformations: [],
              optionAttributeId: "",
              cleaner: [],
            },
          ]),
      ...(textAttributes || []),
    ],
    [optionsAttributes, textAttributes]
  );

  const handleEdit = (index: number, field: string, value: string) => {
    const updatedRows = [...rows];
    const row = updatedRows[index];
    row[field as keyof typeof row] = value;
    setRows(updatedRows);
  };

  const handleSave = () => {
    if (versionDate && id) {
      // Map and transform rows based on textAttributes
      const transformedRows = rows.map((row) => {
        const transformedRow = { ...row };

        textAttributes?.forEach((attr) => {
          const value = row[attr.name];

          if (attr.type === "number") {
            transformedRow[attr.name] = value
              ? parseFloat(value?.toString())
              : 0;
          } else if (attr.type === "boolean") {
            transformedRow[attr.name] = value === "true";
          } else {
            transformedRow[attr.name] = value || "";
          }
        });

        return transformedRow;
      });

      const payload = {
        dataSourceId: id,
        versionValue: versionDate,
        versionData: transformedRows,
      };

      dataSourceCreate?.mutate({
        url: POST?.DATA_SOURCE_VERSION_CREATE,
        payload,
      });
    }
  };

  const tab = localStorage.getItem("activeTab");

  return (
    <>
      {tab === "Notifix" ? (
        <p>yesss</p>
      ) : (
        <Box sx={{ p: STYLE_GUIDE.SPACING.s2 }}>
          <PageHeader
            title={`IP Report Constants - ${currentDataSource?.name || "Data Source Version"}`}
          />
          <PageCardLayout>
            <Box sx={{ display: "flex", alignItems: "center", gap: STYLE_GUIDE.SPACING.s4, mb: STYLE_GUIDE.SPACING.s4 }}>
              <CommonDatePicker
                name="versionValue"
                control={control}
                views={["year", "month"]}
                label="Period*"
                rules={{ required: "Period is required" }}
              />
              <StyledButton
                variant="primary"
                disabled={dataSourceCreate?.isPending || !(versionDate && id)}
                onClick={handleSave}
                icon={
                  dataSourceCreate?.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : undefined
                }
              >
                {dataSourceCreate?.isPending ? "Saving..." : "Save Changes"}
              </StyledButton>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <TableContainer
                component={Paper}
                sx={{
                  ...getTableSx(),
                  maxHeight: "calc(100vh - 300px)",
                  borderRadius: STYLE_GUIDE.SPACING.s2,
                  boxShadow: STYLE_GUIDE.SHADOWS.xxxl,
                  backgroundColor:
                    theme.palette.card?.background ||
                    STYLE_GUIDE.COLORS.backgroundSurface,
                  "& .MuiTable-root": {
                    minWidth: "600px",
                  },
                  width: "100%",
                }}
              >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {header?.map((field) => (
                      <TableCell
                        key={field?.optionAttributeId}
                        sx={{
                          backgroundColor:
                            theme.palette.table?.headerBackground ||
                            STYLE_GUIDE.COLORS.backgroundLightGray,
                          fontWeight:
                            STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                          color:
                            theme.palette.table?.headerText ||
                            STYLE_GUIDE.COLORS.textGray,
                          borderBottom: `2px solid ${STYLE_GUIDE.COLORS.divider}`,
                          padding: "12px 16px",
                        }}
                      >
                        {field?.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      sx={{
                        backgroundColor:
                          rowIndex % 2 === 0
                            ? theme.palette.table?.rowEvenBackground ||
                              STYLE_GUIDE.COLORS.white
                            : theme.palette.table?.rowOddBackground ||
                              STYLE_GUIDE.COLORS.backgroundDefault,
                        "&:hover": {
                          backgroundColor:
                            theme.palette.table?.rowHoverBackground ||
                            STYLE_GUIDE.COLORS.backgroundHover,
                        },
                      }}
                    >
                      {header?.map((field, headIndex) => (
                        <TableCell
                          key={field?.optionAttributeId}
                          sx={{
                            padding: "12px 16px",
                            borderBottom: `1px solid ${STYLE_GUIDE.COLORS.divider2}`,
                            color:
                              theme.palette.table?.rowText ||
                              STYLE_GUIDE.COLORS.textDarkGray,
                          }}
                        >
                          <TextField
                            value={row[field?.name as keyof typeof row]}
                            disabled={headIndex === 0}
                            onChange={(e) =>
                              handleEdit(rowIndex, field?.name, e.target.value)
                            }
                            variant="outlined"
                            type={
                              textAttributes?.find((attr) => {
                                return attr?.name === field?.name;
                              })?.type ?? "text"
                            }
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                height: "40px",
                                minHeight: "40px",
                                borderRadius: "10px",
                                backgroundColor:
                                  STYLE_GUIDE.COLORS.inputFieldBackground ||
                                  "#f7fafc",
                                "& fieldset": {
                                  borderColor:
                                    STYLE_GUIDE.COLORS.inputFieldBorder ||
                                    "#e5e7eb",
                                  borderWidth: "1px",
                                },
                                "&:hover fieldset": {
                                  borderColor:
                                    theme.palette.primary.main ||
                                    STYLE_GUIDE.COLORS.primary,
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor:
                                    theme.palette.primary.main ||
                                    STYLE_GUIDE.COLORS.primary,
                                  borderWidth: "1px",
                                },
                              },
                              "& .MuiOutlinedInput-input": {
                                fontSize: "14px",
                                color:
                                  STYLE_GUIDE.COLORS.textDarkGray ||
                                  "#374151",
                                padding: "10px 14px",
                              },
                            }}
                            slotProps={{
                              input: {
                                onWheel: (e) => {
                                  if (
                                    (e.target as HTMLInputElement)?.type ===
                                    "number"
                                  ) {
                                    (e.target as HTMLInputElement)?.blur();
                                  }
                                },
                                onKeyDown: (e) => {
                                  if (
                                    (e.currentTarget as HTMLInputElement)
                                      .type === "number" &&
                                    ["e", "E", "+", "-"].includes(e.key)
                                  ) {
                                    e.preventDefault();
                                  }
                                },
                              },
                            }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {sourceData?.hasNextPage && (
                    <TableRow>
                      <TableCell colSpan={header.length}>
                        <Box
                          ref={lastElementRef}
                          sx={{
                            padding: "1rem",
                            textAlign: "center",
                            color: "#6c757d",
                          }}
                        >
                          Loading more data...
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          </PageCardLayout>
        </Box>
      )}
    </>
  );
};

export default DataSources;
