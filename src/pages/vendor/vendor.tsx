import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  DialogContentText,
  Avatar,
  Badge,
  Divider,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Grid from "@mui/material/Grid2";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";
import { PUT, DELETE } from "../../services/apiRoutes";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import { useState, useContext } from "react";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import usePost from "../../hooks/usePost";
import { POST } from "../../services/apiRoutes";
import { useEffect, useRef } from "react";
import Users from "../users";
import { AuthContext } from "../../context/AuthContext";
import Autocomplete from "@mui/material/Autocomplete";
import { PageHeader, PageCardLayout, StyledButton, StatusChip } from "../../components/common";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import DialogContainer from "../../components/molecule/dialog";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  checkPermission,
  formatDate,
  formatDateWithoutTime,
} from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";
import usePostMultipart from "../../hooks/usePostMultipart";
import usePutMultipart from "../../hooks/usePutMultipart";
import { toast } from "react-toastify";
import CommonDatePicker from "../../components/common/datePicker/datePicker";
import LocationAutocomplete, {
  validateLocationValues,
} from "../../components/common/location/LocationAutocomplete";
import { State, City } from "country-state-city";
import { CURRENCIES } from "../../constants/currencies";
import EngagementLetterSection from "../../components/common/EngagementLetterSection/EngagementLetterSection";
import { countryCodes } from "../../constants/countryCodes";
import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom"; // make sure this is imported




interface ProductSubscription {
  productId: string;
  totalLicenses: string;
  licenseExpiresAt: string;
  organizationProductSubscriptionId: string;
}

interface MediumSetting {
  medium: string;
  fromAddress?: string;
  serviceName?: string;
  apiKey?: string;
  enabled: boolean;
}

interface PrimaryBankDetail {
  bankName?: string;
  bankAddress1?: string;
  bankAddress2?: string;
  bankCity?: string;
  bankState?: string;
  bankCountry?: string;
  bankZip?: string;
  bankSwiftCode?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  beneficiaryContactName?: string;
  beneficiaryContactEmail?: string;
  isDefault?: boolean;
}

interface VendorFormValues {
  name: string;
  aliasName: string;
  description?: string;
  code: string;
  status: string;

  email?: string;
  phone?: string;
  mobile?: number;
  countryISOCode?: string;
  countryDialCode?: string;
  primaryContactName?: string;

  secondaryContactMobile?: number;
  secondaryContactCountryISOCode?: string;
  secondaryContactCountryDialCode?: string;
  secondaryContactName?: string;

  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;

  taxId?: string;
  pan?: string;

  defaultCurrency: string;

  isEngagementLetter?: boolean;
  engagementLetterId?: string | null;

  // Primary Bank
  primaryBankDetails: PrimaryBankDetail[];
  
  // Intermediary Bank
  intermediaryBankName?: string;
  intermediaryBankAddress1?: string;
  intermediaryBankAddress2?: string;
  intermediaryBankSwiftCode?: string;
  intermediaryBeneficiaryAccountNumber?: string;
  intermediaryBeneficiaryContactName?: string;
  intermediaryBeneficiaryContactEmail?: string;
  intermediaryBankCity?: string;
  intermediaryBankState?: string;
  intermediaryBankCountry?: string;
  intermediaryBankZip?: string;

  logo?: File | string | null;
}

export default function Vendor() {
  const { isSuperUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );
  const shouldAllowCreate = checkPermission(
    permissions,
    PermissionsMap.VENDOR,
    "create"
  );
  const shouldAllowEdit = checkPermission(
    permissions,
    PermissionsMap.VENDOR,
    "update"
  );
  const shouldAllowDelete = checkPermission(
    permissions,
    PermissionsMap.VENDOR,
    "delete"
  );

  const shouldAllowUserList = checkPermission(
    permissions,
    PermissionsMap.USER,
    "list"
  );

  const shouldAllowUserCreate = checkPermission(
    permissions,
    PermissionsMap.USER,
    "create"
  );

  const shouldAllowUserEdit = checkPermission(
    permissions,
    PermissionsMap.USER,
    "update"
  );

  const shouldAllowUserDelete = checkPermission(
    permissions,
    PermissionsMap.USER,
    "delete"
  );

  const shouldAllowMediumAdd = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_MEDIUM_SETTING,
    "create"
  );

  const shouldAllowMediumEdit = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_MEDIUM_SETTING,
    "update"
  );

  const shouldAllowMediumDelete = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_MEDIUM_SETTING,
    "delete"
  );

  const shouldAllowMediumList = checkPermission(
    permissions,
    PermissionsMap.NOTIFICATION_MEDIUM_SETTING,
    "list"
  );

  const shouldAllowProductListing = checkPermission(
    permissions,
    PermissionsMap.PRODUCT,
    "list"
  );

  const shouldAllowProductSubscriptionListing = checkPermission(
    permissions,
    PermissionsMap.PRODUCT_SUBSCRIPTION,
    "list"
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm<VendorFormValues>({
    defaultValues: {
      name: "",
      aliasName: "",
    description: "",
    code: "",
    status: "active",

    email: "",
    phone: "",
    mobile: undefined,
    countryISOCode: "",
    countryDialCode: "",
    primaryContactName: "",

    secondaryContactMobile: undefined,
    secondaryContactCountryISOCode: "",
    secondaryContactCountryDialCode: "",
    secondaryContactName: "",

    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",

    taxId: "",
    pan: "",

    defaultCurrency: "USD",

    isEngagementLetter: false,
    engagementLetterId: null,

    primaryBankDetails: [
      {
        bankName: "",
        bankAddress1: "",
        bankAddress2: "",
        bankCity: "",
        bankState: "",
        bankCountry: "",
        bankZip: "",
        bankSwiftCode: "",
        bankRoutingNumber: "",
        bankAccountNumber: "",
        beneficiaryContactName: "",
        beneficiaryContactEmail: "",
        isDefault: true,
      },
    ],

    intermediaryBankName: "",
    intermediaryBankAddress1: "",
    intermediaryBankAddress2: "",
    intermediaryBankSwiftCode: "",
    intermediaryBeneficiaryAccountNumber: "",
    intermediaryBeneficiaryContactName: "",
    intermediaryBeneficiaryContactEmail: "",

    logo: null,
    },
    mode: "onChange",
  });

  const {
  fields: bankFields,
  append: appendBank,
  remove: removeBank
} = useFieldArray({
  control,
  name: "primaryBankDetails"
});

  const { fields, replace, remove, append } =
    useFieldArray<VendorFormValues>({
      control,
      name: "productSubscriptions",
    });

  const {
    fields: mediumFields,
    replace: replaceMedium,
    remove: removeMedium,
    append: appendMedium,
  } = useFieldArray<VendorFormValues>({
    control,
    name: "mediumSettings",
  });

  const {
    fields: domainFields,
    append: appendDomain,
    remove: removeDomain,
  } = useFieldArray<VendorFormValues>({
    control,
    name: "allowedDomains",
  });

  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [orgModalLoading, setOrgModalLoading] = useState(false);
  const [productAccessOpen, setProductAccessOpen] = useState(false);
  const [productAccessOrgId, setProductAccessOrgId] = useState<string | null>(
    null
  );
  const [showUsers, setShowUsers] = useState(false);
  const [selectedOrganizationForUsers, setSelectedOrganizationForUsers] =
    useState<any>(null);
  const [showMediumDropdown, setShowMediumDropdown] = useState(false);
  const [editingMediumId, setEditingMediumId] = useState<string | null>(null);
  const [organizationIdForMedium, setOrganizationIdForMedium] = useState<
    string | null
  >(null);
  const [domainInput, setDomainInput] = useState("");
  const [_forceUpdate, setForceUpdate] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const triggerLogoUpload = () => {
    logoInputRef.current?.click();
  };
  const isUpdatingDomainsRef = useRef(false);

  const theme = useUnifiedTheme();

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const currentStateValue = watch("state");
  const currentCityValue = watch("city");

  useEffect(() => {
    if (selectedCountry) {
      if (currentStateValue) {
        try {
          const states = State.getStatesOfCountry(selectedCountry);
          const stateExists = states.some(
            (s) =>
              s.isoCode === currentStateValue || s.name === currentStateValue
          );
          if (!stateExists) {
            setValue("state", "");
            setValue("city", "");
          }
        } catch {
          setValue("state", "");
          setValue("city", "");
        }
      }
    } else {
      setValue("state", "");
      setValue("city", "");
    }
  }, [selectedCountry, currentStateValue, setValue]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      if (currentCityValue) {
        try {
          const cities = City.getCitiesOfState(selectedCountry, selectedState);
          const cityExists = cities.some((c) => c.name === currentCityValue);
          if (!cityExists) {
            setValue("city", "");
          }
        } catch {
          setValue("city", "");
        }
      }
    } else if (!selectedState) {
      setValue("city", "");
    }
  }, [selectedState, selectedCountry, currentCityValue, setValue]);

//   const selectedBankCountry = watch("bankCountry");
// const selectedBankState = watch("bankState");
// const currentBankStateValue = watch("bankState");
// const currentBankCityValue = watch("bankCity");

// useEffect(() => {
//   if (selectedBankCountry) {
//     if (currentBankStateValue) {
//       try {
//         const states = State.getStatesOfCountry(selectedBankCountry);
//         const stateExists = states.some(
//           (s) =>
//             s.isoCode === currentBankStateValue ||
//             s.name === currentBankStateValue
//         );
//         if (!stateExists) {
//           setValue("bankState", "");
//           setValue("bankCity", "");
//         }
//       } catch {
//         setValue("bankState", "");
//         setValue("bankCity", "");
//       }
//     }
//   } else {
//     setValue("bankState", "");
//     setValue("bankCity", "");
//   }
// }, [selectedBankCountry, currentBankStateValue, setValue]);

