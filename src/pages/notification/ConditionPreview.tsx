// import React from 'react';
// import { Box, Paper, Typography, Chip } from '@mui/material';

// const ConditionPreview = ({ conditionGroup, fieldOptions, operatorList }) => {
//   // VIBGYOR colors for nested brackets
//   const bracketColors = [
//     '#9C27B0', // Violet
//     '#3F51B5', // Indigo
//     '#2196F3', // Blue
//     '#4CAF50', // Green
//     '#FFEB3B', // Yellow
//     '#FF9800', // Orange
//     '#F44336', // Red
//   ];

//   const getOperatorSymbol = (operatorKey, fieldType) => {
//     const operators = operatorList?.data?.data?.find(
//       (op) => op.fieldType === fieldType
//     )?.operators || [];
//     const operator = operators.find((op) => op.operatorKey === operatorKey);
//     return operator?.operatorName || operatorKey;
//   };

//   const getFieldLabel = (fieldValue) => {
//     const field = fieldOptions.find((f) => f.value === fieldValue);
//     return field?.label || fieldValue;
//   };

//   const formatValue = (value, timeUnit) => {
//     if (!value) return '';
//     if (timeUnit) {
//       const unitLabel = {
//         'M': 'months',
//         'd': 'days',
//         'y': 'years'
//       }[timeUnit] || timeUnit;
//       return `${value} ${unitLabel}`;
//     }
//     return value;
//   };

//   const renderConditionExpression = (group, depth = 0) => {
//     if (!group || !group.rules || group.rules.length === 0) {
//       return null;
//     }

//     const expressions = group.rules
//       .map((rule, index) => {
//         if (rule.logic) {
//           // Nested group - increase depth for next level
//           return renderConditionExpression(rule, depth + 1);
//         } else {
//           // Single rule
//           if (!rule.field || !rule.operator) return null;

//           const field = fieldOptions.find((f) => f.value === rule.field);
//           const fieldLabel = getFieldLabel(rule.field);
//           const operatorSymbol = getOperatorSymbol(rule.operator, field?.type);
//           const valueDisplay = formatValue(rule.value, rule.timeUnit);

//           return (
//             <Box
//               key={rule.id || index}
//               component="span"
//               sx={{
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: 0.5,
//               }}
//             >
//               <Chip
//                 label={fieldLabel}
//                 size="small"
//                 color="primary"
//                 variant="outlined"
//                 sx={{
//                   fontWeight: 600,
//                   borderRadius: '4px',
//                   height: '24px',
//                 }}
//               />
//               <Typography
//                 component="span"
//                 sx={{
//                   fontSize: '0.875rem',
//                   color: 'text.secondary',
//                   fontWeight: 500,
//                   px: 0.5,
//                 }}
//               >
//                 {operatorSymbol}
//               </Typography>
//               {valueDisplay && (
//                 <Chip
//                   label={valueDisplay}
//                   size="small"
//                   color="secondary"
//                   variant="filled"
//                   sx={{
//                     fontWeight: 500,
//                     borderRadius: '4px',
//                     height: '24px',
//                   }}
//                 />
//               )}
//             </Box>
//           );
//         }
//       })
//       .filter(Boolean);

//     if (expressions.length === 0) return null;

//     const logicOperator = group.logic === 'AND' ? 'ALL' : 'ANY';
//     const needsParentheses = depth > 0;

//     // Get color based on depth (cycle through VIBGYOR colors)
// const bracketColor = bracketColors[depth % bracketColors.length];
//     // Determine text color (white for yellow/light colors, white for others)
//     const isLightColor = bracketColor === '#FFEB3B'; // Yellow
//     const textColor = isLightColor ? '#000' : '#FFF';

//     return (
//       <Box
//         component="span"
//         sx={{
//           display: 'inline-flex',
//           flexWrap: 'wrap',
//           alignItems: 'center',
//           gap: 1,
//           py: 0.5,
//         }}
//       >
//         {needsParentheses && (
//           <Typography
//             component="span"
//             sx={{
//               fontSize: '1.8rem',
//               fontWeight: 'bold',
//               color: bracketColor,
//               lineHeight: 1,
//               px: 0.3,
//             }}
//           >
//             (
//           </Typography>
//         )}

