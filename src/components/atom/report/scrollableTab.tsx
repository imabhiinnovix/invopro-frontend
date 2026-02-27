import { Box, IconButton } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useRef, useState, useEffect } from "react";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { STYLE_GUIDE } from "../../../styles";

interface ScrollableTabNavigationProps {
  tabs: { tabName: string }[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  /** When true, tabs stretch equally to fill the container width */
  fullWidth?: boolean;
  /** When true, active tab uses theme primary color background instead of white */
  themed?: boolean;
}

export default function ScrollableTabNavigation({
  tabs,
  activeTab,
  setActiveTab,
  fullWidth = false,
  themed = false,
}: ScrollableTabNavigationProps) {
  const theme = useUnifiedTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkForArrows = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkForArrows();
    window.addEventListener("resize", checkForArrows);
    return () => window.removeEventListener("resize", checkForArrows);
  }, [tabs]);

  useEffect(() => {
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

  const isActive = (index: number) => activeTab === index;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
        borderRadius: "8px",
        p: "4px",
        mb: 2,
      }}
    >
      {showLeftArrow && (
        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            left: 4,
            zIndex: 2,
            backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[2],
            "&:hover": {
              backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
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
          gap: "2px",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          width: "100%",
          transition: "padding 0.3s ease",
        }}
      >
        {tabs?.map((item, index) => (
          <Box
            key={index}
            className="tab-item"
            sx={{
              whiteSpace: "nowrap",
              flexShrink: fullWidth ? 1 : 0,
              flexGrow: fullWidth ? 1 : 0,
              textAlign: fullWidth ? "center" : "left",
              padding: "8px 16px",
              cursor: "pointer",
              borderRadius: "6px",
              fontWeight: isActive(index) ? 600 : 400,
              fontSize: "14px",
              color: isActive(index)
                ? themed
                  ? STYLE_GUIDE.COLORS.white
                  : theme.palette.text.primary
                : STYLE_GUIDE.COLORS.textSecondary,
              backgroundColor: isActive(index)
                ? themed
                  ? theme.palette.primary.main
                  : STYLE_GUIDE.COLORS.white
                : "transparent",
              border: isActive(index) && !themed
                ? `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`
                : "1px solid transparent",
              boxShadow: isActive(index)
                ? themed
                  ? `0 2px 6px ${theme.palette.primary.main}40`
                  : "0 1px 3px rgba(0,0,0,0.08)"
                : "none",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: isActive(index)
                  ? themed
                    ? theme.palette.primary.main
                    : STYLE_GUIDE.COLORS.white
                  : STYLE_GUIDE.COLORS.backgroundHover,
              },
            }}
            onClick={() => {
              setActiveTab(index);
            }}
          >
            {item.tabName}
          </Box>
        ))}
      </Box>

      {showRightArrow && (
        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            right: 4,
            zIndex: 2,
            backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[2],
            "&:hover": {
              backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
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