// useEffect(() => {
//   if (selectedBankState && selectedBankCountry) {
//     if (currentBankCityValue) {
//       try {
//         const cities = City.getCitiesOfState(
//           selectedBankCountry,
//           selectedBankState
//         );
//         const cityExists = cities.some(
//           (c) => c.name === currentBankCityValue
//         );
//         if (!cityExists) {
//           setValue("bankCity", "");
//         }
//       } catch {
//         setValue("bankCity", "");
//       }
//     }
//   } else if (!selectedBankState) {
//     setValue("bankCity", "");
//   }
// }, [selectedBankState, selectedBankCountry, currentBankCityValue, setValue]);

const primaryBankDetails = watch("primaryBankDetails");

useEffect(() => {
  primaryBankDetails.forEach((bank, index) => {
    if (bank.bankCountry) {
      if (bank.bankState) {
        try {
          const states = State.getStatesOfCountry(bank.bankCountry);
          const stateExists = states.some(
            (s) => s.isoCode === bank.bankState || s.name === bank.bankState
          );
          if (!stateExists) {
            setValue(`primaryBankDetails.${index}.bankState`, "");
            setValue(`primaryBankDetails.${index}.bankCity`, "");
          }
        } catch {
          setValue(`primaryBankDetails.${index}.bankState`, "");
          setValue(`primaryBankDetails.${index}.bankCity`, "");
        }
      }
    } else {
      setValue(`primaryBankDetails.${index}.bankState`, "");
      setValue(`primaryBankDetails.${index}.bankCity`, "");
    }
  });
}, [primaryBankDetails, setValue]);

useEffect(() => {
  primaryBankDetails.forEach((bank, index) => {
    if (bank.bankState && bank.bankCountry) {
      if (bank.bankCity) {
        try {
          const cities = City.getCitiesOfState(bank.bankCountry, bank.bankState);
          const cityExists = cities.some((c) => c.name === bank.bankCity);
          if (!cityExists) {
            setValue(`primaryBankDetails.${index}.bankCity`, "");
          }
        } catch {
          setValue(`primaryBankDetails.${index}.bankCity`, "");
        }
      }
    } else if (!bank.bankState) {
      setValue(`primaryBankDetails.${index}.bankCity`, "");
    }
  });
}, [primaryBankDetails, setValue]);

const selectedIntermediaryBankCountry = watch("intermediaryBankCountry");
const selectedIntermediaryBankState = watch("intermediaryBankState");
const currentIntermediaryBankStateValue = watch("intermediaryBankState");
const currentIntermediaryBankCityValue = watch("intermediaryBankCity");

useEffect(() => {
  if (selectedIntermediaryBankCountry) {
    if (currentIntermediaryBankStateValue) {
      try {
        const states = State.getStatesOfCountry(
          selectedIntermediaryBankCountry
        );
        const stateExists = states.some(
          (s) =>
            s.isoCode === currentIntermediaryBankStateValue ||
            s.name === currentIntermediaryBankStateValue
        );
        if (!stateExists) {
          setValue("intermediaryBankState", "");
          setValue("intermediaryBankCity", "");
        }
      } catch {
        setValue("intermediaryBankState", "");
        setValue("intermediaryBankCity", "");
      }
    }
  } else {
    setValue("intermediaryBankState", "");
    setValue("intermediaryBankCity", "");
  }
}, [
  selectedIntermediaryBankCountry,
  currentIntermediaryBankStateValue,
  setValue,
]);

