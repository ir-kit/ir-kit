import { CaptureToggle, useNetworkBinding } from "../features/capture-control";
import { DownloadsButton } from "../features/downloads";
import {
  Body,
  Brand,
  ClearButton,
  OriginDropdown,
  SampleCount,
} from "../features/origins-browse";
import { DownloadButton } from "../features/spec-export";
import { Providers } from "./providers";
import { Shell } from "./shell";

export function App() {
  useNetworkBinding();

  return (
    <Providers>
      <Shell>
        <Shell.Header>
          <Brand />
          <SampleCount />
          <OriginDropdown />
          <Shell.HeaderActions>
            <CaptureToggle />
            <DownloadsButton />
            <DownloadButton />
            <ClearButton />
          </Shell.HeaderActions>
        </Shell.Header>
        <Shell.Main>
          <Body />
        </Shell.Main>
      </Shell>
    </Providers>
  );
}
