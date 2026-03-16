import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  TableContainer,
  Stack
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { Controller, useForm } from "react-hook-form";
import { useState } from "react";

import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import useDelete from "../../hooks/useDelete";
import usePut from "../../hooks/usePut";

import { CURRENCIES } from "../../constants/currencies";


import { GET, POST, DELETE, PUT } from "../../services/apiRoutes";
import { formatCurrency } from "../../utils/utils";

const ATTORNEY_USER_TYPES = [
  { label: "Attorney", value: "attorney" },
  { label: "Paralegal", value: "paralegal" }
];

export default function AttorneyRateCardSection({
  vendorId,
  engagementLetterId,
  currency
}: any) {

  const { control, handleSubmit, reset } = useForm();

 const {
  control: attorneyControl,
  handleSubmit: handleAttorneySubmit,
  reset: resetAttorney
} = useForm({
  defaultValues: {
    name: "",
    userType: ""
  }
});

  const [showForm, setShowForm] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);

  const attorneys = useGet(
    ["attorneys", vendorId],
    `${GET.Vendor_Attorney_List}?vendorId=${vendorId}`,
    true
  );

  const rateCards = useGet(
    ["attorneyRateCards", engagementLetterId],
    `${GET.Activity_Rate_Card_List}?activityEntity=attorney&engagementLetterId=${engagementLetterId}`,
    true
  );

  const createAttorney = usePost(
    ["createAttorney"],
    () => attorneys.refetch(),
    true
  );

  const createRateCard = usePost(
    ["createRateCard"],
    () => rateCards.refetch(),
    true
  );

  const updateRateCard = usePut(
    ["updateRateCard"],
    () => rateCards.refetch(),
    true
  );

  const deleteRateCard = useDelete(
    ["deleteRateCard"],
    () => rateCards.refetch(),
    true
  );

  const addAttorney = (data: any) => {
  createAttorney.mutate(
    {
      url: POST.Create_Vendor_Attorney,
      payload: {
        vendorId,
        name: data.name,
        userType: data.userType
      }
    },
    {
      onSuccess: () => {
        setOpen(false);
        resetAttorney({
          name: "",
          userType: ""
        });
      }
    }
  );
};

  const submitRateCard = (data: any) => {

    const payload = {
      vendorId,
      engagementLetterId,
      activityEntity: "attorney",
      attorneyId: data.attorneyId,
      rateType: data.rateType,
      rate: data.rate,
      upperCap: data.upperCap,
      currency: data.currency,
      status: data.status
    };

    if(editRow){
      updateRateCard.mutate({
        url: `${PUT.UPDATE_ACTIVITY_RATE_CARD}${editRow._id}`,
        payload
      });
      setEditRow(null);
    }else{
      createRateCard.mutate({
        url: POST.Create_Activity_Rate_Card,
        payload
      });
    }

    reset({
  attorneyId: "",
  rateType: "",
  rate: "",
  upperCap: "",
  currency: currency,
  status: "active"
});

setEditRow(null);
setShowForm(false);
  };

  const resetToAdd = () => {
    reset({
      attorneyId: "",
      rateType: "",
      rate: "",
      upperCap: "",
      currency: currency,
      status: "active"
    });
    setEditRow(null);
  };

const cancelForm = () => {
  reset({
    attorneyId: "",
    rateType: "",
    rate: "",
    upperCap: "",
    currency: currency,
    status: "active"
  });

  setEditRow(null);
};