//         {expressions.map((expr, index) => (
//           <React.Fragment key={index}>
//             {expr}
//             {index < expressions.length - 1 && (
//               <Chip
//                 label={logicOperator}
//                 size="small"
//                 sx={{
//                   bgcolor: group.logic === 'AND' ? 'success.light' : 'warning.light',
//                   color: 'white',
//                   fontWeight: 700,
//                   fontSize: '0.75rem',
//                   height: '24px',
//                   borderRadius: '4px',
//                 }}
//               />
//             )}
//           </React.Fragment>
//         ))}

//         {needsParentheses && (
//           <Typography
//             component="span"
//             sx={{
//               fontSize: '1.8rem',
//               fontWeight: 'bold',
//               color: bracketColor,
//               lineHeight: 1,
//               px: 0.3,
//             }}
//           >
//             )
//           </Typography>
//         )}
//       </Box>
//     );
//   };

//   const hasConditions = conditionGroup?.rules?.length > 0;

//   return (
//     <Paper
//       elevation={2}
//       sx={{
//         p: 2,
//         mt: 3,
//         bgcolor: 'grey.50',
//         borderLeft: '4px solid',
//         borderColor: 'primary.main',
//         minHeight: '60px',
//         display: 'flex',
//         flexDirection: 'column',
//       }}
//     >
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
//         <Typography
//           variant="subtitle2"
//           sx={{
//             fontWeight: 700,
//             color: 'text.secondary',
//             textTransform: 'uppercase',
//             fontSize: '0.75rem',
//             letterSpacing: '0.5px',
//           }}
//         >
//           📋 Condition Preview
//         </Typography>

//         {/* Color Legend for Brackets */}
//         <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
//           <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', mr: 0.5 }}>
//             Bracket Levels:
//           </Typography>
//           {bracketColors.slice(0, 4).map((color, index) => (
//             <Box
//               key={index}
//               sx={{
//                 width: 16,
//                 height: 16,
//                 bgcolor: color,
//                 borderRadius: '2px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '0.6rem',
//                 fontWeight: 'bold',
//                 color: color === '#FFEB3B' ? '#000' : '#FFF',
//               }}
//             >
//               {index + 1}
//             </Box>
//           ))}
//         </Box>
//       </Box>

//       {hasConditions ? (
//         <Box
//           sx={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             alignItems: 'center',
//             gap: 1,
//             p: 1.5,
//             bgcolor: 'white',
//             borderRadius: 1,
//             border: '1px solid',
//             borderColor: 'grey.300',
//           }}
//         >
//           {renderConditionExpression(conditionGroup)}
//         </Box>
//       ) : (
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             p: 2,
//             bgcolor: 'white',
//             borderRadius: 1,
//             border: '1px dashed',
//             borderColor: 'grey.400',
//           }}
//         >
//           <Typography
//             variant="body2"
//             sx={{
//               color: 'text.secondary',
//               fontStyle: 'italic',
//             }}
//           >
//             No conditions added yet. Add conditions to see the preview.
//           </Typography>
//         </Box>
//       )}
//     </Paper>
//   );
// };

// export default ConditionPreview;

// import React, { useEffect, useState } from 'react';
// import { Box, Paper, Typography, Chip, CircularProgress } from '@mui/material';
// import usePost from '../../hooks/usePost';
// import { POST } from '../../services/apiRoutes';

// const ConditionPreview = ({ conditionGroup, fieldOptions, operatorList, notificationData }) => {
//   const [summaryData, setSummaryData] = useState(null);
//   const getSummary = usePost(['getNotificationSummary']);

//   // VIBGYOR colors for nested brackets
//   const bracketColors = [
//     '#9C27B0', // Violet
//     '#3F51B5', // Indigo
//     '#2196F3', // Blue
//     '#4CAF50', // Green
//     '#FFEB3B', // Yellow
//     '#FF9800', // Orange
//     '#F44336', // Red
//   ];

//   const getOperatorSymbol = (operatorKey, fieldType) => {
//     const operators = operatorList?.data?.data?.find(
//       (op) => op.fieldType === fieldType
//     )?.operators || [];
//     const operator = operators.find((op) => op.operatorKey === operatorKey);
//     return operator?.operatorName || operatorKey;
//   };

