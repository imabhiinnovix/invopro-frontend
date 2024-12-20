// // Core(React) Library
// import { useContext, useEffect, useMemo, useRef, useState } from "react";

// // Hooks
// import useContainerHeight from "../../hooks/useContainerHeight";

// // Third-Party Library
// import { HotTableClass } from "@handsontable/react";
// import { Resizable } from "re-resizable";

// // Local
// import SearchWithColorPalette from "../../components/atom/searchWithColorPalette";
// import ExcelArea from "../../components/atom/excelArea";
// import ReadingPane from "../../components/atom/readingPane";
// import UploadFile from "../../components/atom/uploadFile";
// import WorkSpace from "../../components/atom/workSpace";
// import Divider from "../../components/molecule/divider";
// import Footer from "../../components/molecule/footer";
// import { AuthContext, AuthContextType } from "../../context/AuthContext";
// import { colorArray } from "../../utils/constants";
// import WordArea from "../../components/atom/wordArea";
// import {
//   GeneralContext,
//   GeneralContextType,
// } from "../../context/GeneralContext";
// import ShowPdf from "../../components/atom/pdfArea";
// import SearchWordCount from "../../components/atom/searchWordCount";
// import {
//   OccurrenceCountContext,
//   OccurrenceCountContextType,
// } from "../../context/OccurrenceCountContext";
// import usePost from "../../hooks/usePost";
// import { userUpdatePayload, userUpdateResponse } from "../settings/type";
// import { POST } from "../../services/apiRoutes";
// import { HighlightArea } from "@react-pdf-viewer/highlight";
// import {
//   formatedTerm,
//   getCharRange,
//   getSentenceRange,
//   getWordRange,
// } from "../../utils/utils";
// import { SearchTerm } from "../../components/atom/advancedSearch/types";
// import {
//   ExpandScreenContext,
//   ExpandScreenContextType,
// } from "../../context/ExpandScreenContext";

// export interface Files {
//   _id: string;
//   userId: string;
//   workspaceId: string;
//   name: string;
//   type: "csv" | "xlsx" | "xls" | "docx" | "doc" | "pdf";
//   path: string;
//   size: number;
//   rowCount: number;
//   createdAt: string;
//   updatedAt: string;
//   wordCount: number;
//   __v: number;
// }

// interface Note {
//   id: number;
//   content: string;
//   highlightAreas: HighlightArea[];
//   previewImage: string;
//   quote: string;
// }

// const Dashboard = () => {
//   const [selectedCell, setSelectedCell] = useState<{
//     row: number | null;
//     col: number | null;
//     data: string;
//   }>({
//     row: null,
//     col: null,
//     data: "",
//   });
//   const [selectedCellData, setSelectedCellData] = useState<{
//     textColorData: Array<{ text: string; backgroundColor: string }>;
//     col: number;
//     row: number;
//   } | null>(null);
//   const [searchValue, setSearchValue] = useState("");
//   const [queryResult, setQueryResult] = useState<
//     | {
//         col: number;
//         row: number;
//       }[]
//     | undefined
//   >([]);
//   const [currentIndex, setCurrentIndex] = useState<number>(-1);
//   const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
//   const [liveSearchTerms, setLiveSearchTerms] = useState<
//     { query: string; colorCode?: string }[]
//   >([]);
//   const [workspaceId, setWorkspaceId] = useState<string>("");
//   const [selectedFile, setSelectedFile] = useState<Files>();
//   const [isMatchAllKeywords, setIsMatchAllKeywords] = useState(false);
//   const [defaultSize, setDefaultSize] = useState({ width: "", height: "" });
//   const [headerNameWithHeaderValue, setHeaderNameWithHeaderValue] = useState<
//     { header: string; colValue: string }[]
//   >([]);
//   const [selectedColumnIndex, setSelectedColumnIndex] = useState<number[]>([]);
//   const [searchHistoryId, setSearchHistoryId] = useState<string>("");
//   const [hiddenColumns, setHiddenColumns] = useState<number[]>([]);
//   const [pdfFile, setPdfFile] = useState<string>("");
//   const [currentIndexPdf, setCurrentIndexPdf] = useState<number>(0);
//   const [matches, setMatches] = useState<NodeListOf<Element>>(
//     document.querySelectorAll(".rpv-search__highlight")
//   );
//   const [cellSearchCount, setCellSearchCount] = useState<
//     {
//       query: string;
//       count: number;
//       colorCode?: string;
//     }[]
//   >([]);
//   const [isWordCountLoading, setWordCountLoading] = useState(false);
//   const [fileListState, setFileListState] = useState<Files[]>([]);
//   const [shouldSelectNextFirstResult, setShouldSelectNextFirstResult] =
//     useState(false);
//   const [shouldSelectPrevLastResult, setShouldSelectPrevLastResult] =
//     useState(false);
//   const [fileLoaded, setFileLoaded] = useState(false);
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [isShowCommentBar, setIsShowCommentBar] = useState(false);
//   const [totalColumn, setTotalColumn] = useState<string[]>([]);
//   const [searchCollectionName, setSearchCollectionName] = useState("");

