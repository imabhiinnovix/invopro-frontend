import React from "react";
import { Box, Typography } from "@mui/material";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import * as pdfjs from "pdfjs-dist";

// use same version worker
const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Props {
  fileUrl?: string | null;
}

export default function FilePreview({ fileUrl }: Props) {
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  const isImage =
    fileUrl?.endsWith(".png") ||
    fileUrl?.endsWith(".jpg") ||
    fileUrl?.endsWith(".jpeg");

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: 1,
        height: "600px",
        p: 2,
        background: "#fafafa",
      }}
    >
      <Typography variant="subtitle1" mb={1}>
        File Preview
      </Typography>

      {!fileUrl && (
        <Typography color="text.secondary">
          No file selected
        </Typography>
      )}

      {fileUrl && isImage && (
        <Box
          component="img"
          src={fileUrl}
          sx={{
            maxWidth: "100%",
            maxHeight: "550px",
            objectFit: "contain",
          }}
        />
      )}

      {fileUrl && !isImage && (
        <>
          <Box display="flex" gap={1} mb={1}>
            <ZoomOutButton />
            <ZoomInButton />
          </Box>

          <Box height="520px">
            <Worker workerUrl={workerUrl}>
              <Viewer
                fileUrl={fileUrl}
                plugins={[zoomPluginInstance]}
              />
            </Worker>
          </Box>
        </>
      )}
    </Box>
  );
}