import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import {ResolvedDevice} from '../store/resolvedDevices';

export type Config = {
  alias: string;
};

export type ResolvedDeviceAndConfig = {
  device: ResolvedDevice;
  config: Config;
};

type ResolvedDevicesFetchArgs = FetchArgs & {
  device: ResolvedDevice;
};

// Base URL is different for different foundDevices, but the API is the same
const deviceBaseQuery: BaseQueryFn<
  ResolvedDevicesFetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const {device} = args;
  // TODO: this could be safer and maybe select the most
  // appropriate address if there are different ones. Maybe even
  // use the 'host' field instead of the resolved address and let
  // the network stack resolve it again
  const baseUrl = `http://${device.service.addresses[0]}/`;
  console.log(baseUrl);
  const rawBaseQuery = fetchBaseQuery({baseUrl});
  return rawBaseQuery(args, api, extraOptions);
};

const CONFIGS_TAG_TYPE = 'Configs';
const CONFIG_ENDPOINT = 'config';

export const devicesApi = createApi({
  reducerPath: 'devicesApi',
  baseQuery: deviceBaseQuery,
  tagTypes: [CONFIGS_TAG_TYPE],
  endpoints: builder => ({
    getConfig: builder.query<Config, ResolvedDevice>({
      query: device => ({
        url: CONFIG_ENDPOINT,
        method: 'GET',
        device,
      }),
      providesTags: (result, error, {id}) => [{type: CONFIGS_TAG_TYPE, id}],
    }),
    setConfig: builder.mutation<Config, ResolvedDeviceAndConfig>({
      query: deviceAndConfig => ({
        url: CONFIG_ENDPOINT,
        method: 'PUT',
        post: deviceAndConfig.config,
        device: deviceAndConfig.device,
      }),
      invalidatesTags: (result, error, {device: {id}}) => [
        {type: CONFIGS_TAG_TYPE, id},
      ],
    }),
  }),
});

export const {useGetConfigQuery, useSetConfigMutation} = devicesApi;