//   const getFieldLabel = (fieldValue) => {
//     const field = fieldOptions.find((f) => f.value === fieldValue);
//     return field?.label || fieldValue;
//   };

//   const formatValue = (value, timeUnit) => {
//     if (!value) return '';
//     if (timeUnit) {
//       const unitLabel = {
//         'M': 'months',
//         'd': 'days',
//         'y': 'years'
//       }[timeUnit] || timeUnit;
//       return `${value} ${unitLabel}`;
//     }
//     return value;
//   };

//   const renderConditionExpression = (group, depth = 0) => {
//     if (!group || !group.rules || group.rules.length === 0) {
//       return null;
//     }

//     const expressions = group.rules
//       .map((rule, index) => {
//         if (rule.logic) {
//           // Nested group - increase depth for next level
//           return renderConditionExpression(rule, depth + 1);
//         } else {
//           // Single rule
//           if (!rule.field || !rule.operator) return null;

//           const field = fieldOptions.find((f) => f.value === rule.field);
//           const fieldLabel = getFieldLabel(rule.field);
//           const operatorSymbol = getOperatorSymbol(rule.operator, field?.type);
//           const valueDisplay = formatValue(rule.value, rule.timeUnit);

//           return (
//             <Box
//               key={rule.id || index}
//               component="span"
//               sx={{
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: 0.5,
//               }}
//             >
//               <Chip
//                 label={fieldLabel}
//                 size="small"
//                 color="primary"
//                 variant="outlined"
//                 sx={{
//                   fontWeight: 600,
//                   borderRadius: '4px',
//                   height: '24px',
//                 }}
//               />
//               <Typography
//                 component="span"
//                 sx={{
//                   fontSize: '0.875rem',
//                   color: 'text.secondary',
//                   fontWeight: 500,
//                   px: 0.5,
//                 }}
//               >
//                 {operatorSymbol}
//               </Typography>
//               {valueDisplay && (
//                 <Chip
//                   label={valueDisplay}
//                   size="small"
//                   color="secondary"
//                   variant="filled"
//                   sx={{
//                     fontWeight: 500,
//                     borderRadius: '4px',
//                     height: '24px',
//                   }}
//                 />
//               )}
//             </Box>
//           );
//         }
//       })
//       .filter(Boolean);

//     if (expressions.length === 0) return null;

//     const logicOperator = group.logic === 'AND' ? 'ALL' : 'ANY';
//     const needsParentheses = depth > 0;

//     // Get color based on depth (cycle through VIBGYOR colors)
//     const bracketColor = bracketColors[depth % bracketColors.length];
//     // Determine text color (white for yellow/light colors, white for others)
//     const isLightColor = bracketColor === '#FFEB3B'; // Yellow
//     const textColor = isLightColor ? '#000' : '#FFF';

//     return (
//       <Box
//         component="span"
//         sx={{
//           display: 'inline-flex',
//           flexWrap: 'wrap',
//           alignItems: 'center',
//           gap: 1,
//           py: 0.5,
//         }}
//       >
//         {needsParentheses && (
//           <Typography
//             component="span"
//             sx={{
//               fontSize: '1.8rem',
//               fontWeight: 'bold',
//               color: bracketColor,
//               lineHeight: 1,
//               px: 0.3,
//             }}
//           >
//             (
//           </Typography>
//         )}

//         {expressions.map((expr, index) => (
//           <React.Fragment key={index}>
//             {expr}
//             {index < expressions.length - 1 && (
//               <Chip
//                 label={logicOperator}
//                 size="small"
//                 sx={{
//                   bgcolor: group.logic === 'AND' ? 'success.light' : 'warning.light',
//                   color: 'white',
//                   fontWeight: 700,
//                   fontSize: '0.75rem',
//                   height: '24px',
//                   borderRadius: '4px',
//                 }}
//               />
//             )}
//           </React.Fragment>
//         ))}

//         {needsParentheses && (
//           <Typography
//             component="span"
//             sx={{
//               fontSize: '1.8rem',
//               fontWeight: 'bold',
//               color: bracketColor,
//               lineHeight: 1,
//               px: 0.3,
//             }}
//           >
//             )
//           </Typography>
//         )}
//       </Box>
//     );
//   };

