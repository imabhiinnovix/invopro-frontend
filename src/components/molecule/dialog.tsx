import * as React from "react";
import Button from "@mui/material/Button";
import { alpha, styled } from "@mui/material/styles";
import MUIDialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { STYLE_GUIDE } from "../../styles";

const BootstrapDialog = styled(MUIDialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function DialogContainer({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  const theme = useUnifiedTheme();
  const { getDialogTitleSx } = useComponentTypography();
  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            color:
              theme.palette.dialog?.titleColor ||
              STYLE_GUIDE.COLORS.bootstrapPrimary,
            py: STYLE_GUIDE.SPACING.s4,
            ...getDialogTitleSx(),
          }}
          id="customized-dialog-title"
        >
          {title}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          dividers
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: STYLE_GUIDE.SPACING.s6,
          }}
        >
          {children}
        </DialogContent>
        <DialogActions>{actions}</DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