//   // Default sizes for different readingPanePlace values
//   const DEFAULT_SIZES = {
//     left: { width: "50%", height: "100%" },
//     right: { width: "50%", height: "100%" },
//     bottom: { width: "100%", height: "50%" },
//     top: { width: "100%", height: "50%" },
//   };

//   const hotTableComponent = useRef<HotTableClass>(null);
//   const firstContainerRef = useRef<HTMLDivElement>(null);
//   const secondContainerRef = useRef<HTMLDivElement>(null);

//   const firstContainerHeight = useContainerHeight(firstContainerRef);
//   const secondContainerHeight = useContainerHeight(secondContainerRef);

//   const { initialization, userDetails } = useContext(
//     AuthContext
//   ) as AuthContextType;

//   const { sidebarWidth, setReadingPanePlace, readingPanePlace } = useContext(
//     GeneralContext
//   ) as GeneralContextType;

//   const { isCheckedShowOccurrenceCount } = useContext(
//     OccurrenceCountContext
//   ) as OccurrenceCountContextType;

//   const { screen } = useContext(ExpandScreenContext) as ExpandScreenContextType;

//   const userUpdate = usePost<userUpdatePayload, userUpdateResponse>([
//     "userDetails",
//   ]);

//   useEffect(() => {
//     if (userDetails?.data?.settings?.RPPos) {
//       setReadingPanePlace(userDetails?.data?.settings?.RPPos);
//     } else {
//       setReadingPanePlace("top");
//     }
//   }, [userDetails?.data?.settings]);

//   useEffect(() => {
//     initialization();
//   }, []);

//   useEffect(() => {
//     const hotInstance =
//       hotTableComponent.current && hotTableComponent.current?.hotInstance;

//     if (hotInstance && selectedCell.row !== null && selectedCell.col !== null) {
//       const cell = hotInstance.getCell(selectedCell.row, selectedCell.col);
//       if (cell) {
//         const extractTextColorData = (
//           node: Node
//         ): { text: string; backgroundColor: string }[] => {
//           const data: { text: string; backgroundColor: string }[] = [];

//           const traverse = (
//             currentNode: Node,
//             parentBackgroundColor: string
//           ) => {
//             if (currentNode.nodeType === Node.TEXT_NODE) {
//               const textContent = currentNode.textContent || "";
//               const trimmedText = textContent.replace(/\s+/g, " ");
//               if (trimmedText) {
//                 data.push({
//                   text: trimmedText,
//                   backgroundColor: parentBackgroundColor,
//                 });
//               }
//             } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
//               const element = currentNode as HTMLElement;
//               const backgroundColor =
//                 window.getComputedStyle(element).backgroundColor;

//               element.childNodes.forEach((childNode) =>
//                 traverse(childNode, backgroundColor)
//               );
//             }
//           };

//           traverse(node, "transparent");
//           return data;
//         };

//         const textColorData = extractTextColorData(cell);
//         const updatedSelectedCellData = {
//           textColorData,
//           row: selectedCell.row,
//           col: selectedCell.col,
//         };
//         setSelectedCellData(updatedSelectedCellData);
//       }
//     }
//   }, [selectedCell, searchTerms]);

//   useEffect(() => {
//     if (selectedCell?.data) {
//       const updatedCellSearchCount = searchTerms?.map((term) => ({
//         query: term?.query,
//         count: 0,
//         colorCode: term?.colorCode,
//         matchType: term?.matchType,
//         proximity: term?.proximity,
//         proximityInfo: term?.proximityInfo,
//         synonyms: term?.synonyms || [],
//       }));