//   const hasConditions = conditionGroup?.rules?.length > 0;

//   // Fetch summary when notificationData changes
//   useEffect(() => {
//     const fetchSummary = async () => {
//       if (notificationData && notificationData.dataSourceId && notificationData.conditionGroups?.length > 0) {
//         try {
//           const response = await getSummary.mutateAsync({
//             url: `${POST.NOTIFICATION_SUMMARY || 'notivix/notification-setting/type/summary'}`,
//             payload: notificationData,
//           });
//           if (response?.success) {
//             setSummaryData(response.data);
//           }
//         } catch (error) {
//           console.error('Failed to fetch summary:', error);
//           setSummaryData(null);
//         }
//       } else {
//         setSummaryData(null);
//       }
//     };

//     fetchSummary();
//   }, [notificationData]);

//   return (
//     <Paper
//       elevation={2}
//       sx={{
//         p: 2,
//         mt: 3,
//         bgcolor: 'grey.50',
//         borderLeft: '4px solid',
//         borderColor: 'primary.main',
//         minHeight: '60px',
//         display: 'flex',
//         flexDirection: 'column',
//       }}
//     >
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
//         <Typography
//           variant="subtitle2"
//           sx={{
//             fontWeight: 700,
//             color: 'text.secondary',
//             textTransform: 'uppercase',
//             fontSize: '0.75rem',
//             letterSpacing: '0.5px',
//           }}
//         >
//           📋 Condition Preview
//         </Typography>

//         {/* Color Legend for Brackets */}
//         <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
//           <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', mr: 0.5 }}>
//             Bracket Levels:
//           </Typography>
//           {bracketColors.slice(0, 4).map((color, index) => (
//             <Box
//               key={index}
//               sx={{
//                 width: 16,
//                 height: 16,
//                 bgcolor: color,
//                 borderRadius: '2px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '0.6rem',
//                 fontWeight: 'bold',
//                 color: color === '#FFEB3B' ? '#000' : '#FFF',
//               }}
//             >
//               {index + 1}
//             </Box>
//           ))}
//         </Box>
//       </Box>

//       {hasConditions ? (
//         <Box
//           sx={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             alignItems: 'center',
//             gap: 1,
//             p: 1.5,
//             bgcolor: 'white',
//             borderRadius: 1,
//             border: '1px solid',
//             borderColor: 'grey.300',
//           }}
//         >
//           {renderConditionExpression(conditionGroup)}
//         </Box>
//       ) : (
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             p: 2,
//             bgcolor: 'white',
//             borderRadius: 1,
//             border: '1px dashed',
//             borderColor: 'grey.400',
//           }}
//         >
//           <Typography
//             variant="body2"
//             sx={{
//               color: 'text.secondary',
//               fontStyle: 'italic',
//             }}
//           >
//             No conditions added yet. Add conditions to see the preview.
//           </Typography>
//         </Box>
//       )}

//       {/* Summary Section */}
//       {summaryData && (
//         <Box
//           sx={{
//             mt: 2,
//             p: 1.5,
//             bgcolor: 'white',
//             borderRadius: 1,
//             border: '1px solid',
//             borderColor: 'grey.300',
//           }}
//         >
//           <Typography
//             variant="subtitle2"
//             sx={{
//               fontWeight: 700,
//               color: 'text.secondary',
//               mb: 1,
//               fontSize: '0.75rem',
//               textTransform: 'uppercase',
//               letterSpacing: '0.5px',
//             }}
//           >
//             📊 Summary
//           </Typography>
//           <Typography variant="body2" sx={{ color: 'text.primary' }}>
//             {summaryData.summary || summaryData.message || JSON.stringify(summaryData)}
//           </Typography>
//         </Box>
//       )}

//       {/* Loading indicator for summary */}
//       {getSummary.isLoading && (
//         <Box
//           sx={{
//             mt: 2,
//             p: 1.5,
//             bgcolor: 'white',
//             borderRadius: 1,
//             border: '1px solid',
//             borderColor: 'grey.300',
//             display: 'flex',
//             alignItems: 'center',
//             gap: 1,
//           }}
//         >
//           <CircularProgress size={16} />
//           <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//             Loading summary...
//           </Typography>
//         </Box>
//       )}
//     </Paper>
//   );
// };

