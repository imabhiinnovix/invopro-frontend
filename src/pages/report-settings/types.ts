export interface ReportSetting {
    _id: string;
    sheetName: string;
    sheetCode: string;
    isWhiteBackGround: boolean;
    startTableColumn: string;
    startRowNumber: number;
}

export interface FilterColumn {
    _id: string;
    reportHeader: string;
    attributeValues: string[];
}

export interface Filter {
    _id: string;
    sheetCode: string;
    section: string;
    attribute: string;
    columns: FilterColumn[];
}

export interface Report {
    _id: string;
    reportName: string;
    reportSettings: ReportSetting[];
    filters: Filter[];
}