//       updatedCellSearchCount?.forEach((termCount) => {
//         if (termCount?.proximity) {
//           if (termCount?.proximityInfo?.type === "sentence") {
//             const { sentenceRanges, subQueries } = getSentenceRange(
//               termCount,
//               selectedCell?.data
//             );
//             // Loop through valid sentence ranges and apply regex matching
//             sentenceRanges?.forEach((sentence) => {
//               subQueries?.forEach((q) => {
//                 const exactRegex = new RegExp(`\\b${formatedTerm(q)}\\b`, "gi");
//                 const partialRegex = new RegExp(q, "gi");

//                 // Exact match counting
//                 if (termCount?.matchType === "exact") {
//                   const exactMatches = sentence?.text?.match(exactRegex);
//                   if (exactMatches) termCount.count += exactMatches?.length;
//                 }

//                 // Partial match counting
//                 if (
//                   termCount?.matchType === "partial" ||
//                   termCount?.count === 0
//                 ) {
//                   const partialMatches = sentence?.text?.match(partialRegex);
//                   if (partialMatches) termCount.count += partialMatches?.length;
//                 }
//               });
//             });
//           } else if (termCount?.proximityInfo?.type === "word") {
//             const { ranges, subQueries } = getWordRange(
//               termCount,
//               selectedCell?.data
//             );

//             // Iterate through each range and perform the counting
//             ranges?.forEach(({ wordRange }) => {
//               if (wordRange) {
//                 subQueries?.forEach((q) => {
//                   const subTerm = formatedTerm(q);
//                   const exactRegex = new RegExp(`\\b${subTerm}\\b`, "gi");
//                   const partialRegex = new RegExp(subTerm, "gi");

//                   // Exact match counting
//                   if (termCount?.matchType === "exact") {
//                     const exactMatches = wordRange?.match(exactRegex);
//                     if (exactMatches) termCount.count += exactMatches.length;
//                   }

//                   // Partial match counting
//                   if (
//                     termCount?.matchType === "partial" ||
//                     termCount?.count === 0
//                   ) {
//                     const partialMatches = wordRange?.match(partialRegex);
//                     if (partialMatches)
//                       termCount.count += partialMatches.length;
//                   }
//                 });
//               }
//             });
//           } else if (termCount?.proximityInfo?.type === "char") {
//             const { ranges, subQueries } = getCharRange(
//               termCount,
//               selectedCell?.data
//             );

//             if (ranges?.length > 0) {
//               ranges.forEach(({ text }) => {
//                 subQueries?.forEach((q) => {
//                   const subTerm = formatedTerm(q);
//                   const exactRegex = new RegExp(`\\b${subTerm}\\b`, "gi");
//                   const partialRegex = new RegExp(subTerm, "gi");

//                   // Exact match counting
//                   if (termCount?.matchType === "exact") {
//                     const exactMatches = text.match(exactRegex);
//                     if (exactMatches) termCount.count += exactMatches.length;
//                   }

//                   // Partial match counting
//                   if (
//                     termCount?.matchType === "partial" ||
//                     termCount?.count === 0
//                   ) {
//                     const partialMatches = text.match(partialRegex);
//                     if (partialMatches)
//                       termCount.count += partialMatches.length;
//                   }
//                 });
//               });
//             }
//           }
//         } else {
//           const exactRegex = new RegExp(
//             `\\b${formatedTerm(termCount?.query)}\\b`,
//             "gi"
//           );
//           const partialRegex = new RegExp(formatedTerm(termCount?.query), "gi");

//           // Main term matching
//           if (termCount?.matchType === "exact") {
//             const exactMatches = selectedCell?.data?.match(exactRegex);
//             if (exactMatches) {
//               termCount.count += exactMatches?.length;
//             }
//           }

//           if (termCount?.matchType === "partial" || termCount?.count === 0) {
//             const partialMatches = selectedCell?.data?.match(partialRegex);
//             if (partialMatches) {
//               termCount.count += partialMatches?.length;
//             }
//           }

//           // Synonym exact matching only
//           termCount?.synonyms?.forEach((synonym) => {
//             const synonymRegex = new RegExp(
//               `\\b${formatedTerm(synonym?.term)}\\b`,
//               "gi"
//             );
//             const synonymMatches = selectedCell?.data?.match(synonymRegex);

//             if (synonymMatches) {
//               termCount.count += synonymMatches?.length;
//             }
//           });
//         }
//       });

