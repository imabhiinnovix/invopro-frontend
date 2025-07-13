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
  useTheme,
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

const DataSources = () => {
  const theme = useTheme();
  const [rows, setRows] = useState<
    { [x: string]: string | number | boolean }[]
  >([]);

  const { id } = useParams();

  const { control, watch } = useForm<{ versionValue: string }>({});

  const reduxDataSourceList = useAppSelector((state) => state.dataSource.list);

  const dataSourceAttributes = useMemo(
    () =>
      reduxDataSourceList?.find((source) => source?._id === id)?.entityId
        ?.attributes,
    [id, reduxDataSourceList]
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
    ["sourceData", versionDate ?? ""],
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

  // const handleAddRow = () => {
  //   const newRow =
  //     textAttributes?.reduce((acc: { [key: string]: string }, attr) => {
  //       acc[attr?.name] = "";
  //       return acc;
  //     }, {} as { [key: string]: string }) || {};

  //   newRow[optionsAttributes?.name ?? "defaultName"] = "";

  //   setRows((prevRows) => [...prevRows, newRow]);
  // };

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

  // const handleDeleteRow = (index: number) => {
  //   const updatedRows = rows.filter((_, i) => i !== index);
  //   setRows(updatedRows);
  // };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        margin: STYLE_GUIDE.SPACING.s8,
        padding: STYLE_GUIDE.SPACING.s8,
        backgroundColor: theme.palette.background.paper,
        borderRadius: STYLE_GUIDE.SPACING.s3,
        boxShadow: STYLE_GUIDE.SHADOWS.base
      }}
    >
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ 
          marginBottom: STYLE_GUIDE.SPACING.s8,
          padding: STYLE_GUIDE.SPACING.s4,
          backgroundColor: STYLE_GUIDE.COLORS.white,
          borderRadius: STYLE_GUIDE.SPACING.s2,
          boxShadow: STYLE_GUIDE.SHADOWS.xxxl
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6" color="primary" sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold }}>
            Data Source Version
          </Typography>
          <CommonDatePicker
            name="versionValue"
            control={control}
            views={["year", "month"]}
            label="Period*"
            rules={{ required: "Period is required" }}
          />
        </Stack>
        <Button
          variant="contained"
          disabled={dataSourceCreate?.isPending || !(versionDate && id)}
          onClick={handleSave}
          sx={{ 
            minWidth: "150px",
            height: "40px",
            borderRadius: STYLE_GUIDE.SPACING.s1,
            textTransform: "none",
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
            fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            }
          }}
        >
          {dataSourceCreate?.isPending ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "24px",
              }}
            >
              <CircularProgress size={20} sx={{ color: STYLE_GUIDE.COLORS.white }} />
            </Box>
          ) : (
            "Save Changes"
          )}
        </Button>
      </Stack>
      
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: "calc(100vh - 300px)",
            borderRadius: STYLE_GUIDE.SPACING.s2,
            boxShadow: STYLE_GUIDE.SHADOWS.xxxl,
            width: "fit-content",
            "& .MuiTable-root": {
              minWidth: "600px"
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {header?.map((field) => (
                  <TableCell
                    key={field?.optionAttributeId}
                    sx={{
                      backgroundColor: STYLE_GUIDE.COLORS.backgroundLightGray,
                      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                      color: STYLE_GUIDE.COLORS.textGray,
                      borderBottom: `2px solid ${STYLE_GUIDE.COLORS.divider}`,
                       padding: "12px 16px"
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
                    "&:nth-of-type(odd)": {
                      backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault
                    },
                    "&:hover": {
                      backgroundColor: STYLE_GUIDE.COLORS.backgroundHover
                    }
                  }}
                >
                  {header?.map((field, headIndex) => (
                    <TableCell 
                      key={field?.optionAttributeId}
                      sx={{ 
                        padding: "12px 16px",
                        borderBottom: `1px solid ${STYLE_GUIDE.COLORS.divider2}`
                      }}
                    >
                      <TextField
                        value={row[field?.name as keyof typeof row]}
                        disabled={headIndex === 0}
                        onChange={(e) =>
                          handleEdit(rowIndex, field?.name, e.target.value)
                        }
                        variant="outlined"
                        size="small"
                        type={
                          textAttributes?.find((attr) => {
                            return attr?.name === field?.name;
                          })?.type ?? "text"
                        }
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: STYLE_GUIDE.SPACING.s1,
                            backgroundColor: STYLE_GUIDE.COLORS.white,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: STYLE_GUIDE.COLORS.borderPrimary
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: STYLE_GUIDE.COLORS.materialBlue
                            }
                          }
                        }}
                        slotProps={{
                          input: {
                            onWheel: (e) => {
                              if ((e.target as HTMLInputElement)?.type === "number") {
                                (e.target as HTMLInputElement)?.blur();
                              }
                            },
                            onKeyDown: (e) => {
                              if (
                                (e.currentTarget as HTMLInputElement).type === "number" &&
                                ["e", "E", "+", "-"].includes(e.key)
                              ) {
                                e.preventDefault();
                              }
                            },
                            sx: {
                              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                              padding: "8px 12px"
                            }
                          }
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {sourceData?.hasNextPage && (
                <Box 
                  ref={lastElementRef} 
                  sx={{ 
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6c757d"
                  }}
                >
                  Loading more data...
                </Box>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default DataSources;
