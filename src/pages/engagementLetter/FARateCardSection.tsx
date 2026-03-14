"use client";

import React, { useState, useEffect } from "react";
import {
 Card,
 CardContent,
 Typography,
 Grid,
 TextField,
 MenuItem,
 Table,
 TableHead,
 TableRow,
 TableCell,
 TableBody,
 IconButton,
 TableContainer,
 Dialog,
 DialogTitle,
 DialogContent,
 DialogActions,
 Button,
 Collapse,
 Autocomplete
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { Controller, useForm } from "react-hook-form";

import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";

import { GET, POST, PUT, DELETE } from "../../services/apiRoutes";
import { CURRENCIES } from "../../constants/currencies";
import { LANGUAGES } from "../../constants/languages";

import { useSelector } from "react-redux";
import { RootState } from "../../reducers";

import LocationAutocomplete from "../../components/common/location/LocationAutocomplete";

interface Props {
 vendorId: string;
 engagementLetterId: string;
 currency: string;
}

export default function FARateCardSection({
 vendorId,
 engagementLetterId,
 currency
}: Props) {

 const [editRow,setEditRow]=useState<any>(null);
 const [showForm,setShowForm]=useState(false);
 const [openDialog,setOpenDialog]=useState(false);
 const [deleteId,setDeleteId]=useState<string|null>(null);
 const [openFAModal,setOpenFAModal]=useState(false);

 const [costCodeOptions,setCostCodeOptions]=useState<any[]>([]);
 const [costTypeOptions,setCostTypeOptions]=useState<any[]>([]);
const defaultValues = {
  subVendorId: "",
  costCode: null,
  costType: null,
  rateType: "",
  rate: "",
  minRate: "",
  maxRate: "",
  upperCap: "",
  languageFrom: "",
  languageTo: "",
  currency: currency,
  status: "active"
};
 const {control,handleSubmit,reset, setValue}=useForm<any>({defaultValues});
 const {control:faControl,handleSubmit:handleFASubmit,reset:faReset}=useForm<any>();

 const subvendors = useGet(
  ["subvendors",vendorId],
  `${GET.Sub_Vendor_List}?vendorId=${vendorId}`,
  true
 );

 const rateCards = useGet(
  ["faRateCards",vendorId,engagementLetterId],
  `${GET.Activity_Rate_Card_List}?activityEntity=subvendor&vendorId=${vendorId}&engagementLetterId=${engagementLetterId}`,
  true
 );

 const createRateCard = usePost(
  ["createFARateCard"],
  ()=>rateCards.refetch(),
  true
 );

 const updateRateCard = usePut(
  ["updateFARateCard"],
  ()=>rateCards.refetch(),
  true
 );

 const deleteRateCard = useDelete(
  ["deleteFARateCard"],
  ()=>rateCards.refetch(),
  true
 );

 const createSubVendor = usePost(
  ["createSubVendor"],
  ()=>{
   subvendors.refetch()
  },
  true
 );

 const costCodeMaster = usePost(["costCodeMaster"],undefined,false);
 const costTypeMaster = usePost(["costTypeMaster"],undefined,false);

 const commonDataSourceList = useSelector(
  (state:RootState)=>state.dataSource?.list
 );

 const costCodeDataSourceId = commonDataSourceList.find(ds=>ds.code==="costcode")?._id;
 const costTypeDataSourceId = commonDataSourceList.find(ds=>ds.code==="costtype")?._id;

 useEffect(()=>{

  const fetchMaster=async()=>{

   const codeRes:any = await costCodeMaster.mutateAsync({
    url:POST.DATASOURCE_MASTER_LIST,
    payload:{dataSourceId:costCodeDataSourceId}
   });

   const typeRes:any = await costTypeMaster.mutateAsync({
    url:POST.DATASOURCE_MASTER_LIST,
    payload:{dataSourceId:costTypeDataSourceId}
   });

   setCostCodeOptions(codeRes?.data||[]);
   setCostTypeOptions(typeRes?.data||[]);
  }

  fetchMaster();

 },[])

 const onSubmit=(data:any)=>{

  const payload={
   ...data,
   costCode:data.costCode?.["Cost Code"],
   costType:data.costType?.["Cost Type"],
   languageFrom:data.languageFrom,
   languageTo:data.languageTo,
   vendorId,
   engagementLetterId,
   activityEntity:"subvendor",
   subVendorId:data.subVendorId
  }

  if(editRow){

   updateRateCard.mutate({
    url:PUT.UPDATE_ACTIVITY_RATE_CARD+editRow._id,
    payload
   })

  }else{

   createRateCard.mutate({
    url:POST.Create_Activity_Rate_Card,
    payload
   })

  }

  reset();
  setEditRow(null);
  setShowForm(false);
 }

 const handleAdd=()=>{
  reset(defaultValues);
  setEditRow(null);
  setShowForm(true);
 }

 const handleEdit=(row:any)=>{

  const costCodeObj=costCodeOptions.find(o=>o["Cost Code"]===row.costCode)
  const costTypeObj=costTypeOptions.find(o=>o["Cost Type"]===row.costType)

  reset({
   ...row,
   costCode:costCodeObj,
   costType:costTypeObj,
   subVendorId:row.subVendorId?._id,
   languageFrom:row.languageFrom,
   languageTo:row.languageTo
  })

  setValue("subVendorId", row.subVendorId?._id);

  setEditRow(row)
  setShowForm(true)
 }

 const handleDelete=(id:string)=>{
  setDeleteId(id)
  setOpenDialog(true)
 }

 const confirmDelete=()=>{
  if(deleteId){
   deleteRateCard.mutate({
    url:`${DELETE.Delete_Activity_Rate_Card}/${deleteId}`
   })
  }
  setOpenDialog(false)
 }

 const addFA=(data:any)=>{

  createSubVendor.mutate({
   url:POST.Create_Sub_Vendor,
   payload:{
    vendorId,
    name:data.name,
    vendorCountry:data.country,
    email:data.email,
    phone:data.phone
   }
  })

  setOpenFAModal(false)
  faReset()
 }

 return(

<Card sx={{mt:0}}>
<CardContent>

<Grid container alignItems="center" justifyContent="space-between" sx={{mb:2}}>
  <Grid item>
    {/* <Typography variant="h6">FA Rate Card</Typography> */}
  </Grid>

  <Grid item>
    <Button variant="outlined" onClick={handleAdd}>
      Add Rate
    </Button>
  </Grid>
</Grid>

<Collapse in={showForm}>
<form onSubmit={handleSubmit(onSubmit)}>

<Grid container spacing={2} mb={3}>

<Grid item xs={4}>
<Controller
  name="subVendorId"
  control={control}
  rules={{ required: true }}
  render={({ field }) => (
    <Autocomplete
      options={subvendors.data?.data || []}
      getOptionLabel={(o:any) => o.name}
      value={
        subvendors.data?.data?.find((s:any) => s._id === field.value) || null
      }
      onChange={(_, v:any) => field.onChange(v?._id)}
      renderInput={(params) => (
        <TextField {...params} label="FA" size="small" fullWidth />
      )}
    />
  )}
/>
</Grid>

{!editRow && (
<Grid item xs={2}>
<Button variant="outlined" onClick={()=>setOpenFAModal(true)}>
Add FA
</Button>
</Grid>
)}

<Grid item xs={4}>
<Controller
 name="costCode"
 control={control}
 render={({field})=>(
<Autocomplete
 options={costCodeOptions}
 getOptionLabel={(o)=>o["Cost Code"]}
 value={field.value||null}
 onChange={(_,v)=>field.onChange(v)}
 renderOption={(props, option:any)=>(
  <li {...props}>
   <div>
    <Typography fontSize={14}>{option["Cost Code"]}</Typography>
    <Typography fontSize={12} color="text.secondary">
     {option["Code Description"]}
    </Typography>
   </div>
  </li>
 )}
 renderInput={(params)=>(
  <TextField {...params} label="Cost Code" size="small"
   helperText={field.value?.Comments}
  />
 )}
/>
 )}
/>
</Grid>

<Grid item xs={4}>
<Controller
 name="costType"
 control={control}
 rules={{ required: true }}
 render={({field})=>(
<Autocomplete
 options={costTypeOptions}
 getOptionLabel={(o)=>o["Cost Type"]}
 value={field.value||null}
 onChange={(_,v)=>field.onChange(v)}
 renderOption={(props, option:any)=>(
  <li {...props}>
   <div>
    <Typography fontSize={14}>{option["Cost Type"]}</Typography>
    <Typography fontSize={12} color="text.secondary">
     {option["Cost Type Description"]}
    </Typography>
   </div>
  </li>
 )}
 renderInput={(params)=>(
  <TextField {...params} label="Cost Type" size="small"
   helperText={field.value?.["Comments for Mapping"]}
  />
 )}
/>
 )}
/>
</Grid>

<Grid item xs={3}>
<Controller
 name="rateType"
 control={control}
 rules={{ required: true }}
 render={({field})=>(
<TextField select {...field} label="Rate Type" fullWidth size="small">
<MenuItem value="fixed">Fixed</MenuItem>
<MenuItem value="hourly">Hourly</MenuItem>
<MenuItem value="per_word">Per Word</MenuItem>
<MenuItem value="per_page">Per Page</MenuItem>
</TextField>
)}
/>
</Grid>

<Grid item xs={3}>
<Controller name="rate" control={control} render={({field})=>(
<TextField {...field} label="Rate" type="number" inputProps={{ step: "0.0001" }} fullWidth size="small"/>
)}/>
</Grid>

<Grid item xs={3}>
<Controller name="minRate" control={control} render={({field})=>(
<TextField {...field} label="Min Rate" type="number" inputProps={{ step: "0.0001" }} fullWidth size="small"/>
)}/>
</Grid>

<Grid item xs={3}>
<Controller name="maxRate" control={control} render={({field})=>(
<TextField {...field} label="Max Rate" type="number" inputProps={{ step: "0.0001" }} fullWidth size="small"/>
)}/>
</Grid>

<Grid item xs={3}>
<Controller
 name="languageFrom"
 control={control}
 render={({field})=>(
<Autocomplete
 options={LANGUAGES}
 getOptionLabel={(o)=>o.label}
 value={LANGUAGES.find(l=>l.code===field.value)||null}
 onChange={(_,v)=>field.onChange(v?.code)}
 renderInput={(params)=>(
<TextField {...params} label="Language From" size="small"/>
 )}
/>
 )}
/>
</Grid>

<Grid item xs={3}>
<Controller
 name="languageTo"
 control={control}
 render={({field})=>(
<Autocomplete
 options={LANGUAGES}
 getOptionLabel={(o)=>o.label}
 value={LANGUAGES.find(l=>l.code===field.value)||null}
 onChange={(_,v)=>field.onChange(v?.code)}
 renderInput={(params)=>(
<TextField {...params} label="Language To" size="small"/>
 )}
/>
 )}
/>
</Grid>

<Grid item xs={3}>
<Controller name="upperCap" control={control} render={({field})=>(
<TextField {...field} label="Upper Cap" type="number" inputProps={{ step: "0.0001" }} fullWidth size="small"/>
)}/>
</Grid>

<Grid item xs={3}>
<Controller
 name="currency"
 control={control}
 rules={{ required: true }}
 render={({field})=>(
<Autocomplete
 options={CURRENCIES}
 getOptionLabel={(o)=>o.label}
 value={CURRENCIES.find(c=>c.code===field.value)||null}
 onChange={(_,v)=>field.onChange(v?.code)}
 renderInput={(params)=>(
  <TextField {...params} label="Currency" size="small"/>
 )}
/>
 )}
/>
</Grid>

<Grid item xs={3}>
<Controller
 name="status"
 rules={{ required: true }}
 control={control}
 render={({field})=>(
<TextField select {...field} label="Status" size="small" fullWidth>
<MenuItem value="active">Active</MenuItem>
<MenuItem value="inactive">Inactive</MenuItem>
</TextField>
)}
/>
</Grid>

<Grid item xs={3} display="flex" alignItems="center">

<Button variant="contained" type="submit">
{editRow?"Update":"Save"}
</Button>

<Button sx={{ml:2}} onClick={()=>setShowForm(false)}>
Cancel
</Button>

</Grid>

</Grid>

</form>
</Collapse>

<TableContainer>
<Table size="small">

<TableHead>
<TableRow>
<TableCell>FA</TableCell>
<TableCell>Cost Code</TableCell>
<TableCell>Cost Type</TableCell>
<TableCell>Rate Type</TableCell>
<TableCell>Rate</TableCell>
<TableCell>Min</TableCell>
<TableCell>Max</TableCell>
<TableCell>Upper Cap</TableCell>
<TableCell>Currency</TableCell>
<TableCell>Status</TableCell>
<TableCell>Action</TableCell>
</TableRow>
</TableHead>

<TableBody>
{rateCards.data?.data && rateCards.data.data.length > 0 ? (
rateCards.data?.data?.map((row:any)=>(
<TableRow key={row._id}>

<TableCell>{row.subVendorId?.name}</TableCell>
<TableCell>{row.costCode}</TableCell>
<TableCell>{row.costType}</TableCell>
<TableCell>{row.rateType}</TableCell>
<TableCell>{row.rate}</TableCell>
<TableCell>{row.minRate}</TableCell>
<TableCell>{row.maxRate}</TableCell>
<TableCell>{row.upperCap}</TableCell>
<TableCell>{row.currency}</TableCell>
<TableCell>{row.status}</TableCell>

<TableCell>

<IconButton onClick={()=>handleEdit(row)}>
<EditIcon/>
</IconButton>

<IconButton onClick={()=>handleDelete(row._id)}>
<DeleteIcon/>
</IconButton>

</TableCell>

</TableRow>
))
) : (
    <TableRow>
      <TableCell colSpan={12} align="center">
        No Data Available
      </TableCell>
    </TableRow>
  )}

</TableBody>
</Table>
</TableContainer>

<Dialog open={openDialog} onClose={()=>setOpenDialog(false)}>
<DialogTitle>Delete?</DialogTitle>
<DialogActions>
<Button onClick={()=>setOpenDialog(false)}>Cancel</Button>
<Button color="error" onClick={confirmDelete}>Delete</Button>
</DialogActions>
</Dialog>

<Dialog open={openFAModal} onClose={()=>setOpenFAModal(false)}>
<DialogTitle>Add FA</DialogTitle>

<DialogContent>

<Controller
 name="name"
 control={faControl}
 render={({field})=><TextField {...field} label="Name" fullWidth sx={{mt:2}}/>}
/>

<LocationAutocomplete
 control={faControl}
 name="country"
 label="Country"
 locationType="country"
 required
 fullWidth
 sx={{ mt: 2 }}
/>

<Controller
 name="email"
 control={faControl}
 render={({field})=><TextField {...field} label="Business Email Id" fullWidth sx={{mt:2}}/>}
/>

<Controller
 name="phone"
 control={faControl}
 render={({field})=><TextField {...field} label="Phone" fullWidth sx={{mt:2}}/>}
/>

</DialogContent>

<DialogActions>
<Button onClick={()=>setOpenFAModal(false)}>Cancel</Button>
<Button onClick={handleFASubmit(addFA)}>Save</Button>
</DialogActions>

</Dialog>

</CardContent>
</Card>

 )
}