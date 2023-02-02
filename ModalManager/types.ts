import type React from 'react';
import type { ModalWindowState } from '@components/common/customHooks';

/** `ModalManager` component properties */
export interface Props {
  /** Additional CSS class */
  className?: string;
}

/** List of modal names */
export enum ModalNames {
  DASHBOARD_CREATE_MODAL = 'dashboardCreateModal',
  DASHBOARD_REMOVE_MODAL = 'dashboardRemoveModal',
  WIDGET_CONSTRUCT_MODAL = 'widgetConstructModal',
  WIDGET_MAXIMIZE_MODAL = 'widgetMaximizeModal',
  WIDGET_TABLE_DATA_MODAL = 'widgetTableDataModal',
  WIDGET_TEMPLATE_CONFIG_MODAL = 'widgetTemplateConfigModal',
  WIDGET_REMOVE_MODAL = 'widgetRemoveModal',
  DASHBOARD_CHANGE_PERIOD_MODAL = 'dashboardChangePeriodModal',
  NOTIFICATION_MODAL = 'notificationModal',
  REPORT_CONSTRUCT_MODAL = 'reportConstructModal',
  REPORT_EDIT_NAME_MODAL = 'reportEditModal',
  REPORT_CHANGE_PERIOD_MODAL = 'reportChangePeriodModal',
  REPORT_REMOVE_MODAL = 'reportRemoveModal',
  USERS_PERMISSIONS_MODAL = 'usersPermissionsModal',
  PROVIDER_ACCESS_MODAL = 'providerAccessModal',
  PROVIDER_EDITOR_MODAL = 'providerEditorModal',
  PROVIDER_REMOVE_MODAL = 'providerRemoveModal',
  FOLDER_EDITOR_MODAL = 'folderEditorModal',
  FOLDER_REMOVE_MODAL = 'folderRemoveModal',
  RESOURCE_REMOVE_MODAL = 'resourceRemoveModal',
  CHARGING_UNIT_CREATE_MODAL = 'chargingUnitCreateModal',
  CHARGING_UNIT_REMOVE_MODAL = 'chargingUnitRemoveModal',
  USER_CREATE_MODAL = 'userCreateModal',
  USER_REMOVE_MODAL = 'userRemoveModal',
  USER_CHANGE_PASSWORD_MODAL = 'userChangePasswordModal',
  NOTICE_MODAL = 'noticeModal',
  TABLE_SETTINGS_MODAL = 'tableSettingsModal',
  ROLE_CREATE_MODAL = 'roleCreateModal',
  ROLE_REMOVE_MODAL = 'roleRemoveModal',
  CATEGORIES_LIST_MODAL = 'categoriesListModal',
  CATEGORY_CREATE_MODAL = 'categoryCreateModal',
  CATEGORY_SUB_CREATE_MODAL = 'categorySubCreateModal',
  CATEGORY_ADD_OBJECT_MODAL = 'categoryAddObjectModal',
}

/** Common modal window object */
export interface ModalNodeState {
  /** Created modal window node  */
  node: React.ReactFragment;
  /** Name of modal window */
  name: ModalNames;
  /** Modal state handlers */
  handlers: ModalWindowState;
}

/** Common modal window arguments object */
export interface ModalComplexArg {
  /** Argument on second pos */
  secondArg?: unknown;
  /** Argument on third pos */
  thirdArg?: unknown;
  /** `callback` argument */
  callbackArg?: () => unknown;
}

/** Modal context value description type */
export type ModalContextHandler = Record<ModalNames, ModalWindowState>;

/** `useRenderModals` hook result */
export interface UseRenderModalsResult {
  /** Values for modal context */
  modalContextValue: ModalContextHandler;
  /** list of modals */
  modals: React.ReactFragment[];
}