useEffect(() => {
  if (
    selectedIntermediaryBankState &&
    selectedIntermediaryBankCountry
  ) {
    if (currentIntermediaryBankCityValue) {
      try {
        const cities = City.getCitiesOfState(
          selectedIntermediaryBankCountry,
          selectedIntermediaryBankState
        );
        const cityExists = cities.some(
          (c) => c.name === currentIntermediaryBankCityValue
        );
        if (!cityExists) {
          setValue("intermediaryBankCity", "");
        }
      } catch {
        setValue("intermediaryBankCity", "");
      }
    }
  } else if (!selectedIntermediaryBankState) {
    setValue("intermediaryBankCity", "");
  }
}, [
  selectedIntermediaryBankState,
  selectedIntermediaryBankCountry,
  currentIntermediaryBankCityValue,
  setValue,
]);

  const { data, isLoading, error, refetch } = useGet<{
    success: boolean;
    data: any[];
    totalCount: number;
  }>(
    [
      "vendorList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
    ],
    `${GET.Vendor_List}?page=${paginationModel.page + 1}&limit=${
      paginationModel.pageSize
    }`,
    true
  );

  const deleteOrg = useDelete<any>(
    ["vendorList"],
    () => {
      setDeleteOpen(false);
      setSelectedOrg(null);
      refetch();
    },
    true
  );

  const updateOrg = usePutMultipart<any, any>(
    ["vendorList"],
    () => {
      setOrgModalOpen(false);
      setSelectedOrg(null);
      refetch();
    },
    true
  );

  const createOrg = usePostMultipart<any, any>(
    ["vendorList"],
    () => {
      setOrgModalOpen(false);
      refetch();
    },
    true
  );

  const createMedium = usePost<any, any>(["organizationList"], () => {}, true);

  const updateMedium = usePut<any, any>(["organizationList"], () => {}, true);

  const deleteMedium = useDelete<any>(
    ["organizationList"],
    () => {
      refetch();
    },
    true
  );

  // const {
  //   data: productAccessData,
  //   isLoading: productAccessLoading,
  //   error: productAccessError,
  //   refetch: refetchProductAccess,
  // } = useGet<{ success: boolean; data: any[]; totalCount: number }>(
  //   ["productAccess", productAccessOrgId || ""],
  //   productAccessOrgId
  //     ? `${GET.Product_Subscription_List}?organizationId=${productAccessOrgId}`
  //     : "",
  //   !!productAccessOrgId
  // );

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
        toast.error("Only JPG or PNG files are allowed");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Image size must be at most 20MB");
        return;
      }
      setValue("logo", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrgModalOpen = (org?: any) => {
    setDomainInput("");
    setShowMediumDropdown(false);
    replaceMedium([]);
    setEditingMediumId(null);

    if (org) {
      setSelectedOrg(org);
      setOrgModalOpen(true);
      setProductAccessOrgId(org._id);

      // Existing Fields
      setValue("name", org.name || "");
      setValue("aliasName", org.aliasName || "");
      setValue("description", org.description || "");
      setValue("code", org.code || "");
      setValue("status", org.status || "inactive");

      setValue("email", org.email || "");
      setValue("phone", org.phone || "");
      setValue("mobile", org.mobile || "");
      setValue("countryISOCode", org.countryISOCode || "");
      setValue("countryDialCode", org.countryDialCode || "");
      setValue("primaryContactName", org.primaryContactName || "");

      setValue("secondaryContactName", org.secondaryContactName || "");
      setValue("secondaryContactMobile", org.secondaryContactMobile || "");
      setValue("secondaryContactCountryISOCode", org.secondaryContactCountryISOCode || "");
      setValue("secondaryContactCountryDialCode", org.secondaryContactCountryDialCode || "");

      setValue("address1", org.address1 || "");
      setValue("address2", org.address2 || "");
      setValue("city", org.city || "");
      setValue("state", org.state || "");
      setValue("zip", org.zip || "");
      setValue("country", org.country || "");

      setValue("taxId", org.taxId || "");
      setValue("pan", org.pan || "");

      setValue("defaultCurrency", org.defaultCurrency || "");

      setValue("isEngagementLetter", org.isEngagementLetter || false);
      setValue("engagementLetterId", org.engagementLetterId?._id || null);

      // Primary Bank
      setValue(
        "primaryBankDetails",
        org.primaryBankDetails?.length
          ? org.primaryBankDetails
          : [
              {
                bankName: "",
                bankAddress1: "",
                bankAddress2: "",
                bankCity: "",
                bankState: "",
                bankCountry: "",
                bankZip: "",
                bankSwiftCode: "",
                bankRoutingNumber: "",
                bankAccountNumber: "",
                beneficiaryContactName: "",
                beneficiaryContactEmail: "",
                isDefault: true,
              },
            ]
      );
      // Intermediary Bank
      setValue("intermediaryBankName", org.intermediaryBankName || "");
      setValue("intermediaryBankAddress1", org.intermediaryBankAddress1 || "");
      setValue("intermediaryBankAddress2", org.intermediaryBankAddress2 || "");
      setValue("intermediaryBankSwiftCode", org.intermediaryBankSwiftCode || "");
      setValue(
        "intermediaryBeneficiaryAccountNumber",
        org.intermediaryBeneficiaryAccountNumber || ""
      );
      setValue(
        "intermediaryBeneficiaryContactName",
        org.intermediaryBeneficiaryContactName || ""
      );
      setValue(
        "intermediaryBeneficiaryContactEmail",
        org.intermediaryBeneficiaryContactEmail || ""
      );

      if (org.logo) {
        setLogoPreview(org.logo);
        setValue("logo", null);
      }

      // refetchProductAccess();
    } else {
      setSelectedOrg(null);
      reset({
        name: "",
        aliasName: "",
        description: "",
        code: "",
        status: "active",

        email: "",
        phone: "",
        mobile: undefined,
        countryISOCode: "",
        countryDialCode: "",
        primaryContactName: "",

        secondaryContactMobile: undefined,
        secondaryContactCountryISOCode: "",
        secondaryContactCountryDialCode: "",
        secondaryContactName: "",

        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",

        taxId: "",
        pan: "",

        defaultCurrency: "",

        isEngagementLetter: false,
        engagementLetterId: null,

        // Primary Bank
        primaryBankDetails: [
          {
            bankName: "",
            bankAddress1: "",
            bankAddress2: "",
            bankCity: "",
            bankState: "",
            bankCountry: "",
            bankZip: "",
            bankSwiftCode: "",
            bankRoutingNumber: "",
            bankAccountNumber: "",
            beneficiaryContactName: "",
            beneficiaryContactEmail: "",
            isDefault: true,
          },
        ],

        // Intermediary Bank
        intermediaryBankName: "",
        intermediaryBankAddress1: "",
        intermediaryBankAddress2: "",
        intermediaryBankSwiftCode: "",
        intermediaryBeneficiaryAccountNumber: "",
        intermediaryBeneficiaryContactName: "",
        intermediaryBeneficiaryContactEmail: "",
        intermediaryBankCity: "",
        intermediaryBankState: "",
        intermediaryBankCountry: "",
        intermediaryBankZip: "",


        logo: null,
      });

      setOrgModalOpen(true);
      setOrganizationIdForMedium(null);
      setProductAccessOrgId(null);
      setLogoPreview(null);
    }
  };

  const handleOrgModalClose = () => {
    setOrgModalOpen(false);
    setSelectedOrg(null);
    setShowMediumDropdown(false);
    setOrganizationIdForMedium(null);
    setEditingMediumId(null);
    replaceMedium([]);
    setLogoPreview(null);
    setValue("logo", null);
  };

  const handleDeleteOpen = (org: any) => {
    setSelectedOrg(org);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedOrg(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedOrg?._id) {
      deleteOrg.mutate({
        url: `${DELETE.Delete_Vendor}/${selectedOrg._id}`,
      });
    }
  };

  // State to hold uploaded engagement letter file
const [uploadedEngagementFile, setUploadedEngagementFile] = useState<File | null>(null);

// Hook to create Engagement Letter
const createEngagementLetter = usePostMultipart<any, any>(
  ["createEngagementLetter"],
  (data) => {
    if (data?.success) {
      toast.success("Engagement letter uploaded successfully");
      // Save the returned engagement letter ID in the form
      setValue("engagementLetterId", data.data._id);
      setUploadedEngagementFile(null);
    }
  },
  true
);

// Function to trigger saving engagement letter after vendor is created
const handleSaveEngagementLetter = async (vendorId: string) => {
  if (!uploadedEngagementFile) return;
  const payload = {
      vendorId,
      files: uploadedEngagementFile || undefined,
    };
  const updateResponse = await createEngagementLetter.mutateAsync({
    url: POST.Create_Engagement_Letter,
    payload,
  });
  return updateResponse;
};

  const handleOrgModalSubmit = async (formData: any) => {
    setOrgModalLoading(true);
      let vendorId: string | undefined;


    try {
      const { productIds, logo, ...rest } = formData;
      const payload = {
            files: formData.logo,

            name: formData.name,
            aliasName: formData.aliasName,
            description: formData.description,
            code: formData.code,

            // Contact
            email: formData.email,
            phone: formData.phone,
            mobile: formData.mobile,
            countryISOCode: formData.countryISOCode,
            countryDialCode: formData.countryDialCode,
            primaryContactName: formData.primaryContactName,

            secondaryContactName: formData.secondaryContactName,
            secondaryContactMobile: formData.secondaryContactMobile,
            secondaryContactCountryISOCode: formData.secondaryContactCountryISOCode,
            secondaryContactCountryDialCode: formData.secondaryContactCountryDialCode,

            // Address
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,

            // Tax
            taxId: formData.taxId,
            pan: formData.pan,

            // Currency
            defaultCurrency: formData.defaultCurrency,

            // Engagement Letter
            isEngagementLetter: formData.isEngagementLetter,
            engagementLetterId: formData.engagementLetterId,

            // Primary Bank
            primaryBankDetails: formData.primaryBankDetails,

            // Intermediary Bank
            intermediaryBankName: formData.intermediaryBankName,
            intermediaryBankAddress1: formData.intermediaryBankAddress1,
            intermediaryBankAddress2: formData.intermediaryBankAddress2,
            intermediaryBankSwiftCode: formData.intermediaryBankSwiftCode,
            intermediaryBeneficiaryAccountNumber:
              formData.intermediaryBeneficiaryAccountNumber,
            intermediaryBeneficiaryContactName:
              formData.intermediaryBeneficiaryContactName,
            intermediaryBeneficiaryContactEmail:
              formData.intermediaryBeneficiaryContactEmail,
            intermediaryBankCity: formData.intermediaryBankCity,
            intermediaryBankState: formData.intermediaryBankState,
            intermediaryBankCountry: formData.intermediaryBankCountry,
            intermediaryBankZip: formData.intermediaryBankZip,  
              status: rest.status === "active" ? "active" : "inactive",
          };
      let latestEngagementLetterId: string | null = null;
      if (selectedOrg) {
        const updateRes = await updateOrg.mutateAsync({
          url: `${PUT.UPDATE_VENDOR}${selectedOrg._id}`,
          payload,
        });
        vendorId = updateRes.data._id;

        // After update
        if (selectedOrg && updateRes?.data) {
          latestEngagementLetterId = updateRes.data.engagementLetterId || null;
        }

        if (formData.mediumSettings && formData.mediumSettings.length > 0) {
          const notivixProduct = formData.productSubscriptions.find(
            (ps: any) => {
              const product = productOptions.find(
                (p) => p._id === ps.productId
              );
              return product && product.name?.toLowerCase() === "notivix";
            }
          );

          if (notivixProduct) {
            await createMedium.mutateAsync({
              url: `${POST.CREATE_MEDIUM}`,
              payload: {
                organizationId: selectedOrg._id,
                productId: notivixProduct.productId,
                mediumSettings: formData.mediumSettings.map((ms: any) => ({
                  medium: ms.medium,
                  fromAddress: ms.fromAddress,
                  serviceName: ms.serviceName,
                  apiKey: ms.apiKey,
                  enabled: ms.enabled,
                })),
              },
            });
          }
        }
      } else {
        const createResponse = await createOrg.mutateAsync({
          url: POST.Create_Vendor,
          payload,
        });

        vendorId = createResponse.data._id;

         // After create
        if (!selectedOrg && createResponse?.data) {
          latestEngagementLetterId =
            createResponse.data.engagementLetterId || null;
          setValue("engagementLetterId", latestEngagementLetterId);
          setSelectedOrg({
            ...createResponse.data,
            engagementLetterId: latestEngagementLetterId,
          });
        }

        if (
          formData.mediumSettings &&
          formData.mediumSettings.length > 0 &&
          createResponse.data?._id
        ) {
          const notivixProduct = formData.productSubscriptions.find(
            (ps: any) => {
              const product = productOptions.find(
                (p) => p._id === ps.productId
              );
              return product && product.name?.toLowerCase() === "notivix";
            }
          );

          if (notivixProduct) {
            await createMedium.mutateAsync({
              url: POST.CREATE_MEDIUM,
              payload: {
                organizationId: selectedOrg._id,
                productId: notivixProduct.productId,
                mediumSettings: formData.mediumSettings.map((ms: any) => ({
                  medium: ms.medium,
                  fromAddress: ms.fromAddress,
                  serviceName: ms.serviceName,
                  apiKey: ms.apiKey,
                  enabled: ms.enabled,
                })),
              },
            });
          }
        }
      }

// Save engagement letter if file uploaded
if (uploadedEngagementFile && vendorId) {
  try {
    const engagementLetterResponse = await handleSaveEngagementLetter(vendorId);
    console.log('engagementLetterResponse',engagementLetterResponse);
    const engagementLetterId = engagementLetterResponse?.data?._id;

    if (engagementLetterId) {
      // Patch vendor with engagement letter info
      await updateOrg.mutateAsync({
        url: `${PUT.UPDATE_VENDOR}${vendorId}`,
        payload: {
          isEngagementLetter: true,
          engagementLetterId,
        },
      });

      // Update form state
      refetch();
      latestEngagementLetterId = engagementLetterId; // override with latest
      setUploadedEngagementFile(null);
    }
  } catch (err) {
    console.error("Failed to upload engagement letter", err);
  }
}
      replaceMedium([]);
      return latestEngagementLetterId;
    } catch (error) {
      console.error(error);
    } finally {
      setOrgModalLoading(false);
    }
  };

  // const { data: productListData } = useGet<{
  //   success: boolean;
  //   data: any[];
  //   totalCount: number;
  // }>(["productList"], GET.Product_List, true);
  // const productOptions = productListData?.data || [];

  // const { data: mediumListDataWithOrg } = useGet<any>(
  //   ["mediumList", organizationIdForMedium || ""],
  //   organizationIdForMedium
  //     ? `${GET.MEDIUM_LIST}?organizationId=${organizationIdForMedium}&productId=6870c9e335f4e90221de9ed1`
  //     : `${GET.MEDIUM_LIST}`,
  //   Boolean(orgModalOpen && selectedOrg)
  // );

  // const selectedProductIds = watch("productIds") || [];
  // useEffect(() => {
  //   const formValues = getValues();
  //   const newFields = selectedProductIds.map((id) => {
  //     const filled = formValues.productSubscriptions?.find(
  //       (f: any) => f.productId === id
  //     );
  //     const existing = fields.find((f: any) => (f as any).productId === id);
  //     return (
  //       filled ||
  //       existing || { productId: id, totalLicenses: "", licenseExpiresAt: "" }
  //     );
  //   });
  //   replace(newFields);
  // }, [selectedProductIds]);

  const handleProductAccessView = (orgId: string) => {
    setProductAccessOrgId(orgId);
    setProductAccessOpen(true);
    // refetchProductAccess();
  };

  const handleProductAccessClose = () => {
    setProductAccessOpen(false);
    setProductAccessOrgId(null);
  };

  // useEffect(() => {
  //   if (
  //     orgModalOpen &&
  //     selectedOrg &&
  //     productAccessData &&
  //     Array.isArray(productAccessData.data) &&
  //     productAccessOrgId === selectedOrg._id
  //   ) {
  //     const productSubs = productAccessData.data.map((item: any) => ({
  //       productId: item.productId?._id || item.productId,
  //       totalLicenses: String(item.totalLicenses || ""),
  //       licenseExpiresAt: item.licenseExpiresAt || "",
  //       organizationProductSubscriptionId: item?._id,
  //     }));
  //     const productIds = productSubs.map((ps: any) => ps.productId);
  //     setValue("productIds", productIds);
  //     setValue("productSubscriptions", productSubs);
  //     replace(productSubs);
  //   }
  // }, [orgModalOpen, selectedOrg, productAccessData, productAccessOrgId]);
  const isUserSuperUser = isSuperUser();
  const handleRowClick = (org: any, _rowIndex: number) => {
    if (!shouldAllowUserList) return;

    const organizationIdForUsers = isUserSuperUser ? org._id : null;

    setSelectedOrganizationForUsers({
      ...org,
      organizationIdForUsers,
    });
    setShowUsers(true);
  };

  const handleBackToOrganizations = () => {
    setShowUsers(false);
    setSelectedOrganizationForUsers(null);
  };

  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const showEngagementButton =
  isValid &&
  (selectedOrg
    ? selectedOrg.engagementLetterId || uploadedEngagementFile // Edit mode: show if org has engagementId OR file uploaded
    : getValues("engagementLetterId") || uploadedEngagementFile); // Create mode: show if dropdown or file)
  return (
    <Box>
      <PageHeader
        title={showUsers ? "User Details" : "Vendors"}
        subtext={!showUsers ? "View and manage vendors." : undefined}
        onBack={showUsers ? handleBackToOrganizations : undefined}
        action={
          !showUsers && shouldAllowCreate ? (
            <StyledButton variant="primary" startIcon={<AddIcon />} onClick={() => handleOrgModalOpen()}>
              Create
            </StyledButton>
          ) : undefined
        }
      />
      {showUsers ? (
        <Users
          organizationId={selectedOrganizationForUsers?.organizationIdForUsers}
          shouldAllowUserCreate={shouldAllowUserCreate}
          shouldAllowUserEdit={shouldAllowUserEdit}
          shouldAllowUserDelete={shouldAllowUserDelete}
          shouldAllowProductSubscriptionListing={
            shouldAllowProductSubscriptionListing
          }
        />
      ) : (
        <>
          <PageCardLayout>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 100,
                }}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">
                Failed to load organizations.
              </Typography>
            ) : (
              <DataGrid
                rows={
                  data?.data?.map((org) => ({
                    id: org._id,
                    _id: org._id,
                    name: org.name || "",
                    aliasName: org.aliasName || "",
                    code: org.code || "",
                    status: org.status || "",
                    owner: org.owner
                      ? `${org.owner.firstName || ""} ${
                          org.owner.lastName || ""
                        }`.trim()
                      : "",
                    description: org.description || "",
                    createdAt: org.createdAt
                      ? new Date(org.createdAt).getTime()
                      : 0,
                    createdAtDisplay: org.createdAt,
                    updatedAt: org.updatedAt
                      ? new Date(org.updatedAt).getTime()
                      : 0,
                    updatedAtDisplay: org.updatedAt,
                    originalData: org,
                  })) || []
                }
                columns={[
                  {
                    field: "name",
                    headerName: "Name",
                    width: 170,
                    sortable: true,
                  },
                  {
                    field: "code",
                    headerName: "Code",
                    width: 170,
                    sortable: true,
                  },
                  // {
                  //   field: "owner",
                  //   headerName: "Owner",
                  //   width: 170,
                  //   sortable: true,
                  // },
                  {
                    field: "description",
                    headerName: "Description",
                    width: 200,
                    sortable: true,
                  },
                  {
                    field: "status",
                    headerName: "Status",
                    width: 170,
                    sortable: true,
                    renderCell: (params) => (
                      <StatusChip status={params.value === "active" ? "active" : "inactive"} label={params.value || "Unknown"} />
                    ),
                  },
                  {
                    field: "createdAt",
                    headerName: "Created At",
                    width: 170,
                    sortable: true,
                    renderCell: (params) => {
                      const createdAtDisplay = params.row.createdAtDisplay as
                        | string
                        | undefined;
                      return (
                        <span>
                          {createdAtDisplay
                            ? formatDate(createdAtDisplay)
                            : "-"}
                        </span>
                      );
                    },
                  },
                  {
                    field: "updatedAt",
                    headerName: "Updated At",
                    width: 170,
                    sortable: true,
                    renderCell: (params) => {
                      const updatedAtDisplay = params.row.updatedAtDisplay as
                        | string
                        | undefined;
                      return (
                        <span>
                          {updatedAtDisplay
                            ? formatDate(updatedAtDisplay)
                            : "-"}
                        </span>
                      );
                    },
                  },
                //   {
                //     field: "productAccess",
                //     headerName: "Product Access",
                //     width: 170,
                //     sortable: false,
                //     renderCell: (params) => {
                //       const orgId = params.row._id as string | undefined;
                //       if (!orgId) return null;
                //       return (
                //         <Button
                //           size="small"
                //           variant="outlined"
                //           onClick={(e) => {
                //             e.stopPropagation();
                //             handleProductAccessView(orgId);
                //           }}
                //         >
                //           View
                //         </Button>
                //       );
                //     },
                //   },
                  {
                    field: "actions",
                    headerName: "Actions",
                    minWidth: 100,
                    sortable: false,
                    renderCell: (params) => {
                      const org = params.row.originalData as any;
                      if (!org) return null;
                      return (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            color="primary"
                            disabled={!shouldAllowEdit}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrgModalOpen(org);
                            }}
                            size="small"
                            title="Edit"
                            sx={{
                              "&:not(.Mui-disabled)": { color: "primary.main" },
                            }}
                          >
                            <EditOutlined sx={{ fontSize: "16px" }} />
                          </IconButton>
                          <IconButton
                            color="primary"
                            disabled={!shouldAllowDelete}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOpen(org);
                            }}
                            size="small"
                            title="Delete"
                            sx={{
                              "&:not(.Mui-disabled)": { color: "primary.main" },
                            }}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    },
                  },
                ]}
                loading={isLoading}
                getRowId={(row) => row._id}
                disableColumnMenu
                disableVirtualization
                // onRowClick={(params) => {
                //   const org = params.row.originalData as any;
                //   if (org) {
                //     handleRowClick(org, 0);
                //   }
                // }}
                sx={{
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiDataGrid-row": {
                    "&:hover": {
                      backgroundColor: "action.hover",
                      cursor: "pointer",
                    },
                  },
                }}
                pagination
                paginationMode="server"
                rowCount={data?.totalCount ?? 0}
                paginationModel={paginationModel}
                onPaginationModelChange={(model) => {
                  setPaginationModel(model);
                }}
                pageSizeOptions={[10, 20, 50]}
                slots={{
                  pagination: () => (
                    <CustomPagination
                      paginationModel={paginationModel}
                      setPaginationModel={setPaginationModel}
                      rowCount={data?.totalCount ?? 0}
                    />
                  ),
                }}
              />
            )}
          </PageCardLayout>

          {/* <DialogContainer
            open={orgModalOpen}
            onClose={handleOrgModalClose}
            title={selectedOrg ? "Edit Vendor" : "Create Vendor"}
            maxWidth="md"
            fullWidth
            actions={
              <>
                <StyledButton
                  variant="primary"
                  type="submit"
                  onClick={handleSubmit(handleOrgModalSubmit)}
                  disabled={
                    !isValid 
                    // ||
                    // (selectedOrg ? fields.length === 0 : false) ||
                    // fields.some((f, idx) => {
                    //   const err =
                    //     errors.productSubscriptions &&
                    //     (errors.productSubscriptions as any)[idx];
                    //   return err && (err.totalLicenses || err.licenseExpiresAt);
                    // })
                  }
                >
                  {orgModalLoading
                    ? selectedOrg
                      ? "Saving..."
                      : "Creating..."
                    : selectedOrg
                    ? "Save"
                    : "Create"}
                </StyledButton>
              </>
            }
          > */}