//       const finalCellSearchCount = updatedCellSearchCount?.map((termCount) => ({
//         query: termCount?.query,
//         count: termCount?.count,
//         colorCode: termCount?.colorCode,
//       }));

//       setCellSearchCount(finalCellSearchCount);
//     }
//   }, [searchTerms, selectedCell?.data]);

//   useEffect(() => {
//     const savedSizesString = userDetails?.data?.settings?.RPDimensions;
//     const savedSizes = savedSizesString ? savedSizesString : DEFAULT_SIZES;

//     setDefaultSize(savedSizes[readingPanePlace]);
//   }, [readingPanePlace, userDetails?.data?.settings?.RPDimensions]);

//   useEffect(() => {
//     const debounceTimeout = setTimeout(() => {
//       if (
//         shouldSelectNextFirstResult &&
//         Array?.isArray(queryResult) &&
//         queryResult.length > 0
//       ) {
//         const newIndex = 0;
//         const { row, col } = queryResult[newIndex];
//         selectAndScrollToCell(row, col);
//         setCurrentIndex(newIndex);
//         setShouldSelectNextFirstResult(false);
//       }
//     }, 300);
//     return () => {
//       clearTimeout(debounceTimeout);
//     };
//   }, [queryResult]);

//   useEffect(() => {
//     const debounceTimeout = setTimeout(() => {
//       if (
//         shouldSelectPrevLastResult &&
//         Array?.isArray(queryResult) &&
//         queryResult.length > 0
//       ) {
//         const newIndex = queryResult?.length - 1;
//         const { row, col } = queryResult[newIndex];
//         selectAndScrollToCell(row, col);
//         setCurrentIndex(newIndex);
//         setShouldSelectPrevLastResult(false);
//       }
//     }, 300);
//     return () => {
//       clearTimeout(debounceTimeout);
//     };
//   }, [queryResult]);

//   const handleSelectCell = (row: number, col: number) => {
//     const hotInstance =
//       hotTableComponent.current && hotTableComponent.current?.hotInstance;
//     if (hotInstance) {
//       if (row !== -1 && col !== -1) {
//         const selectedValue = hotInstance.getDataAtCell(row, col);
//         setSelectedCell({ row, col, data: selectedValue });
//       }
//     }
//   };

//   const applyCustomScrollAndStyle = (matches: NodeListOf<Element>) => {
//     matches.forEach((element) => {
//       const highlightElement = element as HTMLElement;
//       highlightElement.style.border = "";
//     });

//     const currentHighlight = document.querySelector(
//       ".rpv-search__highlight--current"
//     ) as HTMLElement;

//     if (currentHighlight) {
//       currentHighlight.style.border = "3px solid red";

//       currentHighlight.scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//         inline: "center",
//       });
//     }
//   };

//   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setCurrentIndex(-1);
//     setCurrentIndexPdf(0);

//     const value = event.target.value;
//     setSearchValue(value);

//     setLiveSearchTerms([
//       { query: value, colorCode: colorArray[searchTerms.length] },
//     ]);
//   };

//   const selectAndScrollToCell = (row: number, col: number) => {
//     const hotInstance = hotTableComponent.current?.hotInstance;
//     if (hotInstance) {
//       hotInstance.selectCell(row, col);
//       hotInstance.render();
//       hotInstance.scrollViewportTo(row, col, true, true, true);
//       hotInstance.render();
//     }
//   };

//   const handleNext = () => {
//     if (
//       selectedFile?.type === "csv" ||
//       selectedFile?.type === "xlsx" ||
//       selectedFile?.type === "xls"
//     ) {
//       if (
//         Array.isArray(queryResult) &&
//         queryResult.length > 0 &&
//         currentIndex < queryResult.length - 1
//       ) {
//         const newIndex = currentIndex + 1;