const confirmDelete = () => {
  if (!deleteId) return;

  deleteRateCard.mutate({
    url: `${DELETE.Delete_Activity_Rate_Card}/${deleteId}`
  });

  setDeleteOpen(false);
  setDeleteId(null);
};

  return (
    <Box mt={1}>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Grid item>
            {/* <Typography variant="h6">Attorney Rate Card</Typography> */}
        </Grid>

        <Button
  variant="outlined"
  onClick={()=>{
    resetToAdd();
    setShowForm(true);
  }}
>
  Add Rate
</Button>
      </Box>

      {showForm && (
<Grid container spacing={2} mt={1}>

        <Grid item xs={3}>
          <Controller
            name="attorneyId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField select {...field} label="Attorney" fullWidth size="small">
                {attorneys.data?.data?.map((a: any) => (
                  <MenuItem key={a._id} value={a._id}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {!editRow && (
          <Grid item xs={3}>
           <Button
            variant="outlined"
            onClick={() => {
              resetAttorney({
                name: "",
                userType: ""
              });
              setOpen(true);
            }}
          >
            Add Attorney
          </Button>
          </Grid>
        )}

        <Grid item xs={3}>
          <Controller
            name="rateType"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField select {...field} label="Rate Type" fullWidth size="small">
                <MenuItem value="fixed">Fixed</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={3}>
          <Controller
            name="rate"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField {...field} label="Rate" type="number" inputProps={{ step: "0.0001" }} fullWidth size="small"/>
            )}
          />
        </Grid>
{/* 
        <Grid item xs={2}>
          <Controller
            name="upperCap"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Upper Cap" fullWidth size="small"/>
            )}
          />
        </Grid> */}

        <Grid item xs={3}>
          <Controller
                  name="currency"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      options={CURRENCIES}
                      getOptionLabel={(option) => option.label}
                      value={CURRENCIES.find((c) => c.code === field.value) || null}
                      onChange={(_, newValue) =>
                        field.onChange(newValue ? newValue.code : "")
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Currency" size="small" />
                      )}
                    />
                  )}
                />
        </Grid>

        <Grid item xs={2}>
          <Controller
            name="status"
            defaultValue="active"
            control={control}
            render={({ field }) => (
              <TextField select {...field} label="Status" fullWidth size="small">
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={3} display="flex" alignItems="center">

  <Button
    variant="contained"
    onClick={handleSubmit(submitRateCard)}
  >
    {editRow ? "Update" : "Save"}
  </Button>

  <Button
  sx={{ ml: 2 }}
  variant="outlined"
  onClick={()=>{
    cancelForm();
    setShowForm(false);
  }}
>
  Cancel
</Button>

</Grid>

      </Grid>
      )}

      <TableContainer>

      <Table sx={{ mt:3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Attorney</TableCell>
            <TableCell>Rate Type</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>Status</TableCell>
            <TableCell/>
          </TableRow>
        </TableHead>

        <TableBody>
{rateCards.data?.data && rateCards.data.data.length > 0 ? (
          rateCards.data?.data?.map((r:any)=>(
            <TableRow key={r._id}>
              <TableCell>{r.attorneyId?.name}</TableCell>
              <TableCell>{r.rateType}</TableCell>
              <TableCell>{formatCurrency(r.rate, r.currency)}</TableCell>
              <TableCell>{r.currency}</TableCell>
              <TableCell>{r.status}</TableCell>

              <TableCell>
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  sx={{ p: 0.5 }}
                  onClick={()=>{
                    reset({
                      attorneyId:r.attorneyId?._id,
                      rateType:r.rateType,
                      rate:r.rate,
                      upperCap:r.upperCap,
                      currency:r.currency,
                      status:r.status
                    });
                    setEditRow(r);
setShowForm(true);
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }}/>
                </IconButton>

                <IconButton
                  sx={{ p: 0.5 }}
                  onClick={()=>{
                    setDeleteId(r._id);
                    setDeleteOpen(true);
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }}/>
                </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))
          ) : (
    <TableRow>
      <TableCell colSpan={6} align="center">
        No Data Available
      </TableCell>
    </TableRow>
  )}

        </TableBody>
      </Table>
      </TableContainer>

      <Dialog open={open} onClose={()=>setOpen(false)}>

        <DialogTitle>Add Attorney</DialogTitle>

        <DialogContent>

          <Controller
            name="name"
            control={attorneyControl}
            render={({ field }) => (
              <TextField {...field} label="Name" fullWidth sx={{ mt: 2 }} />
            )}
          />

         <Controller
            name="userType"
            control={attorneyControl}
            defaultValue=""
            render={({ field }) => (
                <TextField
                {...field}
                select
                label="User Type"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                >
                <MenuItem value="attorney">Attorney</MenuItem>
                <MenuItem value="paralegal">Paralegal</MenuItem>
                </TextField>
            )}
            />

        </DialogContent>

        <DialogActions>

          <Button onClick={()=>setOpen(false)}>Cancel</Button>

         <Button onClick={handleAttorneySubmit(addAttorney)}>Save</Button>

        </DialogActions>

      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
  <DialogTitle>Confirm Delete</DialogTitle>

  <DialogContent>
    <Typography>
      Are you sure you want to delete this Attorney rate card?
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setDeleteOpen(false)}>
      Cancel
    </Button>

    <Button
      color="error"
      variant="contained"
      onClick={confirmDelete}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}