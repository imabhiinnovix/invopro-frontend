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
  Button,
  Container,
  Box,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import CommonDatePicker from "../../components/common/datePicker/datePicker";
import { useAppSelector } from "../../storeHooks";
import { useParams } from "react-router-dom";
import { GET } from "../../services/apiRoutes";
import {
  OptionsAttributesValueResponce,
  SourceValueData,
  SourceValuePayload,
} from "./types";
import useGet from "../../hooks/useGet";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { DateTime } from "luxon";

const DataSources = () => {
  const [rows, setRows] = useState<{ [x: string]: string }[]>([]);

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
    ["sourceData"],
    GET?.SOURCE_VERSION_DATA +
      `?dataSourceId=${id}&versionValue=${versionDate}`,
    10,
    "get",
    !!optionsAttributes?.optionAttributeId && !!versionDate
  );

  const sourceMap = useMemo(() => {
    return (
      sourceData?.data?.pages
        ?.flatMap((page) => page?.data)
        ?.map((item) => item?.rowData) || []
    );
  }, [sourceData?.data?.pages]);

  // const sourceMap = [
  //   {
  //     SBU: "Corp T&I",
  //     Estimates: 10,
  //   },
  //   {
  //     SBU: "Metals",
  //     Estimates: 20,
  //   },
  // ];

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

        // Dynamically map text attributes
        const rowData = textAttributes.reduce(
          (acc: { [key: string]: string }, attr) => {
            acc[attr?.name] = matchingRow ? matchingRow[attr?.name] || "" : "";
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
    OptionsAttributesValue?.data?.data.attributeValue,
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

  const handleAddRow = () => {
    const newRow =
      textAttributes?.reduce((acc: { [key: string]: string }, attr) => {
        acc[attr?.name] = "";
        return acc;
      }, {} as { [key: string]: string }) || {};

    newRow[optionsAttributes?.name ?? "defaultName"] = "";

    setRows((prevRows) => [...prevRows, newRow]);
  };

  return (
    <Container style={{ margin: "4rem 0 0 0" }}>
      <Box component="div" style={{ marginBottom: "2rem" }}>
        <CommonDatePicker
          name="versionValue"
          control={control}
          views={["year", "month"]}
          label="Version Value*"
          rules={{ required: "Version Value is required" }}
        />
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "fit-content",
          maxHeight: "fit-content",
          backgroundColor: "#F5F5F5",
        }}
      >
        <Table>
          <TableHead>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {header?.map((field) => (
                  <TableCell key={field?.optionAttributeId}>
                    <TextField
                      value={row[field?.name as keyof typeof row]}
                      onChange={(e) =>
                        handleEdit(rowIndex, field?.name, e.target.value)
                      }
                      variant="standard"
                      size="small"
                      fullWidth
                      slotProps={{
                        input: {
                          disableUnderline: true,
                          sx: {
                            fontSize: "1rem",
                            padding: "4px 0",
                            border: "none",
                            backgroundColor: "transparent",
                            "&:hover": { backgroundColor: "#f5f5f5" },
                            "&:focus": { backgroundColor: "#fff" },
                          },
                        },
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {sourceData?.hasNextPage && (
              <Box ref={lastElementRef} marginTop={2} marginLeft={2}>
                Loading...
              </Box>
            )}
            <TableRow>
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
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DataSources;