//         const { row, col } = queryResult[newIndex];
//         selectAndScrollToCell(row, col);
//         setCurrentIndex(newIndex);
//       } else {
//         const selectedIndex = fileListState?.findIndex(
//           (file) => file._id === selectedFile?._id
//         );
//         if (
//           selectedIndex === fileListState?.length - 1 &&
//           queryResult?.length === 0
//         ) {
//           return;
//         }
//         if (
//           selectedIndex >= fileListState?.length - 1 &&
//           Array.isArray(queryResult) &&
//           queryResult.length > 0
//         ) {
//           const { row, col } = queryResult[queryResult?.length - 1];
//           selectAndScrollToCell(row, col);
//           return;
//         }
//         const nextIndex = selectedIndex + 1;
//         const nextFile = fileListState[nextIndex];
//         setSelectedFile(nextFile);
//         setSelectedCell({
//           row: null,
//           col: null,
//           data: "",
//         });
//         setSelectedCellData(null);
//         setShouldSelectNextFirstResult(true);
//       }
//     } else if (pdfFile) {
//       const jumpToNextMatch = () => {
//         if (matches.length === 0) return;
//         if (currentIndexPdf >= 0) {
//           matches[currentIndexPdf].classList.remove(
//             "rpv-search__highlight--current"
//           );
//         }
//         setCurrentIndexPdf((prevIndex) => {
//           const newIndex = (prevIndex + 1) % matches.length;
//           matches[newIndex].classList.add("rpv-search__highlight--current");
//           return newIndex;
//         });

//         applyCustomScrollAndStyle(matches);
//       };
//       jumpToNextMatch();
//     }
//   };

//   const handlePrev = () => {
//     if (
//       selectedFile?.type === "csv" ||
//       selectedFile?.type === "xlsx" ||
//       selectedFile?.type === "xls"
//     ) {
//       if (
//         currentIndex > 0 &&
//         Array.isArray(queryResult) &&
//         queryResult.length > 0
//       ) {
//         const newIndex = currentIndex - 1;

//         const { row, col } = queryResult[newIndex];
//         selectAndScrollToCell(row, col);
//         setCurrentIndex(newIndex);
//       } else {
//         const selectedIndex = fileListState?.findIndex(
//           (file) => file._id === selectedFile?._id
//         );
//         if (selectedIndex === 0 && queryResult?.length === 0) {
//           return;
//         }
//         if (
//           selectedIndex <= 0 &&
//           Array.isArray(queryResult) &&
//           queryResult.length > 0
//         ) {
//           const { row, col } = queryResult[0];
//           selectAndScrollToCell(row, col);
//           return;
//         }
//         const nextIndex = selectedIndex - 1;
//         const nextFile = fileListState[nextIndex];
//         setSelectedFile(nextFile);
//         setSelectedCell({
//           row: null,
//           col: null,
//           data: "",
//         });
//         setSelectedCellData(null);

//         setShouldSelectPrevLastResult(true);
//       }
//     } else if (pdfFile) {
//       const jumpToPreviousMatch = () => {
//         if (matches.length === 0 || currentIndexPdf <= 0) return;

//         if (currentIndexPdf >= 0) {
//           matches[currentIndexPdf].classList.remove(
//             "rpv-search__highlight--current"
//           );
//         }

//         setCurrentIndexPdf((prevIndex) => {
//           const newIndex = (prevIndex - 1 + matches.length) % matches.length;
//           matches[newIndex].classList.add("rpv-search__highlight--current");
//           return newIndex;
//         });
//         applyCustomScrollAndStyle(matches);
//       };
//       jumpToPreviousMatch();
//     }
//   };

//   const handleResize = (ref: HTMLElement) => {
//     setDefaultSize({
//       width: ref.style.width,
//       height: ref.style.height,
//     });

//     const savedSizesString = userDetails?.data?.settings?.RPDimensions;
//     const savedSizes = savedSizesString ? savedSizesString : DEFAULT_SIZES;

//     const updatedSizes = {
//       ...savedSizes,
//       [readingPanePlace]: {
//         width: ref.style.width,
//         height: ref.style.height,
//       },
//     };

//     userUpdate.mutate({
//       url: POST.USER_UPDATE,
//       payload: {
//         settings: {
//           RPDimensions: updatedSizes,
//         },
//       },
//     });
//   };

//   const shouldShowSearchWordCount = useMemo(() => {
//     return (
//       searchTerms?.length > 0 &&
//       isCheckedShowOccurrenceCount &&
//       ["csv", "xlsx", "xls"].includes(selectedFile?.type ?? "")
//     );
//   }, [isCheckedShowOccurrenceCount, searchTerms?.length, selectedFile?.type]);