<DialogContainer
  open={orgModalOpen}
  onClose={handleOrgModalClose}
  title={selectedOrg ? "Edit Vendor" : "Create Vendor"}
  maxWidth="md"
  fullWidth
  actions={
    <>
      {/* Primary button: Save / Create */}
      <StyledButton
        variant="primary"
        type="submit"
        onClick={handleSubmit(handleOrgModalSubmit)}
        disabled={!isValid || orgModalLoading}
      >
        {orgModalLoading
          ? selectedOrg
            ? "Saving..."
            : "Creating..."
          : selectedOrg
          ? "Save"
          : "Create"}
      </StyledButton>

      {/* Secondary button: Save & Edit Engagement / Create & Edit Engagement */}
      {showEngagementButton && (
  <StyledButton
    variant="primary"
    onClick={async () => {
      try {
        const formData = getValues();
        const engagementId = await handleOrgModalSubmit(formData);
        if (!engagementId) {
          toast.error("Engagement Letter not found");
          return;
        }

        navigate(`/engagement-letter/edit/${engagementId}`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to proceed to Engagement Letter");
      }
    }}
    disabled={orgModalLoading}
  >
    {selectedOrg ? "Save & Edit Engagement" : "Create & Edit Engagement"}
  </StyledButton>
)}
    </>
  }
>
            <DialogContent>
              <form
                onSubmit={handleSubmit(handleOrgModalSubmit)}
                style={{ marginTop: 8 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 4,
                    mt: 2,
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <IconButton
                        onClick={triggerLogoUpload}
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "primary.dark" },
                          width: 32,
                          height: 32,
                          boxShadow: 2,
                        }}
                        size="small"
                      >
                        <EditOutlined sx={{ fontSize: "16px" }} />
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={logoPreview || ""}
                      sx={{
                        width: 120,
                        height: 120,
                        border: `3px solid ${theme.palette.divider}`,
                        bgcolor: "background.paper",
                        fontSize: "3rem",
                      }}
                    >
                      {!logoPreview && (watch("name")?.charAt(0) || "O")}
                    </Avatar>
                  </Badge>
                  <input
                    type="file"
                    ref={logoInputRef}
                    hidden
                    onChange={handleLogoChange}
                    accept="image/*"
                  />
                </Box>
                <Grid container spacing={2}>
                  {/* Super Admin Section (Only for Create) */}
                  {/* {!selectedOrg && (
                    <>
                      <Grid size={12} sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ mt: 1 }}
                        >
                          User Details
                        </Typography>
                        <Divider sx={{ mt: 0.5 }} />
                      </Grid>

                      <Grid size={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name="firstName"
                            control={control}
                            rules={{ required: "First Name is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                required
                                label="First Name"
                                fullWidth
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Last Name"
                                fullWidth
                              />
                            )}
                          />
                        </Box>
                      </Grid>

                      <Grid size={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name="email"
                            control={control}
                            rules={{ required: "Email is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                required
                                label="Email"
                                fullWidth
                                error={!!errors.email}
                                helperText={errors.email?.message}
                              />
                            )}
                          />
                        </Box>
                      </Grid>

                      <Grid size={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name="password"
                            control={control}
                            rules={{ required: "Password is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                required
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() =>
                                          setShowPassword((show) => !show)
                                        }
                                        onMouseDown={(event) =>
                                          event.preventDefault()
                                        }
                                        edge="end"
                                      >
                                        {showPassword ? (
                                          <VisibilityOff />
                                        ) : (
                                          <Visibility />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                    </>
                  )} */}

                  {/* Basic Details Section */}
                  <Grid size={12} sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                      Vendor Details
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Grid>

                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="name"
                        control={control}
                        rules={{ required: "Name is required" }}
                        defaultValue={selectedOrg?.name}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            required
                            label="Name"
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name?.message}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                   <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="aliasName"
                        control={control}
                        defaultValue={selectedOrg?.name}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Alias Name"
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name?.message}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue={selectedOrg?.description || ""}
                        render={({ field }) => (
                          <TextField {...field} label="Description" fullWidth />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* {!selectedOrg ? (
                    <Grid size={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Controller
                          name="code"
                          control={control}
                          rules={{ required: "Code is required" }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              required
                              label="Code"
                              fullWidth
                              error={!!errors.code}
                              helperText={errors.code?.message}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                  ) : null} */}
                  {/* <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="businessUnitCode"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Business Unit Code"
                            fullWidth
                            error={!!errors.businessUnitCode}
                            helperText={errors.businessUnitCode?.message}
                          />
                        )}
                      />
                    </Box>
                  </Grid> */}

                   <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="email"
                        control={control}
                          rules={{
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address",
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Business Email Id"
                            fullWidth
                            error={!!errors.businessEmail}
                            helperText={errors.businessEmail?.message}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Phone" fullWidth />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="primaryContactName"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Primary Contact Name" fullWidth />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Country Code */}
                  <Grid size={3}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="countryISOCode"
                        control={control}
                        // rules={{ required: "Country is required" }}
                        render={({ field }) => (
                          <Autocomplete
                            options={countryCodes}
                            size="small"
                            fullWidth
                            getOptionLabel={(option) => option.label}
                            value={
                              countryCodes.find(
                                (c) => c.iso === field.value
                              ) || null
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.iso === value.iso
                            }
                            onChange={(_, newValue) => {
                              field.onChange(newValue?.iso || "");
                              setValue("countryDialCode", newValue?.dialCode || "");
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Country Code"
                                fullWidth
                                error={!!errors.countryISOCode}
                                helperText={errors.countryISOCode?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Mobile */}
                  <Grid size={3}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="mobile"
                        control={control}
                        rules={{
                          // required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "Only numbers allowed",
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Mobile"
                            fullWidth
                            type="tel"
                            error={!!errors.mobile}
                            helperText={errors.mobile?.message}
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                              maxLength: 15,
                            }}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, "");
                              field.onChange(numericValue);
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  {/* Secondary Contact Info */}
                   <Grid size={12} sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                      Secondary Contact Details
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="secondaryContactName"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Secondary Contact Name" fullWidth />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Country Code */}
                  <Grid size={3}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="secondaryContactCountryISOCode"
                        control={control}
                        // rules={{ required: "Country is required" }}
                        render={({ field }) => (
                          <Autocomplete
                            options={countryCodes}
                            size="small"
                            fullWidth
                            getOptionLabel={(option) => option.label}
                            value={
                              countryCodes.find(
                                (c) => c.iso === field.value
                              ) || null
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.iso === value.iso
                            }
                            onChange={(_, newValue) => {
                              field.onChange(newValue?.iso || "");
                              setValue("countryDialCode", newValue?.dialCode || "");
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Country Code"
                                fullWidth
                                error={!!errors.countryISOCode}
                                helperText={errors.countryISOCode?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Mobile */}
                  <Grid size={3}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="secondaryContactMobile"
                        control={control}
                        rules={{
                          // required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "Only numbers allowed",
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Mobile"
                            fullWidth
                            type="tel"
                            error={!!errors.mobile}
                            helperText={errors.mobile?.message}
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                              maxLength: 15,
                            }}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, "");
                              field.onChange(numericValue);
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>


                  {/* Address Section */}
                  <Grid size={12} sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                      Address
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Grid>

                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="address1"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Address Line 1"
                            fullWidth
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="address2"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Address Line 2"
                            fullWidth
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={3}>
                    <LocationAutocomplete
                      control={control}
                      name="country"
                      label="Country"
                      locationType="country"
                      errors={errors}
                      rules={{ required: "Country is required" }}
                      required
                    />
                  </Grid>
                  <Grid size={3}>
                    <LocationAutocomplete
                      control={control}
                      name="state"
                      label="State"
                      locationType="state"
                      selectedCountry={selectedCountry}
                      errors={errors}
                    />
                  </Grid>
                  <Grid size={3}>
                    <LocationAutocomplete
                      control={control}
                      name="city"
                      label="City"
                      locationType="city"
                      selectedCountry={selectedCountry}
                      selectedState={selectedState}
                      errors={errors}
                    />
                  </Grid>
                  <Grid size={3}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="zip"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Zip" fullWidth />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Legal & Tax Section */}
                  <Grid size={12} sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                      Legal & Tax Information
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Grid>

                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="gst"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="TAX ID (VAT/GST)" fullWidth />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="pan"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="PAN" fullWidth />
                        )}
                      />
                    </Box>
                  </Grid>

                {/* ================= Billing Details ================= */}
                <Grid size={12} sx={{ mt: 3 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Billing Details
                  </Typography>
                  <Divider sx={{ mt: 0.5 }} />
                </Grid>

                <Grid size={6}>
                  <Controller
                    name="defaultCurrency"
                    control={control}
                    rules={{ required: "Default Currency is required" }}
                    render={({ field }) => (
                      <Autocomplete
                        options={CURRENCIES}
                        getOptionLabel={(option) => option.label}
                        value={
                          CURRENCIES.find((c) => c.code === field.value) || null
                        }
                        onChange={(_, newValue) =>
                          field.onChange(newValue ? newValue.code : "")
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Default Currency"
                            required
                            error={!!errors.defaultCurrency}
                            helperText={errors.defaultCurrency?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                  {/* ================= Primary Bank Details ================= */}
                  {/* <Grid size={12} sx={{ mt: 3 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Primary Bank Details
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Grid>

                  <Grid size={6}>
                    <Controller
                      name="bankName"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Bank Name" fullWidth />
                      )}
                    />
                  </Grid>

                  <Grid size={6}>
                    <Controller
                      name="bankSwiftCode"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="SWIFT Code" fullWidth />
                      )}
                    />
                  </Grid>

                  <Grid size={6}>
                    <Controller
                      name="bankRoutingNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Routing Number" fullWidth />
                      )}
                    />
                  </Grid>

                  <Grid size={6}>
                    <Controller
                      name="bankAccountNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Account Number" fullWidth />
                      )}
                    />
                  </Grid>

                  <Grid size={6}>
                    <Controller
                      name="beneficiaryContactName"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Beneficiary Contact Name" fullWidth />
                      )}
                    />
                  </Grid>

                  <Grid size={6}>
                    <Controller
                      name="beneficiaryContactEmail"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Beneficiary Contact Email" fullWidth />
                      )}
                    />
                  </Grid>

                  <Grid size={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Controller
                          name="bankAddress1"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Bank Address Line 1"
                              fullWidth
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    <Grid size={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Controller
                          name="bankAddress2"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Bank Address Line 2"
                              fullWidth
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    <Grid size={3}>
                      <LocationAutocomplete
                        control={control}
                        name="bankCountry"
                        label="Bank Country"
                        locationType="country"
                        errors={errors}
                        rules={{ required: "Bank Country is required" }}
                        required
                      />
                    </Grid>
                    <Grid size={3}>
                      <LocationAutocomplete
                        control={control}
                        name="bankState"
                        label="Bank State"
                        locationType="state"
                        selectedCountry={selectedBankCountry}
                        errors={errors}
                      />
                    </Grid>
                    <Grid size={3}>
                      <LocationAutocomplete
                        control={control}
                        name="bankCity"
                        label="Bank City"
                        locationType="city"
                        selectedCountry={selectedBankCountry}
                        selectedState={selectedBankState}
                        errors={errors}
                      />
                    </Grid>
                    <Grid size={3}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Controller
                          name="bankZip"
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} label="Bank Zip" fullWidth />
                          )}
                        />
                      </Box>
                    </Grid> */}
                    <Grid size={12} sx={{ mt: 3 }}>
  <Typography variant="body2" fontWeight={600}>
    Primary Bank Details
  </Typography>
  <Divider sx={{ mt: 0.5 }} />
</Grid>

{bankFields.map((item, index) => {
  const bankCountry = watch(`primaryBankDetails.${index}.bankCountry`);
  const bankState = watch(`primaryBankDetails.${index}.bankState`);
  return (
  <Fragment key={item.id}>

    {/* Dynamic Section Title */}
    <Grid size={12} sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={600}>
        Primary Bank Details {index + 1}
      </Typography>
      <Divider sx={{ mt: 0.5, mb: 2 }} />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.beneficiaryName`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Beneficiary Name" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.beneficiaryAddress`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Beneficiary Address" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.bankName`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Bank Name" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.bankSwiftCode`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="SWIFT Code" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.bankRoutingNumber`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Routing Number" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.bankAccountNumber`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Account Number" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.beneficiaryContactName`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Beneficiary Contact Name" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.beneficiaryContactEmail`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Beneficiary Contact Email" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.bankAddress1`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Bank Address Line 1" fullWidth />
        )}
      />
    </Grid>

    <Grid size={6}>
      <Controller
        name={`primaryBankDetails.${index}.bankAddress2`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Bank Address Line 2" fullWidth />
        )}
      />
    </Grid>

    <Grid size={3}>
        <LocationAutocomplete
          control={control}
          name={`primaryBankDetails.${index}.bankCountry`}
          label="Bank Country"
          locationType="country"
          errors={errors}
        />
      </Grid>

      <Grid size={3}>
        <LocationAutocomplete
          control={control}
          name={`primaryBankDetails.${index}.bankState`}
          label="Bank State"
          locationType="state"
          selectedCountry={bankCountry} // <- pass the bank’s own country
          errors={errors}
        />
      </Grid>

      <Grid size={3}>
        <LocationAutocomplete
          control={control}
          name={`primaryBankDetails.${index}.bankCity`}
          label="Bank City"
          locationType="city"
          selectedCountry={bankCountry} // <- bank’s own country
          selectedState={bankState} // <- bank’s own state
          errors={errors}
        />
      </Grid>

    <Grid size={3}>
      <Controller
        name={`primaryBankDetails.${index}.bankZip`}
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Bank Zip" fullWidth />
        )}
      />
    </Grid>
    {/* Remove button */}
    {index !== 0 && (
        <Grid size={12}>
  <Button color="error" onClick={() => removeBank(index)}>
    Remove Bank
  </Button>
</Grid>
  )}
  </Fragment>
  );
})} 

<Grid size={12}>
  <Button
  startIcon={<AddIcon />}
  onClick={() =>
    appendBank({
      bankName: "",
      bankAddress1: "",
      bankAddress2: "",
      bankCity: "",
      bankState: "",
      bankCountry: "",
      bankZip: "",
      bankSwiftCode: "",
      bankRoutingNumber: "",
      bankAccountNumber: "",
      beneficiaryContactName: "",
      beneficiaryContactEmail: "",
      isDefault: false,
    })
  }
>
  Add Bank
</Button>
</Grid>

                {/* ================= Intermediary Bank Details ================= */}
              <Grid size={12} sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  Intermediary Bank Details
                </Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>

              <Grid size={6}>
                <Controller
                  name="intermediaryBankName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Bank Name" fullWidth />
                  )}
                />
              </Grid>

              <Grid size={6}>
                <Controller
                  name="intermediaryBankSwiftCode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="SWIFT Code" fullWidth />
                  )}
                />
              </Grid>

              <Grid size={6}>
                <Controller
                  name="intermediaryBeneficiaryAccountNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Account Number" fullWidth />
                  )}
                />
              </Grid>

              <Grid size={6}>
                <Controller
                  name="intermediaryBeneficiaryContactName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Beneficiary Contact Name"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid size={6}>
                <Controller
                  name="intermediaryBeneficiaryContactEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Beneficiary Contact Email"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="intermediaryBankAddress1"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Bank Address Line 1"
                            fullWidth
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="intermediaryBankAddress2"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Bank Address Line 2"
                            fullWidth
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      
                    </Box>
                  </Grid>
                  <Grid size={3}>
                    <LocationAutocomplete
                      control={control}
                      name="intermediaryBankCountry"
                      label="Bank Country"
                      locationType="country"
                      errors={errors}
                      // rules={{ required: "Intermediary Bank Country is required" }}
                      // required
                    />
                  </Grid>
                  <Grid size={3}>
                    <LocationAutocomplete
                      control={control}
                      name="intermediaryBankState"
                      label="Bank State"
                      locationType="state"
                      selectedCountry={selectedIntermediaryBankCountry}
                      errors={errors}
                    />
                  </Grid>
                  <Grid size={3}>
                    <LocationAutocomplete
                      control={control}
                      name="intermediaryBankCity"
                      label="Bank City"
                      locationType="city"
                      selectedCountry={selectedIntermediaryBankCountry}
                      selectedState={selectedIntermediaryBankState}
                      errors={errors}
                    />
                  </Grid>
                  <Grid size={3}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="intermediaryBankZip"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Bank Zip" fullWidth />
                        )}
                      />
                    </Box>
                  </Grid>


                  {/* Domains Section */}
                  {/* <Grid size={12} sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                      Domains
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Grid>

                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Controller
                        name="domain"
                        control={control}
                        rules={{ required: "Domain is required" }}
                        defaultValue={selectedOrg?.domain || ""}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            required
                            label="Primary Domain"
                            fullWidth
                            error={!!errors.domain}
                            helperText={errors.domain?.message}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Autocomplete
                        multiple
                        freeSolo
                        fullWidth
                        options={[]}
                        value={domainFields.map(
                          (field) => (field as { value: string }).value
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option.toLowerCase() === value.toLowerCase()
                        }
                        getOptionLabel={(option) =>
                          typeof option === "string" ? option : ""
                        }
                        onChange={(_, newValue) => {
                          if (isUpdatingDomainsRef.current) {
                            return;
                          }

                          const trimmedDomains = newValue
                            .filter(
                              (domain) =>
                                domain &&
                                typeof domain === "string" &&
                                domain.trim()
                            )
                            .map((domain) => domain.trim());

                          const seen = new Set<string>();
                          const uniqueDomains: string[] = [];
                          trimmedDomains.forEach((domain) => {
                            const lowerDomain = domain.toLowerCase();
                            if (!seen.has(lowerDomain)) {
                              seen.add(lowerDomain);
                              uniqueDomains.push(domain);
                            }
                          });

                          const currentValues = domainFields.map((field) =>
                            (field as { value: string }).value.toLowerCase()
                          );
                          const currentValuesSet = new Set(currentValues);

                          const newValuesSet = new Set(
                            uniqueDomains.map((d) => d.toLowerCase())
                          );
                          const setsEqual =
                            currentValuesSet.size === newValuesSet.size &&
                            [...currentValuesSet].every((val) =>
                              newValuesSet.has(val)
                            );

                          if (!setsEqual) {
                            isUpdatingDomainsRef.current = true;

                            const removeCount = domainFields.length;
                            for (let i = removeCount - 1; i >= 0; i--) {
                              removeDomain(i);
                            }

                            uniqueDomains.forEach((domain) => {
                              appendDomain({ value: domain });
                            });

                            setDomainInput("");

                            setTimeout(() => {
                              isUpdatingDomainsRef.current = false;
                            }, 0);
                          }
                        }}
                        onInputChange={(_, newInputValue, reason) => {
                          if (reason === "input") {
                            setDomainInput(newInputValue);
                          }
                        }}
                        inputValue={domainInput}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Add a domain (e.g. example.com)"
                            label="Allowed Domains"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {params.InputProps.endAdornment}
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    disabled={!domainInput.trim()}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (
                                        domainInput.trim() &&
                                        !isUpdatingDomainsRef.current
                                      ) {
                                        const trimmedDomain =
                                          domainInput.trim();
                                        const lowerDomain =
                                          trimmedDomain.toLowerCase();
                                        const exists = domainFields.some(
                                          (field) =>
                                            (
                                              field as { value: string }
                                            ).value.toLowerCase() ===
                                            lowerDomain
                                        );
                                        if (!exists) {
                                          isUpdatingDomainsRef.current = true;
                                          const currentValues =
                                            domainFields.map(
                                              (field) =>
                                                (field as { value: string })
                                                  .value
                                            );
                                          const newValues = [
                                            ...currentValues,
                                            trimmedDomain,
                                          ];

                                          const removeCount =
                                            domainFields.length;
                                          for (
                                            let i = removeCount - 1;
                                            i >= 0;
                                            i--
                                          ) {
                                            removeDomain(i);
                                          }

                                          newValues.forEach((domain) => {
                                            appendDomain({ value: domain });
                                          });

                                          setDomainInput("");

                                          setTimeout(() => {
                                            isUpdatingDomainsRef.current =
                                              false;
                                          }, 0);
                                        }
                                      }
                                    }}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </>
                              ),
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => {
                            const { key } = getTagProps({ index });
                            return (
                              <Box
                                key={key}
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  bgcolor: "primary.main",
                                  color: "primary.contrastText",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.8125rem",
                                  mr: 0.5,
                                  mb: 0.5,
                                }}
                              >
                                <span>{option}</span>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const fieldIndex = domainFields.findIndex(
                                      (field) =>
                                        (field as { value: string }).value ===
                                        option
                                    );
                                    if (fieldIndex !== -1) {
                                      removeDomain(fieldIndex);
                                    }
                                  }}
                                  sx={{ ml: 0.5, p: 0, color: "inherit" }}
                                >
                                  <CancelIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            );
                          })
                        }
                      />
                    </Box>
                  </Grid>

                  {isUserSuperUser && (
                    <>
                      <Grid size={12} sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ mt: 1 }}
                        >
                          Product License
                        </Typography>
                        <Divider sx={{ mt: 0.5 }} />
                      </Grid>
                      <Grid size={12}>
                        {!selectedOrg
                          ? shouldAllowProductListing && (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Controller
                                  name="productIds"
                                  control={control}
                                  rules={{
                                    required:
                                      "At least one product is required",
                                  }}
                                  render={({ field }) => (
                                    <Autocomplete
                                      multiple
                                      fullWidth
                                      options={productOptions}
                                      getOptionLabel={(option) => option.name}
                                      value={productOptions.filter((option) =>
                                        field.value?.includes(option._id)
                                      )}
                                      onChange={(_, newValue) => {
                                        field.onChange(
                                          newValue.map((option) => option._id)
                                        );
                                      }}
                                      isOptionEqualToValue={(option, value) =>
                                        option._id === value._id
                                      }
                                      renderInput={(params) => (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <TextField
                                            {...params}
                                            required
                                            label="Products"
                                            error={!!errors.productIds}
                                            helperText={
                                              errors.productIds?.message
                                            }
                                          />
                                        </Box>
                                      )}
                                    />
                                  )}
                                />
                              </Box>
                            )
                          : (() => {
                              const usedProductIds = fields.map(
                                (f: any) => (f as any).productId
                              );
                              const availableProducts = productOptions.filter(
                                (p) => !usedProductIds.includes(p._id)
                              );
                              if (availableProducts.length === 0) return null;
                              return (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <FormControl sx={{ minWidth: 200 }} fullWidth>
                                    <InputLabel id="add-product-label">
                                      Add Product
                                    </InputLabel>
                                    <Select
                                      labelId="add-product-label"
                                      value={""}
                                      label="Add Product"
                                      onChange={(e) => {
                                        const productId = e.target.value;
                                        if (!productId) return;
                                        append({
                                          productId,
                                          totalLicenses: "",
                                          licenseExpiresAt: "",
                                          organizationProductSubscriptionId: "",
                                        });
                                      }}
                                    >
                                      <MenuItem value="" disabled>
                                        Select product to add
                                      </MenuItem>
                                      {availableProducts.map((product) => (
                                        <MenuItem
                                          key={product._id}
                                          value={product._id}
                                        >
                                          {product.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Add a new product subscription
                                  </Typography>
                                </Box>
                              );
                            })()}
                      </Grid>

                      {(fields || []).map((field, idx) => (
                        <Grid
                          container
                          spacing={2}
                          key={field.id}
                          sx={{
                            p: 2,
                            width: "100%",
                            border: "1px solid #eee",
                            borderRadius: STYLE_GUIDE.SPACING.s1,
                          }}
                        >
                          <Grid size={3}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Controller
                                name={`productSubscriptions.${idx}.productId`}
                                control={control}
                                rules={{ required: "Product is required" }}
                                render={({ field }) => (
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Product</InputLabel>
                                    <Select {...field} label="Product">
                                      {productOptions.map((product) => (
                                        <MenuItem
                                          key={product._id}
                                          value={product._id}
                                        >
                                          {product.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Box>
                          </Grid>
                          <Grid size={3}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Controller
                                name={`productSubscriptions.${idx}.totalLicenses`}
                                control={control}
                                rules={{
                                  required: "Total Licenses is required",
                                  min: {
                                    value: 1,
                                    message: "Must be at least 1",
                                  },
                                }}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Total Licenses"
                                    type="number"
                                    fullWidth
                                    size="small"
                                    error={
                                      !!errors.productSubscriptions &&
                                      (errors.productSubscriptions as any)[idx]
                                        ?.totalLicenses
                                    }
                                    helperText={
                                      (errors.productSubscriptions &&
                                        (errors.productSubscriptions as any)[
                                          idx
                                        ]?.totalLicenses?.message) ||
                                      ""
                                    }
                                    inputProps={{ min: 1 }}
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                          <Grid size={4}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Controller
                                name={`productSubscriptions.${idx}.licenseExpiresAt`}
                                control={control}
                                rules={{
                                  required: "License Expiry Date is required",
                                }}
                                render={({ field }) => (
                                  <CommonDatePicker
                                    {...field}
                                    control={control}
                                    label="License Expiry Date"
                                    views={["year", "month", "day"]}
                                    disablePast={true}
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                          <Grid
                            size={2}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              aria-label="Remove"
                              color="error"
                              onClick={() => remove(idx)}
                              disabled={fields.length === 1}
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </>
                  )} */}

                  {(() => {
                    // const hasNotivixProduct = fields.some((field: any) => {
                    //   const product = productOptions.find(
                    //     (p) => p._id === field.productId
                    //   );
                    //   return (
                    //     product && product.name?.toLowerCase() === "notivix"
                    //   );
                    // });

                    // if (!hasNotivixProduct || !selectedOrg) return null;

                    // return (
                    //   <Grid size={12}>
                    //     <Typography
                    //       variant="body2"
                    //       sx={{ fontWeight: 600, mt: 3, mb: 2 }}
                    //     >
                    //       Channel Settings for Notivix
                    //     </Typography>

                    //     {/* ------------------------------------------------------------------
                    //         WE NOW HANDLE FLAT API RESPONSE → GROUP BY LATEST MEDIUM
                    //         ------------------------------------------------------------------- */}
                    //     {mediumListDataWithOrg?.data?.length > 0 &&
                    //       (() => {
                    //         const mediumList = mediumListDataWithOrg?.data; // <-- SHOW ALL ROWS

                    //         return (
                    //           <Box sx={{ mb: 3 }}>
                    //             <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    //               Existing Medium Settings:
                    //             </Typography>

                    //             {mediumList
                    //               ?.filter(
                    //                 (medium: any) =>
                    //                   !deletedIds.includes(medium._id)
                    //               ) // hide deleted row
                    //               ?.map((medium: any) => {
                    //                 const mediumId = medium._id;
                    //                 const isEditing =
                    //                   editingMediumId === mediumId;

                    //                 return (
                    //                   <Grid
                    //                     container
                    //                     spacing={2}
                    //                     key={mediumId}
                    //                     sx={{
                    //                       m: 2,
                    //                       width: "100%",
                    //                       border: "1px solid #eee",
                    //                       borderRadius: STYLE_GUIDE.SPACING.s1,
                    //                       p: 2,
                    //                     }}
                    //                   >
                    //                     {/* MEDIUM NAME */}
                    //                     <Grid size={5}>
                    //                       <Box
                    //                         sx={{
                    //                           display: "flex",
                    //                           alignItems: "center",
                    //                         }}
                    //                       >
                    //                         <FormControl fullWidth size="small">
                    //                           <InputLabel>Medium</InputLabel>
                    //                           <Select
                    //                             value={medium.medium}
                    //                             disabled
                    //                             label="Medium"
                    //                           >
                    //                             {[
                    //                               "email",
                    //                               "sms",
                    //                               "whatsapp",
                    //                               "inapp",
                    //                             ].map((m) => (
                    //                               <MenuItem key={m} value={m}>
                    //                                 {m}
                    //                               </MenuItem>
                    //                             ))}
                    //                           </Select>
                    //                         </FormControl>
                    //                       </Box>
                    //                     </Grid>

                    //                     {/* FROM ADDRESS */}
                    //                     <Grid size={5}>
                    //                       <Box
                    //                         sx={{
                    //                           display: "flex",
                    //                           alignItems: "center",
                    //                         }}
                    //                       >
                    //                         <TextField
                    //                           label="From Address"
                    //                           value={medium.fromAddress || ""}
                    //                           fullWidth
                    //                           size="small"
                    //                           disabled={!isEditing}
                    //                           onChange={(e) => {
                    //                             if (isEditing) {
                    //                               medium.fromAddress =
                    //                                 e.target.value;
                    //                               setForceUpdate((p) => p + 1);
                    //                             }
                    //                           }}
                    //                         />
                    //                       </Box>
                    //                     </Grid>

                    //                     {/* ACTION BUTTONS */}
                    //                     <Grid
                    //                       size={2}
                    //                       sx={{
                    //                         display: "flex",
                    //                         alignItems: "center",
                    //                         justifyContent: "center",
                    //                       }}
                    //                     >
                    //                       <IconButton
                    //                         aria-label={
                    //                           isEditing ? "Save" : "Edit"
                    //                         }
                    //                         color={
                    //                           isEditing ? "default" : "primary"
                    //                         }
                    //                         size="small"
                    //                         onClick={async () => {
                    //                           if (isEditing) {
                    //                             await updateMedium.mutateAsync({
                    //                               url: `${PUT.UPDATE_MEDIUM}/${medium._id}`,
                    //                               payload: {
                    //                                 productId:
                    //                                   "6870c9e335f4e90221de9ed1",
                    //                                 medium: medium.medium,
                    //                                 fromAddress:
                    //                                   medium.fromAddress,
                    //                                 serviceName:
                    //                                   medium.serviceName,
                    //                                 apiKey: medium.apiKey,
                    //                                 enabled: medium.enabled,
                    //                               },
                    //                             });

                    //                             setEditingMediumId(null);
                    //                           } else {
                    //                             setEditingMediumId(mediumId);
                    //                           }
                    //                         }}
                    //                       >
                    //                         {isEditing ? (
                    //                           <SaveIcon />
                    //                         ) : (
                    //                           <EditOutlined sx={{ fontSize: "16px" }} />
                    //                         )}
                    //                       </IconButton>

                    //                       <IconButton
                    //                         aria-label="Delete"
                    //                         color="error"
                    //                         size="small"
                    //                         onClick={() => {
                    //                           deleteMedium.mutate({
                    //                             url: `${DELETE.DELETE_MEDIUM}`,
                    //                             payload: {
                    //                               ids: [medium._id],
                    //                             },
                    //                           });
                    //                           // hide the row immediately
                    //                           setDeletedIds((prev) => [
                    //                             ...prev,
                    //                             medium._id,
                    //                           ]);
                    //                         }}
                    //                       >
                    //                         <DeleteOutlined />
                    //                       </IconButton>
                    //                     </Grid>

                    //                     {/* SERVICE NAME */}
                    //                     <Grid size={5}>
                    //                       <Box
                    //                         sx={{
                    //                           display: "flex",
                    //                           alignItems: "center",
                    //                         }}
                    //                       >
                    //                         <TextField
                    //                           label="Service Name"
                    //                           value={medium.serviceName || ""}
                    //                           fullWidth
                    //                           size="small"
                    //                           disabled={!isEditing}
                    //                           onChange={(e) => {
                    //                             if (isEditing) {
                    //                               medium.serviceName =
                    //                                 e.target.value;
                    //                               setForceUpdate((p) => p + 1);
                    //                             }
                    //                           }}
                    //                         />
                    //                       </Box>
                    //                     </Grid>

                    //                     {/* API KEY */}
                    //                     <Grid size={5}>
                    //                       <Box
                    //                         sx={{
                    //                           display: "flex",
                    //                           alignItems: "center",
                    //                         }}
                    //                       >
                    //                         <TextField
                    //                           label="API Key"
                    //                           value={medium.apiKey || ""}
                    //                           type="password"
                    //                           fullWidth
                    //                           size="small"
                    //                           disabled={!isEditing}
                    //                           onChange={(e) => {
                    //                             if (isEditing) {
                    //                               medium.apiKey =
                    //                                 e.target.value;
                    //                               setForceUpdate((p) => p + 1);
                    //                             }
                    //                           }}
                    //                         />
                    //                       </Box>
                    //                     </Grid>

                    //                     {/* ENABLED SWITCH */}
                    //                     <Grid
                    //                       size={2}
                    //                       sx={{
                    //                         display: "flex",
                    //                         alignItems: "center",
                    //                         justifyContent: "space-between",
                    //                       }}
                    //                     >
                    //                       <Box
                    //                         sx={{
                    //                           display: "flex",
                    //                           alignItems: "center",
                    //                         }}
                    //                       >
                    //                         <FormControlLabel
                    //                           control={
                    //                             <Switch
                    //                               size="small"
                    //                               checked={medium.enabled}
                    //                               disabled={!isEditing}
                    //                               onChange={(e) => {
                    //                                 if (isEditing) {
                    //                                   medium.enabled =
                    //                                     e.target.checked;
                    //                                   setForceUpdate(
                    //                                     (p) => p + 1
                    //                                   );
                    //                                 }
                    //                               }}
                    //                             />
                    //                           }
                    //                           label="Enabled"
                    //                         />
                    //                       </Box>
                    //                     </Grid>
                    //                   </Grid>
                    //                 );
                    //               })}
                    //           </Box>
                    //         );
                    //       })()}

                    //     {/* ----------------------------------  
                    //         ADD MEDIUM (UNCHANGED)
                    //         ---------------------------------- */}
                    //     {(() => {
                    //       const usedMediums = mediumFields.map(
                    //         (f: any) => f.medium
                    //       );
                    //       const availableMediums = [
                    //         "email",
                    //         "sms",
                    //         "whatsapp",
                    //         "inapp",
                    //       ].filter((m) => !usedMediums.includes(m));

                    //       if (availableMediums.length === 0) return null;

                    //       return (
                    //         <Box
                    //           sx={{
                    //             display: "flex",
                    //             alignItems: "center",
                    //             gap: 2,
                    //           }}
                    //         >
                    //           {!showMediumDropdown ? (
                    //             <Button
                    //               variant="outlined"
                    //               startIcon={<span>+</span>}
                    //               onClick={() => setShowMediumDropdown(true)}
                    //               disabled={!shouldAllowMediumAdd}
                    //               fullWidth
                    //             >
                    //               Add Medium
                    //             </Button>
                    //           ) : (
                    //             <FormControl fullWidth>
                    //               <InputLabel id="add-medium-label">
                    //                 Add Medium
                    //               </InputLabel>
                    //               <Select
                    //                 labelId="add-medium-label"
                    //                 value={""}
                    //                 label="Add Medium"
                    //                 onChange={(e) => {
                    //                   const medium = e.target.value;
                    //                   if (!medium) return;

                    //                   appendMedium({
                    //                     medium,
                    //                     fromAddress: "",
                    //                     serviceName: "",
                    //                     apiKey: "",
                    //                     enabled: true,
                    //                   });

                    //                   setShowMediumDropdown(false);
                    //                 }}
                    //               >
                    //                 <MenuItem value="" disabled>
                    //                   Select medium to add
                    //                 </MenuItem>
                    //                 {availableMediums.map((medium) => (
                    //                   <MenuItem key={medium} value={medium}>
                    //                     {medium}
                    //                   </MenuItem>
                    //                 ))}
                    //               </Select>
                    //             </FormControl>
                    //           )}
                    //         </Box>
                    //       );
                    //     })()}
                    //   </Grid>
                    // );
                  })()}

                  {/* {(mediumFields || []).map((field: any, idx) => (
                    <Grid
                      container
                      spacing={2}
                      key={field.id}
                      sx={{
                        m: 2,
                        width: "100%",
                        border: "1px solid #eee",
                        borderRadius: STYLE_GUIDE.SPACING.s1,
                        p: 2,
                      }}
                    >
                      <Grid size={5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name={`mediumSettings.${idx}.medium`}
                            control={control}
                            rules={{ required: "Medium is required" }}
                            render={({ field }) => (
                              <FormControl fullWidth size="small">
                                <InputLabel>Medium</InputLabel>
                                <Select {...field} label="Medium" disabled>
                                  {["email", "sms", "whatsapp", "inapp"].map(
                                    (medium) => (
                                      <MenuItem key={medium} value={medium}>
                                        {medium}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Box>
                      </Grid>
                      <Grid size={5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name={`mediumSettings.${idx}.fromAddress`}
                            control={control}
                            rules={{ required: "From Address is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="From Address"
                                fullWidth
                                size="small"
                                error={
                                  !!errors.mediumSettings &&
                                  (errors.mediumSettings as any)[idx]
                                    ?.fromAddress
                                }
                                helperText={
                                  (errors.mediumSettings &&
                                    (errors.mediumSettings as any)[idx]
                                      ?.fromAddress?.message) ||
                                  ""
                                }
                              />
                            )}
                          />
                        </Box>
                      </Grid>

                      <Grid
                        size={2}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconButton
                          aria-label="Remove"
                          color="error"
                          onClick={() => removeMedium(idx)}
                          size="small"
                        >
                          <DeleteOutlined />
                        </IconButton>
                      </Grid>

                      <Grid size={5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name={`mediumSettings.${idx}.serviceName`}
                            control={control}
                            rules={{ required: "Service Name is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Service Name"
                                fullWidth
                                size="small"
                                error={
                                  !!errors.mediumSettings &&
                                  (errors.mediumSettings as any)[idx]
                                    ?.serviceName
                                }
                                helperText={
                                  (errors.mediumSettings &&
                                    (errors.mediumSettings as any)[idx]
                                      ?.serviceName?.message) ||
                                  ""
                                }
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                      <Grid size={5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name={`mediumSettings.${idx}.apiKey`}
                            control={control}
                            rules={{ required: "API Key is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="API Key"
                                type="password"
                                fullWidth
                                size="small"
                                error={
                                  !!errors.mediumSettings &&
                                  (errors.mediumSettings as any)[idx]?.apiKey
                                }
                                helperText={
                                  (errors.mediumSettings &&
                                    (errors.mediumSettings as any)[idx]?.apiKey
                                      ?.message) ||
                                  ""
                                }
                              />
                            )}
                          />
                        </Box>
                      </Grid>

                      <Grid
                        size={2}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Controller
                            name={`mediumSettings.${idx}.enabled`}
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={value}
                                    onChange={onChange}
                                    color="primary"
                                    size="small"
                                  />
                                }
                                label="Enabled"
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  ))} */}

                  {/* <Grid size={12} sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                      Settings
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Grid>

                  <Grid size={6}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      2 Factor Authentication
                    </Typography>
                    <Box sx={{ display: "flex", pt: 1 }}>
                      <Controller
                        name="activatePasswordOTP"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={value}
                                onChange={(e) => onChange(e.target.checked)}
                                color="primary"
                              />
                            }
                            label={
                              value
                                ? "OTP Required While Login"
                                : "OTP Not Required While Login"
                            }
                          />
                        )}
                      />
                    </Box>
                  </Grid> */}
                <Grid size={12} sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                      Engagement Letter
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Grid>
                  <EngagementLetterSection
  control={control}
  watch={watch}
  errors={errors}
  setValue={setValue}
  setUploadedFile={setUploadedEngagementFile}
  vendorId={selectedOrg?._id}
/>
                  {selectedOrg && isSuperUser() && (
                    <Grid size={6}>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={value === "active"}
                                onChange={(_, checked) =>
                                  onChange(checked ? "active" : "inactive")
                                }
                                color="primary"
                              />
                            }
                            label={value === "active" ? "Active" : "Inactive"}
                          />
                        )}
                      />
                    </Grid>
                  )}
                </Grid>
              </form>
            </DialogContent>
          </DialogContainer>

          <DialogContainer
            open={deleteOpen}
            onClose={handleDeleteClose}
            title={"Delete Vendor"}
            maxWidth="sm"
            actions={
              <>
                <StyledButton
                  variant="primary"
                  onClick={handleDeleteConfirm}
                  color="error"
                  disabled={deleteOrg.isPending}
                >
                  {deleteOrg.isPending ? "Deleting..." : "Delete"}
                </StyledButton>
              </>
            }
          >
            <Typography>
              Are you sure you want to delete this vendor?
            </Typography>
          </DialogContainer>

          {/* Product Access Modal */}
          {/* <DialogContainer
            open={productAccessOpen}
            onClose={handleProductAccessClose}
            maxWidth="sm"
            fullWidth
            title="Product Access"
            actions={<Button onClick={handleProductAccessClose}>Close</Button>}
          >
            {productAccessLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 100,
                }}
              >
                <CircularProgress />
              </Box>
            ) : productAccessError ? (
              <DialogContentText color="error.main">
                {typeof productAccessError === "string"
                  ? productAccessError
                  : "Failed to fetch product access"}
              </DialogContentText>
            ) : !productAccessData?.data?.length ? (
              <DialogContentText>No product access found.</DialogContentText>
            ) : (
              <Box>
                {(productAccessData?.data || []).map((item: any) => (
                  <Box
                    key={item._id}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #eee",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2">
                      {item.productId?.name || "-"}
                    </Typography>
                    <Typography variant="body2">
                      Total Licenses: {item.totalLicenses}
                    </Typography>
                    <Typography variant="body2">
                      License Expires At:{" "}
                      {item.licenseExpiresAt
                        ? formatDateWithoutTime(item.licenseExpiresAt)
                        : "-"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContainer> */}
        </>
      )}
    </Box>
  );
}
