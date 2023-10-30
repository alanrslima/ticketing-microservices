import { useState } from "react";
import axios from "axios";

type UseRequestProps = {
  url: string;
  method: "get" | "post" | "put";
  body: any;
  onSuccess?: (data: any) => void;
};

export function useRequest({ url, method, body, onSuccess }: UseRequestProps) {
  const [errors, setErros] = useState<JSX.Element>();

  async function doRequest() {
    try {
      setErros(undefined);
      const { data } = await axios[method](url, body);
      onSuccess && onSuccess(data);
      return data;
    } catch (error: any) {
      setErros(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {error.response?.data?.errors?.map((err: any) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return { doRequest, errors, onSuccess };
}