//   return (
//     <div
//       className={`flex w-full ${screen === "normal" ? "h-[93%]" : "h-[99.5%]"}`}
//     >
//       {screen === "normal" ? (
//         <div
//           className={`h-full border-r-2 shadow-xl shadow-grey-500/50 bg-[#F5F8FC] relative transition-all duration-400`}
//           style={{ width: sidebarWidth, transition: "all 0.4s ease-in-out" }}
//         >
//           <div className="w-full h-[8%] flex justify-center items-center pt-5">
//             <WorkSpace
//               setWorkspaceId={setWorkspaceId}
//               setSearchTerms={setSearchTerms}
//               setSelectedCell={setSelectedCell}
//               setSelectedCellData={setSelectedCellData}
//               workspaceId={workspaceId}
//               setSearchCollectionName={setSearchCollectionName}
//             />
//           </div>
//           <div className="w-full h-[84%]">
//             <UploadFile
//               // searchCounter={searchCounter}
//               setSearchValue={setSearchValue}
//               setCurrentIndex={setCurrentIndex}
//               hotTableComponent={hotTableComponent}
//               setQueryResult={setQueryResult}
//               workspaceId={workspaceId}
//               setSelectedFile={setSelectedFile}
//               selectedFile={selectedFile}
//               setSelectedCell={setSelectedCell}
//               setSelectedCellData={setSelectedCellData}
//               searchHistoryId={searchHistoryId}
//               setCellSearchCount={setCellSearchCount}
//               setWordCountLoading={setWordCountLoading}
//               setFileListState={setFileListState}
//               fileListState={fileListState}
//               setNotes={setNotes}
//               setCurrentIndexPdf={setCurrentIndexPdf}
//             />
//           </div>
//           <div className="w-full h-[8%]">
//             {sidebarWidth === "20%" ? <Footer /> : null}
//           </div>
//         </div>
//       ) : null}

//       <div
//         className="overflow-hidden h-full transition-all duration-[1500ms] ease-[cubic-bezier(0.68, -0.55, 0.27, 1.55)] relative"
//         style={{
//           width: `100%`,
//         }}
//       >
//         {screen === "normal" ? (
//           <div className="w-full h-auto" ref={firstContainerRef}>
//             <SearchWithColorPalette
//               handleSearch={handleSearch}
//               searchValue={searchValue}
//               setSearchValue={setSearchValue}
//               searchTerms={searchTerms}
//               setLiveSearchTerms={setLiveSearchTerms}
//               setSearchTerms={setSearchTerms}
//               handleNext={handleNext}
//               handlePrev={handlePrev}
//               workspaceId={workspaceId}
//               // setSearchCounter={setSearchCounter}
//               setIsMatchAllKeywords={setIsMatchAllKeywords}
//               isMatchAllKeywords={isMatchAllKeywords}
//               headerNameWithHeaderValue={headerNameWithHeaderValue}
//               setSelectedColumnIndex={setSelectedColumnIndex}
//               selectedColumnIndex={selectedColumnIndex}
//               setQueryResult={setQueryResult}
//               setCurrentIndex={setCurrentIndex}
//               setSearchHistoryId={setSearchHistoryId}
//               searchHistoryId={searchHistoryId}
//               selectedFile={selectedFile}
//               hiddenColumns={hiddenColumns}
//               currentIndexPdf={currentIndexPdf}
//               setIsShowCommentBar={setIsShowCommentBar}
//               isShowCommentBar={isShowCommentBar}
//               totalColumn={totalColumn}
//               isWordCountLoading={isWordCountLoading}
//               setSearchCollectionName={setSearchCollectionName}
//             />
//           </div>
//         ) : null}

//         {shouldShowSearchWordCount ? (
//           <>
//             <Divider width="100%" color="black" opacity={0.12} />

//             <div className="w-full h-auto" ref={secondContainerRef}>
//               <SearchWordCount
//                 searchTerms={searchTerms}
//                 isWordCountLoading={isWordCountLoading}
//                 searchCollectionName={searchCollectionName}
//               />
//             </div>
//           </>
//         ) : null}
//         <Divider width="100%" color="black" opacity={0.12} />

