import * as React from "react";
import * as Styles from "~/common/styles";
import * as Events from "~/common/custom-events";

import { ModalPortal } from "../ModalPortal";
import { Provider } from "~/components/core/Upload/Provider";
import { Popup } from "~/components/core/Upload/popup";
import { UploadJumper as Jumper } from "~/components/core/Upload/Jumper";

import DropIndicator from "~/components/core/Upload/DropIndicator";

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/
const Root = ({ children }) => {
  return (
    <>
      {children}
      <ModalPortal>
        <Jumper />
        <Popup />
        <DropIndicator />
      </ModalPortal>
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * -----------------------------------------------------------------------------------------------*/

const Trigger = ({ viewer, css, children, ...props }) => {
  const showUploadModal = () => {
    if (!viewer) {
      Events.dispatchCustomEvent({ name: "slate-global-open-cta", detail: {} });
      return;
    }
    Events.dispatchCustomEvent({ name: "open-upload-jumper" });
  };

  return (
    <div css={Styles.HORIZONTAL_CONTAINER_CENTERED}>
      <button css={[Styles.BUTTON_RESET, css]} onClick={showUploadModal} {...props}>
        {children}
      </button>
    </div>
  );
};

export { Provider, Root, Trigger };