// export default ConditionPreview;

import React, { useEffect, useState, useMemo } from "react";
import { Box, Paper, Typography, Chip, CircularProgress } from "@mui/material";
import usePost from "../../hooks/usePost";
import { POST } from "../../services/apiRoutes";

// Helper function to transform notification data
const transformNotificationData = (
  notification,
  fieldOptions,
  organizationId
) => {
  const transformGroup = (group) => {
    if (!group || !group.rules || group.rules.length === 0) return null;

    const result = {
      group_operator: group.logic,
      conditions: [],
    };

    group.rules.forEach((rule) => {
      if (rule.logic) {
        const nestedGroup = transformGroup(rule);
        if (nestedGroup) {
          result.conditions.push(nestedGroup);
        }
      } else {
        const fieldOption = fieldOptions.find((f) => f.value === rule.field);
        if (fieldOption && rule.field && rule.operator) {
          const condition = {
            attributeId: fieldOption.attributeId,
            operator: rule.operator,
            value: rule.value || "",
            refAttributeId: fieldOption.refAttributeId,
          };

          if (
            (fieldOption.type === "date" ||
              fieldOption.type === "date-range") &&
            rule.timeUnit
          ) {
            condition.timeUnit = rule.timeUnit;
          }

          result.conditions.push(condition);
        }
      }
    });

    return result.conditions.length > 0 ? result : null;
  };

  const conditionGroup = transformGroup(notification.conditionGroup);
  return {
    name: notification.name || "",
    organizationId: organizationId || "",
    dataSourceId: notification.entityId || "",
    triggerFieldId: "",
    isActive: true,
    conditionGroups: conditionGroup ? [conditionGroup] : [],
  };
};