//         <div
//           className={`h-full w-full transition-all duration-[1500ms] ease-[cubic-bezier(0.68, -0.55, 0.27, 1.55)] relative flex ${
//             readingPanePlace === "left"
//               ? "flex-row justify-start items-stretch"
//               : readingPanePlace === "right"
//               ? "flex-row-reverse justify-end items-stretch"
//               : readingPanePlace === "bottom"
//               ? "flex-col-reverse justify-end items-center"
//               : "flex-col justify-start items-center"
//           }`}
//           style={{
//             maxHeight: `${
//               screen === "normal"
//                 ? readingPanePlace === "left" || readingPanePlace === "right"
//                   ? `${93.8 - firstContainerHeight - secondContainerHeight}%`
//                   : `${95.3 - firstContainerHeight - secondContainerHeight}%`
//                 : `${95}%`
//             }`,
//           }}
//         >
//           {selectedFile?.type === "csv" ||
//           selectedFile?.type === "xlsx" ||
//           selectedFile?.type === "xls" ? (
//             <Resizable
//               onResizeStop={(_e, _direction, ref) => handleResize(ref)}
//               size={defaultSize}
//               enable={{
//                 right: readingPanePlace === "left" ? true : false,
//                 left: readingPanePlace === "right" ? true : false,
//                 top: readingPanePlace === "bottom" ? true : false,
//                 bottom: readingPanePlace === "top" ? true : false,
//               }}
//             >
//               <div
//                 className={`overflow-auto p-3 w-full h-full border-black border-opacity-[0.12]  ${
//                   readingPanePlace === "top"
//                     ? "border-b-2"
//                     : readingPanePlace === "bottom"
//                     ? "border-t-2"
//                     : readingPanePlace === "right"
//                     ? "border-l-2"
//                     : "border-r-2"
//                 } `}
//               >
//                 <ReadingPane
//                   selectedCell={selectedCell}
//                   selectedCellData={selectedCellData}
//                   hotTableComponent={hotTableComponent}
//                   selectedFile={selectedFile}
//                   readingPanePlace={readingPanePlace}
//                   setSelectedCellData={setSelectedCellData}
//                   cellSearchCount={cellSearchCount}
//                 />
//               </div>
//             </Resizable>
//           ) : null}
//           {/* {pdfFile ? (
//             <div className="w-full h-full flex justify-end overflow-hidden">
//               <ShowPdf
//                 pdfFile={pdfFile}
//                 searchTerms={searchTerms}
//                 searchPluginInstance={searchPluginInstance}
//               />
//             </div>
//           ) : ( */}
//           <div className="overflow-auto w-full h-full pt-4 pl-4 pr-2 pb-2 transition-all duration-[1500ms] ease-[cubic-bezier(0.68, -0.55, 0.27, 1.55)] relative">
//             <div className="overflow-hidden w-full h-full flex justify-end transition-all duration-[1500ms] ease-[cubic-bezier(0.68, -0.55, 0.27, 1.55)] relative">
//               {selectedFile?.type === "csv" ||
//               selectedFile?.type === "xlsx" ||
//               selectedFile?.type === "xls" ? (
//                 <ExcelArea
//                   hotTableComponent={hotTableComponent}
//                   handleSelectCell={handleSelectCell}
//                   searchTerms={searchTerms}
//                   setQueryResult={setQueryResult}
//                   colorArray={colorArray}
//                   selectedFile={selectedFile}
//                   setSelectedCellData={setSelectedCellData}
//                   isMatchAllKeywords={isMatchAllKeywords}
//                   setHeaderNameWithHeaderValue={setHeaderNameWithHeaderValue}
//                   selectedColumnIndex={selectedColumnIndex}
//                   setHiddenColumns={setHiddenColumns}
//                   hiddenColumns={hiddenColumns}
//                   setSelectedColumnIndex={setSelectedColumnIndex}
//                   queryResult={queryResult}
//                   setSearchTerms={setSearchTerms}
//                   setWordCountLoading={setWordCountLoading}
//                   totalColumn={totalColumn}
//                   setTotalColumn={setTotalColumn}
//                 />
//               ) : selectedFile?.type === "docx" ||
//                 selectedFile?.type === "doc" ? (
//                 <WordArea
//                   selectedFile={selectedFile}
//                   searchTerms={searchTerms}
//                   liveSearchTerms={liveSearchTerms}
//                 />
//               ) : selectedFile?.type === "pdf" ? (
//                 <ShowPdf
//                   selectedFile={selectedFile}
//                   pdfFile={pdfFile}
//                   setPdfFile={setPdfFile}
//                   searchTerms={searchTerms}
//                   notes={notes}
//                   setNotes={setNotes}
//                   fileLoaded={fileLoaded}
//                   setFileLoaded={setFileLoaded}
//                   applyCustomScrollAndStyle={applyCustomScrollAndStyle}
//                   setMatches={setMatches}
//                   isShowCommentBar={isShowCommentBar}
//                 />
//               ) : null}
//             </div>
//           </div>
//           {/* )} */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
