import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import { useComponentTypography } from '../../../hooks';
import { useNav } from '../../../context/NavContext';
import { useNavigate } from 'react-router-dom';

interface ErrorDialogProps {
  dataSourceVersionId: string;
}
const ErrorDialog: React.FC<ErrorDialogProps> = ({ dataSourceVersionId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [errors, setErrors] = useState<any[]>([]);
const navigate = useNavigate();
  const perPageItem = 10;

  const errorList = useGet<{ success: boolean; data: any[]; totalCount: number }>(
    [`dataSourceVersionErrorList`, String(currentPage)],
    GET?.Data_Import_Error +
    `/list?dataSourceVersionId=${dataSourceVersionId}&page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  useEffect(() => {
    if (errorList?.data?.data) {
      if (currentPage === 1) {
        setErrors([...errorList?.data?.data]);
      } else {
        setErrors((prev) => [...prev, ...errorList?.data?.data]);
      }
    }
  }, [errorList?.data?.data]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (errorList.isFetching || errors.length >= errorList?.data?.totalCount!) return;

      // Disconnect the previous observer if it exists
      if (lastRowRef.current) {
        lastRowRef.current.disconnect();
      }

      // Create a new IntersectionObserver
      lastRowRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });

      // Observe the new node if it exists
      if (node) {
        lastRowRef.current.observe(node);
      }
    },
    [errorList.isFetching] // Add the correct dependency
  );

  const { getDialogTitleSx } = useComponentTypography();
console.log("Rendering ErrorDialog with dataSourceVersionId:", dataSourceVersionId);
  return (
    <div>
      {/* <Button variant="outlined" onClick={() => setDialogOpen(true)}>
        Show Errors
      </Button> */}
       <Button
      variant="outlined"
      onClick={() =>
        navigate(`/validation-errors/${dataSourceVersionId}`)
      }
    >
      Show Errors
    </Button>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          ...getDialogTitleSx(),
        }}>
          Error Messages
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            The following errors were found:
          </Typography>
          <List>
            {errors.map((error, index) => (
              <React.Fragment key={error._id}>
                <ListItem alignItems="flex-start" ref={errors.length === index + 1 ? lastElementRef : null}>
                  <ListItemText
                    primary={`Row ${error.rowNumber} - ${error.fileAttributeName}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {`Error Type: ${error.errorType} (Code: ${error.errorCode})`}
                        </Typography>
                        <br />
                        {error.errorMessage}
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ErrorDialog;
