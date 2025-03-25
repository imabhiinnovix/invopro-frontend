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
  Divider,
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
import ContainedButton from "../../components/molecule/containedButton";
import usePost from "../../hooks/usePost";

const DataSources = () => {
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
    <Container style={{ margin: "4rem 0 0 0", width: "calc(100vw - 288px)" }}>
      <Stack component="div" direction="row" justifyContent="space-between">
        <CommonDatePicker
          name="versionValue"
          control={control}
          views={["year", "month"]}
          label="Version Value*"
          rules={{ required: "Version Value is required" }}
        />
        <ContainedButton
          disabled={dataSourceCreate?.isPending || !(versionDate && id)}
          loading={dataSourceCreate?.isPending}
          text="Save"
          handleClick={handleSave}
        />
      </Stack>
      <Divider style={{ margin: "1.5rem 0" }} />
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "fit-content",
          maxHeight: "calc(100vh - 250px)",
          backgroundColor: "#F5F5F5",
          overflowY: "auto",
        }}
      >
        <Table>
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: "#F5F5F5",
            }}
          >
            <TableRow>
              <TableCell style={{ fontWeight: "600", fontSize: "1rem" }}>
                {optionsAttributes?.name ?? "Default Name"}
              </TableCell>
              {textAttributes?.map((textAttr) => (
                <TableCell
                  style={{ fontWeight: "600", fontSize: "1rem" }}
                  key={textAttr?.optionAttributeId}
                >
                  {textAttr?.name}
                </TableCell>
              ))}
              <TableCell style={{ fontWeight: "600", fontSize: "1rem" }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {header?.map((field, headIndex) => (
                  <TableCell key={field?.optionAttributeId}>
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
                      slotProps={{
                        input: {
                          onWheel: (e) => {
                            if (
                              (e.target as HTMLInputElement)?.type === "number"
                            ) {
                              (e.target as HTMLInputElement)?.blur();
                            }
                          },
                          onKeyDown: (e) => {
                            if (
                              (e.currentTarget as HTMLInputElement).type ===
                                "number" &&
                              ["e", "E", "+", "-"].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          },
                          sx: {
                            fontSize: "1rem",
                            padding: "4px 8px",
                            border: "none",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                          },
                        },
                      }}
                    />
                  </TableCell>
                ))}
                {/* <TableCell>
                  <IconButton
                    onClick={() => handleDeleteRow(rowIndex)}
                    color="primary"
                    disabled={!(versionDate && id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell> */}
              </TableRow>
            ))}
            {sourceData?.hasNextPage && (
              <Box ref={lastElementRef} marginTop={2} marginLeft={2}>
                Loading...
              </Box>
            )}
            {/* <TableRow>
              <TableCell colSpan={4} align="center">
                <Button
                  onClick={handleAddRow}
                  startIcon={<Add />}
                  variant="contained"
                  color="primary"
                >
                  Add Row
                </Button>
              </TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DataSources;
