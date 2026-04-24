// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';

// function useApproveRequest(refetch) {
//   const queryClient = useQueryClient();
//   const accessToken = useSelector((state) => state.user.accessToken);
//   return useMutation({
//     mutationFn: async ({ id, request_type }) => {
//       const response = await fetch("https://aps2.zemenbank.com/zbss/api/guaranty/view_request", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           'x-access-token': accessToken,
//         },
//         body: JSON.stringify({ id, request_type })
//       });

//       const data = await response.json()
//       if (response.ok) {
//         toast.success(`Request Approved Successfully`);
//       } else {
//         toast.error(`Error: ${data.message}`);
//       }
//     },
//     onSuccess: () => {
//       refetch();
//     },
//   });
// }

// function useRejectRequest(refetch) {
//   const queryClient = useQueryClient();
//   const accessToken = useSelector((state) => state.user.accessToken);
//   return useMutation({
//     mutationFn: async ({ id, request_type }) => {
//       const response = await fetch("https://aps2.zemenbank.com/zbss/api/experiance/reject_request", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           'x-access-token': accessToken,
//         },
//         body: JSON.stringify({ id, request_type })
//       });

//       const data = await response.json()
//       if (response.ok) {
//         toast.success(`Request Rejected Successfully`);
//       } else {
//         toast.error(`Error: ${data.message}`);
//       }
//     },
//     onSuccess: () => {
//       refetch();
//     },
//   });
// }

// export { useApproveRequest, useRejectRequest };























import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

function useApproveRequest(refetch) {
  const accessToken = useSelector((state) => state.user.accessToken);
  
  return useMutation({
    mutationFn: async ({ id, request_type }) => {
      let endpoint = '';
      let bodyData = {};

      // Route to correct endpoint based on request type
      switch (request_type.toLowerCase()) {
        case 'experience':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/experiance/view_request_experiance';
          bodyData = {
            id,
            employee_first_name: '',
            employee_middle_name: '',
            employee_last_name: '',
            employee_description: '',
          };
          break;

        case 'supportive':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/supportive/view_request_supportive';
          bodyData = {
            id,
            medical_place: '',
            spouse_first_name: '',
            spouse_middle_name: '',
            spouse_last_name: '',
            employee_id_no: '',
            child_first_name: '',
            chid_middle_name: '',
            child_last_name: '',
            place_of_assignment: '',
            employee_description: '',
          };
          break;

        case 'guranty':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/guaranty/view_request_guaranty';
          bodyData = {
            id,
            employee_first_name: '',
            employee_middle_name: '',
            employee_last_name: '',
            employee_description: '',
            guaranty_first_name: '',
            guaranty_middle_name: '',
            guaranty_last_name: '',
            guaranty_organazation: '',
          };
          break;

        case 'embassy':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/embassy/view_request_embassy';
          bodyData = {
            id,
            employee_first_name: '',
            employee_middle_name: '',
            employee_last_name: '',
            employee_embassy_name: '',
            employee_description: '',
          };
          break;

        case 'medical':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/medical/view_request_medical';
          bodyData = {
            id,
            is_Spouse: false,
            medical_place: '',
            spouse_first_name: '',
            spouse_middle_name: '',
            spouse_last_name: '',
            child_first_name: '',
            chid_middle_name: '',
            child_last_name: '',
            employee_description: '',
            name_of_supervisor: '',
          };
          break;

        default:
          throw new Error(`Invalid request type: ${request_type}`);
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          'x-access-token': accessToken,
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || `${request_type} Request Approved Successfully`);
        return data;
      } else {
        toast.error(data.message || `Error: Failed to approve ${request_type} request`);
        throw new Error(data.message || 'Approval failed');
      }
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Approval error:', error);
    }
  });
}

function useRejectRequest(refetch) {
  const accessToken = useSelector((state) => state.user.accessToken);
  
  return useMutation({
    mutationFn: async ({ id, request_type, rejection_reason = 'No reason provided' }) => {
      let endpoint = '';

      // Route to correct reject endpoint based on request type
      switch (request_type.toLowerCase()) {
        case 'experience':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/experiance/reject_request_experiance';
          break;

        case 'supportive':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/supportive/reject_request_supportive';
          break;

        case 'guranty':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/guaranty/reject_request_guaranty';
          break;

        case 'embassy':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/embassy/reject_request_embassy';
          break;

        case 'medical':
          endpoint = 'https://aps2.zemenbank.com/zbss/api/medical/reject_request_medical';
          break;

        default:
          throw new Error(`Invalid request type: ${request_type}`);
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          'x-access-token': accessToken,
        },
        body: JSON.stringify({ id, rejection_reason })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || `${request_type} Request Rejected Successfully`);
        return data;
      } else {
        toast.error(data.message || `Error: Failed to reject ${request_type} request`);
        throw new Error(data.message || 'Rejection failed');
      }
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Rejection error:', error);
    }
  });
}

export { useApproveRequest, useRejectRequest };

















