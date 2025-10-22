import type React from "react";

import { Box, IconButton } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useRef, useState, useEffect } from "react";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";

interface ScrollableTabNavigationProps {
  tabs: { tabName: string }[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  tabStyle: (index: number) => React.CSSProperties;
}

export default function ScrollableTabNavigation({
  tabs,
  activeTab,
  setActiveTab,
  tabStyle,
}: ScrollableTabNavigationProps) {
  const theme = useUnifiedTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkForArrows = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
  };

  useEffect(() => {
    checkForArrows();
    window.addEventListener("resize", checkForArrows);
    return () => window.removeEventListener("resize", checkForArrows);
  }, [tabs]);

  useEffect(() => {
    // Scroll active tab into view when it changes
    if (scrollContainerRef.current) {
      const tabElements =
        scrollContainerRef.current.querySelectorAll(".tab-item");
      if (tabElements[activeTab]) {
        const tabElement = tabElements[activeTab] as HTMLElement;
        const container = scrollContainerRef.current;

        const tabLeft = tabElement.offsetLeft;
        const tabRight = tabLeft + tabElement.offsetWidth;
        const containerLeft = container.scrollLeft;
        const containerRight = containerLeft + container.offsetWidth;

        if (tabLeft < containerLeft) {
          container.scrollTo({ left: tabLeft - 16, behavior: "smooth" });
        } else if (tabRight > containerRight) {
          container.scrollTo({
            left: tabRight - container.offsetWidth + 16,
            behavior: "smooth",
          });
        }
      }
    }
  }, [activeTab]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    checkForArrows();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        position: "relative",
        borderBottom: `1px solid ${theme.palette.divider}`,
        mb: 2,
      }}
    >
      {showLeftArrow && (
        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            left: 0,
            zIndex: 2,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[2],
            "&:hover": {
              backgroundColor: theme.palette.background.default,
            },
          }}
          size="small"
        >
          <KeyboardArrowLeft />
        </IconButton>
      )}

      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          display: "flex",
          overflowX: "auto",
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            // Chrome, Safari, Edge
            display: "none",
          },
          msOverflowStyle: "none", // IE
          width: "100%",
          px: showLeftArrow || showRightArrow ? 4 : 0,
          transition: "padding 0.3s ease",
        }}
      >
        {tabs?.map((item, index) => (
          <div
            key={index}
            className="tab-item"
            style={{
              ...tabStyle(index),
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onClick={() => {
              setActiveTab(index);
            }}
          >
            {item.tabName}
          </div>
        ))}
      </Box>

      {showRightArrow && (
        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            right: 0,
            zIndex: 2,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[2],
            "&:hover": {
              backgroundColor: theme.palette.background.default,
            },
          }}
          size="small"
        >
          <KeyboardArrowRight />
        </IconButton>
      )}
    </Box>
  );
}
