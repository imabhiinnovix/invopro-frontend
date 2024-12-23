// import { useForm } from "react-hook-form";
// import Input from "../../components/molecule/input";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import Button from "../../components/molecule/button";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import usePost from "../../hooks/usePost";
// import {
//   sendOTPPayload,
//   sendOTPResponse,
//   verifyOTPPayload,
//   verifyOTPResponse,
// } from "./types";
// import { POST } from "../../services/apiRoutes";
// import LoaderButton from "../../components/molecule/loaderButton";
// import {
//   getAuthToken,
//   setAuthToken,
//   setRoleId,
// } from "../../utils/handleLocalStorage";
// import { useContext, useEffect, useRef } from "react";
// import { AuthContext, AuthContextType } from "../../context/AuthContext";
// import { roleId } from "../../utils/constants";
// import useCountdown from "../../hooks/useCountdown";

// const VerifyOTP = () => {
//   const { setIsAuthUser, userDetails } = useContext(
//     AuthContext
//   ) as AuthContextType;

//   useEffect(() => {
//     const token = getAuthToken();
//     if (token) {
//       setTimeout(() => {
//         if (userDetails?.data?.roleId === roleId?.SUPER_ADMIN) {
//           navigate("/superadmin/dashboard");
//         } else {
//           navigate("/dashboard");
//         }
//       }, 10);
//       setRoleId(String(userDetails?.data?.roleId));
//     }
//   }, [userDetails]);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const email = location.state?.email;

//   const verifyOTP = usePost<verifyOTPPayload, verifyOTPResponse>(
//     [""],
//     (data) => {
//       if (data?.success) {
//         setAuthToken(data?.data?.token);
//         setIsAuthUser(true);
//       }
//     },
//     true
//   );

//   const sendOTP = usePost<sendOTPPayload, sendOTPResponse>(
//     [""],
//     () => {},
//     true
//   );

//   const { countdown, isButtonDisabled, resetCountdown } = useCountdown(60);

//   const LoginSchema = yup.object().shape({
//     otp: yup
//       .array()
//       .of(yup.string().required("Each box must have a digit"))
//       .min(6, "OTP must be 6 digits")
//       .max(6, "OTP must be 6 digits")
//       .required("OTP is required"),
//   });

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<{ otp: string[] }>({
//     mode: "all",
//     reValidateMode: "onChange",
//     resolver: yupResolver(LoginSchema),
//     defaultValues: { otp: ["", "", "", "", "", ""] },
//   });

//   const otpRefs = useRef<HTMLInputElement[]>([]);

//   const onSubmit = async (data: { otp: string[] }) => {
//     const otpCode = data.otp.join("");

//     verifyOTP?.mutate({
//       url: POST?.VERIFY_OTP,
//       payload: {
//         email,
//         otp: otpCode,
//       },
//     });
//   };

//   const handleOTPInput = (
//     index: number,
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const value = event.target.value;
//     setValue(`otp.${index}`, value);

//     // Handle navigation to the next or previous input
//     if (/^\d$/.test(value) && index < 5) {
//       otpRefs.current[index + 1]?.focus();
//     } else if (!value && index > 0) {
//       otpRefs.current[index - 1]?.focus();
//     }
//   };

//   const handlePaste = (
//     index: number,
//     event: React.ClipboardEvent<HTMLInputElement>
//   ) => {
//     const pastedData = event.clipboardData.getData("text").split("");

//     pastedData.forEach((digit, i) => {
//       if (/^\d$/.test(digit) && index + i < 6) {
//         setValue(`otp.${index + i}`, digit);
//         otpRefs.current[index + i]?.focus();
//       }
//     });

//     event.preventDefault();
//   };

//   const otpValues = watch("otp");

//   const otpError =
//     Array.isArray(errors.otp) && errors.otp.find((error) => error)
//       ? "Each box must have a digit and the OTP must be 6 digits"
//       : null;

//   const handleResendOTP = () => {
//     const data = { email };
//     sendOTP?.mutate({ url: POST?.SEND_OTP, payload: data });
//     resetCountdown();
//   };

//   return (
//     <main className="main-wrapper relative h-[93%] w-full">
//       {/*...::: Login Section Start :::... */}
//       <section
//         id="login-section"
//         className="h-full flex items-center justify-center w-full"
//       >
//         {/* Section Spacer */}
//         <div className="w-full">
//           {/* Section Container */}
//           <div className="global-container">
//             <div className="mx-auto max-w-[510px] text-center">
//               <h1 className="mb-2 text-4xl">Welcome to SearchiVix</h1>
//               <h3 className="mb-8 font-light text-gray-500">Login with OTP</h3>
//               <div className="block rounded-xl bg-white px-4 py-8 text-left shadow-[0_4px_60px_0_rgba(0,0,0,0.1)] sm:px-10">
//                 {/* Login Form */}
//                 <form
//                   onSubmit={handleSubmit(onSubmit)}
//                   className="flex flex-col gap-y-4"
//                 >
//                   {/* Form Group */}
//                   <div className="grid grid-cols-1 gap-3">
//                     {/* Form Single Input */}
//                     <div className="flex items-center justify-between">
//                       <label
//                         htmlFor="login-email"
//                         className="text-md font-bold leading-[1.6]"
//                       >
//                         OTP
//                       </label>
//                       <div className="flex gap-3">
//                         {Array.from({ length: 6 }, (_, index) => (
//                           <Input
//                             key={index}
//                             type="text"
//                             maxLength={1}
//                             {...register(`otp.${index}`)}
//                             ref={(el) => {
//                               if (el) otpRefs.current[index] = el;
//                             }}
//                             placeholder="0"
//                             value={otpValues[index]}
//                             handleInputChange={(e) => handleOTPInput(index, e)}
//                             handlePaste={(e) => handlePaste(index, e)}
//                             customClass="w-12 h-12 text-center rounded-lg border border-gray-300 text-lg"
//                           />
//                         ))}
//                       </div>
//                     </div>
//                     {otpError && (
//                       <p className="text-red-500 text-sm mt-1 text-center">
//                         {otpError}
//                       </p>
//                     )}
//                   </div>
//                   {/* Form Group */}
//                   <div>
//                     <div className="flex justify-end gap-1 mb-2">
//                       <Button
//                         butttonLabel="Re-send OTP"
//                         classname="!bg-transparent !text-black disabled:!text-gray-400 cursor-pointer disabled:cursor-not-allowed"
//                         customType="button"
//                         handleOnClick={handleResendOTP}
//                         disabled={isButtonDisabled}
//                       />
//                       {countdown > 0 ? (
//                         <span className="text-gray-400">({countdown}s)</span>
//                       ) : null}
//                     </div>
//                     {/* Form Button */}
//                     {verifyOTP?.isPending ? (
//                       <LoaderButton />
//                     ) : (
//                       <Button
//                         classname="w-full button  block rounded-xl border-2 border-black bg-black py-2 text-white after:bg-colorOrangyRed hover:border-colorOrangyRed hover:text-white"
//                         butttonLabel="Login with OTP"
//                         customType="submit"
//                       />
//                     )}
//                     {/* Form Button */}
//                   </div>
//                 </form>
//                 {/* Login Form */}
//               </div>
//               <div className="mt-4">
//                 <Link to="/login" className="hover:text-[#fa4059] text-lg">
//                   Login with Password!
//                 </Link>
//               </div>
//             </div>
//           </div>
//           {/* Section Container */}
//         </div>
//         {/* Section Spacer */}
//       </section>
//       {/*...::: Login Section End :::... */}
//     </main>
//   );
// };

// export default VerifyOTP;
