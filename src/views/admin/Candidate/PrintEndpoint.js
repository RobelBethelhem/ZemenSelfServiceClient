import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { API_BASE } from '../../../api/base';

function useApproveRequest(refetch) {
  const queryClient = useQueryClient();
  const accessToken = useSelector((state) => state.user.accessToken);

  return useMutation({
    mutationFn: async ({ id, request_type }) => {
      const response = await fetch(`${API_BASE}/guaranty/getData`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          'x-access-token': accessToken,
        },
        body: JSON.stringify({ id, request_type })
      });
      
      const data = await response.json()
      if (response.ok) {
        toast.success(`Request Approved Successfully`);
      } else {
        toast.error(`Error: ${data.message}`);
      }
    },
    onSuccess: () => {
      refetch();
    },
  });
}

export { useApproveRequest }; 