const ConditionPreview = ({
  conditionGroup,
  fieldOptions,
  operatorList,
  notification,
}) => {
  const [summaryData, setSummaryData] = useState(null);
  const getSummary = usePost(["getNotificationSummary"]);

  // VIBGYOR colors for nested brackets
  const bracketColors = [
    "#9C27B0", // Violet
    "#3F51B5", // Indigo
    "#2196F3", // Blue
    "#4CAF50", // Green
    "#FFEB3B", // Yellow
    "#FF9800", // Orange
    "#F44336", // Red
  ];

  // Transform notification data for summary
  const transformedNotification = useMemo(() => {
    if (!notification || !notification.entityId) return null;

    // Get organizationId from Redux or pass as prop
    const organizationId = notification.organizationId || "";

    return transformNotificationData(
      notification,
      fieldOptions,
      organizationId
    );
  }, [notification, fieldOptions]);

  const getOperatorSymbol = (operatorKey, fieldType) => {
    const operators =
      operatorList?.data?.data?.find((op) => op.fieldType === fieldType)
        ?.operators || [];
    const operator = operators.find((op) => op.operatorKey === operatorKey);
    return operator?.operatorName || operatorKey;
  };

  const getFieldLabel = (fieldValue) => {
    const field = fieldOptions.find((f) => f.value === fieldValue);
    return field?.label || fieldValue;
  };

  const formatValue = (value, timeUnit) => {
    if (!value) return "";
    if (timeUnit) {
      const unitLabel =
        {
          M: "months",
          d: "days",
          y: "years",
        }[timeUnit] || timeUnit;
      return `${value} ${unitLabel}`;
    }
    return value;
  };

  const renderConditionExpression = (group, depth = 0) => {
    if (!group || !group.rules || group.rules.length === 0) {
      return null;
    }

    const expressions = group.rules
      .map((rule, index) => {
        if (rule.logic) {
          // Nested group - increase depth for next level
          return renderConditionExpression(rule, depth + 1);
        } else {
          // Single rule
          if (!rule.field || !rule.operator) return null;

          const field = fieldOptions.find((f) => f.value === rule.field);
          const fieldLabel = getFieldLabel(rule.field);
          const operatorSymbol = getOperatorSymbol(rule.operator, field?.type);
          const valueDisplay = formatValue(rule.value, rule.timeUnit);

          return (
            <Box
              key={rule.id || index}
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Chip
                label={fieldLabel}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderRadius: "4px",
                  height: "24px",
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  fontWeight: 500,
                  px: 0.5,
                }}
              >
                {operatorSymbol}
              </Typography>
              {valueDisplay && (
                <Chip
                  label={valueDisplay}
                  size="small"
                  color="secondary"
                  variant="filled"
                  sx={{
                    fontWeight: 500,
                    borderRadius: "4px",
                    height: "24px",
                  }}
                />
              )}
            </Box>
          );
        }
      })
      .filter(Boolean);

    if (expressions.length === 0) return null;

    const logicOperator = group.logic === "AND" ? "ALL" : "ANY";
    const needsParentheses = depth > 0;

    // Get color based on depth (cycle through VIBGYOR colors)
    const bracketColor = bracketColors[depth % bracketColors.length];
    // Determine text color (white for yellow/light colors, white for others)
    const isLightColor = bracketColor === "#FFEB3B"; // Yellow
    const textColor = isLightColor ? "#000" : "#FFF";

    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          py: 0.5,
        }}
      >
        {needsParentheses && (
          <Typography
            component="span"
            sx={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: bracketColor,
              lineHeight: 1,
              px: 0.3,
            }}
          >
            (
          </Typography>
        )}

        {expressions.map((expr, index) => (
          <React.Fragment key={index}>
            {expr}
            {index < expressions.length - 1 && (
              <Chip
                label={logicOperator}
                size="small"
                sx={{
                  bgcolor:
                    group.logic === "AND" ? "success.light" : "warning.light",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  height: "24px",
                  borderRadius: "4px",
                }}
              />
            )}
          </React.Fragment>
        ))}

        {needsParentheses && (
          <Typography
            component="span"
            sx={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: bracketColor,
              lineHeight: 1,
              px: 0.3,
            }}
          >
            )
          </Typography>
        )}
      </Box>
    );
  };

  const hasConditions = conditionGroup?.rules?.length > 0;

  // Fetch summary when transformedNotification changes
  useEffect(() => {
    const fetchSummary = async () => {
      if (
        transformedNotification &&
        transformedNotification.dataSourceId &&
        transformedNotification.conditionGroups?.length > 0
      ) {
        try {
          const response = await getSummary.mutateAsync({
            url: `${POST.NOTIFICATION_SUMMARY}`,
            payload: transformedNotification,
          });
          if (response?.success) {
            setSummaryData(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch summary:", error);
          setSummaryData(null);
        }
      } else {
        setSummaryData(null);
      }
    };

    fetchSummary();
  }, [transformedNotification]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mt: 3,
        bgcolor: "grey.50",
        borderLeft: "4px solid",
        borderColor: "primary.main",
        minHeight: "60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "text.secondary",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.5px",
          }}
        >
          📋 Condition Preview
        </Typography>

        {/* Color Legend for Brackets */}
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{ fontSize: "0.65rem", color: "text.secondary", mr: 0.5 }}
          >
            Bracket Levels:
          </Typography>
          {bracketColors.slice(0, 4).map((color, index) => (
            <Box
              key={index}
              sx={{
                width: 16,
                height: 16,
                bgcolor: color,
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6rem",
                fontWeight: "bold",
                color: color === "#FFEB3B" ? "#000" : "#FFF",
              }}
            >
              {index + 1}
            </Box>
          ))}
        </Box>
      </Box>

      {hasConditions ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1,
            p: 1.5,
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "grey.300",
          }}
        >
          {renderConditionExpression(conditionGroup)}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            bgcolor: "white",
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "grey.400",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            No conditions added yet. Add conditions to see the preview.
          </Typography>
        </Box>
      )}
      {/* Summary Section */}
      {summaryData && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "grey.300",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              mb: 1,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            📊 Summary
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {summaryData.result ||
              summaryData.result ||
              JSON.stringify(summaryData)}
          </Typography>
        </Box>
      )}

      {/* Loading indicator for summary */}
      {getSummary.isLoading && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "grey.300",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CircularProgress size={16} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Loading summary...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ConditionPreview;
